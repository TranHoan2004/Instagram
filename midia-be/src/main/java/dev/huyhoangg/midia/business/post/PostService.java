package dev.huyhoangg.midia.business.post;


import java.util.List;

import dev.huyhoangg.midia.codegen.types.CreatePostInput;
import dev.huyhoangg.midia.codegen.types.CreatePostResp;
import dev.huyhoangg.midia.codegen.types.Post;

public interface PostService {
    CreatePostResp createPost(CreatePostInput input);
    List<Post> getPostsByAuthorId(String authorId);
} 