// backend/src/main/java/com/airetia/application/dto/request/ticket/TicketGrantRequest.java
package com.airetia.application.dto.request.ticket;

import java.time.LocalDate;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import lombok.Data;

/**
 * チケット手動付与リクエスト DTO
 * POST /api/v1/tickets（管理者専用）
 * → 02_business_rules.md §1.1 / §1.2
 * → 06_infrastructure.md §7.2（手動付与手順）
 *
 * 修正: expiryDate フィールドを追加
 *   - .class ファイルには存在しなかったが、仕様上「有効期限（購入日 + 1年）を入力して確定」が必要
 *   - null の場合は TicketService が付与日 + 1年を自動計算する
 */
@Data
public class TicketGrantRequest {

    @NotNull(message = "メンバーIDは必須です")
    private Long memberId;

    @NotNull(message = "付与枚数は必須です")
    @Min(value = 1, message = "付与枚数は1枚以上で指定してください")
    private Integer quantity;

    /**
     * 有効期限（任意）
     * 省略時 → 付与日 + 1年（→ 02_business_rules.md §1.2）
     * 指定時 → 指定日の 23:59:59 JST（TicketService で計算）
     */
    private LocalDate expiryDate;

    private String note;
}