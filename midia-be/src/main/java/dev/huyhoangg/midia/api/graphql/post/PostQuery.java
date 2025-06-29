package dev.huyhoangg.midia.api.graphql.post;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import dev.huyhoangg.midia.business.post.PostService;
import dev.huyhoangg.midia.codegen.types.Post;
import lombok.RequiredArgsConstructor;

import java.util.List;

@DgsComponent
@RequiredArgsConstructor
public class PostQuery {

    private final PostService postService;

    @DgsQuery
    public List<Post> posts(@InputArgument String authorId) {
        return postService.getPostsByAuthorId(authorId);
    }
}