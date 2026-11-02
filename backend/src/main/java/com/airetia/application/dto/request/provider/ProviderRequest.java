// backend/src/main/java/com/airetia/application/dto/request/provider/ProviderRequest.java

package com.airetia.application.dto.request.provider;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Data;

/**
 * プロバイダー申請リクエスト
 * 仕様書 02_business_rules.md §5.1.1 に準拠。
 *
 * 修正:
 *   - university: @NotBlank 削除（仕様は任意△）
 *   - highSchool / university: @Size(max = 100) → 255 に修正（仕様書値）
 *   - qualifications / achievements: 各要素の @Size 検証はサービス層で行う
 */
@Data
public class ProviderRequest {

    @NotBlank(message = "出身高校は必須です")
    @Size(max = 255, message = "出身高校は255文字以内で入力してください")
    private String highSchool;

    /** 任意 */
    @Size(max = 255, message = "出身大学・専門学校は255文字以内で入力してください")
    private String university;

    /** 任意・最大5件（各255文字以内） */
    @Size(max = 5, message = "保有資格は最大5件まで登録できます")
    private List<
        @NotBlank(message = "資格名を入力してください")
        @Size(max = 255, message = "資格名は255文字以内で入力してください")
        String
    > qualifications;

    /** 任意・最大5件（各255文字以内） */
    @Size(max = 5, message = "賞歴・実績は最大5件まで登録できます")
    private List<
        @NotBlank(message = "賞歴・実績を入力してください")
        @Size(max = 255, message = "賞歴・実績は255文字以内で入力してください")
        String
    > achievements;

    @NotBlank(message = "アピールポイントは必須です")
    @Size(max = 2000, message = "アピールポイントは2000文字以内で入力してください")
    private String appealPoint;
}
