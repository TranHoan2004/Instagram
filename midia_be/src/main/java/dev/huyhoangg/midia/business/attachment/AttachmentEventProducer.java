package dev.huyhoangg.midia.business.attachment;

import dev.huyhoangg.midia.domain.event.AttachmentCreatedPayload;

public interface AttachmentEventProducer {

    void sendAttachmentCreatedEvent(AttachmentCreatedPayload payload);
}
