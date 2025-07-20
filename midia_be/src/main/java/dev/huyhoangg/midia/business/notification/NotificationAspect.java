package dev.huyhoangg.midia.business.notification;

import dev.huyhoangg.midia.business.notification.processor.AbstractNotifyProcessor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationAspect {
    private final AbstractNotifyProcessor notifyProcessor;

    @Before("@annotation(dev.huyhoangg.midia.business.notification.annotation.PreNotify)")
    public void handlePreNotify(JoinPoint joinPoint) {
        try {
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            Object[] args = joinPoint.getArgs();

            notifyProcessor.processPreNotify(method, args);
        } catch (Exception e) {
            log.error("Error processing PreNotify annotation", e);
        }
    }

    @AfterReturning(pointcut = "@annotation(dev.huyhoangg.midia.business.notification.annotation.PostNotify)",
    returning = "result")
    public void handlePostNotify(JoinPoint joinPoint, Object result) {
        try {
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            Object[] args = joinPoint.getArgs();

            notifyProcessor.processPostNotify(method, args, result);
        } catch (Exception e) {
            log.error("Error processing PostNotify annotation", e);
        }
    }
}
