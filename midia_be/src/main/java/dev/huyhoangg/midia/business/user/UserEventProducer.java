package dev.huyhoangg.midia.business.user;

import dev.huyhoangg.midia.domain.event.UserEmailVerificationPayload;
import dev.huyhoangg.midia.domain.event.PasswordResetPayload;

public interface UserEventProducer {

    void produceUserEmailVerifiedEvent(UserEmailVerificationPayload payload);
    
    void producePasswordResetEvent(PasswordResetPayload payload);
}
