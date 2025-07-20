package dev.huyhoangg.midia.domain.event;

import lombok.Builder;
import lombok.With;

@Builder
@With
public record UserEmailVerificationPayload(
        String userId,
        String email,
        String fullName
) {
}
