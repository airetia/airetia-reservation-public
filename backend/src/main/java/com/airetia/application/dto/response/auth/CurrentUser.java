// backend/src/main/java/com/airetia/application/dto/response/auth/CurrentUser.java
package com.airetia.application.dto.response.auth;

import com.airetia.domain.model.member.Member;
import com.airetia.domain.model.member.MemberRole;
import lombok.Getter;

/**
 * GET /api/v1/auth/me レスポンス
 * → 03_common_specification.md §5 認証エンドポイント
 *
 * capabilities フィールドはフロントエンドの AuthContext で使用する。
 * hasProvider / hasParent は AuthService で別途クエリして付与する。
 */
@Getter
public class CurrentUser {

    private final Long       id;
    private final String     email;
    private final MemberRole role;
    private final String     firstName;
    private final String     lastName;
    private final Capabilities capabilities;

    private CurrentUser(Long id, String email, MemberRole role,
                        String firstName, String lastName,
                        boolean hasProvider, boolean hasParent) {
        this.id           = id;
        this.email        = email;
        this.role         = role;
        this.firstName    = firstName;
        this.lastName     = lastName;
        this.capabilities = new Capabilities(hasProvider, hasParent);
    }

    public static CurrentUser of(Member member, boolean hasProvider, boolean hasParent) {
        return new CurrentUser(
            member.getId(),
            member.getEmail(),
            member.getRole(),
            member.getFirstName(),
            member.getLastName(),
            hasProvider,
            hasParent
        );
    }

    @Getter
    public static class Capabilities {
        private final boolean hasProvider;
        private final boolean hasParent;

        Capabilities(boolean hasProvider, boolean hasParent) {
            this.hasProvider = hasProvider;
            this.hasParent   = hasParent;
        }
    }
}
