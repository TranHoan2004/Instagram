package dev.huyhoangg.midia.infrastructure.kafka.producer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import dev.huyhoangg.midia.business.attachment.AttachmentEvent;
import dev.huyhoangg.midia.business.attachment.AttachmentEventProducer;
import dev.huyhoangg.midia.domain.event.AttachmentCreatedPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class KafkaAttachmentEventProducer implements AttachmentEventProducer {
    private final KafkaTemplate<String, byte[]> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public void sendAttachmentCreatedEvent(AttachmentCreatedPayload payload) {
        try {
            kafkaTemplate.send(AttachmentEvent.IMAGE_UPLOADED, objectMapper.writeValueAsBytes(payload));
        } catch (JsonProcessingException e) {
            log.info("Failed to send attachment created event", e);
        }
    }
}
