// backend/src/main/java/com/airetia/domain/model/penalty/Penalty.java
package com.airetia.domain.model.penalty;

import java.time.Instant;
import java.time.ZoneId;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import com.airetia.domain.model.booking.Booking;
import com.airetia.domain.model.participant.Participant;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * ペナルティエンティティ
 * → V13__create_penalties.sql / 06_infrastructure.md §2.2
 * → 02_business_rules.md §4（ペナルティルール）
 *
 * 修正:
 *   - @Column(name = "is_active"), nullable = false) → @Column(name = "is_active", nullable = false)
 *     括弧の位置ミスによるコンパイルエラーを修正
 *   - @Table index の columnList "isActive" → "is_active"（DB 物理カラム名に合わせる）
 *   - フィールド名 isActive → active
 *     Lombok @Builder で boolean isActive フィールドがある場合、
 *     getter は isActive() だが Jackson は "active" としてシリアライズするため
 *     フィールド名を active に統一して JPQL（p.active）と一致させる
 */
@Entity
@Table(name = "penalties",
    indexes = @Index(name = "idx_participant_active", columnList = "participant_id, is_active"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class Penalty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    /**
     * ペナルティ種別（現在は NO_SHOW のみ）
     * → 01_glossary.md §3 PenaltyType
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "penalty_type", nullable = false, length = 20)
    @Builder.Default
    private PenaltyType penaltyType = PenaltyType.NO_SHOW;

    /**
     * 有効フラグ（DB: is_active）
     * true: 有効 / false: 期限切れ（バッチで無効化）or 管理者手動解除
     * Lombok @Getter → isActive()
     * JPQL 参照: p.active
     */
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    /**
     * 有効期限: 付与日時 + 3ヶ月
     * → §4.1 / BatchConfig PenaltyExpiryBatch（毎日 1:00 JST）
     */
    @Column(nullable = false)
    private Instant expiresAt;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    // ── ドメインメソッド ──────────────────────────────────────────────────

    /** ペナルティを無効化（管理者手動解除 or バッチ処理） */
    public void deactivate() {
        this.active = false;
    }

    /**
     * ファクトリメソッド: 無断キャンセル時に生成
     * → §4.1: 有効期間 = 付与日時 + 3ヶ月（90日）
     */
    public static Penalty forNoShow(Participant participant, Booking booking) {
        return Penalty.builder()
            .participant(participant)
            .booking(booking)
            .penaltyType(PenaltyType.NO_SHOW)
            .active(true)
            .expiresAt(Instant.now()
                    .atZone(ZoneId.of("Asia/Tokyo"))
                    .plusMonths(3)
                    .toInstant())
            .build();
    }
}