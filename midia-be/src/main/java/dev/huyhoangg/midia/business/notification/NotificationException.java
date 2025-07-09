package dev.huyhoangg.midia.business.notification;

public class NotificationException extends RuntimeException {
    
    public NotificationException(String message) {
        super(message);
    }
    
    public NotificationException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public static class UserNotFoundException extends NotificationException {
        public UserNotFoundException(String userId) {
            super("User not found: " + userId);
        }
    }
    
    public static class PostNotFoundException extends NotificationException {
        public PostNotFoundException(String postId) {
            super("Post not found: " + postId);
        }
    }
    
    public static class InvalidNotificationTypeException extends NotificationException {
        public InvalidNotificationTypeException(String type) {
            super("Invalid notification type: " + type);
        }
    }
    
    public static class NotificationCreationException extends NotificationException {
        public NotificationCreationException(String message, Throwable cause) {
            super("Failed to create notification: " + message, cause);
        }
    }

    public static class SubscriptionException extends NotificationException {
        public SubscriptionException(String userId, String message) {
            super("Subscription error for user " + userId + ": " + message);
        }
        
        public SubscriptionException(String userId, Throwable cause) {
            super("Subscription error for user " + userId, cause);
        }
    }

    public static class NotificationConversionException extends NotificationException {
        public NotificationConversionException(String message) {
            super("Failed to convert notification: " + message);
        }
        
        public NotificationConversionException(String message, Throwable cause) {
            super("Failed to convert notification: " + message, cause);
        }
    }

    public static class InvalidInputException extends NotificationException {
        public InvalidInputException(String fieldName) {
            super(fieldName + " cannot be null or empty");
        }
        
        public InvalidInputException(String message, String fieldName) {
            super(message + ": " + fieldName);
        }
    }

    public static class NotificationNotFoundException extends NotificationException {
        public NotificationNotFoundException(String notificationId) {
            super("Notification not found: " + notificationId);
        }
    }

    public static class NotificationUpdateException extends NotificationException {
        public NotificationUpdateException(String message) {
            super("Failed to update notification: " + message);
        }
        
        public NotificationUpdateException(String message, Throwable cause) {
            super("Failed to update notification: " + message, cause);
        }
    }
} 