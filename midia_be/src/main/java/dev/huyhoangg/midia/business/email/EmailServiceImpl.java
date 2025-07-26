package dev.huyhoangg.midia.business.email;

import jakarta.mail.MessagingException;

import dev.huyhoangg.midia.domain.event.UserEmailVerificationPayload;
import dev.huyhoangg.midia.domain.event.PasswordResetPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final RedisTemplate<String, String> redisTemplate;

    @Value("${email-verification.url}")
    private String emailVerificationUrl;

    @Value("${email-verification.valid-duration}")
    private long validDuration;

    @Value("${reset-password.url}")
    private String resetPasswordUrl;

    @Value("${reset-password.valid-duration}")
    private long resetPasswordValidDuration;

    @Override
    public void sendVerificationEmail(UserEmailVerificationPayload payload) {
        final var token = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(token, payload.email(), validDuration, TimeUnit.SECONDS);
        var context = new Context();
        context.setLocale(Locale.getDefault());
        context.setVariable("fullName", payload.fullName());
        context.setVariable("verifyUrl", emailVerificationUrl + "?token=" + token + "&id=" + payload.userId());
        var htmlContent = templateEngine.process("email-verification", context);
        try {
            sendEmailWithHtml(payload.email(), "Verify your email", htmlContent);
        } catch (MessagingException e) {
            log.error("Failed to send verification email", e);
        }
    }

    private void sendEmailWithHtml(String to, String subject, String htmlContent) throws MessagingException {
        var mimeMessage = mailSender.createMimeMessage();
        var helper = new MimeMessageHelper(mimeMessage, true, "utf-8");
        helper.setFrom("noreply@midia.com");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        mailSender.send(mimeMessage);
    }

    @Override
    public void sendResetPasswordEmail(PasswordResetPayload payload) {
        // Lưu resetToken vào Redis với key: "reset-password:<userId>", value: resetToken
        redisTemplate.opsForValue().set("reset-password:" + payload.userId(), payload.resetToken(), resetPasswordValidDuration, TimeUnit.SECONDS);
        String url = resetPasswordUrl + "?userId=" + payload.userId() + "&resetToken=" + payload.resetToken();
        
        var context = new Context();
        context.setLocale(Locale.getDefault());
        context.setVariable("fullName", payload.fullName());
        context.setVariable("resetUrl", url);
        var htmlContent = templateEngine.process("reset-password", context);
        try {
            sendEmailWithHtml(payload.email(), "Reset your password", htmlContent);
        } catch (MessagingException e) {
            log.error("Failed to send reset password email", e);
        }
    }
}
