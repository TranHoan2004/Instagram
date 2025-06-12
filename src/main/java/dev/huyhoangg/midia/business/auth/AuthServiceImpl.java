package dev.huyhoangg.midia.business.auth;

import com.nimbusds.jose.JOSEException;
import dev.huyhoangg.midia.business.user.UserNotExistsException;
import dev.huyhoangg.midia.codegen.types.LoginInput;
import dev.huyhoangg.midia.codegen.types.LoginResp;
import dev.huyhoangg.midia.codegen.types.RefreshTokenResp;
import dev.huyhoangg.midia.domain.repository.user.UserRepository;
import dev.huyhoangg.midia.infrastructure.service.JwtService;
import jakarta.servlet.http.HttpServletResponse;
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
        var user = userRepository.findByEmail(input.getEmailOrUsername())
                .orElseGet(() -> userRepository.findByUsername(input.getEmailOrUsername())
                        .orElseThrow(() -> new UsernameNotFoundException("Incorrect email or username")));
        if (!passwordEncoder.matches(input.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Incorrect password");
        }

        return LoginResp.newBuilder()
                .accessToken(jwtService.generateToken(user, false))
                .refreshToken(jwtService.generateToken(user, true))
                .message("Sign in successful")
                .build();
    }

    @Override
    public RefreshTokenResp refreshToken(String refreshToken) {
        try {
            var token = jwtService.verifyToken(refreshToken);
            var userId = token.getJWTClaimsSet().getSubject();

            var user = userRepository.findById(userId)
                    .orElseThrow(UserNotExistsException::new);
            return RefreshTokenResp.newBuilder()
                    .accessToken(jwtService.generateToken(user, false))
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


}
