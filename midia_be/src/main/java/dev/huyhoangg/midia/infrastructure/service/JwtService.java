package dev.huyhoangg.midia.infrastructure.service;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import dev.huyhoangg.midia.business.auth.UnauthenticatedException;
import dev.huyhoangg.midia.domain.model.user.User;
import dev.huyhoangg.midia.domain.repository.user.PermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Objects;
import java.util.StringJoiner;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class JwtService {
    @Value("${jwt.valid-duration}")
    private long VALID_DURATION;

    @Value("${jwt.refresh-duration}")
    private long REFRESH_DURATION;

    @Value("${jwt.signer-key}")
    private String SIGNER_KEY;

    @Value("${jwt.issuer}")
    private String ISSUER;

    private final StringRedisTemplate redisTemplate;
    private final PermissionRepository permissionRepository;

    public Long getValidDuration() {
        return VALID_DURATION;
    }

    public Long getRefreshDuration() {
        return REFRESH_DURATION;
    }

    public String generateToken(User user, boolean isRefresh) {
        var header = new JWSHeader(JWSAlgorithm.HS256);

        var jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getId())
                .issuer(ISSUER)
                .issueTime(new Date())
                .claim("token_type", "Bearer")
                .claim("type", isRefresh ? "refresh_token" : "access_token")
                .claim("username", user.getUsername())
                .claim("scope", buildScope(user))
                .expirationTime(new Date(Instant.now()
                        .plus(isRefresh ? REFRESH_DURATION : VALID_DURATION, ChronoUnit.SECONDS)
                        .toEpochMilli()))
                .jwtID(UUID.randomUUID().toString())
                .build();
        var payload = new Payload(jwtClaimsSet.toJSONObject());
        var jwsObj = new JWSObject(header, payload);
        try {
            jwsObj.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObj.serialize();
        } catch (JOSEException e) {
            log.error("Error generating token", e);
            throw new RuntimeException(e);
        }
    }

    public boolean isValidAccessToken(String token) {
        var isValid = true;
        try {
            verifyToken(token);
        } catch (UnauthenticatedException | JOSEException | ParseException e) {
            isValid = false;
        }
        return isValid;
    }

    public SignedJWT verifyToken(String token) throws JOSEException, ParseException, UnauthenticatedException {
        var verifier = new MACVerifier(SIGNER_KEY.getBytes());
        var signedJWT = SignedJWT.parse(token);

        var expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();
        var verified = signedJWT.verify(verifier);

        if (!verified || !expirationTime.after(new Date())) {
            throw new UnauthenticatedException();
        }
        if (redisTemplate.opsForValue().get(signedJWT.getJWTClaimsSet().getJWTID()) != null) {
            throw new UnauthenticatedException();
        }
        return signedJWT;
    }

    public void invalidateToken(String token) throws JOSEException, ParseException {
        var signedJWT = verifyToken(token);
        var tokenId = signedJWT.getJWTClaimsSet().getJWTID();
        var ttl = signedJWT.getJWTClaimsSet().getExpirationTime().getTime() - System.currentTimeMillis();
        redisTemplate.opsForValue().set(tokenId, "blacklist", ttl, TimeUnit.MILLISECONDS);
    }

    public String getUsernameFromToken(String token) {
        try {
            var signedJWT = verifyToken(token);
            return signedJWT.getJWTClaimsSet().getStringClaim("username");
        } catch (JOSEException | ParseException e) {
            throw new UnauthenticatedException();
        }
    }

    private String buildScope(User user) {
        var stringJoiner = new StringJoiner(" ");

        if (Objects.nonNull(user.getRole())) {
            stringJoiner.add("ROLE_" + user.getRole().getName());
            var permissions =
                    permissionRepository.findAllByRoleName(user.getRole().getName());
            if (!CollectionUtils.isEmpty(permissions)) {
                permissions.forEach(permission -> {
                    stringJoiner.add(permission.getAction());
                });
            }
        }

        return stringJoiner.toString();
    }
}
