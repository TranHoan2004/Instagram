package dev.huyhoangg.midia.domain.repository.notification;

import dev.huyhoangg.midia.domain.model.notification.Notification;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface NotificationRepository {
    Notification save(Notification notification);

    Optional<Notification> findById(String id);

    List<Notification> findByRecipientId(String recipientId, int limit, int offset);

    List<Notification> findUnreadByRecipientId(String recipientId);

    Long countUnreadByRecipientId(String recipientId);

    void markAsRead(String notiId);

    void markAsReadByRecipientId(String recipientId);

    void deleteByActorAndRecipientAndType(String actor, String recipient, String type);

    boolean existsByActorAndRecipientAndType(String actorId, String recipientId, String type);

    List<Notification> findNotificationAfterTimestamp(String recipientId, Instant afterTimestamp);
}
