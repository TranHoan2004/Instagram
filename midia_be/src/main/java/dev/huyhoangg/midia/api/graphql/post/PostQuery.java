package dev.huyhoangg.midia.api.graphql.post;

import com.netflix.graphql.dgs.*;

import dev.huyhoangg.midia.business.post.PostService;
import dev.huyhoangg.midia.business.user.UserCommonService;
import dev.huyhoangg.midia.codegen.types.Post;
import dev.huyhoangg.midia.codegen.types.Sort;
import dev.huyhoangg.midia.codegen.types.User;
import dev.huyhoangg.midia.domain.repository.SortDirection;
import graphql.relay.Connection;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.util.Assert;

@DgsComponent
@RequiredArgsConstructor
@Slf4j
public class PostQuery {

    private final PostService postService;
    private final UserCommonService userCommonService;

    @DgsData(parentType = "User", field = "posts")
    public Connection<Post> postsByAuthor(DgsDataFetchingEnvironment dfe) {
        User user = dfe.getSource();
        var first = dfe.getArgumentOrDefault("first", 10);
        String after = dfe.getArgument("after");
        var sortDirection = SortDirection.valueOf(dfe.getArgumentOrDefault("sortDirection", Sort.DESC.name()));
        Assert.notNull(user, "user must not be null");
        return postService.getPostsByAuthorId(user.getId(), first, after, sortDirection);
    }

    @DgsData(parentType = "Post")
    public User author(DgsDataFetchingEnvironment dfe) {
        Post post = dfe.getSource();
        return userCommonService.getUserByPost(post);
    }
}
