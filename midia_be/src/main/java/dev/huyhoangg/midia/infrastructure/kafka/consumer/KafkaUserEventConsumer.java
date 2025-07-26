package dev.huyhoangg.midia.infrastructure.kafka.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;

import dev.huyhoangg.midia.business.email.EmailService;
import dev.huyhoangg.midia.business.user.UserEvent;
import dev.huyhoangg.midia.domain.event.UserEmailVerificationPayload;
import dev.huyhoangg.midia.domain.event.PasswordResetPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class KafkaUserEventConsumer {
    private final ObjectMapper objectMapper;
    private final EmailService emailService;

    @KafkaListener(topics = UserEvent.USER_EMAIL_VERIFY, groupId = "midia")
    public void onUserEmailVerifiedEvent(byte[] payload) {
        try {
            var userEmailVerificationPayload = objectMapper.readValue(payload, UserEmailVerificationPayload.class);
            log.info("received payload: {}", userEmailVerificationPayload);
            emailService.sendVerificationEmail(userEmailVerificationPayload);
        } catch (IOException e) {
            log.error("Failed to handle user email verified event", e);
        }
    }

    @KafkaListener(topics = UserEvent.PASSWORD_RESET, groupId = "midia")
    public void onPasswordResetEvent(byte[] payload) {
        try {
            var passwordResetPayload = objectMapper.readValue(payload, PasswordResetPayload.class);
            log.info("received password reset payload: {}", passwordResetPayload);
            emailService.sendResetPasswordEmail(passwordResetPayload);
        } catch (IOException e) {
            log.error("Failed to handle password reset event", e);
        }
    }
}
