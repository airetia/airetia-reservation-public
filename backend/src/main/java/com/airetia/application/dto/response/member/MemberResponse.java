// backend/src/main/java/com/airetia/application/dto/response/member/MemberResponse.java
package com.airetia.application.dto.response.member;

import java.time.Instant;
import java.time.LocalDate;
import com.airetia.domain.model.common.Gender;

import com.airetia.domain.model.member.MemberRole;

import lombok.Builder;
import lombok.Getter;

/**
 * メンバー情報レスポンス DTO
 * → /api/v1/auth/me / GET /api/v1/members/{id} で使用
 *
 * 修正:
 *   - isisActive → isActive（タイポ修正）
 *   - birthDate: String → LocalDate（MemberService が LocalDate を渡すため型一致）
 *   - gender は members テーブルに存在するが ProfilePage 非表示のため含めない
 *     （将来必要になった場合は追加する）
 */
@Getter
@Builder
public class MemberResponse {

    private Long       id;
    private String     email;
    private String     firstName;
    private String     lastName;
    private String     firstNameKana;
    private String     lastNameKana;
    private String     phoneNumber;
    private String     postalCode;
    private String     address;

    private Gender     gender;

    /** 生年月日（JSON シリアライズ時: "yyyy-MM-dd"） */
    private LocalDate  birthDate;

    private MemberRole role;

    /** 修正: isisActive → isActive */
    private Boolean    isActive;
    private Boolean    isLocked;

    /** プロバイダー・保護者機能の有効フラグ（→ 02_business_rules.md §7.2） */
    private Capabilities capabilities;

    private Instant suspendedUntil;
    private Instant createdAt;

    @Getter
    @Builder
    public static class Capabilities {
        private boolean hasProvider;
        private boolean hasParent;
    }
}
