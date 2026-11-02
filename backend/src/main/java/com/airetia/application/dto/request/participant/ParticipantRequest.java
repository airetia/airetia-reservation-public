// backend/src/main/java/com/airetia/application/dto/request/participant/ParticipantRequest.java
package com.airetia.application.dto.request.participant;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import com.airetia.domain.model.common.Gender;
import com.airetia.domain.model.participant.ParticipantType;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

/**
 * 利用者登録・更新リクエスト DTO
 * POST /api/v1/participants / PATCH /api/v1/participants/{id}
 * 03_common_specification.md §7 バリデーションルール
 *
 * ふりがなはプロバイダー申請のみ必須（02_business_rules.md §5.1.1）
 * 一般利用者登録では任意とする
 */
@Data
public class ParticipantRequest {

    @NotNull(message = "利用者種別は必須です")
    private ParticipantType participantType;

    @NotBlank(message = "名（名前）は必須です")
    @Size(max = 50, message = "名（名前）は50文字以内で入力してください")
    private String firstName;

    @NotBlank(message = "姓（苗字）は必須です")
    @Size(max = 50, message = "姓（苗字）は50文字以内で入力してください")
    private String lastName;

    @Size(max = 50, message = "名（ふりがな）は50文字以内で入力してください")
    @Pattern(regexp = "^[\u3041-\u3096]*$", message = "名（ふりがな）はひらがなで入力してください")
    private String firstNameKana;

    @Size(max = 50, message = "姓（ふりがな）は50文字以内で入力してください")
    @Pattern(regexp = "^[\u3041-\u3096]*$", message = "姓（ふりがな）はひらがなで入力してください")
    private String lastNameKana;

    /** 生年月日（任意: SELF の場合は member.birthDate から補完可） */
    @PastOrPresent(message = "生年月日は過去または今日の日付を指定してください")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthDate;

    /** 性別（任意） */
    private Gender gender;

    /** プロバイダーが参照する利用者特記事項（任意） */
    private String notes;
}