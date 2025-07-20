package dev.huyhoangg.midia.api.rest;

import dev.huyhoangg.midia.business.attachment.AttachmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/v1/attachments")
@Tag(name = "Upload File", description = "Upload File API")
@SecurityRequirement(name = "bearerToken")
@RequiredArgsConstructor
@Slf4j
public class AttachmentController {

    private final AttachmentService attachmentService;

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    @Operation(
            summary = "Create Attachment",
            description = "Upload File To Server and Create Attachment",
            requestBody =
                    @RequestBody(
                            required = true,
                            content =
                                    @Content(
                                            mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                                            schema = @Schema(type = "object", implementation = MultipartFile.class))))
    @ApiResponses(
            value = {
                @ApiResponse(responseCode = "200", description = "Success"),
                @ApiResponse(responseCode = "400", description = "Bad Request"),
                @ApiResponse(responseCode = "500", description = "Internal Server Error")
            })
    public CompletableFuture<ResponseEntity<Map<String, Object>>> createAttachment(
            @RequestPart("file") MultipartFile multipartFile) {
        return attachmentService
                .createAttachmentFromFile(multipartFile)
                .thenApply(attachment -> {
                    Map<String, Object> response = Map.of(
                            "success",
                            true,
                            "attachmentId",
                            attachment.getId(),
                            "message",
                            "File uploaded successfully");
                    return ResponseEntity.ok(response);
                })
                .exceptionally(e -> {
                    log.info("Attachment upload root cause", e);
                    Map<String, Object> response =
                            Map.of("success", false, "message", "Failed to upload file: " + e.getMessage());
                    return ResponseEntity.badRequest().body(response);
                });
    }
}
