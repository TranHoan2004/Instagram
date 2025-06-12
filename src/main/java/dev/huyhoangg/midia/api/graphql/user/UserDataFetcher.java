package dev.huyhoangg.midia.api.graphql.user;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import dev.huyhoangg.midia.business.user.UserCommonService;
import dev.huyhoangg.midia.codegen.types.User;
import dev.huyhoangg.midia.codegen.types.UserProfile;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@DgsComponent
@RequiredArgsConstructor
public class UserDataFetcher {
    private final UserCommonService userCommonService;

    @DgsQuery
    @PreAuthorize("isAuthenticated()")
    public User me() {
        return userCommonService.getMyInfo();
    }

    @DgsQuery
    @PreAuthorize("isAuthenticated()")
    public UserProfile userProfile(@InputArgument String id) {
        return userCommonService.getUserProfile(id);
    }

    @DgsQuery
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> users() {
        return null;
    }
}
