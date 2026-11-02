// backend/src/main/java/com/airetia/application/dto/request/member/UpdateMemberRequest.java
package com.airetia.application.dto.request.member;

import java.time.LocalDate;

import com.airetia.domain.model.common.Gender;
import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * メンバー情報更新リクエスト
 * → PATCH /api/v1/members/{id}
 * → 03_common_specification.md §7 バリデーションルール
 *
 * 全フィールド任意（null = 変更なし）
 * frontend/src/models/member.ts の MemberUpdateRequest と対応
 */
@Getter
@NoArgsConstructor
public class UpdateMemberRequest {

    @Size(max = 50, message = "姓は50文字以内で入力してください")
    private String firstName;

    @Size(max = 50, message = "名は50文字以内で入力してください")
    private String lastName;

    @Size(max = 50, message = "姓（ふりがな）は50文字以内で入力してください")
    @Pattern(regexp = "^[ぁ-ん]*$", message = "姓（ふりがな）はひらがなで入力してください")
    private String firstNameKana;

    @Size(max = 50, message = "名（ふりがな）は50文字以内で入力してください")
    @Pattern(regexp = "^[ぁ-ん]*$", message = "名（ふりがな）はひらがなで入力してください")
    private String lastNameKana;

    @Pattern(regexp = "^[0-9]{10,11}$", message = "電話番号は10〜11桁の数字で入力してください")
    private String phoneNumber;

    @Pattern(regexp = "^[0-9]{7}$", message = "郵便番号は7桁の数字で入力してください")
    private String postalCode;

    @Size(max = 255, message = "住所は255文字以内で入力してください")
    private String address;

    /** 性別 → 01_glossary.md §3 Gender */
    private Gender gender;

    /** 生年月日（プロバイダー申請に必須 → 02_business_rules.md §5.1.1） */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthDate;
}