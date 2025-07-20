package dev.huyhoangg.midia.business.notification;

import dev.huyhoangg.midia.domain.model.notification.Notification;
import dev.huyhoangg.midia.domain.repository.notification.NotificationRepository;
import dev.huyhoangg.midia.domain.repository.post.PostRepository;
import dev.huyhoangg.midia.domain.repository.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PostRepository postRepository;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    @Test
    void createFollowNotification_ShouldNotCreateWhenActorEqualsRecipient() {
        String userId = "user123";

        notificationService.createFollowNotification(userId, userId);

        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    void createFollowNotification_ShouldNotCreateWhenNotificationExists() {
        String actorId = "actor123";
        String recipientId = "recipient123";
        when(notificationRepository.existsByActorAndRecipientAndType(actorId, recipientId, "FOLLOW"))
                .thenReturn(true);

        notificationService.createFollowNotification(actorId, recipientId);

        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    void markAsRead_ShouldHandleValidNotificationId() {
        String notificationId = "notification123";

        notificationService.markAsRead(notificationId);

        verify(notificationRepository).markAsRead(notificationId);
    }

    @Test
    void getUnreadNumber_ShouldReturnCountFromRepository() {
        String userId = "user123";
        long expectedCount = 5L;
        when(notificationRepository.countUnreadByRecipientId(userId)).thenReturn(expectedCount);

        long result = notificationService.getUnreadNumber(userId);

        assert result == expectedCount;
        verify(notificationRepository).countUnreadByRecipientId(userId);
    }
} 