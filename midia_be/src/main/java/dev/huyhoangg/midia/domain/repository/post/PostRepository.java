package dev.huyhoangg.midia.domain.repository.post;

import dev.huyhoangg.midia.domain.model.post.Post;
import dev.huyhoangg.midia.domain.repository.SortDirection;

import org.springframework.lang.Nullable;

import java.util.List;
import java.util.Optional;

public interface PostRepository {

    Post save(Post post);

    Optional<Post> findById(String id);

    List<Post> findByAuthorIdOrderByCreatedAt(
            String authorId, @Nullable Integer first, @Nullable String after, SortDirection sortDirection);

    void deleteById(String id);
}
