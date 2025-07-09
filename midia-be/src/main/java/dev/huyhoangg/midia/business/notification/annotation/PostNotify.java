package dev.huyhoangg.midia.business.notification.annotation;

import dev.huyhoangg.midia.domain.model.notification.NotificationType;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface PostNotify {
    NotificationType type();

    String actorIdParam() default "actorId";

    String recipientIdParam() default "recipientId";

    String postIdParam() default "postId";

    boolean enabled() default true;
}
