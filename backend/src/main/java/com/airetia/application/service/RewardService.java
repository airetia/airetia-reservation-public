// backend/src/main/java/com/airetia/application/service/RewardService.java
package com.airetia.application.service;

import java.time.YearMonth;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.airetia.domain.model.booking.Booking;
import com.airetia.domain.model.booking.BookingStatus;
import com.airetia.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * プロバイダー報酬計算サービス
 * → 02_business_rules.md §5.3
 *
 * 計算式:
 *   月間報酬 = floor( Σ(対象チケット枚数) × 500円 × 0.4 ) − 振込手数料
 *   報酬率 = 40%
 *
 * NO_SHOW 報酬: 元消費予定 6 枚以上のみ固定 1 枚として計算
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RewardService {

    /** 報酬率 → §5.3 */
    private static final double REWARD_RATE = 0.4;

    /** チケット単価 → §1.1 */
    private static final int TICKET_PRICE = 500;

    /** NO_SHOW 報酬の最小チケット閾値 → §5.3 */
    private static final int NO_SHOW_REWARD_MIN_TICKETS = 6;

    private final BookingRepository bookingRepository;

    /**
     * 月次報酬を計算する（振込手数料控除前）
     *
     * @param providerId プロバイダーID
     * @param month      対象年月
     * @return 報酬額（円）
     */
    @Transactional(readOnly = true)
    public int calculateMonthlyReward(Long providerId, YearMonth month) {
        // 完了サービスの合計チケット枚数
        List<Booking> completed = bookingRepository.findByProviderId(providerId).stream()
            .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
            .filter(b -> {
                YearMonth bm = YearMonth.from(
                    b.getAvailability().getStartDatetime()
                        .atZone(java.time.ZoneId.of("Asia/Tokyo")).toLocalDate()
                );
                return bm.equals(month);
            })
            .toList();

        int totalTickets = completed.stream()
            .mapToInt(Booking::getTicketsConsumed)
            .sum();

        // NO_SHOW: 消費予定 6 枚以上の場合のみ固定 1 枚として報酬計算 → §5.3
        List<Booking> noShows = bookingRepository.findByProviderId(providerId).stream()
            .filter(b -> b.getStatus() == BookingStatus.NO_SHOW)
            .filter(b -> {
                YearMonth bm = YearMonth.from(
                    b.getAvailability().getStartDatetime()
                        .atZone(java.time.ZoneId.of("Asia/Tokyo")).toLocalDate()
                );
                return bm.equals(month);
            })
            .filter(b -> b.getTicketsConsumed() >= NO_SHOW_REWARD_MIN_TICKETS)
            .toList();

        int noShowTickets = noShows.size(); // 1件につき固定1枚

        int totalReward = (int) Math.floor((totalTickets + noShowTickets) * TICKET_PRICE * REWARD_RATE);

        log.info("Provider {} reward for {}: completed={}tickets, noShow={}tickets, total={}yen",
            providerId, month, totalTickets, noShowTickets, totalReward);

        return totalReward;
    }
}
