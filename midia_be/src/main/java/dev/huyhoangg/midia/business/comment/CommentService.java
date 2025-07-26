package dev.huyhoangg.midia.business.comment;

import java.util.Optional;

import dev.huyhoangg.midia.codegen.types.CommentInput;
import dev.huyhoangg.midia.domain.model.comment.Comment;
import dev.huyhoangg.midia.domain.model.user.User;
import graphql.relay.Connection;

public interface CommentService {
    Comment createComment(CommentInput input);
    Connection<Comment> getCommentsByPostId(String postId, Integer first, String after);
    Connection<Comment> getRepliesByParentId(String parentId, Integer first, String after);
    Optional<Comment> findById(String id);
    boolean deleteComment(String id, String userId);
    void likeComment(String commentId, String userId);
    void unlikeComment(String commentId, String userId);
    Connection<User> getLikesByCommentId(String commentId, Integer first, String after);
}