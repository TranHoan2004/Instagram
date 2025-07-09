package dev.huyhoangg.midia.business.post;

import dev.huyhoangg.midia.codegen.types.CreatePostInput;
import dev.huyhoangg.midia.codegen.types.CreatePostResp;
import dev.huyhoangg.midia.domain.model.attachment.Attachment;
import dev.huyhoangg.midia.domain.model.post.Post;
import dev.huyhoangg.midia.domain.model.post.PostVisibility;
import dev.huyhoangg.midia.domain.model.user.User;
import dev.huyhoangg.midia.domain.repository.attachment.AttachmentRepository;
import dev.huyhoangg.midia.domain.repository.post.PostRepository;
import dev.huyhoangg.midia.domain.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final AttachmentRepository attachmentRepository;

    @Override
    public List<dev.huyhoangg.midia.codegen.types.Post> getPostsByAuthorId(String authorId) {
        List<Post> posts = postRepository.findByAuthorId(authorId);
        return posts.stream()
                .map(post -> dev.huyhoangg.midia.codegen.types.Post.newBuilder()
                        .id(post.getId())
                        .build())
                .toList();
    }

    @Override
    public CreatePostResp createPost(CreatePostInput input) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Post post = Post.builder()
                .id(UUID.randomUUID().toString())
                .caption(input.getCaption() != null ? input.getCaption() : "")
                .visibility(input.getVisibility() != null ? PostVisibility.valueOf(input.getVisibility().toString()) : PostVisibility.PUBLIC)
                .author(currentUser)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        // Nếu có attachmentIds, lấy các attachments và gán vào post
        if (input.getAttachmentIds() != null && !input.getAttachmentIds().isEmpty()) {
            Set<Attachment> attachments = new HashSet<>();
            for (String attachmentId : input.getAttachmentIds()) {
                Attachment attachment = attachmentRepository.findById(attachmentId)
                        .orElseThrow(() -> new RuntimeException("Attachment not found: " + attachmentId));
                attachments.add(attachment);
            }
            post.setAttachments(attachments);
        }

        postRepository.save(post);
        dev.huyhoangg.midia.codegen.types.Post graphqlPost = dev.huyhoangg.midia.codegen.types.Post.newBuilder()
                .id(post.getId())
                .caption(post.getCaption())
                .visibility(dev.huyhoangg.midia.codegen.types.PostVisibility.valueOf(post.getVisibility().toString()))
                .createdAt(post.getCreatedAt().toString())
                .updatedAt(post.getUpdatedAt() != null ? post.getUpdatedAt().toString() : null)
                .build();
        
        return CreatePostResp.newBuilder()
                .post(graphqlPost)
                .message("Post created successfully")
                .build();
    }
}