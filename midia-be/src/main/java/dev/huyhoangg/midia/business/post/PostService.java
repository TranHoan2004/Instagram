package dev.huyhoangg.midia.business.post;

import dev.huyhoangg.midia.domain.model.post.Post;
import dev.huyhoangg.midia.domain.model.post.PostVisibility;

import java.util.List;

public interface PostService {
    Post createPost(String caption, PostVisibility visibility, List<String> attachmentIds);

    List<Post> getPostsByAuthorId(String authorId);
} 