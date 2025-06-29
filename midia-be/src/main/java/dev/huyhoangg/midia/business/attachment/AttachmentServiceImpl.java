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
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String originalLink = "/uploads/" + UUID.randomUUID().toString() + fileExtension;
        
        // Tạo Attachment mới
        Attachment attachment = Attachment.builder()
                .id(UUID.randomUUID().toString())
                .title(originalFilename)
                .description("Uploaded file: " + originalFilename)
                .originalLink(originalLink)
                .optimizedLinks(new HashSet<>())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return attachmentRepository.save(attachment);
    }
} 