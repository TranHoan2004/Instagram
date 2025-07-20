package dev.huyhoangg.midia.infrastructure.oauth2;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.SerializationUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

import java.io.Serializable;
import java.util.Base64;
import java.util.Optional;

public final class CookieUtils {
    private CookieUtils() {}

    public static Optional<Cookie> getCookie(HttpServletRequest request, String name) {
        var cookies = request.getCookies();
        if (cookies == null) return Optional.empty();
        for (var cookie : cookies) {
            if (cookie.getName().equals(name)) {
                return Optional.of(cookie);
            }
        }
        return Optional.empty();
    }

    public static void addCookie(String cookieName, String cookieValue, HttpServletResponse response, long maxAge) {
        var cookie = ResponseCookie.from(cookieName, cookieValue)
                .path("/")
                .httpOnly(true)
                .maxAge(maxAge)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public static void deleteCookie(String cookieName, HttpServletResponse response) {
        var cookie = ResponseCookie.from(cookieName, "")
                .path("/")
                .httpOnly(true)
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public static String base64Encode(Serializable obj) {
        return Base64.getUrlEncoder().encodeToString(SerializationUtils.serialize(obj));
    }

    public static <T> T base64Decode(Cookie cookie, Class<T> clazz) {
        var data = Base64.getUrlDecoder().decode(cookie.getValue());
        var obj = SerializationUtils.deserialize(data);
        return clazz.cast(obj);
    }
}
