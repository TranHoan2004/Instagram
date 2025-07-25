package dev.huyhoangg.midia.business.auth;

import jakarta.servlet.http.HttpServletResponse;

import com.nimbusds.jose.JOSEException;

import dev.huyhoangg.midia.business.user.UserNotExistsException;
import dev.huyhoangg.midia.codegen.types.IntrospectResp;
import dev.huyhoangg.midia.codegen.types.LoginInput;
import dev.huyhoangg.midia.codegen.types.LoginResp;
import dev.huyhoangg.midia.codegen.types.RefreshTokenResp;
import dev.huyhoangg.midia.domain.repository.user.UserRepository;
import dev.huyhoangg.midia.infrastructure.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
@Lazy
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public LoginResp login(LoginInput input) {
        var user = userRepository.findByEmail(input.getEmailOrUsername()).orElseGet(() -> userRepository
                .findByUsername(input.getEmailOrUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Incorrect email or username")));
        
        if (!passwordEncoder.matches(input.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Incorrect password");
        }
        if (user.getIsLocked()) {
            throw new LockedAccountException();
        }

        userRepository.setLoginAt(user.getId(), Instant.now());

        return LoginResp.newBuilder()
                .accessToken(jwtService.generateToken(user, false))
                .accessTokenExpiresIn(jwtService.getValidDuration().toString())
                .refreshToken(jwtService.generateToken(user, true))
                .refreshTokenExpiresIn(jwtService.getRefreshDuration().toString())
                .message("Sign in successful")
                .build();
    }

    @Override
    public RefreshTokenResp refreshToken(String refreshToken) {
        try {
            var token = jwtService.verifyToken(refreshToken);
            var userId = token.getJWTClaimsSet().getSubject();

            var user = userRepository.findById(userId).orElseThrow(UserNotExistsException::new);
            return RefreshTokenResp.newBuilder()
                    .accessToken(jwtService.generateToken(user, false))
                    .accessTokenExpiresIn(jwtService.getValidDuration().toString())
                    .message("Refresh token successful")
                    .build();
        } catch (ParseException | JOSEException e) {
            throw new UnauthenticatedException();
        }
    }

    @Override
    public String logout(String accessToken, String refreshToken, HttpServletResponse response) {
        try {
            jwtService.invalidateToken(accessToken);
            jwtService.invalidateToken(refreshToken);
            if (response != null) {
                response.addHeader(HttpHeaders.AUTHORIZATION, "");
                var cookie = ResponseCookie.from("refresh_token", "").maxAge(0).build();
                response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
            }
        } catch (ParseException | JOSEException e) {
            log.info("Cannot parse token");
        } catch (RuntimeException e) {
            log.info("{}: {}", e.getCause(), e.getMessage());
        }
        return "Logout successful";
    }

    @Override
    public IntrospectResp introspect(String token, String authHeader) {
        final String authToken;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            authToken = authHeader.substring(7);
        } else if (token != null && !token.isBlank()) {
            authToken = token;
        } else {
            authToken = null;
        }
        var isValid = true;
        try {
            jwtService.verifyToken(authToken);
        } catch (Exception e) {
            isValid = false;
        }
        return IntrospectResp.newBuilder().isValid(isValid).build();
    }
}
