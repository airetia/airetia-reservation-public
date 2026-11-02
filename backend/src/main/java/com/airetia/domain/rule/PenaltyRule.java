// backend/src/main/java/com/airetia/domain/rule/PenaltyRule.java
package com.airetia.domain.rule;

import java.time.Instant;
import java.time.ZoneId;

import org.springframework.stereotype.Component;

import com.airetia.domain.model.booking.Booking;
import com.airetia.domain.model.penalty.Penalty;
import com.airetia.domain.model.penalty.PenaltyType;
import com.airetia.repository.MemberRepository;
import com.airetia.repository.PenaltyRepository;

import lombok.RequiredArgsConstructor;

/**
 * ペナルティルール
 * → 02_business_rules.md §4
 *
 * 無断キャンセル回数に応じた自動ペナルティ（利用停止・アカウント削除）を判定。
 */
@Component
@RequiredArgsConstructor
public class PenaltyRule {

    private final PenaltyRepository penaltyRepository;
    private final MemberRepository  memberRepository;

    private static final ZoneId JST = ZoneId.of("Asia/Tokyo");

    /** 有効期間（付与日時 + 3ヶ月） → §4.1 */
    public static final int PENALTY_VALID_MONTHS = 3;

    public static final int SUSPEND_7DAYS_THRESHOLD  = 3;
    public static final int SUSPEND_90DAYS_THRESHOLD = 5;
    public static final int DELETE_THRESHOLD         = 10;
    public static final int SUSPEND_7DAYS            = 7;
    public static final int SUSPEND_90DAYS           = 90;

    /** 直近 3ヶ月の有効ペナルティ数 */
    public long countActivePenalties(Long participantId) {
        return penaltyRepository.countActiveByParticipantId(participantId, Instant.now());
    }

    /**
     * 停止措置判定
     * @return 停止日数（0 = 停止不要、-1 = アカウント削除）
     */
    public int evaluateSuspension(long noShowCount) {
        if (noShowCount >= DELETE_THRESHOLD)         return -1;
        if (noShowCount >= SUSPEND_90DAYS_THRESHOLD) return SUSPEND_90DAYS;
        if (noShowCount >= SUSPEND_7DAYS_THRESHOLD)  return SUSPEND_7DAYS;
        return 0;
    }

    /**
     * NO_SHOW に対するペナルティ付与
     * → 02_business_rules.md §4.1〜§4.2
     *
     * 1. Penalty レコード生成（有効期間: 付与日時 + 3ヶ月）
     * 2. 直近 3ヶ月の NO_SHOW 回数に応じて Member を利用停止またはアカウント削除
     */
    public void applyForNoShow(Booking booking) {
        var participant = booking.getParticipant();
        var member      = participant.getMember();

        // ペナルティ有効期限: 付与日時 + 3ヶ月（§4.1）
        Instant expiresAt = Instant.now()
            .atZone(JST)
            .toLocalDate()
            .plusMonths(PENALTY_VALID_MONTHS)
            .atStartOfDay(JST)
            .toInstant();

        Penalty penalty = Penalty.builder()
            .participant(participant)
            .booking(booking)
            .penaltyType(PenaltyType.NO_SHOW)
            .active(true)
            .expiresAt(expiresAt)
            .build();
        penaltyRepository.save(penalty);

        // 累積 NO_SHOW 回数チェック（直近 3ヶ月）
        long count = countActivePenalties(participant.getId());
        int  days  = evaluateSuspension(count);

        if (days == -1) {
            member.deactivate();
            memberRepository.save(member);
        } else if (days > 0) {
            // Member.suspendFor(int days) を使用
            member.suspendFor(days);
            memberRepository.save(member);
        }
    }
}