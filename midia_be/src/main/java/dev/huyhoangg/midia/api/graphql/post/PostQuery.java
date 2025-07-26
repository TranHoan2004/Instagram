package dev.huyhoangg.midia.api.graphql.post;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.netflix.graphql.dgs.*;

import dev.huyhoangg.midia.business.attachment.AttachmentService;
import dev.huyhoangg.midia.business.comment.CommentMapper;
import dev.huyhoangg.midia.business.comment.CommentService;
import dev.huyhoangg.midia.business.post.PostService;
import dev.huyhoangg.midia.business.storage.ObjectStorageService;
import dev.huyhoangg.midia.business.user.UserCommonService;
import dev.huyhoangg.midia.codegen.types.Attachment;
import dev.huyhoangg.midia.codegen.types.Comment;
import dev.huyhoangg.midia.codegen.types.Post;
import dev.huyhoangg.midia.codegen.types.Sort;
import dev.huyhoangg.midia.codegen.types.User;
import dev.huyhoangg.midia.domain.repository.SortDirection;
import dev.huyhoangg.midia.infrastructure.util.ConnectionUtil;
import graphql.relay.Connection;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.Assert;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@DgsComponent
@RequiredArgsConstructor
@Slf4j
public class PostQuery {
    private final PostService postService;
    private final UserCommonService userCommonService;
    private final AttachmentService attachmentService;
    private final CommentService commentService;
    private final ObjectStorageService objectStorageService;
    private final ObjectMapper objectMapper;
    private final CommentMapper commentMapper;

    @DgsQuery
    @PreAuthorize("isAuthenticated()")
    public Post post(@InputArgument String postId) {
        return postService.getPost(postId);
    }

    @DgsQuery
    @PreAuthorize("isAuthenticated()")
    public Connection<Post> postsByUser(@InputArgument String userId, DgsDataFetchingEnvironment dfe) {
        var first = dfe.getArgumentOrDefault("first", 10);
        String after = dfe.getArgument("after");
        var sortDirection = SortDirection.valueOf(dfe.getArgumentOrDefault("sortDirection", Sort.DESC.name()));
        return postService.getPostsByAuthorId(userId, first, after, sortDirection);
    }

    @DgsQuery
    @PreAuthorize("isAuthenticated()")
    public Connection<Post> newsFeed(@InputArgument Optional<Integer> first, @InputArgument Optional<String> after) {
        var currentUser = userCommonService.getMyInfo();
        var offset = after.map(ConnectionUtil::getOffsetFromConnectionCursor).orElse(0);
        return postService.getNewsFeedByUserId(currentUser.getId(), first.orElse(10), offset);
    }

    @DgsData(parentType = "User", field = "posts")
    @PreAuthorize("isAuthenticated()")
    public Connection<Post> postsByAuthor(DgsDataFetchingEnvironment dfe) {
        User user = dfe.getSource();
        var first = dfe.getArgumentOrDefault("first", 10);
        String after = dfe.getArgument("after");
        var sortDirection = SortDirection.valueOf(dfe.getArgumentOrDefault("sortDirection", Sort.DESC.name()));
        Assert.notNull(user, "user must not be null");
        return postService.getPostsByAuthorId(user.getId(), first, after, sortDirection);
    }

    @DgsData(parentType = "Post")
    @PreAuthorize("isAuthenticated()")
    public User author(DgsDataFetchingEnvironment dfe) {
        Post post = dfe.getSource();
        String authorId = post.getAuthor() != null ? post.getAuthor().getId() : null;
        if (authorId == null) return null;
        return userCommonService.getUserById(authorId);
    }

    @DgsData(parentType = "Post")
    @PreAuthorize("isAuthenticated()")
    public List<Attachment> attachments(DgsDataFetchingEnvironment dfe) {
        Post post = dfe.getSource();
        if (post != null) {
            var attachments = attachmentService.getAttachmentsByPostId(post.getId());

            return attachments.stream().map(this::toAttachment).toList();
        }
        return null;
    }

    @DgsData(parentType = "Post", field = "comments")
    @PreAuthorize("isAuthenticated()")
    public Connection<Comment> comments(DgsDataFetchingEnvironment dfe) {
        Post post = dfe.getSource();
        Integer first = dfe.getArgument("first");
        String after = dfe.getArgument("after");
        
        var connection = commentService.getCommentsByPostId(post.getId(), first, after);
        return commentMapper.toCommentConnection(connection);
    }

    private Attachment toAttachment(dev.huyhoangg.midia.domain.model.attachment.Attachment attachment) {
        if (attachment == null) {
            return null;
        }

        Map<String, Object> optimizedLinks = null;
        var converted =
                objectMapper.convertValue(attachment.getOptimizedLinks(), new TypeReference<Map<String, String>>() {});

        if (converted != null) {
            optimizedLinks = converted.entrySet().stream()
                    .collect(Collectors.toMap(
                            Map.Entry::getKey, entry -> objectStorageService.getObjectUrl(entry.getValue())));
        }

        return Attachment.newBuilder()
                .id(attachment.getId())
                .originalLink(objectStorageService.getObjectUrl(attachment.getOriginalLink()))
                .optimizedLinks(optimizedLinks)
                .createdAt(attachment.getCreatedAt())
                .updatedAt(attachment.getUpdatedAt())
                .deletedAt(attachment.getDeletedAt())
                .build();
    }
}
