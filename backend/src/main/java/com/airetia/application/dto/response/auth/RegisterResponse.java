// backend/src/main/java/com/airetia/application/dto/response/auth/RegisterResponse.java
package com.airetia.application.dto.response.auth;

import com.airetia.domain.model.member.Member;
import lombok.Getter;

/**
 * POST /api/v1/auth/register レスポンス
 * → 03_common_specification.md §5 認証エンドポイント
 *
 * 登録完了後に返す最小限の情報。
 * セッションはこの時点では発行しない（別途 login が必要）。
 */
@Getter
public class RegisterResponse {

    private final Long   id;
    private final String email;
    private final String firstName;
    private final String lastName;

    private RegisterResponse(Long id, String email, String firstName, String lastName) {
        this.id        = id;
        this.email     = email;
        this.firstName = firstName;
        this.lastName  = lastName;
    }

    public static RegisterResponse of(Member member) {
        return new RegisterResponse(
            member.getId(),
            member.getEmail(),
            member.getFirstName(),
            member.getLastName()
        );
    }
}
