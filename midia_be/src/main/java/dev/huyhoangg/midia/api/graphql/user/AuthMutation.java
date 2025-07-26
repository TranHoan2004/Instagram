package dev.huyhoangg.midia.api.graphql.user;

import jakarta.servlet.http.Cookie;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsDataFetchingEnvironment;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.InputArgument;
import com.netflix.graphql.dgs.internal.DgsWebMvcRequestData;

import dev.huyhoangg.midia.business.auth.AuthService;
import dev.huyhoangg.midia.business.auth.UnauthenticatedException;
import dev.huyhoangg.midia.codegen.types.IntrospectResp;
import dev.huyhoangg.midia.codegen.types.LoginInput;
import dev.huyhoangg.midia.codegen.types.LoginResp;
import dev.huyhoangg.midia.codegen.types.RefreshTokenResp;
import dev.huyhoangg.midia.codegen.types.UpdatePasswordResp;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.context.request.ServletWebRequest;

import java.util.Arrays;
import java.util.Objects;

@DgsComponent
@RequiredArgsConstructor
@Slf4j
public class AuthMutation {
    private final AuthService authService;
    private final Environment environment;

    @Value("${jwt.refresh-duration}")
    private long REFRESH_DURATION;

    @DgsMutation
    public IntrospectResp introspect(@InputArgument String token, @RequestHeader("Authorization") String authHeader) {
        return authService.introspect(token, authHeader);
    }

    @DgsMutation
    public LoginResp login(@InputArgument("input") LoginInput input, DgsDataFetchingEnvironment dfe) {
        var requestData = (DgsWebMvcRequestData) dfe.getDgsContext().getRequestData();
        var webRequest = (ServletWebRequest) Objects.requireNonNull(requestData).getWebRequest();
        var loginResp = authService.login(input);
        var responseCookie = ResponseCookie.from("refresh_token", loginResp.getRefreshToken())
                .httpOnly(true)
                .secure(Arrays.asList(environment.getActiveProfiles()).contains("prod"))
                .maxAge(REFRESH_DURATION)
                .path("/")
                .sameSite("Lax")
                .build();
        var response = Objects.requireNonNull(webRequest).getResponse();
        Objects.requireNonNull(response).addHeader(HttpHeaders.SET_COOKIE, responseCookie.toString());
        return loginResp;
    }

    @DgsMutation
    public RefreshTokenResp refreshToken(@InputArgument String refreshToken, DgsDataFetchingEnvironment dfe) {
        var requestData = (DgsWebMvcRequestData) dfe.getDgsContext().getRequestData();
        var webRequest = (ServletWebRequest) Objects.requireNonNull(requestData).getWebRequest();
        final RefreshTokenResp resp;
        // for mobile apps which usually save the token in secured local storage
        if (refreshToken != null && !refreshToken.isBlank()) {
            resp = authService.refreshToken(refreshToken);
        } else {
            var request = Objects.requireNonNull(webRequest).getRequest();
            var refreshCookie = Arrays.stream(request.getCookies())
                    .filter(cookie -> cookie.getName().equals("refresh_token"))
                    .findFirst()
                    .map(Cookie::getValue)
                    .orElseThrow(UnauthenticatedException::new);
            resp = authService.refreshToken(refreshCookie);
        }

        return resp;
    }

    @DgsMutation
    public String logout(@InputArgument String refreshToken, DgsDataFetchingEnvironment dfe) {
        var requestData = (DgsWebMvcRequestData) dfe.getDgsContext().getRequestData();
        var webRequest = (ServletWebRequest) Objects.requireNonNull(requestData).getWebRequest();
        var request = Objects.requireNonNull(webRequest).getRequest();
        var accessToken = request.getHeader(HttpHeaders.AUTHORIZATION).substring(7);
        if (refreshToken != null && !refreshToken.isBlank()) {
            return authService.logout(accessToken, refreshToken, webRequest.getResponse());
        }
        var refreshCookie = Arrays.stream(request.getCookies())
                .filter(cookie -> cookie.getName().equals("refresh_token"))
                .findFirst()
                .map(Cookie::getValue)
                .orElseThrow(UnauthenticatedException::new);
        return authService.logout(accessToken, refreshCookie, webRequest.getResponse());
    }
}
