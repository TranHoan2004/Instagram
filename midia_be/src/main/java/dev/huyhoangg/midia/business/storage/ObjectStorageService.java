package dev.huyhoangg.midia.business.storage;

import java.io.IOException;
import java.io.InputStream;
import java.util.concurrent.CompletableFuture;

public interface ObjectStorageService {

    /**
     * Put an input stream to the object storage then return the object key.
     *
     * @param objectKey unique key for the object
     * @param inputStream InputStream to upload
     * @return Object key of the uploaded object
     */
    CompletableFuture<String> put(String objectKey, InputStream inputStream) throws IOException;

    CompletableFuture<String> put(String objectKey, InputStream inputStream, String contentType) throws IOException;

    String getObjectUrl(String objectKey);
}
