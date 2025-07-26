package dev.huyhoangg.midia.business.notification;

import dev.huyhoangg.midia.domain.event.NotificationPayload;
import dev.huyhoangg.midia.domain.model.notification.Notification;
import dev.huyhoangg.midia.domain.model.notification.NotificationType;
import dev.huyhoangg.midia.domain.model.post.Post;
import dev.huyhoangg.midia.domain.model.user.User;
import dev.huyhoangg.midia.domain.repository.notification.NotificationRepository;
import dev.huyhoangg.midia.domain.repository.post.PostRepository;
import dev.huyhoangg.midia.domain.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    private final Map<String, Sinks.Many<Notification>> activeSubscribers = new ConcurrentHashMap<>();

    @Override
    public void createFollowNotification(String actorId, String recipientId) {
        if (actorId.equals(recipientId)) return;

        if (notificationRepository.existsByActorAndRecipientAndType(actorId, recipientId, "FOLLOW")) {
            return;
        }

        User actor = userRepository.findById(actorId)
                .orElseThrow(() -> new NotificationException.UserNotFoundException(actorId));
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new NotificationException.UserNotFoundException(recipientId));

        Notification notification = Notification.builder()
                .id(UUID.randomUUID().toString())
                .type("FOLLOW")
                .actor(actor)
                .recipient(recipient)
                .message("started following you.")
                .isRead(false)
                .createdAt(Instant.now())
                .build();

        Notification saved = notificationRepository.save(notification);
        emitNotificationToUser(recipientId, saved);
    }

    @Override
    public void createPostRelatedNotification(String actorId, String recipientId, String postId, NotificationType type) {
        if (type == NotificationType.LIKE &&
                notificationRepository.existsByActorAndRecipientAndType(actorId, recipientId, type.name())) {
            return;
        }

        User actor = userRepository.findById(actorId)
                .orElseThrow(() -> new NotificationException.UserNotFoundException(actorId));
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new NotificationException.UserNotFoundException(recipientId));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotificationException.PostNotFoundException(postId));

        String message = switch (type) {
            case LIKE -> "liked your post.";
            case COMMENT -> "commented on your post.";
            case MENTION -> "mentioned you in a post.";
            case POST_CREATED -> "created a new post.";
            default -> throw new NotificationException.InvalidNotificationTypeException(type.name());
        };

        Notification notification = Notification.builder()
                .id(UUID.randomUUID().toString())
                .type(type.name())
                .actor(actor)
                .recipient(recipient)
                .post(post)
                .message(message)
                .isRead(false)
                .createdAt(Instant.now())
                .build();

        Notification saved = notificationRepository.save(notification);
        emitNotificationToUser(recipientId, saved);
    }

    @Override
    public Map<String, List<Notification>> getNotificationBatch(String userId) {
        List<Notification> notifications = notificationRepository.findByRecipientId(userId, 100, 0);
        return groupNotificationsByTime(notifications);
    }

    @Override
    public List<Notification> getNotifications(String userId, int page, int size) {
        return notificationRepository.findByRecipientId(userId, size, page * size);
    }

    @Override
    public long getUnreadNumber(String userId) {
        return notificationRepository.countUnreadByRecipientId(userId);
    }

    @Override
    public void markAsRead(String notificationId) {
        notificationRepository.markAsRead(notificationId);
    }

    @Override
    public void markAsAllRead(String userId) {
        notificationRepository.markAsReadByRecipientId(userId);
    }

    @Override
    public Flux<Notification> subscribeToNotifications(String userId) {
        Sinks.Many<Notification> sink = activeSubscribers.computeIfAbsent(userId,
                k -> Sinks.many().multicast().onBackpressureBuffer());

        // Poll for new notifications every 10 seconds using DGraph queries (reduced frequency)
        Flux<Notification> pollingFlux = Flux.interval(Duration.ofSeconds(10))
                .flatMap(tick -> {
                    try {
                        // Get timestamp from 15 seconds ago to catch recent notifications
                        Instant fifteenSecondsAgo = Instant.now().minusSeconds(15);
                        List<Notification> newNotifications =
                                notificationRepository.findNotificationAfterTimestamp(userId, fifteenSecondsAgo);
                        return Flux.fromIterable(newNotifications);
                    } catch (Exception e) {
                        log.error("Error polling notifications for user {}: {}", userId, e.getMessage());
                        return Flux.empty();
                    }
                })
                .distinct(Notification::getId)
                .onErrorContinue((error, obj) -> {
                    log.error("Error in polling flux for user {}: {}", userId, error.getMessage());
                });

        // Combine real-time emissions with polling fallback
        return Flux.merge(sink.asFlux(), pollingFlux)
                .doOnCancel(() -> {
                    log.info("User {} unsubscribed from notifications", userId);
                    activeSubscribers.remove(userId);
                })
                .doOnError(error -> {
                    log.error("Error in notification subscription for user {}", userId, error);
                    activeSubscribers.remove(userId);
                })
                .onErrorContinue((error, obj) -> {
                    log.error("Continuing after error in notification stream for user {}: {}", userId, error.getMessage());
                });
    }

    @Override
    public void handlePostNotificationEvent(NotificationPayload payload) {
        try {
            Optional<User> actorOpt = userRepository.findByIdWithFollowers(payload.getActorId());
            
            if (actorOpt.isEmpty()) {
                log.warn("findByIdWithFollowers failed for user {}, trying regular findById", payload.getActorId());
                actorOpt = userRepository.findById(payload.getActorId());
            }
            
            User actor = actorOpt.orElseThrow(() -> new NotificationException.UserNotFoundException(payload.getActorId()));

            if (actor.getFollowers() != null && !actor.getFollowers().isEmpty()) {
                for (User follower : actor.getFollowers()) {
                    createPostRelatedNotification(
                            payload.getActorId(),
                            follower.getId(),
                            payload.getPostId(),
                            NotificationType.POST_CREATED
                    );
                }
                log.info("Sent post notifications to {} followers of user {}", 
                        actor.getFollowers().size(), payload.getActorId());
            } else {
                log.info("User {} has no followers to notify", payload.getActorId());
            }
        } catch (Exception e) {
            log.error("Failed to handle post notification event for actor {}", payload.getActorId(), e);
            throw e;
        }
    }

    @Override
    public void handleFollowNotificationEvent(NotificationPayload payload) {
        try {
            createFollowNotification(payload.getActorId(), payload.getRecipientId());
        } catch (Exception e) {
            log.error("Failed to handle follow notification event: actor {}, recipient {}",
                    payload.getActorId(), payload.getRecipientId(), e);
            throw e;
        }
    }

    @Override
    public void handlePostRelatedNotificationEvent(NotificationPayload payload) {
        try {
            NotificationType type = NotificationType.valueOf(payload.getType());
            createPostRelatedNotification(
                    payload.getActorId(),
                    payload.getRecipientId(),
                    payload.getPostId(),
                    type
            );
        } catch (Exception e) {
            log.error("Failed to handle post-related notification event: type {}, actor {}, recipient {}",
                    payload.getType(), payload.getActorId(), payload.getRecipientId(), e);
            throw e;
        }
    }

    private void emitNotificationToUser(String userId, Notification notification) {
        Sinks.Many<Notification> sink = activeSubscribers.get(userId);
        if (sink != null) {
            Sinks.EmitResult result = sink.tryEmitNext(notification);
            if (result.isFailure()) {
                log.warn("Failed to emit notification to user {}: {}", userId, result);
            }
        }
    }

    private Map<String, List<Notification>> groupNotificationsByTime(List<Notification> notifications) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = now.toLocalDate().atStartOfDay();
        LocalDateTime startOfYesterday = startOfToday.minusDays(1);
        LocalDateTime startOfLastWeek = startOfToday.minusDays(7);

        Map<String, List<Notification>> grouped = new LinkedHashMap<>();
        grouped.put("yesterday", new ArrayList<>());
        grouped.put("thisWeek", new ArrayList<>());
        grouped.put("earlier", new ArrayList<>());

        for (Notification notification : notifications) {
            LocalDateTime notificationTime = LocalDateTime.ofInstant(notification.getCreatedAt(), ZoneId.systemDefault());

            if (notificationTime.isAfter(startOfYesterday) && notificationTime.isBefore(startOfToday)) {
                grouped.get("yesterday").add(notification);
            } else if (notificationTime.isAfter(startOfLastWeek)) {
                grouped.get("thisWeek").add(notification);
            } else {
                grouped.get("earlier").add(notification);
            }
        }

        return grouped;
    }
}
