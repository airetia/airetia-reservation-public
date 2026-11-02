// backend/src/main/java/com/airetia/domain/rule/TicketRule.java
package com.airetia.domain.rule;

import java.time.Instant;
import org.springframework.stereotype.Component;
import com.airetia.exception.BusinessException;
import com.airetia.repository.TicketRepository;
import lombok.RequiredArgsConstructor;

/**
 * チケットバリデーションルール
 * → 02_business_rules.md §1.3
 *
 * 責務: 予約時のチケット残高チェックを集約
 *   利用可能チケット数 >= 消費枚数 → 予約可能
 *   利用可能チケット数 < 消費枚数  → 予約不可
 *
 * 消費タイミング: 予約確定（CONFIRMED）時（BookingService が TicketService 経由で消費）
 */
@Component
@RequiredArgsConstructor
public class TicketRule {

    private final TicketRepository ticketRepository;

    /**
     * チケット残高が必要枚数を満たすか検証する。
     *
     * @param memberId       チケット所有者のメンバーID
     * @param requiredAmount 必要なチケット枚数（消費枚数 = サービス設定枚数 × 予約人数）
     * @throws BusinessException 残高不足の場合
     */
    public void validateBalance(Long memberId, int requiredAmount) {
        long available = ticketRepository.countValidTickets(memberId, Instant.now());
        if (available < requiredAmount) {
            throw new BusinessException(
                String.format("チケットが不足しています（必要: %d枚、残高: %d枚）", requiredAmount, available),
                "BUSINESS_INSUFFICIENT_TICKETS"
            );
        }
    }

    /**
     * 有効チケット残高を取得する。
     *
     * @param memberId メンバーID
     * @return 有効チケット枚数
     */
    public long getAvailableCount(Long memberId) {
        return ticketRepository.countValidTickets(memberId, Instant.now());
    }
}
