package dev.huyhoangg.midia.api.graphql.user;

import com.netflix.graphql.dgs.*;
import dev.huyhoangg.midia.business.user.UserCommonService;
import dev.huyhoangg.midia.codegen.types.SocialAccount;
import dev.huyhoangg.midia.business.user.UserInteractionService;
import dev.huyhoangg.midia.codegen.types.User;
import dev.huyhoangg.midia.codegen.types.UserProfile;
import dev.huyhoangg.midia.infrastructure.util.ConnectionUtil;
import graphql.relay.Connection;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

@DgsComponent
@RequiredArgsConstructor
public class UserDatafetcher {
    private final UserCommonService userCommonService;
    private final UserInteractionService userInteractionService;

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
    @PreAuthorize("isAuthenticated()")
    public User user(@InputArgument String userId) {
        return userCommonService.getUserById(userId);
    }

    @DgsQuery
    @PreAuthorize("isAuthenticated()")
    public Connection<User> suggestUsers(@InputArgument Optional<Integer> first, @InputArgument Optional<String> after) {
        var currentUser = userCommonService.getMyInfo();
        var offset = after.map(ConnectionUtil::getOffsetFromConnectionCursor).orElse(0);

        return userInteractionService.suggestUsers(currentUser.getId(), first.orElse(10), offset);
    }

    @DgsQuery
    @PreAuthorize("hasRole('ADMIN')")
    public graphql.relay.Connection<User> users(@InputArgument Integer first, @InputArgument String after) {
        return userCommonService.getUsersConnection(first, after);
    }

    @DgsData(parentType = "User", field = "socialAccounts")
    @PreAuthorize("isAuthenticated()")
    public List<SocialAccount> socialAccounts(DgsDataFetchingEnvironment dfe) {
        User user = dfe.getSource();
        return userCommonService.getSocialAccountsByUserId(user.getId());
    }
}
