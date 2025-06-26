package dev.huyhoangg.midia.domain.repository.attachment;

import dev.huyhoangg.midia.domain.model.attachment.Attachment;

import java.util.Optional;

public interface AttachmentRepository {
    Attachment save(Attachment attachment);
    Optional<Attachment> findById(String id);
    void deleteById(String id);
} 