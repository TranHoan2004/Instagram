package dev.huyhoangg.midia.api.graphql.search;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import dev.huyhoangg.midia.business.search.SearchService;
import dev.huyhoangg.midia.codegen.types.SearchedUser;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.stream.Collectors;

@DgsComponent
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PACKAGE, makeFinal = true)
@Slf4j
public class SearchUserDataFetcher {
    SearchService sSrv;

    /**
     * <h4>Search users by keyword</h4>
     * <p>
     * Searches for users whose username contains the given keyword, and returns a list of matched users
     * with their <code>id</code>, <code>username</code>, and <code>avatar</code> URL.
     * </p>
     *
     * <p><strong>Example GraphQL Request:</strong></p>
     * <pre>{@code
     * query {
     *   searchUser(params: "us") {
     *     id
     *     username
     *     avatar
     *   }
     * }
     * }</pre>
     *
     * <p><strong>Example Response:</strong></p>
     * <pre>{@code
     * {
     *   "data": {
     *     "searchUser": [
     *       {
     *         "id": "1",
     *         "username": "user1",
     *         "avatar": "https://example.com/avatar1.png"
     *       },
     *       {
     *         "id": "2",
     *         "username": "user2",
     *         "avatar": "https://example.com/avatar2.png"
     *       }
     *     ]
     *   }
     * }
     * }</pre>
     *
     * @param params The keyword to match usernames against.
     * @return A list of {@link SearchedUser} including id, username, and avatar URL of each user.
     * @author HoanTX
     */
    @DgsQuery
    public List<SearchedUser> searchUser(@InputArgument String params) {
        log.info("SearchUserDataFetcher params: {}", params);
        List<SearchedUser> u = sSrv.searchUserByKeyword(params).stream()
                .map(user ->
                        SearchedUser.newBuilder()
                                .username(user.getUsername() == null ? "" : user.getUsername())
                                .id(user.getId() == null ? "" : user.getId())
                                .avatar(sSrv.getAvatarByUserUid(user.getUid()).getAvatarUrl())
                                .build()
                ).collect(Collectors.toList());
        log.info(u.toString());
        return u;
    }
}
