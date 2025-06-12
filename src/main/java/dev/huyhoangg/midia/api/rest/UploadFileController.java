package dev.huyhoangg.midia.api.rest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/upload")
@Tag(name = "Upload File", description = "Upload File API")
public class UploadFileController {

    @PostMapping
    @Operation(summary = "Upload File", description = "Upload File To Server")
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
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile multipartFile) {
        return ResponseEntity.ok().build();
    }
}
