package dev.huyhoangg.midia.business.storage;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.concurrent.CompletableFuture;

public interface ObjectStorageService {

    /**
     * Uploads a file to the object storage then return the object key.
     *
     * @param file File to upload
     * @return Object key of the uploaded file
     */
    CompletableFuture<String> upload(MultipartFile file) throws IOException;

    String getObjectUrl(String objectKey);
}
