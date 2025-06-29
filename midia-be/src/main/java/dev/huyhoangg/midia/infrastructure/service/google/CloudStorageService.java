package dev.huyhoangg.midia.infrastructure.service.google;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.common.io.Files;
import dev.huyhoangg.midia.business.storage.ObjectStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudStorageService implements ObjectStorageService {
    private final Storage storage;

    @Value("${gcs.bucket}")
    private String bucketName;

    private static final Map<String, String> EXTENSION_TO_FOLDER = Map.of(
            "jpg", "images/",
            "jpeg", "images/",
            "png", "images/",
            "mp4", "videos/",
            "mov", "videos/",
            "mp3", "audios/",
            "ogg", "audios/"
    );

    @Override
    @Async
    public CompletableFuture<String> upload(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("File is empty");
        }

        var filename = file.getOriginalFilename();
        if (filename == null || filename.isEmpty()) {
            throw new IllegalArgumentException("Filename is null or empty");
        }

        var extension = Files.getFileExtension(filename);
        var folderName = EXTENSION_TO_FOLDER.getOrDefault(extension.toLowerCase(), "misc/");
        var uniqueFilename = UUID.randomUUID() + "_" + filename;
        var key = folderName + uniqueFilename;

        var blobInfo = BlobInfo.newBuilder(bucketName, key)
                .setContentType(file.getContentType())
                .build();
        log.info("Uploading file {} to bucket {}", uniqueFilename, bucketName);
        storage.createFrom(blobInfo, file.getInputStream());

        return CompletableFuture.completedFuture(blobInfo.getName());
    }

    @Override
    public String getObjectUrl(String objectKey) {
        if (objectKey == null || objectKey.isEmpty()) {
            throw new IllegalArgumentException("Object key is null or empty");
        }
        var blobId = BlobId.of(bucketName, objectKey);
        var blob = storage.get(blobId);
        if (blob == null || !blob.exists()) {
            throw new IllegalArgumentException("Object does not exist in bucket " + bucketName);
        }

        return storage.signUrl(
                        BlobInfo.newBuilder(blobId).build(),
                        1,
                        TimeUnit.DAYS,
                        Storage.SignUrlOption.withV4Signature())
                .toExternalForm();
    }
}
