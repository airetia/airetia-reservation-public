// backend/src/main/java/com/airetia/domain/model/booking/Booking.java
package com.airetia.domain.model.booking;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import com.airetia.domain.model.availability.Availability;
import com.airetia.domain.model.common.BaseEntity;
import com.airetia.domain.model.participant.Participant;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 予約エンティティ
 * DB定義 → V10__create_bookings.sql
 * ビジネスルール → 02_business_rules.md §2 / §3 / §5.3
 *
 * ticketsConsumed: 予約作成時に確定。キャンセル・NO_SHOW後も保持（報酬計算基準）。
 * status初期値: PENDING（リクエスト状態）。プロバイダー確定後にCONFIRMEDへ遷移。
 */
@Entity
@Table(name = "bookings")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class Booking extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "availability_id", nullable = false)
    private Availability availability;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @Column(nullable = false)
    private Integer ticketsConsumed;

    // ── ドメインメソッド ──────────────────────────────────────

    /** PENDING → CONFIRMED */
    public void confirm() {
        if (this.status != BookingStatus.PENDING) {
            throw new IllegalStateException("リクエスト中の予約のみ確定できます。現在: " + this.status);
        }
        this.status = BookingStatus.CONFIRMED;
    }

    /** CONFIRMED / PENDING → CANCELLED_BY_USER / CANCELLED_BY_PROVIDER */
    public void cancel(BookingStatus cancelStatus) {
        if (this.status != BookingStatus.CONFIRMED && this.status != BookingStatus.PENDING) {
            throw new IllegalStateException("確定済みまたはリクエスト中の予約のみキャンセルできます。現在: " + this.status);
        }
        this.status = cancelStatus;
    }

    /** CONFIRMED → COMPLETED */
    public void complete() {
        if (this.status != BookingStatus.CONFIRMED) {
            throw new IllegalStateException("確定済みの予約のみ完了にできます。現在: " + this.status);
        }
        this.status = BookingStatus.COMPLETED;
    }

    /** CONFIRMED → NO_SHOW */
    public void markNoShow() {
        if (this.status != BookingStatus.CONFIRMED) {
            throw new IllegalStateException("確定済みの予約のみ無断キャンセルにできます。現在: " + this.status);
        }
        this.status = BookingStatus.NO_SHOW;
    }
}
