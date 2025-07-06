package dev.huyhoangg.midia.api.graphql.search;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import dev.huyhoangg.midia.business.user.UserCommonService;
import dev.huyhoangg.midia.codegen.types.SearchUserResp;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import dev.huyhoangg.midia.domain.model.user.UserProfile;

import java.util.List;
import java.util.stream.Collectors;

@DgsComponent
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PACKAGE, makeFinal = true)
@Slf4j
public class SearchUserDataFetcher {
    UserCommonService srv;

    /**
     * <h4>Search for users by keyword</h4>
     * <p>
     * This method is a GraphQL query marked with {@code @DgsQuery}, allowing you to search for a list of users
     * based on an input keyword string. The result is a list of {@link SearchUserResp} objects,
     * which contain simplified user information such as username, ID, and avatar URL.
     *
     * <p>The method uses the service {@code srv.searchUserByKeyword} to perform the actual search,
     * and maps the data to the output DTO using {@code Stream.map()}.</p>
     *
     * <p>To ensure stability, potentially null fields such as {@code username}, {@code id}, or {@code profile}
     * are replaced with empty strings if they do not exist.</p>
     *
     * @param params The keyword input used for searching users.
     * @return A list of {@link SearchUserResp} objects containing user information that matches the keyword.
     * @author HoanTX
     */
    @DgsQuery
    public List<SearchUserResp> searchUser(@InputArgument String params) {
        log.info("SearchUserDataFetcher params: {}", params);
        return srv.searchUserByKeyword(params).stream()
                .map(user -> SearchUserResp.newBuilder()
                        .username(user.getUsername() == null ? "" : user.getUsername())
                        .id(user.getId() == null ? "" : user.getId())
                        .avatar(user.getProfile() == null ? "" : user.getProfile().getAvatarUrl())
                        .build()).collect(Collectors.toList());
    }
}