package dev.huyhoangg.midia.business.notification;

import dev.huyhoangg.midia.domain.event.NotificationPayload;

public interface NotificationEventProducer {
    void produceFollowNotification(NotificationPayload payload);

    void produceLikeNotification(NotificationPayload payload);

    void produceCommentNotification(NotificationPayload payload);

    void produceMentionNotification(NotificationPayload payload);

    void producePostNotification(NotificationPayload payload);
} 