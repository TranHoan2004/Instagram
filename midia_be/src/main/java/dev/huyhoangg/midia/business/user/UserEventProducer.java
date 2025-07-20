package dev.huyhoangg.midia.business.user;

import dev.huyhoangg.midia.domain.event.UserEmailVerificationPayload;

public interface UserEventProducer {

    void produceUserEmailVerifiedEvent(UserEmailVerificationPayload payload);
}
