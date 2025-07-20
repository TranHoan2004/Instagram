package dev.huyhoangg.midia.business.post;

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
import graphql.relay.Connection;
import graphql.relay.DefaultConnection;
import graphql.relay.DefaultEdge;
import graphql.relay.Edge;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final AttachmentRepository attachmentRepository;
    private final PostMapper postMapper;

    @Override
    public Connection<dev.huyhoangg.midia.codegen.types.Post> getPostsByAuthorId(
            String authorId, Integer first, String after, SortDirection sortDirection) {
        var postConnection = postRepository.findByAuthorIdOrderByCreatedAt(authorId, first, after, sortDirection);

        List<Edge<dev.huyhoangg.midia.codegen.types.Post>> edges = postConnection.getEdges().stream()
                .map(postModelEdge -> {
                    var postModel = postModelEdge.getNode();
                    var post = postMapper.toGraphQLPost(postModel);
                    return new DefaultEdge<>(post, postModelEdge.getCursor());
                })
                .collect(Collectors.toUnmodifiableList());

        return new DefaultConnection<>(edges, postConnection.getPageInfo());
    }

    @Override
    public CreatePostResp createPost(CreatePostInput input) {
        var jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var userId = jwt.getSubject();
        User currentUser =
                userRepository.findById(userId).orElseThrow(UserNotExistsException::new);

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
