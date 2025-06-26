package dev.huyhoangg.midia.api.graphql.post;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.InputArgument;
import dev.huyhoangg.midia.business.post.PostService;
import dev.huyhoangg.midia.domain.model.post.Post;
import dev.huyhoangg.midia.domain.model.post.PostVisibility;
import lombok.RequiredArgsConstructor;

import java.util.List;

@DgsComponent
@RequiredArgsConstructor
public class PostMutation {

    private final PostService postService;

    @DgsMutation
    public Post createPost(@InputArgument CreatePostInput input) {
        return postService.createPost(input.getCaption(), input.getVisibility(), input.getAttachmentIds());
    }
} 