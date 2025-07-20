package dev.huyhoangg.midia.business.post;

import dev.huyhoangg.midia.codegen.types.CreatePostInput;
import dev.huyhoangg.midia.codegen.types.CreatePostResp;
import dev.huyhoangg.midia.codegen.types.Post;
import dev.huyhoangg.midia.domain.repository.SortDirection;
import graphql.relay.Connection;

public interface PostService {

    CreatePostResp createPost(CreatePostInput input);

    Connection<Post> getPostsByAuthorId(String authorId, Integer first, String after, SortDirection sortDirection);
}
