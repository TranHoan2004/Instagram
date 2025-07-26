package dev.huyhoangg.midia.business.attachment;

import dev.huyhoangg.midia.domain.model.attachment.Attachment;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.concurrent.CompletableFuture;

public interface AttachmentService {

    CompletableFuture<Attachment> createAttachmentFromFile(MultipartFile file);

    Attachment getAttachment(String id);

    List<Attachment> getAttachmentsByPostId(String postId);
}