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

import java.util.List;
import java.util.stream.Collectors;

@DgsComponent
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PACKAGE, makeFinal = true)
@Slf4j
public class SearchUserDataFetcher {
    UserCommonService srv;

    @DgsQuery
    public List<SearchUserResp> searchUser(@InputArgument String params) {
        log.info("SearchUserDataFetcher params: {}", params);
        return srv.searchUserByKeyword(params).stream()
                .map(user -> SearchUserResp.newBuilder()
                        .username(user.getUsername() == null ? "" : user.getUsername())
                        .id(user.getId() == null ? "" : user.getId())
                        .avatar(
                                user.getProfile() == null
                                        ? ""
                                        : user.getProfile().getAvatarUrl())
                        .build())
                .collect(Collectors.toList());
    }
}
