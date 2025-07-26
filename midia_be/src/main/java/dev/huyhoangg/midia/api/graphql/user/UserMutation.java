package dev.huyhoangg.midia.api.graphql.user;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.InputArgument;

import dev.huyhoangg.midia.business.notification.annotation.PostNotify;
import dev.huyhoangg.midia.business.user.UserCommonService;
import dev.huyhoangg.midia.business.user.UserInteractionService;
import dev.huyhoangg.midia.codegen.types.EditUserInput;
import dev.huyhoangg.midia.codegen.types.RegisterUserInput;
import dev.huyhoangg.midia.codegen.types.RegisterUserResp;
import dev.huyhoangg.midia.codegen.types.UpdatePasswordResp;
import dev.huyhoangg.midia.domain.model.notification.NotificationType;
import dev.huyhoangg.midia.codegen.types.User;
import dev.huyhoangg.midia.domain.model.user.UserProfile;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.access.prepost.PreAuthorize;

@Slf4j
@DgsComponent
@RequiredArgsConstructor
public class UserMutation {
    private final UserCommonService userCommonService;
    private final UserInteractionService userInteractionService;
    private final RedisTemplate<String, String> redisTemplate;

    @DgsMutation
    public RegisterUserResp registerUser(@InputArgument RegisterUserInput input) {
        return userCommonService.registerUser(input);
    }

    @DgsMutation
    public UpdatePasswordResp updatePassword(@InputArgument("input") dev.huyhoangg.midia.codegen.types.UpdatePasswordInput input) {
        return userCommonService.updatePassword(input);
    }

    @DgsMutation
    @PreAuthorize("isAuthenticated()")
    public dev.huyhoangg.midia.codegen.types.UserProfile editUserProfile(@InputArgument EditUserInput input) {
        dev.huyhoangg.midia.codegen.types.UserProfile p = userCommonService.editUserProfile(input.getUserId(), UserProfile.builder()
                .bio(input.getBio())
                .avatarUrl(input.getAvatarUrl())
                .phoneNumber(input.getPhoneNumber())
                .fullName(input.getFullName())
                .gender(input.getGender())
                .build());

        dev.huyhoangg.midia.domain.model.user.User u = userCommonService.editUserInformation(input.getUserId(), input.getUsername(), input.getEmail());
        p.setUsername(u.getUsername());
        return p;
    }

    @DgsMutation
    @PreAuthorize("hasRole('ADMIN')")
    public User editUserRole(@InputArgument String userId, @InputArgument String roleName) {
        return userCommonService.editUserRole(userId, roleName);
    }

    @DgsMutation
    @PreAuthorize("hasRole('ADMIN')")
    public Boolean assignRoleToUsers(@InputArgument String roleName, @InputArgument List<String> userIds) {
        return userCommonService.assignRoleToUsers(roleName, userIds);
    }

    @DgsMutation
    @PreAuthorize("hasRole('ADMIN')")
    public User toggleUserStatus(@InputArgument String userId) {
        return userCommonService.toggleUserStatus(userId);
    }

    @DgsMutation
    @PreAuthorize("isAuthenticated()")
    @PostNotify(type = NotificationType.FOLLOW, recipientIdParam = "targetUserId")
    public Boolean toggleFollow(@InputArgument String targetUserId) {
        var currentUser = userCommonService.getMyInfo();
        return userInteractionService.toggleFollow(currentUser.getId(), targetUserId);
    }

    @DgsMutation
    @PreAuthorize("hasRole('ADMIN')")
    public User adminAddUser(@InputArgument dev.huyhoangg.midia.codegen.types.AdminAddUserInput input) {
        return userCommonService.adminAddUser(input);
    }
}
