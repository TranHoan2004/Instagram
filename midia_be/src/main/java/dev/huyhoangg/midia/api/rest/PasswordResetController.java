package dev.huyhoangg.midia.api.rest;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;

import dev.huyhoangg.midia.business.user.UserEventProducer;
import dev.huyhoangg.midia.domain.event.PasswordResetPayload;
import dev.huyhoangg.midia.domain.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class PasswordResetController {
    private final UserEventProducer userEventProducer;
    private final UserRepository userRepository;

    @PostMapping("/reset-password")
    public ResponseEntity<?> sendResetEmail(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        var user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email address does not exist in the system"));
        }
        
        String resetToken = UUID.randomUUID().toString();
        
        // Tạo payload và gửi event qua Kafka để offload việc gửi email
        PasswordResetPayload payload = PasswordResetPayload.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getProfile().getFullName())
                .resetToken(resetToken)
                .build();
        
        userEventProducer.producePasswordResetEvent(payload);
        
        return ResponseEntity.ok(Map.of("success", true, "message", "Password reset email sent successfully"));
    }

}