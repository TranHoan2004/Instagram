package dev.huyhoangg.midia.domain.event;

import lombok.Builder;
import lombok.With;

@Builder
@With
public record AttachmentCreatedPayload(String id, String objectKey) {}
