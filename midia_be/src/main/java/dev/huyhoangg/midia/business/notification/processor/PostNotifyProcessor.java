package dev.huyhoangg.midia.business.notification.processor;

import dev.huyhoangg.midia.business.notification.NotificationEventProducer;
import dev.huyhoangg.midia.business.user.UserCommonService;
import dev.huyhoangg.midia.domain.event.NotificationPayload;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class PostNotifyProcessor extends AbstractNotifyProcessor {
    public PostNotifyProcessor(NotificationEventProducer notificationEventProducer,
                               UserCommonService userCommonService) {
        super(notificationEventProducer, userCommonService);
    }

    @Override
    protected void handleCustomNotification(NotificationPayload payload) {
        if (payload.getPostId() != null && payload.getRecipientId() != null) {
            try {
                notificationEventProducer.producePostNotification(payload);
            } catch (Exception e) {
                log.error("Failed to create custom post notification", e);
            }
        }
    }
}
