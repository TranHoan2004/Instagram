package dev.huyhoangg.midia.infrastructure.oauth2;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import dev.huyhoangg.midia.infrastructure.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.util.Optional;

import static dev.huyhoangg.midia.infrastructure.oauth2.HttpCookieOAuth2AuthorizationRequestRepository.REDIRECT_URI_PARAM_COOKIE_NAME;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final JwtService jwtService;
    private final HttpCookieOAuth2AuthorizationRequestRepository oAuth2AuthorizationRequestRepository;
    private final OAuth2Properties oAuth2Properties;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws ServletException, IOException {
        var redirectUrl = determineTargetUrl(request, response, authentication);

        if (response.isCommitted()) {
            log.debug("Response has already been committed. Unable to redirect to {}", redirectUrl);
            return;
        }

        clearAuthenticationAttributes(request, response);

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    protected String determineTargetUrl(
            HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        Optional<String> redirectUri =
                CookieUtils.getCookie(request, REDIRECT_URI_PARAM_COOKIE_NAME).map(Cookie::getValue);

        if (redirectUri.isPresent() && !isAuthorizedRedirectUri(redirectUri.get())) {
            throw new IllegalStateException(
                    "Sorry! We've got an Unauthorized Redirect URI and can't proceed with the authentication");
        }

        var targetUrl = redirectUri.orElse(getDefaultTargetUrl());

        var oAuth2UserProxy = (CustomOAuth2UserService.OAuth2UserProxy) authentication.getPrincipal();
        var accessToken = jwtService.generateToken(oAuth2UserProxy.user(), false);
        var refreshToken = jwtService.generateToken(oAuth2UserProxy.user(), true);

        return UriComponentsBuilder.fromUriString(targetUrl)
                .queryParam("access_token", accessToken)
                .queryParam("access_token_expires_in", jwtService.getValidDuration())
                .queryParam("refresh_token", refreshToken)
                .queryParam("refresh_token_expires_in", jwtService.getRefreshDuration())
                .build()
                .toUriString();
    }

    protected void clearAuthenticationAttributes(HttpServletRequest request, HttpServletResponse response) {
        super.clearAuthenticationAttributes(request);
        oAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(response);
    }

    private boolean isAuthorizedRedirectUri(String uri) {
        var clientRedirectUri = URI.create(uri);

        return oAuth2Properties.getRedirectUris().stream().anyMatch(successRedirectUri -> {
            // Only validate host and port. Let the clients use different paths if they want to
            var authorizedURI = URI.create(successRedirectUri);
            return authorizedURI.getHost().equalsIgnoreCase(clientRedirectUri.getHost())
                    && authorizedURI.getPort() == clientRedirectUri.getPort();
        });
    }
}
