package dev.huyhoangg.midia.business.user;

import dev.huyhoangg.midia.codegen.types.RegisterUserInput;
import dev.huyhoangg.midia.codegen.types.RegisterUserResp;
import dev.huyhoangg.midia.domain.event.UserEmailVerificationPayload;
import dev.huyhoangg.midia.domain.model.user.User;
import dev.huyhoangg.midia.domain.model.user.UserProfile;
import dev.huyhoangg.midia.domain.model.user.UserStats;
import dev.huyhoangg.midia.domain.repository.user.RoleRepository;
import dev.huyhoangg.midia.domain.repository.user.SearchUserRepository;
import dev.huyhoangg.midia.domain.repository.user.UserProfileRepository;
import dev.huyhoangg.midia.domain.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;

import org.springframework.context.annotation.Lazy;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Lazy
public class UserCommonServiceImpl implements UserCommonService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final UserEventProducer userEventProducer;
    private final RedisTemplate<String, String> redisTemplate;
    private final UserMapper userMapper;
    private final ApplicationContext context;

    @Override
    public RegisterUserResp registerUser(RegisterUserInput input) {
        if (userRepository.existsByUsername(input.getUsername())) throw new IllegalArgumentException("Username exists");
        if (userRepository.existsByEmail(input.getEmail())) throw new IllegalArgumentException("Email already taken");
        var userDob = input.getDob();
        if (userDob != null && !userDob.isBefore(LocalDate.now().minusYears(12))) {
            throw new IllegalArgumentException("User must be at least 12 years old");
        }
        var role = roleRepository.findByName("USER").orElseThrow(() -> new RuntimeException("Role User not available"));
        var userProfile = UserProfile.builder()
                .fullName(
                        input.getFirstName().trim() + " " + input.getLastName().trim())
                .birthDate(userDob)
                .build();
        var user = User.builder()
                .id(UUID.randomUUID().toString())
                .username(input.getUsername())
                .profile(userProfile)
                .email(input.getEmail())
                .password(passwordEncoder.encode(input.getPassword()))
                .role(role)
                .stats(new UserStats())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        userRepository.save(user);
        userEventProducer.produceUserEmailVerifiedEvent(
                new UserEmailVerificationPayload(user.getId(), user.getEmail(), userProfile.getFullName()));
        return RegisterUserResp.newBuilder()
                .id(user.getId())
                .message("User registered successfully")
                .build();
    }

    @Override
    public dev.huyhoangg.midia.codegen.types.UserProfile getUserProfile(String userId) {
        var user = userRepository.findById(userId).orElseThrow(UserNotExistsException::new);
        return dev.huyhoangg.midia.codegen.types.UserProfile.newBuilder()
                .fullName(user.getProfile().getFullName())
                .birthDate(userMapper.localDateToString(user.getProfile().getBirthDate()))
                .avatarUrl(user.getProfile().getAvatarUrl())
                .phoneNumber(user.getProfile().getPhoneNumber())
                .build();
    }

    @Override
    public dev.huyhoangg.midia.codegen.types.User getMyInfo() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        log.info("authentication: {}", authentication);
        var jwt = (Jwt) authentication.getPrincipal();
        var userId = jwt.getSubject();

        var user = userRepository.findById(userId).orElseThrow(UserNotExistsException::new);
        return userMapper.toGraphQLUserType(user);
    }

    @Override
    public boolean verifyEmail(String token, String id) {
        var cachedToken = redisTemplate.opsForValue().get(token);
        if (cachedToken == null || cachedToken.isBlank()) {
            return false;
        }

        return userRepository
                .findById(id)
                .map(user -> {
                    user.setIsEmailVerified(true);
                    user.setUpdatedAt(Instant.now());
                    userRepository.save(user);
                    redisTemplate.delete(token);
                    return true;
                })
                .orElse(false);
    }

    @Override
    public dev.huyhoangg.midia.codegen.types.User getUserById(String id) {
        var user = userRepository.findById(id).orElseThrow(UserNotExistsException::new);
        return userMapper.toGraphQLUserType(user);
    }

    @Override
    public dev.huyhoangg.midia.codegen.types.User getUserByUsername(String username) {
        var user = userRepository.findByUsername(username).orElseThrow(UserNotExistsException::new);
        return userMapper.toGraphQLUserType(user);
    }

    @Override
    public dev.huyhoangg.midia.codegen.types.User getUserByEmail(String email) {
        var user = userRepository.findByEmail(email).orElseThrow(UserNotExistsException::new);
        return userMapper.toGraphQLUserType(user);
    }

    @Override
    public List<User> searchUserByKeyword(String kw) {
        SearchUserRepository repo = context.getBean(SearchUserRepository.class);
        List<User> list = repo.findUserByUserNameContaining(kw);
        log.info("searchUserByKeyword: {}", list);
        return list.isEmpty() ? repo.findUserByProfileFullNameContaining(kw) : list;
    }

    @Override
    public void editUserProfile(String userId, dev.huyhoangg.midia.domain.model.user.UserProfile profile) {
        log.info("editUserProfile: userId={}, profile={}", userId, profile);
        UserProfileRepository repo = context.getBean(UserProfileRepository.class);
        repo.updateProfile(profile, userId);
    }

    @Override
    public void editUserInformation(String userId, String username, String email) {
        log.info("edit user information: user={}", username);

        var user = userRepository.findById(userId).orElseThrow(UserNotExistsException::new);
        user.setUsername(username == null ? user.getUsername() : username.trim());
        user.setEmail(email == null ? user.getEmail() : email.trim());

        userRepository.save(user);
    }
}
