package dev.huyhoangg.midia.business.auth;

public class LockedAccountException extends RuntimeException {
    public LockedAccountException() {
        super("Your account has been locked");
    }
}
