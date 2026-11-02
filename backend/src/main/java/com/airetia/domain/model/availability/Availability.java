// backend/src/main/java/com/airetia/domain/model/availability/Availability.java
package com.airetia.domain.model.availability;

import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import com.airetia.domain.model.booking.Booking;
import com.airetia.domain.model.common.BaseEntity;
import com.airetia.domain.model.offering.Offering;
import com.airetia.domain.model.provider.Provider;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 空き枠エンティティ
 * createdAt / updatedAt は BaseEntity が管理する
 *
 * bookings: 双方向関連（Booking.availability が所有側）。
 * 件数だけ必要な場合は availabilityRepository.countConfirmedBookings() を使用すること。
 * ループで getBookings() を呼ぶと N+1 が発生するため、
 * 必要な場合は JOIN FETCH クエリを使うこと。
 */
@Entity
@Table(name = "availabilities")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Availability extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private Provider provider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offering_id", nullable = false)
    private Offering offering;

    @Column(name = "start_datetime", nullable = false)
    private Instant startDatetime;

    @Column(name = "end_datetime", nullable = false)
    private Instant endDatetime;

    @Column(nullable = false)
    private Integer capacity;

    /** true = 予約受付開始済み（サービス開始2ヶ月前から） */
    @Column(nullable = false)
    private Boolean bookable = false;

    /**
     * この空き枠に紐づく予約一覧（読み取り専用参照）。
     * Booking.availability が外部キーを管理する（mappedBy）。
     * → 02_business_rules.md §2.5（定員管理）/ §5.2（空き枠管理）
     */
    @OneToMany(mappedBy = "availability", fetch = FetchType.LAZY)
    private List<Booking> bookings = new ArrayList<>();

    @Builder
    public Availability(Provider provider, Offering offering,
                        Instant startDatetime, Instant endDatetime, Integer capacity) {
        this.provider      = provider;
        this.offering      = offering;
        this.startDatetime = startDatetime;
        this.endDatetime   = endDatetime;
        this.capacity      = capacity;
        // ビジネスルール: サービス開始日の2ヶ月前0:00 JST から予約受付開始
        // → 02_business_rules.md §2.1
        // 作成時点で既に2ヶ月以内のサービスは即時解放する（バッチは翌日以降分を処理）
        Instant twoMonthsFromNow = Instant.now()
                .atZone(ZoneId.of("Asia/Tokyo"))
                .plusMonths(2)
                .toInstant();
        this.bookable = !startDatetime.isAfter(twoMonthsFromNow);
    }

    /** バッチが呼び出す：予約解放 */
    public void release() {
        this.bookable = true;
    }

    /** 定員変更（既存予約数以上のみ許可） */
    public void updateCapacity(int newCapacity) {
        this.capacity = newCapacity;
    }

    /** 予約受付中かどうか */
    public boolean isBookable() {
        return Boolean.TRUE.equals(this.bookable);
    }
}