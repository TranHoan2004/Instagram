package dev.huyhoangg.midia.business.auth;

public class UnauthenticatedException extends RuntimeException {
    public UnauthenticatedException() {
        super("Unauthenticated");
    }
}
