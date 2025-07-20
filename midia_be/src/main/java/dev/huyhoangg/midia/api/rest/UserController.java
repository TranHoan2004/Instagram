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
        var avatarUrl = file != null ? getAvatarUrl(file) : null;
        userCommonService.editUserProfile(userId, UserProfile.builder()
                .bio(null)
                .phoneNumber(null)
                .fullName(null)
                .gender(null)
                .avatarUrl(avatarUrl)
                .build());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "userProfile", avatarUrl == null ? "null" : avatarUrl,
                "message", "File uploaded successfully"));
    }

    private String getAvatarUrl(MultipartFile file) throws IOException {
        CompletableFuture<String> future = csService.put(file.getOriginalFilename(), file.getInputStream(), file.getContentType());
        var objectKey = future.join();
        return csService.getObjectUrl(objectKey);
    }
}
