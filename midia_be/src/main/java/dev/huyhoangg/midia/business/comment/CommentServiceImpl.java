package dev.huyhoangg.midia.business.comment;

import dev.huyhoangg.midia.codegen.types.CommentInput;
import dev.huyhoangg.midia.domain.model.comment.Comment;
import dev.huyhoangg.midia.domain.model.post.Post;
import dev.huyhoangg.midia.domain.repository.comment.CommentRepository;
import dev.huyhoangg.midia.domain.repository.post.PostRepository;
import dev.huyhoangg.midia.domain.repository.user.UserRepository;
import graphql.relay.Connection;
import graphql.relay.DefaultConnection;
import graphql.relay.DefaultPageInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentServiceImpl implements CommentService {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Override
    public Comment createComment(CommentInput input) {
        var jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var userId = jwt.getSubject();
        var currentUser = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        Post post =
                postRepository.findById(input.getPostId()).orElseThrow(() -> new RuntimeException("Post not found"));

        Comment parent = null;
        if (input.getParentId() != null) {
            parent = commentRepository
                    .findById(input.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
        }

        Comment comment = Comment.builder()
                .id(UUID.randomUUID().toString())
                .content(input.getContent())
                .author(currentUser)
                .post(post)
                .parent(parent)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .totalLikes(0L)
                .build();
        return commentRepository.save(comment);
    }

    @Override
    public Connection<Comment> getCommentsByPostId(String postId, Integer first, String after) {
        Connection<Comment> connection = commentRepository.findByPostIdOrderByCreatedAt(postId, first, after);
        if (connection == null) {
            return new DefaultConnection<>(Collections.emptyList(), new DefaultPageInfo(null, null, false, false));
        }
        return connection;
    }

    @Override
    public Connection<Comment> getRepliesByParentId(String parentId, Integer first, String after) {
        return commentRepository.findRepliesByParentIdOrderByCreatedAt(parentId, first, after);
    }

    @Override
    public Optional<Comment> findById(String id) {
        return commentRepository.findById(id);
    }

    @Override
    public boolean deleteComment(String id, String userId) {
        Optional<Comment> commentOpt = commentRepository.findById(id);
        if (commentOpt.isEmpty()) {
            return false;
        }

        Comment comment = commentOpt.get();
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this comment");
        }

        commentRepository.deleteById(id);
        return true;
    }

    @Override
    public void likeComment(String commentId, String userId) {
        commentRepository.addLike(commentId, userId);
    }

    @Override
    public void unlikeComment(String commentId, String userId) {
        commentRepository.removeLike(commentId, userId);
    }

    @Override
    public Connection<dev.huyhoangg.midia.domain.model.user.User> getLikesByCommentId(
            String commentId, Integer first, String after) {
        return commentRepository.findLikesByCommentIdOrderByLikedAt(commentId, first, after);
    }
}
