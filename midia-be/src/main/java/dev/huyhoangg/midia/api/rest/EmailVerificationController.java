package dev.huyhoangg.midia.api.rest;

import dev.huyhoangg.midia.business.user.UserCommonService;
import dev.huyhoangg.midia.business.user.UserEventProducer;
import dev.huyhoangg.midia.domain.event.UserEmailVerificationPayload;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/verify-email")
@RequiredArgsConstructor
@Tag(name = "Email Verification", description = "APIs for email verification")
public class EmailVerificationController {
    private final UserCommonService userCommonService;
    private final UserEventProducer userEventProducer;

    @GetMapping
    public ResponseEntity<Map<String, String>> verifyEmail(
            @RequestParam("token") String token,
            @RequestParam("id") String id
    ) {
        Map<String, String> response;
        if (userCommonService.verifyEmail(token, id)) {
            response = Map.of("message", "Email verified successfully");
            return ResponseEntity.ok(response);
        }
        response = Map.of("message", "Email verified failed");
        return ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/resend")
    public ResponseEntity<Map<String, String>> resendVerificationEmail(@RequestBody EmailVerificationRequest request) {
        var user = userCommonService.getUserByEmail(request.email());
        userEventProducer.produceUserEmailVerifiedEvent(new UserEmailVerificationPayload(
                user.getId(),
                user.getEmail(),
                user.getProfile().getFullName()
        ));
        return ResponseEntity.ok(Map.of("message", "Verification email sent successfully"));
    }

    public record EmailVerificationRequest(String email) {
    }
}
