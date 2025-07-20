package dev.huyhoangg.midia.api.graphql.user;

import com.netflix.graphql.dgs.*;
import dev.huyhoangg.midia.business.user.UserCommonService;
import dev.huyhoangg.midia.codegen.types.User;
import dev.huyhoangg.midia.codegen.types.UserProfile;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@DgsComponent
@RequiredArgsConstructor
public class UserDatafetcher {
    private final UserCommonService userCommonService;

    @DgsQuery
    @PreAuthorize("isAuthenticated()")
    public User me() {
        return userCommonService.getMyInfo();
    }

    @DgsQuery
    @PreAuthorize("isAuthenticated()")
    public UserProfile userProfile(@InputArgument String userId) {
        return userCommonService.getUserProfile(userId);
    }

    @DgsQuery
    public User user(@InputArgument String userId) {
        return userCommonService.getUserById(userId);
    }

    @DgsQuery
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> users(@InputArgument Integer first, @InputArgument Integer offset) {
        return null;
    }
}
