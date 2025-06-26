package dev.huyhoangg.midia.business.attachment;

import dev.huyhoangg.midia.domain.model.attachment.Attachment;
import org.springframework.web.multipart.MultipartFile;

public interface AttachmentService {
    Attachment createAttachmentFromFile(MultipartFile file);
} 