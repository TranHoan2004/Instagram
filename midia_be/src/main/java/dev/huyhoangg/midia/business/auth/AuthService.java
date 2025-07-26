package dev.huyhoangg.midia.business.auth;

import jakarta.servlet.http.HttpServletResponse;

import dev.huyhoangg.midia.codegen.types.IntrospectResp;
import dev.huyhoangg.midia.codegen.types.LoginInput;
import dev.huyhoangg.midia.codegen.types.LoginResp;
import dev.huyhoangg.midia.codegen.types.RefreshTokenResp;

public interface AuthService {

    LoginResp login(LoginInput input);

    RefreshTokenResp refreshToken(String refreshToken);

    String logout(String accessToken, String refreshToken, HttpServletResponse response);

    IntrospectResp introspect(String token, String authHeader);
}
