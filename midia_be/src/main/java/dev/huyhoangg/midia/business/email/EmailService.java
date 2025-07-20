package dev.huyhoangg.midia.business.email;

import dev.huyhoangg.midia.domain.event.UserEmailVerificationPayload;

public interface EmailService {

    void sendVerificationEmail(UserEmailVerificationPayload payload);
}
