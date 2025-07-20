package dev.huyhoangg.midia.business.user;

public class UserNotExistsException extends RuntimeException {
    public UserNotExistsException() {
        super("User not exists");
    }
}
