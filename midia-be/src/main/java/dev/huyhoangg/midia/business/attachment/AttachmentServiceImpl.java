package dev.huyhoangg.midia.business.attachment;

import dev.huyhoangg.midia.domain.model.attachment.Attachment;
import dev.huyhoangg.midia.domain.repository.attachment.AttachmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.HashSet;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttachmentServiceImpl implements AttachmentService {

    private final AttachmentRepository attachmentRepository;

    @Override
    public Attachment createAttachmentFromFile(MultipartFile file) {
        // Tạo tên file duy nhất
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        // Tạo link cho file (trong thực tế sẽ upload lên cloud storage)
        String originalLink = "/uploads/" + UUID.randomUUID().toString() + fileExtension;
        
        // Tạo Attachment mới
        Attachment attachment = Attachment.builder()
                .id(UUID.randomUUID().toString())
                .title(originalFilename)
                .description("Uploaded file: " + originalFilename)
                .originalLink(originalLink)
                .optimizedLinks(new HashSet<>()) // Có thể thêm các link optimized sau
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return attachmentRepository.save(attachment);
    }
    
    /**
     * Tạo attachment mẫu để test
     */
    public Attachment createSampleAttachment(String title, String description) {
        Attachment attachment = Attachment.builder()
                .id(UUID.randomUUID().toString())
                .title(title)
                .description(description)
                .originalLink("/uploads/sample/" + UUID.randomUUID().toString() + ".jpg")
                .optimizedLinks(new HashSet<>())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return attachmentRepository.save(attachment);
    }
} 