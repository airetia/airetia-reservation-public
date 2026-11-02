// backend/src/main/java/com/airetia/domain/rule/CancellationRule.java
package com.airetia.domain.rule;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.stereotype.Component;
import com.airetia.domain.model.booking.Booking;

/**
 * キャンセルポリシー計算
 * → 02_business_rules.md §3
 *
 * 境界ちょうどは返還率が高い方を適用（>= で判定）。
 * 例: ちょうど 24 時間前 → 100% 返還
 */
@Component
public class CancellationRule {

    /** キャンセルポリシー計算結果 */
    public record CancellationResult(int refundAmount, Instant refundExpiry) {}

    /**
     * キャンセル時の返還枚数・返還チケット有効期限を計算する。
     *
     * @param booking    キャンセル対象の予約
     * @param cancelTime キャンセル実行時刻（UTC）
     * @param originalExpiryInstant 消費チケットの最短有効期限（返還期限計算に使用）
     * @return 返還枚数・返還チケット有効期限
     */
    public CancellationResult calculate(Booking booking, Instant cancelTime, Instant originalExpiryInstant) {
        Instant start = booking.getAvailability().getStartDatetime();
        long minutesBefore = Duration.between(cancelTime, start).toMinutes();

        // 境界ちょうどは返還率が高い方を適用（>= で判定） → §3.1
        double refundRate;
        Instant computedExpiry;

        if (minutesBefore >= 1440) {          // 24時間以上前 → 100%
            refundRate     = 1.0;
            computedExpiry = originalExpiryInstant;   // 元の有効期限をそのまま使用
        } else if (minutesBefore >= 720) {    // 12時間以上前 → 50%
            refundRate     = 0.5;
            computedExpiry = cancelTime.plus(7, ChronoUnit.DAYS);
        } else if (minutesBefore >= 30) {     // 30分以上前 → 20%
            refundRate     = 0.2;
            computedExpiry = cancelTime.plus(7, ChronoUnit.DAYS);
        } else {                               // 30分未満 → 0%
            refundRate     = 0.0;
            computedExpiry = null;
        }

        // 返還枚数: floor(消費枚数 × 返還率) → §3.2
        int refundAmount = (int) Math.floor(booking.getTicketsConsumed() * refundRate);

        // 返還有効期限: MIN(計算値, 元チケット有効期限) → §3.3
        Instant refundExpiry = null;
        if (refundAmount > 0) {
            if (computedExpiry == null) {
                refundExpiry = originalExpiryInstant;
            } else if (originalExpiryInstant != null && originalExpiryInstant.isBefore(computedExpiry)) {
                refundExpiry = originalExpiryInstant;
            } else {
                refundExpiry = computedExpiry;
            }
        }

        return new CancellationResult(refundAmount, refundExpiry);
    }

    /**
     * PENDING 状態のキャンセル: チケット未消費のため返還なし・ペナルティなし → §3.1
     */
    public CancellationResult calculateForPending() {
        return new CancellationResult(0, null);
    }
}
