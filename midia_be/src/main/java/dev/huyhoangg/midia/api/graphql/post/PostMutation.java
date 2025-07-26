package dev.huyhoangg.midia.api.graphql.post;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.InputArgument;
import dev.huyhoangg.midia.business.notification.annotation.PostNotify;
import dev.huyhoangg.midia.domain.model.notification.NotificationType;
import dev.huyhoangg.midia.business.post.PostService;
import dev.huyhoangg.midia.codegen.types.CreatePostInput;
import dev.huyhoangg.midia.codegen.types.CreatePostResp;
import lombok.RequiredArgsConstructor;

@DgsComponent
@RequiredArgsConstructor
public class PostMutation {

    private final PostService postService;

    @DgsMutation
    @PostNotify(type = NotificationType.POST_CREATED)
    public CreatePostResp createPost(@InputArgument CreatePostInput input) {
        return postService.createPost(input);
    }
}
