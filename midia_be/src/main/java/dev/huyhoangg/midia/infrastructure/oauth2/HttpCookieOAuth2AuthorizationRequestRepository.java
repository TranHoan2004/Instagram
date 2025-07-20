package dev.huyhoangg.midia.infrastructure.oauth2;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;

@Component
public class HttpCookieOAuth2AuthorizationRequestRepository
        implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {
    public static final String OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME = "oauth2_auth_request";
    public static final String REDIRECT_URI_PARAM_COOKIE_NAME = "redirect_uri";
    public static final int COOKIE_EXPIRE_SECONDS = 300;

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        return CookieUtils.getCookie(request, OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME)
                .map(cookie -> CookieUtils.base64Decode(cookie, OAuth2AuthorizationRequest.class))
                .orElse(null);
    }

    @Override
    public void saveAuthorizationRequest(
            OAuth2AuthorizationRequest authorizationRequest, HttpServletRequest request, HttpServletResponse response) {
        if (authorizationRequest == null) {
            CookieUtils.deleteCookie(OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME, response);
            CookieUtils.deleteCookie(REDIRECT_URI_PARAM_COOKIE_NAME, response);
            return;
        }

        CookieUtils.addCookie(
                OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME,
                CookieUtils.base64Encode(authorizationRequest),
                response,
                COOKIE_EXPIRE_SECONDS);
        var redirectUriAfterLogin = request.getParameter(REDIRECT_URI_PARAM_COOKIE_NAME);

        if (redirectUriAfterLogin != null && !redirectUriAfterLogin.isBlank()) {
            CookieUtils.addCookie(
                    REDIRECT_URI_PARAM_COOKIE_NAME, redirectUriAfterLogin, response, COOKIE_EXPIRE_SECONDS);
        }
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(
            HttpServletRequest request, HttpServletResponse response) {
        return this.loadAuthorizationRequest(request);
    }

    public void removeAuthorizationRequestCookies(HttpServletResponse response) {
        CookieUtils.deleteCookie(OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME, response);
        CookieUtils.deleteCookie(REDIRECT_URI_PARAM_COOKIE_NAME, response);
    }
}
