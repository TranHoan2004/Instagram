package dev.huyhoangg.midia.infrastructure.kafka.producer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.huyhoangg.midia.business.notification.NotificationEvent;
import dev.huyhoangg.midia.business.notification.NotificationEventProducer;
import dev.huyhoangg.midia.domain.event.NotificationPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class KafkaNotificationEventProducer implements NotificationEventProducer {
    private final KafkaTemplate<String, byte[]> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public void produceFollowNotification(NotificationPayload payload) {
        try {
            kafkaTemplate.send(NotificationEvent.NOTIFICATION_FOLLOW, objectMapper.writeValueAsBytes(payload));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void produceLikeNotification(NotificationPayload payload) {
        try {
            kafkaTemplate.send(NotificationEvent.NOTIFICATION_LIKE, objectMapper.writeValueAsBytes(payload));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void produceCommentNotification(NotificationPayload payload) {
        try {
            kafkaTemplate.send(NotificationEvent.NOTIFICATION_COMMENT, objectMapper.writeValueAsBytes(payload));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void produceMentionNotification(NotificationPayload payload) {
        try {
            kafkaTemplate.send(NotificationEvent.NOTIFICATION_MENTION, objectMapper.writeValueAsBytes(payload));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void producePostNotification(NotificationPayload payload) {
        try {
            byte[] payloadBytes = objectMapper.writeValueAsBytes(payload);
            kafkaTemplate.send(NotificationEvent.NOTIFICATION_POST, payloadBytes);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
} 