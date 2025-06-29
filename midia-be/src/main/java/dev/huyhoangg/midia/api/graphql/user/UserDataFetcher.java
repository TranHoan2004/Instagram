package dev.huyhoangg.midia.api.graphql.user;

import com.netflix.graphql.dgs.*;
import dev.huyhoangg.midia.business.user.UserCommonService;
import dev.huyhoangg.midia.codegen.types.User;
import dev.huyhoangg.midia.codegen.types.UserProfile;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestParam;

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
    public UserProfile userProfile(@InputArgument String id) {
        return userCommonService.getUserProfile(id);
    }

    @DgsQuery
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> users(
            @RequestParam(name = "page", defaultValue = "0", required = false) int page,
            @RequestParam(name = "limit", defaultValue = "10", required = false) int limit
    ) {
        Pageable pageable = PageRequest.of(page, limit);
        return null;
    }

    @DgsData(parentType = "User", field = "profile")
    public UserProfile userProfile(DgsDataFetchingEnvironment dfe) {
        User user = dfe.getSource();
        assert user != null;
        return userCommonService.getUserProfile(user.getId());
    }
}
