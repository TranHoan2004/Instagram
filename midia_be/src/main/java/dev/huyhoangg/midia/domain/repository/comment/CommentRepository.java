package dev.huyhoangg.midia.domain.repository.comment;

import dev.huyhoangg.midia.domain.model.comment.Comment;
import dev.huyhoangg.midia.domain.model.user.User;
import graphql.relay.Connection;
import org.springframework.lang.Nullable;

import java.util.Optional;

public interface CommentRepository {
        Comment save(Comment comment);

        Optional<Comment> findById(String id);

        Connection<Comment> findByPostIdOrderByCreatedAt(
                        String postId, @Nullable Integer first, @Nullable String after);

        Connection<Comment> findRepliesByParentIdOrderByCreatedAt(
                        String parentId, @Nullable Integer first, @Nullable String after);

        void deleteById(String id);

        void addLike(String commentId, String userId);

        void removeLike(String commentId, String userId);

        Connection<User> findLikesByCommentIdOrderByLikedAt(
                        String commentId, @Nullable Integer first, @Nullable String after);
}