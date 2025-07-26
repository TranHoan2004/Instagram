package dev.huyhoangg.midia.business.user;

public class UserNotExistsException extends RuntimeException {
    public UserNotExistsException() {
        super();
    }

    public UserNotExistsException(String message) {
        super(message);
    }
}