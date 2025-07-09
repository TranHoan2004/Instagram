package dev.huyhoangg.midia.business.notification;

import dev.huyhoangg.midia.domain.event.NotificationPayload;
import dev.huyhoangg.midia.domain.model.notification.Notification;
import dev.huyhoangg.midia.domain.model.notification.NotificationType;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;

public interface NotificationService {
    void createFollowNotification(String actorId, String recipientId);

    void createPostRelatedNotification(String actorId, String recipientId, String postId, NotificationType type);

    Map<String, List<Notification>> getNotificationBatch(String userId);

    List<Notification> getNotifications(String userId, int page, int size);

    long getUnreadNumber(String userId);

    void markAsRead(String notificationId);

    void markAsAllRead(String userId);

    Flux<Notification> subscribeToNotifications(String userId);

    void handlePostNotificationEvent(NotificationPayload payload);

    void handleFollowNotificationEvent(NotificationPayload payload);

    void handlePostRelatedNotificationEvent(NotificationPayload payload);
}
