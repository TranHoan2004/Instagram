package dev.huyhoangg.midia.domain.repository.post;

import dev.huyhoangg.midia.domain.model.post.Post;

import java.util.List;
import java.util.Optional;

public interface PostRepository {
    Post save(Post post);
    Optional<Post> findById(String id);
    List<Post> findByAuthorId(String authorId);
    void deleteById(String id);
} 