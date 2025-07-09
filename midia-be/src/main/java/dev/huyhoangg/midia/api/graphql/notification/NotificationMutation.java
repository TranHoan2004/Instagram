package dev.huyhoangg.midia.api.graphql.notification;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.InputArgument;
import dev.huyhoangg.midia.business.notification.NotificationService;
import dev.huyhoangg.midia.business.user.UserCommonService;
import dev.huyhoangg.midia.business.notification.NotificationException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;

@DgsComponent
@RequiredArgsConstructor
public class NotificationMutation {
    private final NotificationService notificationService;
    private final UserCommonService userCommonService;

    @DgsMutation
    @PreAuthorize("isAuthenticated()")
    public boolean markNotificationAsRead(@InputArgument String id) {
        validateNotificationId(id);
        try {
            notificationService.markAsRead(id);
            return true;
        } catch (NotificationException e) {
            throw e;
        } catch (Exception e) {
            throw new NotificationException.NotificationUpdateException("mark notification as read", e);
        }
    }

    @DgsMutation
    @PreAuthorize("isAuthenticated()")
    public boolean markAllNotificationsAsRead() {
        String userUid = userCommonService.getCurrentUserUid();
        validateUserId(userUid);
        try {
            notificationService.markAsAllRead(userUid);
            return true;
        } catch (NotificationException e) {
            throw e;
        } catch (Exception e) {
            throw new NotificationException.NotificationUpdateException("mark all notifications as read", e);
        }
    }

    private void validateNotificationId(String id) {
        validateNotNull(id, "Notification ID");
    }

    private void validateUserId(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new NotificationException.UserNotFoundException("Current user ID is null or empty");
        }
    }

    private void validateActorId(String actorId) {
        validateNotNull(actorId, "Actor ID");
    }

    private void validateRecipientId(String recipientId) {
        validateNotNull(recipientId, "Recipient ID");
    }

    private void validatePostId(String postId) {
        validateNotNull(postId, "Post ID");
    }

    private void validateNotNull(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new NotificationException.InvalidInputException(fieldName);
        }
    }

    private void validateNotificationInputs(String actorId, String recipientId, String postId) {
        validateActorId(actorId);
        validateRecipientId(recipientId);
        validatePostId(postId);
    }
} 