package dev.huyhoangg.midia.infrastructure.oauth2;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

import static dev.huyhoangg.midia.infrastructure.oauth2.HttpCookieOAuth2AuthorizationRequestRepository.REDIRECT_URI_PARAM_COOKIE_NAME;

@Component
@RequiredArgsConstructor
public class OAuth2FailureHandler extends SimpleUrlAuthenticationFailureHandler {
    private final HttpCookieOAuth2AuthorizationRequestRepository oAuth2AuthorizationRequestRepository;

    @Value("${web-frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request, HttpServletResponse response, AuthenticationException exception)
            throws IOException, ServletException {
        var redirectUrl = CookieUtils.getCookie(request, REDIRECT_URI_PARAM_COOKIE_NAME)
                .map(Cookie::getValue)
                .orElse(frontendUrl + "/oauth2/redirect");

        redirectUrl = UriComponentsBuilder.fromUriString(redirectUrl)
                .queryParam("error", exception.getMessage())
                .build()
                .toUriString();

        oAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(response);

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
