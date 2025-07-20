package dev.huyhoangg.midia.business.attachment;

import com.google.common.io.Files;

import dev.huyhoangg.midia.business.storage.ObjectStorageService;
import dev.huyhoangg.midia.business.user.UserCommonService;
import dev.huyhoangg.midia.domain.event.AttachmentCreatedPayload;
import dev.huyhoangg.midia.domain.model.attachment.Attachment;
import dev.huyhoangg.midia.domain.model.attachment.AttachmentType;
import dev.huyhoangg.midia.domain.model.user.User;
import dev.huyhoangg.midia.domain.repository.attachment.AttachmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttachmentServiceImpl implements AttachmentService {
    private final ObjectStorageService objectStorageService;
    private final AttachmentRepository attachmentRepository;
    private final UserCommonService userCommonService;
    private final AttachmentEventProducer attachmentEventProducer;

    private static final Map<String, String> EXTENSION_TO_FOLDER = Map.of(
            "jpg", "images/",
            "jpeg", "images/",
            "png", "images/",
            "gif", "images/",
            "webp", "images/",
            "avif", "images/",
            "mp4", "videos/",
            "mov", "videos/",
            "mp3", "audios/",
            "ogg", "audios/");

    @Override
    @Async("asyncExecutor")
    public CompletableFuture<Attachment> createAttachmentFromFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        var filename = file.getOriginalFilename();

        if (filename == null || filename.isBlank()) {
            throw new IllegalArgumentException("Filename is null or blank");
        }

        var extension = Files.getFileExtension(filename);
        var folderName = getFolder(extension);
        var id = UUID.randomUUID().toString();
        var contentType = file.getContentType();
        var currentUserUid = userCommonService.getCurrentUserUid();

        try (var inputStream = file.getInputStream()) {
            if (folderName.equals("images/")) {
                return createAttachmentForImage(id, currentUserUid, folderName, extension, contentType, inputStream);
            }

            throw new IllegalArgumentException("Unsupported file type");
        } catch (IOException e) {
            log.error("Failed to upload file", e);
            throw new RuntimeException(e);
        }
    }

    @Async("asyncExecutor")
    protected CompletableFuture<Attachment> createAttachmentForImage(
            String id, String userUid, String folderName, String extension, String contentType, InputStream inputStream)
            throws IOException {
        var baseKey = folderName + id;
        var buffer = inputStream.readAllBytes();
        var originalFuture = objectStorageService.put(
                appendExtension(baseKey, extension), new ByteArrayInputStream(buffer), contentType);
        var user = new User();
        user.setUid(userUid);

        return originalFuture.thenApply(originalKey -> {
            attachmentEventProducer.sendAttachmentCreatedEvent(new AttachmentCreatedPayload(id, originalKey));

            var attachment = Attachment.builder()
                    .id(id)
                    .originalLink(originalKey)
                    .type(AttachmentType.IMAGE)
                    .createdBy(user)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();
            return attachmentRepository.save(attachment);
        });
    }

    private String getFolder(String extension) {
        return EXTENSION_TO_FOLDER.getOrDefault(extension, "mics/");
    }

    private String appendExtension(String name, String extension) {
        return name + "." + extension;
    }
}
