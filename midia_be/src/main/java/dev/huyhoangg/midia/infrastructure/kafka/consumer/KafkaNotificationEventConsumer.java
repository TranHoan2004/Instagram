package dev.huyhoangg.midia.infrastructure.kafka.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.huyhoangg.midia.business.notification.NotificationEvent;
import dev.huyhoangg.midia.business.notification.NotificationService;
import dev.huyhoangg.midia.domain.event.NotificationPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class KafkaNotificationEventConsumer {
    private final ObjectMapper objectMapper;
    private final NotificationService notificationService;

    @KafkaListener(topics = NotificationEvent.NOTIFICATION_POST, groupId = "midia")
    public void onPostNotification(byte[] payload) {
        handleNotificationEvent(payload, "post", notificationService::handlePostNotificationEvent);
    }

    @KafkaListener(topics = NotificationEvent.NOTIFICATION_FOLLOW, groupId = "midia")
    public void onFollowNotification(byte[] payload) {
        handleNotificationEvent(payload, "follow", notificationService::handleFollowNotificationEvent);
    }

    @KafkaListener(topics = NotificationEvent.NOTIFICATION_LIKE, groupId = "midia")
    public void onLikeNotification(byte[] payload) {
        handleNotificationEvent(payload, "like", notificationService::handlePostRelatedNotificationEvent);
    }

    @KafkaListener(topics = NotificationEvent.NOTIFICATION_COMMENT, groupId = "midia")
    public void onCommentNotification(byte[] payload) {
        handleNotificationEvent(payload, "comment", notificationService::handlePostRelatedNotificationEvent);
    }

    @KafkaListener(topics = NotificationEvent.NOTIFICATION_MENTION, groupId = "midia")
    public void onMentionNotification(byte[] payload) {
        handleNotificationEvent(payload, "mention", notificationService::handlePostRelatedNotificationEvent);
    }

    private void handleNotificationEvent(byte[] payload, String eventType, NotificationProcessor processor) {
        try {
            var notificationPayload = objectMapper.readValue(payload, NotificationPayload.class);
            log.info("Received {} notification event: {}", eventType, notificationPayload);
            processor.process(notificationPayload);
            log.info("Successfully processed {} notification event", eventType);
        } catch (IOException e) {
            log.error("Failed to handle {} notification event", eventType, e);
        } catch (Exception e) {
            log.error("Unexpected error handling {} notification event", eventType, e);
        }
    }

    @FunctionalInterface
    private interface NotificationProcessor {
        void process(NotificationPayload payload) throws Exception;
    }
} 