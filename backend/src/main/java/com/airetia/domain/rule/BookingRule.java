// backend/src/main/java/com/airetia/domain/rule/BookingRule.java
package com.airetia.domain.rule;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.springframework.stereotype.Component;
import com.airetia.domain.model.availability.Availability;
import com.airetia.domain.model.booking.Booking;
import com.airetia.domain.model.booking.BookingStatus;
import com.airetia.exception.BusinessException;
import com.airetia.repository.BookingRepository;
import lombok.RequiredArgsConstructor;

/**
 * 予約バリデーションルール - リファレンス実装
 * → 02_business_rules.md §2
 *
 * ⚠️  本番運用では BookingService の最適化済みカウントクエリを使用する。
 *    BookingService は BookingRepository の countBy* クエリで効率的に検証を行う。
 *    本クラスは単体テスト用または将来的なルール抽象化の基盤として提供する。
 *
 * 責務:
 *   §2.2 予約上限（CONFIRMED+PENDING≤90、PENDING≤10）
 *   §2.3 1日予約上限（Participant 1名・1日3件）
 *   §2.4 時間重複チェック
 *   §2.5 定員チェック
 */
@Component
@RequiredArgsConstructor
public class BookingRule {

    private static final ZoneId JST = ZoneId.of("Asia/Tokyo");

    /** CONFIRMED + PENDING 合計上限 → §2.2 */
    private static final int TOTAL_BOOKING_LIMIT   = 90;
    /** PENDING 上限 → §2.2 */
    private static final int PENDING_BOOKING_LIMIT = 10;
    /** 1日上限 → §2.3 */
    private static final int DAILY_BOOKING_LIMIT   = 3;

    private final BookingRepository bookingRepository;

    /**
     * 予約可否の全ルールをチェックする。
     * チェック順: PENDING上限 → 合計上限 → 1日上限 → 重複 → 定員
     *
     * @param participantId 予約する Participant の ID
     * @param availability  予約対象の空き枠
     */
    public void validate(Long participantId, Availability availability) {
        List<Booking> existing = bookingRepository.findByParticipantIdOrderByCreatedAtDesc(participantId);

        // ── §2.2 PENDING 上限（先に判定） ─────────────────────────────────
        long pendingCount = existing.stream()
            .filter(b -> b.getStatus() == BookingStatus.PENDING)
            .count();
        if (pendingCount >= PENDING_BOOKING_LIMIT) {
            throw new BusinessException(
                "リクエスト上限（10件）に達しています。確定後に再度リクエストしてください",
                "BUSINESS_PENDING_LIMIT_EXCEEDED"
            );
        }

        // ── §2.2 合計上限 ─────────────────────────────────────────────────
        long activeCount = existing.stream()
            .filter(b -> b.getStatus() == BookingStatus.CONFIRMED
                      || b.getStatus() == BookingStatus.PENDING)
            .count();
        if (activeCount >= TOTAL_BOOKING_LIMIT) {
            throw new BusinessException(
                "予約上限（90件）に達しています",
                "BUSINESS_BOOKING_LIMIT_EXCEEDED"
            );
        }

        // ── §2.3 1日3件上限 ───────────────────────────────────────────────
        LocalDate serviceDate = availability.getStartDatetime()
            .atZone(JST).toLocalDate();
        long dailyCount = existing.stream()
            .filter(b -> b.getStatus() == BookingStatus.CONFIRMED
                      || b.getStatus() == BookingStatus.PENDING)
            .filter(b -> b.getAvailability().getStartDatetime()
                          .atZone(JST).toLocalDate().equals(serviceDate))
            .count();
        if (dailyCount >= DAILY_BOOKING_LIMIT) {
            throw new BusinessException(
                String.format("利用者は%sに既に3件のサービスを予約しています", serviceDate),
                "BUSINESS_DAILY_LIMIT_EXCEEDED"
            );
        }

        // ── §2.4 時間重複チェック ──────────────────────────────────────────
        // 重複 = (B_start < A_end) AND (B_end > A_start) — A_end == B_start は許可
        Instant newStart = availability.getStartDatetime();
        Instant newEnd   = availability.getEndDatetime();
        boolean overlap = existing.stream()
            .filter(b -> b.getStatus() == BookingStatus.CONFIRMED
                      || b.getStatus() == BookingStatus.PENDING)
            .anyMatch(b -> {
                Instant aStart = b.getAvailability().getStartDatetime();
                Instant aEnd   = b.getAvailability().getEndDatetime();
                return newStart.isBefore(aEnd) && newEnd.isAfter(aStart);
            });
        if (overlap) {
            throw new BusinessException(
                "指定の時間帯に既に予約があります",
                "BUSINESS_BOOKING_CONFLICT"
            );
        }

        // ── §2.5 定員チェック ──────────────────────────────────────────────
        long confirmedCount = existing.stream()
            .filter(b -> b.getAvailability().getId().equals(availability.getId()))
            .filter(b -> b.getStatus() == BookingStatus.CONFIRMED)
            .count();
        if (confirmedCount >= availability.getCapacity()) {
            throw new BusinessException(
                "この空き枠は満席です",
                "BUSINESS_BOOKING_CONFLICT"
            );
        }
    }
}
