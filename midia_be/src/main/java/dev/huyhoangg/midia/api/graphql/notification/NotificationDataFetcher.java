package dev.huyhoangg.midia.api.graphql.notification;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.DgsSubscription;
import dev.huyhoangg.midia.business.notification.NotificationService;
import dev.huyhoangg.midia.business.user.UserCommonService;
import dev.huyhoangg.midia.business.user.UserConversionUtil;
import dev.huyhoangg.midia.codegen.types.Notification;
import dev.huyhoangg.midia.codegen.types.NotificationBatch;
import dev.huyhoangg.midia.codegen.types.NotificationType;
import dev.huyhoangg.midia.business.notification.NotificationException;
import dev.huyhoangg.midia.domain.model.post.Post;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import reactor.core.publisher.Flux;

@DgsComponent
@RequiredArgsConstructor
public class NotificationDataFetcher {
    private final NotificationService notificationService;
    private final UserCommonService userCommonService;
    private final UserConversionUtil userConversionUtil;

    @DgsQuery
    @PreAuthorize("isAuthenticated()")
    public NotificationBatch notifications() {
        String userUid = userCommonService.getCurrentUserUid();
        if (userUid == null || userUid.trim().isEmpty()) {
            throw new NotificationException.UserNotFoundException("Current user");
        }

        var notificationMap = notificationService.getNotificationBatch(userUid);

        return NotificationBatch.newBuilder()
                .yesterday(convertToCodegenNotifications(notificationMap.get("yesterday")))
                .thisWeek(convertToCodegenNotifications(notificationMap.get("thisWeek")))
                .earlier(convertToCodegenNotifications(notificationMap.get("earlier")))
                .build();
    }

    @DgsQuery
    @PreAuthorize("isAuthenticated()")
    public int unreadNotificationCount() {
        String userUid = userCommonService.getCurrentUserUid();
        if (userUid == null || userUid.trim().isEmpty()) {
            throw new NotificationException.UserNotFoundException("Current user");
        }

        return (int) notificationService.getUnreadNumber(userUid);
    }

    @DgsSubscription
    @PreAuthorize("isAuthenticated()")
    public Flux<Notification> notificationUpdates() {
        String userUid = userCommonService.getCurrentUserUid();
        if (userUid == null || userUid.trim().isEmpty()) {
            throw new NotificationException.UserNotFoundException("Current user");
        }
        
        return notificationService.subscribeToNotifications(userUid)
                .map(this::convertToCodegenNotification);
    }

    private java.util.List<Notification> convertToCodegenNotifications(
            java.util.List<dev.huyhoangg.midia.domain.model.notification.Notification> domainNotifications) {
        if (domainNotifications == null) return java.util.List.of();

        return domainNotifications.stream()
                .map(this::convertToCodegenNotification)
                .toList();
    }

    private Notification convertToCodegenNotification(
            dev.huyhoangg.midia.domain.model.notification.Notification domain) {
        if (domain == null) {
            throw new NotificationException("Domain notification cannot be null");
        }

        try {
            return Notification.newBuilder()
                    .id(domain.getId())
                    .type(NotificationType.valueOf(domain.getType()))
                    .message(domain.getMessage() != null ? domain.getMessage() : "")
                    .isRead(domain.isRead())
                    .createdAt(domain.getCreatedAt() != null ? domain.getCreatedAt().toString() : "")
                    .actor(domain.getActor() != null ? userConversionUtil.toMinimalGraphQLUserType(domain.getActor()) : null)
                    .post(domain.getPost() != null ? convertPost(domain.getPost()) : null)
                    .build();
        } catch (IllegalArgumentException e) {
            throw new NotificationException.InvalidNotificationTypeException(domain.getType());
        }
    }

    private dev.huyhoangg.midia.codegen.types.Post convertPost(
            Post post) {
        if (post == null) {
            return null;
        }

        return dev.huyhoangg.midia.codegen.types.Post.newBuilder()
                .id(post.getId() != null ? post.getId() : "")
                .caption(post.getCaption() != null ? post.getCaption() : "")
                .visibility(dev.huyhoangg.midia.codegen.types.PostVisibility.PUBLIC)
                .createdAt(post.getCreatedAt() != null ? post.getCreatedAt() : java.time.Instant.now())
                .totalLikes(post.getTotalLikes() != null ? post.getTotalLikes() : 0L)
                .totalComments(post.getTotalComments() != null ? post.getTotalComments() : 0L)
                .author(post.getAuthor() != null ? userConversionUtil.toMinimalGraphQLUserType(post.getAuthor()) : userConversionUtil.toMinimalGraphQLUserType(new dev.huyhoangg.midia.domain.model.user.User()))
                .build();
    }
}