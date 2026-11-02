// backend/src/main/java/com/airetia/exception/AuthExceptionHandler.java
package com.airetia.exception;

import java.io.IOException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

/**
 * 認証例外ハンドラー
 *
 * Spring Security が認証失敗時に呼び出す AuthenticationEntryPoint 実装。
 * BadCredentials / DisabledException / LockedException を 401 JSON で返す。
 *
 * ※ SecurityConfig で exceptionHandling().authenticationEntryPoint() に登録する。
 */
@Component
@RequiredArgsConstructor
public class AuthExceptionHandler implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        String message;
        if (authException instanceof BadCredentialsException) {
            message = "メールアドレスまたはパスワードが正しくありません";
        } else if (authException instanceof DisabledException) {
            message = "このアカウントは無効化されています";
        } else if (authException instanceof LockedException) {
            message = "このアカウントは停止中です";
        } else {
            message = "認証が必要です";
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(
            java.util.Map.of(
                "success",    false,
                "errorCode",  "AUTH_AUTHENTICATION_FAILED",
                "message",    message,
                "timestamp",  java.time.Instant.now().toString()
            )
        ));
    }
}
