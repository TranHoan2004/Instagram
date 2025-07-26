package dev.huyhoangg.midia.business.user;

import dev.huyhoangg.midia.codegen.types.Post;
import dev.huyhoangg.midia.codegen.types.UpdatePasswordResp;
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

import org.springframework.context.annotation.Lazy;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.time.Duration;
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
    private final UserProfileRepository upRepo;
    private final SearchUserRepository suRepo;
    private final SocialAccountMapper socialAccountMapper;

    private static final int MIN_AGE = 12;

    private String getCurrentUserIdFromJwt() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        var jwt = (Jwt) authentication.getPrincipal();
        return jwt.getSubject();
    }

    @Override
    public dev.huyhoangg.midia.codegen.types.RegisterUserResp registerUser(
            dev.huyhoangg.midia.codegen.types.RegisterUserInput input) {
        if (userRepository.existsByUsername(input.getUsername())) throw new IllegalArgumentException("Username exists");
        if (userRepository.existsByEmail(input.getEmail())) throw new IllegalArgumentException("Email already taken");
        var userDob = input.getDob();
        if (userDob != null && !userDob.isBefore(LocalDate.now().minusYears(MIN_AGE))) {
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

        return dev.huyhoangg.midia.codegen.types.RegisterUserResp.newBuilder()
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
        var userId = getCurrentUserIdFromJwt();
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
    public dev.huyhoangg.midia.codegen.types.User getUserByPost(Post post) {
        if (post.getAuthor() != null) {
            return post.getAuthor();
        }
        throw new UserNotExistsException();
    }

    @Override
    public String getCurrentUserUid() {
        var userId = getCurrentUserIdFromJwt();
        var user = userRepository.findById(userId).orElseThrow(UserNotExistsException::new);
        return user.getUid();
    }

    @Override
    public List<User> searchUserByKeyword(String kw) {
        List<User> list = suRepo.findUserByUserNameContaining(kw);
        log.info("searchUserByKeyword: {}", list);
        return list.isEmpty() ? suRepo.findUserByProfileFullNameContaining(kw) : list;
    }

    @Override
    public UpdatePasswordResp updatePassword(dev.huyhoangg.midia.codegen.types.UpdatePasswordInput input) {
        String userId = input.getUserId();
        String resetToken = input.getResetToken();
        String newPassword = input.getNewPassword();
        String redisKey = "reset-password:" + userId;
        try {
            // Kiểm tra token reset password
            String tokenInRedis = redisTemplate.opsForValue().get(redisKey);
            if (tokenInRedis == null || !tokenInRedis.equals(resetToken)) {
                return new UpdatePasswordResp(false, "Invalid or expired reset token");
            }
            // Xoá token sau khi dùng
            redisTemplate.delete(redisKey);

            // Validate password strength
            if (newPassword == null || newPassword.length() < 8) {
                return new UpdatePasswordResp(false, "Password must be at least 8 characters long");
            }

            // Check if user exists
            var user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return new UpdatePasswordResp(false, "User not found");
            }

            // Encode new password
            var encodedPassword = passwordEncoder.encode(newPassword);
            // Update password in database
            userRepository.updatePassword(userId, encodedPassword);

            return new UpdatePasswordResp(true, "Password updated successfully");
        } catch (Exception e) {
            log.error("Failed to update password for user {}: {}", userId, e.getMessage());
            return new UpdatePasswordResp(false, "Failed to update password: " + e.getMessage());
        }
    }

    @Override
    public dev.huyhoangg.midia.codegen.types.UserProfile editUserProfile(String userId, UserProfile profile) {
        log.info("editUserProfile: userId={}, profile={}", userId, profile);
        UserProfile p = upRepo.updateProfile(profile, userId);
        return dev.huyhoangg.midia.codegen.types.UserProfile.newBuilder()
                .bio(p.getBio())
                .avatarUrl(p.getAvatarUrl())
                .birthDate(userMapper.localDateToString(p.getBirthDate()))
                .fullName(p.getFullName())
                .phoneNumber(p.getPhoneNumber())
                .build();
    }

    @Override
    public User editUserInformation(String userId, String username, String email) {
        log.info("edit user information: user={}", username);

        var user = userRepository.findById(userId).orElseThrow(UserNotExistsException::new);
        user.setUsername(username == null ? user.getUsername() : username.trim());
        user.setEmail(email == null ? user.getEmail() : email.trim());

        return userRepository.save(user);
    }

    @Override
    public graphql.relay.Connection<dev.huyhoangg.midia.codegen.types.User> getUsersConnection(Integer first, String after) {
        return userRepository.findAllPaginated(first, after);
    }

    @Override
    public List<dev.huyhoangg.midia.codegen.types.SocialAccount> getSocialAccounts(String userUid) {
        var socialAccounts = userRepository.findSocialAccountsByUserUid(userUid);
        return socialAccountMapper.toGraphQLSocialAccountTypes(List.copyOf(socialAccounts));
    }

    @Override
    public List<dev.huyhoangg.midia.codegen.types.SocialAccount> getSocialAccountsByUserId(String userId) {
        var user = userRepository.findById(userId).orElseThrow(UserNotExistsException::new);
        return getSocialAccounts(user.getUid());
    }

    @Override
    public dev.huyhoangg.midia.codegen.types.User editUserRole(String userId, String roleName) {
        var currentUserId = getCurrentUserIdFromJwt();
        if (currentUserId.equals(userId)) {
            throw new IllegalArgumentException("Administrators cannot change their own role");
        }
        var user = userRepository.findById(userId).orElseThrow(() -> new UserNotExistsException("User not found: " + userId));
        var role = roleRepository.findByName(roleName).orElseThrow(() -> new RoleNotExistsException("Role not found: " + roleName));
        user.setRole(role);
        user.setUpdatedAt(Instant.now());
        var updatedUser = userRepository.save(user);
        return userMapper.toGraphQLUserType(updatedUser);
    }

    @Override
    public Boolean assignRoleToUsers(String roleName, List<String> userIds) {
        var currentUserId = getCurrentUserIdFromJwt();
        if (userIds.contains(currentUserId)) {
            throw new IllegalArgumentException("Administrators cannot change their own role");
        }
        var role = roleRepository.findByName(roleName).orElseThrow(() -> new RoleNotExistsException("Role not found: " + roleName));
        for (String userId : userIds) {
            var user = userRepository.findById(userId);
            if (user.isPresent()) {
                user.get().setRole(role);
                user.get().setUpdatedAt(Instant.now());
                userRepository.save(user.get());
            }
        }
        return true;
    }

    @Override
    public dev.huyhoangg.midia.codegen.types.User toggleUserStatus(String userId) {
        var currentUserId = getCurrentUserIdFromJwt();
        if (currentUserId.equals(userId)) {
            throw new IllegalArgumentException("Administrators cannot change their own status");
        }
        var user = userRepository.findById(userId).orElseThrow(() -> new UserNotExistsException("User not found: " + userId));
        user.setIsLocked(!user.getIsLocked());
        user.setUpdatedAt(Instant.now());
        var updatedUser = userRepository.save(user);
        return userMapper.toGraphQLUserType(updatedUser);
    }

    @Override
    public dev.huyhoangg.midia.codegen.types.User adminAddUser(dev.huyhoangg.midia.codegen.types.AdminAddUserInput input) {
        if (userRepository.existsByEmail(input.getEmail())) {
            throw new IllegalArgumentException("Email already taken");
        }

        var role = roleRepository.findByName(input.getRoleName().trim())
                .orElseThrow(() -> new RoleNotExistsException("Role not found: " + input.getRoleName()));

        String username = input.getEmail().split("@")[0];
        int counter = 1;
        while (userRepository.existsByUsername(username)) {
            username = input.getEmail().split("@")[0] + counter;
            counter++;
        }

        var userProfile = UserProfile.builder()
                .fullName(input.getFullName().trim())
                .build();

        var user = User.builder()
                .id(UUID.randomUUID().toString())
                .username(username)
                .profile(userProfile)
                .email(input.getEmail().trim())
                .password(passwordEncoder.encode(input.getPassword()))
                .role(role)
                .stats(new UserStats())
                .isEmailVerified(true)
                .isLocked(false)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        var savedUser = userRepository.save(user);
        return userMapper.toGraphQLUserType(savedUser);
    }

    @Override
    public List<User> getActiveUsers() {
        return userRepository.findAllUsersHasLastLoginAtAfter(Instant.now().minus(Duration.ofDays(3)));
    }
}
