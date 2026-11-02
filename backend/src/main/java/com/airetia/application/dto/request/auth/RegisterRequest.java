// backend/src/main/java/com/airetia/application/dto/request/auth/RegisterRequest.java
package com.airetia.application.dto.request.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import lombok.Data;

/**
 * 会員登録リクエスト
 * POST /api/v1/auth/register
 * → 04_backend_specification.md §6.1（AuthService コメント）
 *
 * 仕様: 姓・名・ふりがな・メール・パスワードのみ受け付ける。
 * その他プロフィール（生年月日・電話・住所等）は登録後に
 * プロフィール編集（PATCH /api/v1/members/{id}）から更新する。
 *
 * 修正: birthDate / gender / postalCode / address / phoneNumber を削除
 *   旧 RegisterRequest はこれらを @NotNull/@NotBlank で必須にしていたが、
 *   AuthService では firstName/lastName/kana/email/password しか使用しておらず
 *   仕様書の記述とも矛盾していたため削除。
 * → 03_common_specification.md §7 バリデーションルール（パスワード正規表現）
 */
@Data
public class RegisterRequest {

    @NotBlank(message = "姓は必須です")
    @Size(max = 50, message = "姓は50文字以内で入力してください")
    private String lastName;

    @NotBlank(message = "名は必須です")
    @Size(max = 50, message = "名は50文字以内で入力してください")
    private String firstName;

    @NotBlank(message = "姓（ふりがな）は必須です")
    @Size(max = 50)
    @Pattern(regexp = "^[ぁ-ん]+$", message = "姓（ふりがな）はひらがなで入力してください")
    private String lastNameKana;

    @NotBlank(message = "名（ふりがな）は必須です")
    @Size(max = 50)
    @Pattern(regexp = "^[ぁ-ん]+$", message = "名（ふりがな）はひらがなで入力してください")
    private String firstNameKana;

    @NotBlank(message = "メールアドレスは必須です")
    @Email(message = "メールアドレスの形式が正しくありません")
    @Size(max = 255)
    private String email;

    /**
     * 一般メンバー用パスワードポリシー
     * → 03_common_specification.md §7 パスワード正規表現（一般）
     */
    @NotBlank(message = "パスワードは必須です")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,64}$",
        message = "パスワードは8文字以上64文字以下で、大文字・小文字・数字をそれぞれ1文字以上含む必要があります"
    )
    private String password;
}
