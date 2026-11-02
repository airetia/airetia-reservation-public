// backend/src/main/java/com/airetia/application/dto/request/auth/LoginRequest.java
package com.airetia.application.dto.request.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import lombok.Data;

/**
 * ログインリクエスト DTO
 * POST /api/v1/auth/login
 * → 03_common_specification.md §5 認証
 */
@Data
public class LoginRequest {

    @NotBlank(message = "メールアドレスは必須です")
    @Email(message = "メールアドレスの形式が正しくありません")
    private String email;

    @NotBlank(message = "パスワードは必須です")
    private String password;
}
