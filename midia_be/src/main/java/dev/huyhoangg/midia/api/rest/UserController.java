package dev.huyhoangg.midia.api.rest;

import dev.huyhoangg.midia.business.storage.ObjectStorageService;
import dev.huyhoangg.midia.business.user.UserCommonService;
import dev.huyhoangg.midia.domain.model.user.UserProfile;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/edit_avatar")
@SecurityRequirement(name = "bearerToken")
@Tag(name = "User Controller", description = "Edit avatar url API")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    UserCommonService userCommonService;
    ObjectStorageService csService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> editUserProfile(
            @RequestParam(value = "avatar", required = false) MultipartFile file,
            @RequestParam("userId") String userId
    ) throws IOException {
        var objectKey = file != null ? uploadAvatar(file) : null;
        userCommonService.editUserProfile(userId, UserProfile.builder()
                .bio(null)
                .phoneNumber(null)
                .fullName(null)
                .gender(null)
                .avatarUrl(objectKey)
                .build());

        var avatarUrl = getAvatarUrl(userId);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "userProfile", avatarUrl == null ? "null" : avatarUrl,
                "message", "File uploaded successfully"));
    }

    private String uploadAvatar(MultipartFile file) throws IOException {
        var objectKey = "images/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        CompletableFuture<String> future = csService.put(
                objectKey,
                file.getInputStream(),
                file.getContentType());
        return future.join();
    }

    private String getAvatarUrl(String userId) {
        var user = userCommonService.getUserProfile(userId);
        var objectKey = user.getAvatarUrl();
        return (objectKey != null && !objectKey.startsWith("https")) ?
                csService.getObjectUrl(objectKey) : objectKey;
    }
}
