// backend/src/main/java/com/airetia/application/dto/request/inquiry/InquiryRequest.java
package com.airetia.application.dto.request.inquiry;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * 問い合わせ作成リクエスト DTO
 * → 03_common_specification.md §5 問い合わせ
 * → 02_business_rules.md §8（本文1000文字以内）
 *
 * 添付ファイルは multipart で別途送信（InquiryController参照）
 */
@Data
public class InquiryRequest {

    @NotBlank(message = "メールアドレスを入力してください")
    @Email(message = "メールアドレスの形式が正しくありません")
    @Size(max = 255)
    private String email;

    @Size(max = 100, message = "100文字以内で入力してください")
    private String name;   // 任意（非ログインユーザーも送信可）

    @Size(max = 255)
    private String subject;

    @NotBlank(message = "本文を入力してください")
    @Size(max = 1000, message = "1000文字以内で入力してください")
    private String body;
}
