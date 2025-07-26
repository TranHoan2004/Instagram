package dev.huyhoangg.midia.domain.repository.attachment;

import dev.huyhoangg.midia.domain.model.attachment.Attachment;

import java.util.List;
import java.util.Optional;

public interface AttachmentRepository {
    Attachment save(Attachment attachment);

    Optional<Attachment> findById(String id);

    List<Attachment> findByPostId(String postId);

    void deleteById(String id);

    java.util.List<Attachment> findAll();
}
