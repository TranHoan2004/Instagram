package dev.huyhoangg.midia.business.notification.processor;

import dev.huyhoangg.midia.business.notification.NotificationEventProducer;
import dev.huyhoangg.midia.business.notification.annotation.PostNotify;
import dev.huyhoangg.midia.business.notification.annotation.PreNotify;
import dev.huyhoangg.midia.business.user.UserCommonService;
import dev.huyhoangg.midia.domain.event.NotificationPayload;
import dev.huyhoangg.midia.domain.model.notification.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.HashMap;
import java.util.Map;

@RequiredArgsConstructor
@Slf4j
public abstract class AbstractNotifyProcessor {
    protected final NotificationEventProducer notificationEventProducer;
    protected final UserCommonService userCommonService;

    public void processPreNotify(Method method, Object[] args) {
        PreNotify preNotify = method.getAnnotation(PreNotify.class);
        if (preNotify != null && preNotify.enabled()) {
            try {
                NotificationPayload payload = extractNotificationPayload(method, args, null, preNotify.type(),
                        preNotify.actorIdParam(), preNotify.recipientIdParam(), preNotify.postIdParam());
                sendNotification(preNotify.type(), payload);
                log.info("PreNotify processed for method: {} with type: {}", method.getName(), preNotify.type());
            } catch (Exception e) {
                log.error("Failed to process PreNotify for method: {}", method.getName(), e);
            }
        }
    }

    public void processPostNotify(Method method, Object[] args, Object result) {
        PostNotify postNotify = method.getAnnotation(PostNotify.class);
        if (postNotify != null && postNotify.enabled()) {
            try {
                NotificationPayload payload = extractNotificationPayload(method, args, result, postNotify.type(),
                        postNotify.actorIdParam(), postNotify.recipientIdParam(), postNotify.postIdParam());

                sendNotification(postNotify.type(), payload);
            } catch (Exception e) {
                log.error("Failed to process PostNotify for method: {}", method.getName(), e);
            }
        } else {
            log.warn("PostNotify annotation is null or disabled for method: {}", method.getName());
        }
    }

    protected void sendNotification(NotificationType type, NotificationPayload payload) {
        switch (type) {
            case FOLLOW -> notificationEventProducer.produceFollowNotification(payload);
            case LIKE -> notificationEventProducer.produceLikeNotification(payload);
            case COMMENT -> notificationEventProducer.produceCommentNotification(payload);
            case MENTION -> notificationEventProducer.produceMentionNotification(payload);
            case POST_CREATED -> notificationEventProducer.producePostNotification(payload);
            default -> log.warn("Unhandled notification type: {}", type);
        }
    }

    protected NotificationPayload extractNotificationPayload(Method method, Object[] args, Object result,
                                                             NotificationType type, String actorIdParam,
                                                             String recipientIdParam, String postIdParam) {
        Map<String, String> paramValues = extractParameterValues(method, args);

        if (result != null) {
            extractFromResultObject(result, paramValues);
        }

        String actorId = paramValues.get(actorIdParam);
        String recipientId = paramValues.get(recipientIdParam);
        String postId = paramValues.get(postIdParam);

        if (actorId == null || actorId.trim().isEmpty()) {
            actorId = userCommonService.getMyInfo().getId();
        }

        return NotificationPayload.builder()
                .actorId(actorId)
                .recipientId(recipientId)
                .postId(postId)
                .type(type.name())
                .build();
    }

    protected void extractFromResultObject(Object resultObject, Map<String, String> paramValues) {
        try {
            Class<?> clazz = resultObject.getClass();

            if ("CreatePostResp".equals(clazz.getSimpleName())) {
                java.lang.reflect.Method getPost = clazz.getMethod("getPost");
                Object post = getPost.invoke(resultObject);

                if (post != null) {
                    java.lang.reflect.Method getId = post.getClass().getMethod("getId");
                    String postId = (String) getId.invoke(post);
                    paramValues.put("postId", postId);
                    paramValues.put("id", postId);
                }
            }

            java.lang.reflect.Field[] fields = clazz.getDeclaredFields();
            for (java.lang.reflect.Field field : fields) {
                field.setAccessible(true);
                Object value = field.get(resultObject);
                if (value instanceof String) {
                    paramValues.put(field.getName(), (String) value);
                }
            }
        } catch (Exception e) {
            log.debug("Could not extract values from result object: {}", resultObject.getClass().getSimpleName(), e);
        }
    }

    protected Map<String, String> extractParameterValues(Method method, Object[] args) {
        Map<String, String> paramValues = new HashMap<>();
        Parameter[] params = method.getParameters();

        for (int i = 0; i < params.length && i < args.length; i++) {
            Parameter param = params[i];
            Object arg = args[i];

            if (args != null) {
                paramValues.put(param.getName(), arg.toString());
            } else {
                extractFromInputObject(args, paramValues);
            }
        }

        return paramValues;
    }

    protected void extractFromInputObject(Object[] inputObj, Map<String, String> paramValues) {
        try {
            Class<?> clazz = inputObj.getClass();
            java.lang.reflect.Field[] fields = clazz.getDeclaredFields();

            for (java.lang.reflect.Field field : fields) {
                field.setAccessible(true);
                Object val = field.get(inputObj);
                if (val instanceof String) {
                    paramValues.put(field.getName(), (String) val);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to extract values from input object: {}", inputObj.getClass().getSimpleName(), e);
        }
    }

    protected abstract void handleCustomNotification(NotificationPayload payload);
}
