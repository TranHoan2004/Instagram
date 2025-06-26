package dev.huyhoangg.midia.api.rest;

import dev.huyhoangg.midia.business.attachment.AttachmentService;
import dev.huyhoangg.midia.domain.model.attachment.Attachment;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/upload")
@Tag(name = "Upload File", description = "Upload File API")
@RequiredArgsConstructor
public class UploadFileController {

    private final AttachmentService attachmentService;

    @PostMapping
    @Operation(summary = "Upload File", description = "Upload File To Server and Create Attachment")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Success"),
            @ApiResponse(responseCode = "400", description = "Bad Request"),
            @ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @RequestBody(
            required = true,
            description = "File to upload",
            content = @Content(mediaType = "multipart/form-data", schema = @Schema(type = "string", format = "binary"))
    )
    public ResponseEntity<Map<String, Object>> uploadFile(@RequestParam("file") MultipartFile multipartFile) {
        try {
            Attachment attachment = attachmentService.createAttachmentFromFile(multipartFile);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("attachmentId", attachment.getId());
            response.put("originalLink", attachment.getOriginalLink());
            response.put("message", "File uploaded successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to upload file: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }
}
