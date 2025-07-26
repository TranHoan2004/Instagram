package dev.huyhoangg.midia.domain.event;

import lombok.Builder;
import lombok.With;

@Builder
@With
public record PasswordResetPayload(String userId, String email, String fullName, String resetToken) {} 