package dev.huyhoangg.midia.business.user;

import dev.huyhoangg.midia.codegen.types.RegisterUserInput;
import dev.huyhoangg.midia.codegen.types.RegisterUserResp;
import dev.huyhoangg.midia.domain.model.user.User;
import dev.huyhoangg.midia.domain.model.user.UserProfile;
import dev.huyhoangg.midia.domain.model.user.UserStats;
import dev.huyhoangg.midia.domain.repository.user.RoleRepository;
import dev.huyhoangg.midia.domain.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Lazy
public class UserCommonServiceImpl implements UserCommonService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    @Override
    public RegisterUserResp registerUser(RegisterUserInput input) {
        if (userRepository.existsByUsername(input.getUserName())) throw new IllegalArgumentException("Username exists");
        if (userRepository.existsByEmail(input.getEmail())) throw new IllegalArgumentException("Email already taken");
        var userDob = input.getDob();
        if (userDob != null && !userDob.isBefore(LocalDate.now().minusYears(12))) {
            throw new IllegalArgumentException("User must be at least 12 years old");
        }
        var role = roleRepository.findByName("USER").orElseThrow(() -> new RuntimeException("Role User not available"));
        log.info("role: {}", role);
        var userProfile = UserProfile.builder()
                .fullName(input.getFirstName() + " " + input.getLastName())
                .birthDate(userDob)
                .build();
        var userStats = new UserStats();
        var user = User.builder()
                .id(UUID.randomUUID().toString())
                .userName(input.getUserName())
                .profile(userProfile)
                .email(input.getEmail())
                .password(passwordEncoder.encode(input.getPassword()))
                .role(role)
                .stats(userStats)
                .build();
        userRepository.save(user);
        return RegisterUserResp.newBuilder().id(user.getId()).message("User registered successfully").build();
    }

    @Override
    public dev.huyhoangg.midia.codegen.types.UserProfile getUserProfile(String userId) {
        var user = userRepository.findById(userId)
                .orElseThrow(UserNotExistsException::new);
        return dev.huyhoangg.midia.codegen.types.UserProfile
                .newBuilder()
                .build();
    }

    @Override
    public dev.huyhoangg.midia.codegen.types.User getMyInfo() {
        var context = SecurityContextHolder.getContext();
        var username = context.getAuthentication().getName();

        var user = userRepository.findByUsername(username).orElseThrow(UserNotExistsException::new);
        return dev.huyhoangg.midia.codegen.types.User.newBuilder()
                .id(user.getId())
                .userName(user.getUserName())
                .role(user.getRole().getName())
                .email(user.getEmail())
                .build();
    }
}
