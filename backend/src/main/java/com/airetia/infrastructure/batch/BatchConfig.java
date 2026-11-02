// backend/src/main/java/com/airetia/infrastructure/batch/BatchConfig.java
package com.airetia.infrastructure.batch;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.airetia.application.service.email.EmailService;
import com.airetia.domain.model.booking.Booking;
import com.airetia.repository.AvailabilityRepository;
import com.airetia.repository.BookingRepository;
import com.airetia.repository.PenaltyRepository;
import com.airetia.repository.TicketRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * スケジュールバッチ
 * 02_business_rules.md §2.1 §1.2 §4.1 §2.6 §9
 *
 * ┌──────────────────────────┬──────────────────┬────────────────┐
 * │ バッチ名                 │ UTC cron         │ JST 実行時刻   │
 * ├──────────────────────────┼──────────────────┼────────────────┤
 * │ releaseBookings          │ 0 0 15 * * ?     │ 毎日 0:00      │
 * │ expireTickets            │ 0 5 15 * * ?     │ 毎日 0:05      │
 * │ expirePenalties          │ 0 0 16 * * ?     │ 毎日 1:00      │
 * │ detectNoShowCandidates   │ 0 0,30 * * * ?   │ 毎時 0/30分    │
 * │ sendReminderEmails       │ 0 0 22 * * ?     │ 毎日 7:00      │
 * └──────────────────────────┴──────────────────┴────────────────┘
 *
 * 修正: releaseByDate(LocalDate) → releaseByDate(Instant, Instant)
 *   AvailabilityRepository.releaseByDate は (Instant startUtc, Instant endUtc) の2引数。
 *   LocalDate を JST midnight → UTC Instant に変換して渡す。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BatchConfig {

    private static final ZoneId JST = ZoneId.of("Asia/Tokyo");

    private final AvailabilityRepository availabilityRepository;
    private final TicketRepository       ticketRepository;
    private final PenaltyRepository      penaltyRepository;
    private final BookingRepository      bookingRepository;
    private final EmailService           emailService;

    /**
     * 予約解放バッチ: 毎日 0:00 JST に「現在日 + 2ヶ月」の空き枠を bookable = true に変更
     * N ヶ月後は同日ベース（該当日なしの場合は月末）
     * 02_business_rules.md §2.1
     */
    @Scheduled(cron = "0 0 15 * * ?", zone = "UTC")
    @Transactional
    public void releaseBookings() {
        LocalDate today       = LocalDate.now(JST);
        LocalDate releaseDate = today.plusMonths(2);
        // AvailabilityRepository.releaseByDate(Instant start, Instant end) に合わせて変換
        Instant startUtc = releaseDate.atStartOfDay(JST).toInstant();
        Instant endUtc   = releaseDate.plusDays(1).atStartOfDay(JST).toInstant();
        int count = availabilityRepository.releaseByDate(startUtc, endUtc);
        log.info("[BookingReleaseBatch] released={}, date={}", count, releaseDate);
    }

    /**
     * チケット有効期限バッチ: 毎日 0:05 JST に期限切れチケットを論理削除
     * 02_business_rules.md §1.2
     */
    @Scheduled(cron = "0 5 15 * * ?", zone = "UTC")
    @Transactional
    public void expireTickets() {
        int count = ticketRepository.deactivateExpired(Instant.now());
        log.info("[TicketExpiryBatch] expired={}", count);
    }

    /**
     * ペナルティ有効期限バッチ: 毎日 1:00 JST に 3ヶ月経過ペナルティを無効化
     * 02_business_rules.md §4.1
     */
    @Scheduled(cron = "0 0 16 * * ?", zone = "UTC")
    @Transactional
    public void expirePenalties() {
        int count = penaltyRepository.deactivateExpired(Instant.now());
        log.info("[PenaltyExpiryBatch] deactivated={}", count);
    }

    /**
     * 無断キャンセル検知バッチ: 毎時 0分・30分 に開始 15分以上経過した CONFIRMED 予約を検知
     * 自動 NO_SHOW 化は行わない（プロバイダーの明示的な報告で適用）
     * 02_business_rules.md §2.6
     */
    @Scheduled(cron = "0 0,30 * * * ?", zone = "UTC")
    public void detectNoShowCandidates() {
        Instant threshold = Instant.now().minusSeconds(15L * 60);
        List<Booking> candidates = bookingRepository.findConfirmedWithStartBefore(threshold);
        if (!candidates.isEmpty()) {
            log.info("[NoShowDetectionBatch] candidates={}", candidates.size());
        }
    }

    /**
     * リマインドメールバッチ: 毎日 7:00 JST に翌日 CONFIRMED の利用者へ通知
     * 02_business_rules.md §9
     */
    @Scheduled(cron = "0 0 22 * * ?", zone = "UTC")
    public void sendReminderEmails() {
        LocalDate tomorrow = LocalDate.now(JST).plusDays(1);
        Instant startUtc = tomorrow.atStartOfDay(JST).toInstant();
        Instant endUtc   = tomorrow.plusDays(1).atStartOfDay(JST).toInstant();
        List<Booking> bookings = bookingRepository.findConfirmedByDate(startUtc, endUtc);
        bookings.forEach(booking -> {
            try {
                emailService.sendReminder(booking);
            } catch (Exception e) {
                log.error("[ReminderEmailBatch] 送信失敗: bookingId={}", booking.getId(), e);
            }
        });
        log.info("[ReminderEmailBatch] sent={}, date={}", bookings.size(), tomorrow);
    }
}