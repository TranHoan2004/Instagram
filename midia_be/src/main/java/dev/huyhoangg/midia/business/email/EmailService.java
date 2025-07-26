package dev.huyhoangg.midia.business.email;

import dev.huyhoangg.midia.domain.event.UserEmailVerificationPayload;
import dev.huyhoangg.midia.domain.event.PasswordResetPayload;

public interface EmailService {

    void sendVerificationEmail(UserEmailVerificationPayload payload);
    
    void sendResetPasswordEmail(PasswordResetPayload payload);
}
