package dev.huyhoangg.midia.business.auth;

import dev.huyhoangg.midia.codegen.types.LoginInput;
import dev.huyhoangg.midia.codegen.types.LoginResp;
import dev.huyhoangg.midia.codegen.types.RefreshTokenResp;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {

    LoginResp login(LoginInput input);

    RefreshTokenResp refreshToken(String refreshToken);

    String logout(String accessToken, String refreshToken, HttpServletResponse response);
}
