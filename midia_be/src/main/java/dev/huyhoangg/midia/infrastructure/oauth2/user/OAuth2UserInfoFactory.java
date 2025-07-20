package dev.huyhoangg.midia.infrastructure.oauth2.user;

import java.util.Map;

public final class OAuth2UserInfoFactory {
    private OAuth2UserInfoFactory() {
    }

    public static OAuth2UserInfo getOAuth2UserInfo(String registrationId, Map<String, Object> attributes) {
        switch (registrationId.toLowerCase()) {
            case "google" -> {
                return new GoogleOAuth2UserInfo(attributes);
            }
            case "github" -> {
                return new GithubOAuth2UserInfo(attributes);
            }
            default -> {
                throw new IllegalArgumentException("Sorry! Login with " + registrationId + " is not supported yet.");
            }
        }
    }
}
