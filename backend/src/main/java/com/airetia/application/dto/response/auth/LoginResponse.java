// backend/src/main/java/com/airetia/application/dto/response/auth/LoginResponse.java
package com.airetia.application.dto.response.auth;

import com.airetia.domain.model.member.MemberRole;

import lombok.Builder;
import lombok.Getter;

/**
 * ログインレスポンス DTO
 * → 03_common_specification.md §5 認証
 * → AuthContext.tsx の capabilities と対応（camelCase）
 *
 * capabilities.hasProvider / hasParent は AuthContext で
 * Provider/Parent 機能の利用可否判定に使用する。
 */
@Getter
@Builder
public class LoginResponse {

    private Long       memberId;
    private String     email;
    private MemberRole role;
    private Capabilities capabilities;

    @Getter
    @Builder
    public static class Capabilities {
        /** APPROVED プロバイダーとして機能が有効か */
        private boolean hasProvider;
        /** 子ども Participant を持つ保護者か */
        private boolean hasParent;
    }
}
