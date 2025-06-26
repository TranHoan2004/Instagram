package dev.huyhoangg.midia.infrastructure.kafka.producer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.huyhoangg.midia.business.user.UserEvent;
import dev.huyhoangg.midia.business.user.UserEventProducer;
import dev.huyhoangg.midia.domain.event.UserEmailVerificationPayload;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class KafkaUserEventProducer implements UserEventProducer {
    private final KafkaTemplate<String, byte[]> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public void produceUserEmailVerifiedEvent(UserEmailVerificationPayload payload) {
        try {
            kafkaTemplate.send(UserEvent.USER_EMAIL_VERIFY, objectMapper.writeValueAsBytes(payload));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
