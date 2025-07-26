package dev.huyhoangg.midia.business.post;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import dev.huyhoangg.midia.business.user.UserNotExistsException;
import dev.huyhoangg.midia.codegen.types.CreatePostInput;
import dev.huyhoangg.midia.codegen.types.CreatePostResp;
import dev.huyhoangg.midia.domain.model.attachment.Attachment;
import dev.huyhoangg.midia.domain.model.post.Post;
import dev.huyhoangg.midia.domain.model.post.PostVisibility;
import dev.huyhoangg.midia.domain.model.user.User;
import dev.huyhoangg.midia.domain.repository.SortDirection;
import dev.huyhoangg.midia.domain.repository.attachment.AttachmentRepository;
import dev.huyhoangg.midia.domain.repository.post.PostRepository;
import dev.huyhoangg.midia.domain.repository.user.UserRepository;
import dev.huyhoangg.midia.infrastructure.util.ConnectionUtil;
import graphql.relay.*;
import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {
    private static final Logger log = LoggerFactory.getLogger(PostServiceImpl.class);
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final AttachmentRepository attachmentRepository;
    private final PostMapper postMapper;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final PostGeneratedService postGeneratedService;

    @Override
    public Connection<dev.huyhoangg.midia.codegen.types.Post> getPostsByAuthorId(
            String authorId, Integer first, String after, SortDirection sortDirection) {
        var afterValue = ConnectionUtil.getCursorValueFromConnectionCursor(after);
        var posts = postRepository.findByAuthorIdOrderByCreatedAt(authorId, first + 1, afterValue, sortDirection);

        var hasNextPage = posts.size() > first;
        var paginatedPosts = hasNextPage ? posts.subList(0, first) : posts;
        List<Edge<dev.huyhoangg.midia.codegen.types.Post>> edges = paginatedPosts.stream()
                .map(post -> {
                    var cursor =
                            ConnectionUtil.connectionCursor(post.getCreatedAt().toString());
                    var graphqlPost = postMapper.toGraphQLPost(post);
                    return new DefaultEdge<>(graphqlPost, cursor);
                })
                .collect(Collectors.toList());

        var startCursor = edges.isEmpty() ? null : edges.getFirst().getCursor();
        var endCursor = edges.isEmpty() ? null : edges.getLast().getCursor();

        var pageInfo = new DefaultPageInfo(startCursor, endCursor, after != null, hasNextPage);

        return new DefaultConnection<>(edges, pageInfo);
    }

    @Override
    public dev.huyhoangg.midia.codegen.types.Post getPost(String postId) {
        return postMapper.toGraphQLPost(postRepository
                .findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found with id: " + postId)));
    }

    @Override
    public Connection<dev.huyhoangg.midia.codegen.types.Post> getNewsFeedByUserId(
            String userId, Integer first, Integer offset) {
        var json = redisTemplate.opsForValue().get(String.format("newsfeed:%s", userId));

        List<Post> posts;

        if (json == null) {
            posts = postGeneratedService.generateNewsFeedForUser(userId);
        } else {
            try {
                posts = objectMapper.readValue(json, new TypeReference<>() {});
            } catch (JsonProcessingException e) {
                log.error("Failed to read newsfeed from redis", e);
                posts = Collections.emptyList();
            }

        }

        int end = Math.min(offset + first + 1, posts.size());
        var pageSlice = posts.subList(offset, end);

        return ConnectionUtil.buildConnectionForOffsetBased(
                pageSlice, first, offset, postMapper::toGraphQLPostWithAttachments);
    }

    @Override
    public CreatePostResp createPost(CreatePostInput input) {
        var jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var userId = jwt.getSubject();
        User currentUser = userRepository.findById(userId).orElseThrow(UserNotExistsException::new);
        var currentStats = currentUser.getStats();
        currentStats.setTotalPosts(currentStats.getTotalPosts() + 1);
        currentUser.setStats(currentStats);

        Post post = Post.builder()
                .id(UUID.randomUUID().toString())
                .caption(input.getCaption() != null ? input.getCaption() : "")
                .visibility(
                        input.getVisibility() != null
                                ? PostVisibility.valueOf(input.getVisibility().toString())
                                : PostVisibility.PUBLIC)
                .author(currentUser)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        // Nếu có attachmentIds, lấy các attachments và gán vào post
        if (input.getAttachmentIds() != null && !input.getAttachmentIds().isEmpty()) {
            Set<Attachment> attachments = new HashSet<>();
            for (String attachmentId : input.getAttachmentIds()) {
                Attachment attachment = attachmentRepository
                        .findById(attachmentId)
                        .orElseThrow(() -> new RuntimeException("Attachment not found: " + attachmentId));
                attachments.add(attachment);
            }
            post.setAttachments(attachments);
        }

        postRepository.save(post);
        var graphqlPost = postMapper.toGraphQLPost(post);

        return CreatePostResp.newBuilder()
                .post(graphqlPost)
                .message("Post created successfully")
                .build();
    }
}
