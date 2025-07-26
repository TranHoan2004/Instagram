package dev.huyhoangg.midia.business.user;

public class RoleNotExistsException extends RuntimeException {
    public RoleNotExistsException(String message) {
        super(message);
    }
} 