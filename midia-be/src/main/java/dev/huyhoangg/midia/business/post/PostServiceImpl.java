package dev.huyhoangg.midia.business.post;

import dev.huyhoangg.midia.domain.model.attachment.Attachment;
import dev.huyhoangg.midia.domain.model.post.Post;
import dev.huyhoangg.midia.domain.model.post.PostVisibility;
import dev.huyhoangg.midia.domain.model.user.User;
import dev.huyhoangg.midia.domain.repository.attachment.AttachmentRepository;
import dev.huyhoangg.midia.domain.repository.post.PostRepository;
import dev.huyhoangg.midia.domain.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
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
    public Post createPost(String caption, PostVisibility visibility, List<String> attachmentIds) {
        // Sử dụng user mặc định
        User currentUser = getDefaultUser();

        // Tạo Post mới
        Post post = Post.builder()
                .id(UUID.randomUUID().toString())
                .caption(caption)
                .visibility(visibility != null ? visibility : PostVisibility.PUBLIC)
                .author(currentUser)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        // Nếu có attachmentIds, lấy các attachments và gán vào post
        if (attachmentIds != null && !attachmentIds.isEmpty()) {
            Set<Attachment> attachments = new HashSet<>();
            for (String attachmentId : attachmentIds) {
                Attachment attachment = attachmentRepository.findById(attachmentId)
                        .orElseThrow(() -> new RuntimeException("Attachment not found: " + attachmentId));
                attachments.add(attachment);
            }
            post.setAttachments(attachments);
        }

        return postRepository.save(post);
    }

    @Override
    public List<Post> getPostsByAuthorId(String authorId) {
        return postRepository.findByAuthorId(authorId);
    }
    
    private User getDefaultUser() {
        return userRepository.findByUsername("testuser")
                .orElseGet(() -> {
                    User defaultUser = User.builder()
                            .id(UUID.randomUUID().toString())
                            .username("testuser")
                            .email("test@example.com")
                            .password("password")
                            .createdAt(Instant.now())
                            .updatedAt(Instant.now())
                            .build();
                    return userRepository.save(defaultUser);
                });
    }
} 