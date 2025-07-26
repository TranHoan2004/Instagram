package dev.huyhoangg.midia.infrastructure.oauth2;

import dev.huyhoangg.midia.domain.model.user.SocialAccount;
import dev.huyhoangg.midia.domain.model.user.User;
import dev.huyhoangg.midia.domain.model.user.UserProfile;
import dev.huyhoangg.midia.domain.model.user.UserStats;
import dev.huyhoangg.midia.domain.repository.user.RoleRepository;
import dev.huyhoangg.midia.domain.repository.user.UserRepository;
import dev.huyhoangg.midia.infrastructure.oauth2.user.OAuth2UserInfo;
import dev.huyhoangg.midia.infrastructure.oauth2.user.OAuth2UserInfoFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Component
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DefaultOAuth2UserService defaultOAuth2UserService = new DefaultOAuth2UserService();
    // Specific to handle GitHub's email retrieval case
    private final RestClient restClient = RestClient.create("https://api.github.com/user/emails");

    public record OAuth2UserProxy(User user, Map<String, Object> attributes) implements OAuth2User {

        @Override
        public Map<String, Object> getAttributes() {
            return attributes;
        }

        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            return List.of();
        }

        @Override
        public String getName() {
            return user.getId();
        }
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        try {
            return processOAuth2User(userRequest);
        } catch (OAuth2AuthenticationException e) {
            throw new OAuth2AuthenticationException("Failed to login with "
                    + userRequest.getClientRegistration().getRegistrationId());
        } catch (Exception e) {
            log.info("Error occurred during OAuth2 user processing: {}", e.getMessage());
            e.printStackTrace();
            throw new InternalAuthenticationServiceException(e.getMessage(), e.getCause());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        var oauth2User = defaultOAuth2UserService.loadUser(userRequest);
        var provider = userRequest.getClientRegistration().getRegistrationId();

        var oAuth2UserInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(provider, oauth2User.getAttributes());

        var email = oAuth2UserInfo.getEmail();

        // Handle GitHub return null email if user's email is private
        if (provider.equalsIgnoreCase("github") && (email == null || email.isBlank())) {
            try {
                email = fetchGitHubUserEmail(userRequest.getAccessToken().getTokenValue());
            } catch (Exception e) {
                log.warn("Failed to fetch GitHub user emails from /user/emails endpoint: {}", e.getMessage());
            }
        }
        log.info("Email: {}", email);
        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }
        var userOptional = userRepository.findByEmail(email);

        User user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            var socialAccounts = userRepository.findSocialAccountsByUserUid(user.getUid());
            var socialAccount = SocialAccount.builder()
                    .provider(provider)
                    .sub(oAuth2UserInfo.getId())
                    .linkedAt(Instant.now())
                    .build();

            if (socialAccounts == null || socialAccounts.isEmpty()) {
                user.setSocialAccounts(Set.of(socialAccount));
            }
            // Only add social account if it is not already linked to this provider
            else if (socialAccounts.stream().noneMatch(sa -> sa.getProvider().equals(provider))) {
                socialAccounts.add(socialAccount);
                user.setSocialAccounts(new HashSet<>(socialAccounts));
            }

            user = updateExistingUser(user, oAuth2UserInfo);
        } else {
            user = registerUser(userRequest, oAuth2UserInfo);
        }

        return new OAuth2UserProxy(user, oauth2User.getAttributes());
    }

    private User registerUser(OAuth2UserRequest userRequest, OAuth2UserInfo oAuth2UserInfo) {
        var provider = userRequest.getClientRegistration().getRegistrationId();
        var email = oAuth2UserInfo.getEmail();
        var name = oAuth2UserInfo.getName();
        var username = email.split("@")[0];
        var userRole =
                roleRepository.findByName("USER").orElseThrow(() -> new RuntimeException("Role User not available"));
        var userProfile = UserProfile.builder().fullName(name).build();
        var socialAccount = SocialAccount.builder()
                .provider(provider)
                .sub(oAuth2UserInfo.getId())
                .linkedAt(Instant.now())
                .build();
        username = userRepository
                .findByUsername(username)
                .map(user -> user.getUsername() + ThreadLocalRandom.current().nextInt(100000, 999999))
                .orElse(username);
        var user = User.builder()
                .id(UUID.randomUUID().toString())
                .username(username)
                .email(email)
                .profile(userProfile)
                .role(userRole)
                .stats(new UserStats())
                .isEmailVerified(true)
                .socialAccounts(Set.of(socialAccount))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        return userRepository.save(user);
    }

    private User updateExistingUser(User user, OAuth2UserInfo oAuth2UserInfo) {
        Objects.requireNonNull(user);
        Objects.requireNonNull(user.getProfile());
        var avatarUrl = user.getProfile().getAvatarUrl();
        var fullName = user.getProfile().getFullName();

        if (!user.getIsEmailVerified()) {
            user.setIsEmailVerified(true);
        }

        if (avatarUrl == null || avatarUrl.isBlank()) {
            user.getProfile().setAvatarUrl(oAuth2UserInfo.getImageUrl());
        }

        if (fullName == null || fullName.isBlank()) {
            user.getProfile().setFullName(oAuth2UserInfo.getName());
        }

        return userRepository.save(user);
    }

    private String fetchGitHubUserEmail(String accessToken) {
        var emails = restClient
                .get()
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {});
        if (emails != null && !emails.isEmpty()) {
            return emails.stream()
                    .filter(emailMap -> Boolean.TRUE.equals(emailMap.get("primary"))
                            && Boolean.TRUE.equals(emailMap.get("verified")))
                    .map(emailMap -> (String) emailMap.get("email"))
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElse(null);
        }

        return null;
    }
}
