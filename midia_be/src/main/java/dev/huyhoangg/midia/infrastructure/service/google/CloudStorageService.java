package dev.huyhoangg.midia.infrastructure.service.google;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;

import dev.huyhoangg.midia.business.storage.ObjectStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudStorageService implements ObjectStorageService {
    private final Storage storage;

    @Value("${gcs.bucket}")
    private String bucketName;

    @Override
    @Async
    public CompletableFuture<String> put(String objectKey, InputStream inputStream) throws IOException {
        var blobInfo = BlobInfo.newBuilder(bucketName, objectKey).build();
        log.info("Uploading {} to {}", objectKey, bucketName);
        storage.createFrom(blobInfo, inputStream);
        return CompletableFuture.completedFuture(objectKey);
    }

    @Override
    @Async
    public CompletableFuture<String> put(String objectKey, InputStream inputStream, String contentType)
            throws IOException {
        var blobInfo = BlobInfo.newBuilder(bucketName, objectKey)
                .setContentType(contentType)
                .build();
        log.info("Uploading {} to {} with content type {}", objectKey, bucketName, contentType);
        storage.createFrom(blobInfo, inputStream);
        return CompletableFuture.completedFuture(objectKey);
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
                        BlobInfo.newBuilder(blobId).build(), 1, TimeUnit.DAYS, Storage.SignUrlOption.withV4Signature())
                .toExternalForm();
    }
}
