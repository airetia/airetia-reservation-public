// backend/src/main/java/com/airetia/repository/AvailabilityRepository.java
package com.airetia.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.airetia.domain.model.availability.Availability;

/**
 * 空き枠リポジトリ
 * → 01_glossary.md §2 Availability
 * → 02_business_rules.md §2.1（予約解放）/ §5.2（空き枠管理）
 * → 06_infrastructure.md §2.2（availabilities テーブル）
 *
 * 修正:
 *   - findWithConfirmedBookingsBetween: Availability に bookings コレクション不存在
 *     → Booking を主体にしたサブクエリに変更
 */
@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {

    /**
     * 公開用検索（日付・オファリング指定・予約解放済みのみ）
     * date=null → 全日程 / offeringId=null → 全サービス
     */
    @Query("""
        SELECT a FROM Availability a
        WHERE a.bookable = true
          AND (:startUtc   IS NULL OR a.startDatetime >= :startUtc)
          AND (:endUtc     IS NULL OR a.startDatetime <  :endUtc)
          AND (:offeringId IS NULL OR a.offering.id = :offeringId)
        ORDER BY a.startDatetime ASC
        """)
    List<Availability> findBookableByDateAndOffering(
            @Param("startUtc")   Instant startUtc,
            @Param("endUtc")     Instant endUtc,
            @Param("offeringId") Long offeringId);

    /** プロバイダー自身の空き枠一覧（開始日時昇順） */
    List<Availability> findByProviderIdOrderByStartDatetimeAsc(Long providerId);

    /**
     * 予約確定数（定員チェック・残席計算用）
     * CONFIRMED のみカウント（PENDING は含まない）
     */
    @Query("""
        SELECT COUNT(b) FROM Booking b
        WHERE b.availability.id = :availabilityId
          AND b.status = com.airetia.domain.model.booking.BookingStatus.CONFIRMED
        """)
    long countConfirmedBookings(@Param("availabilityId") Long availabilityId);

    /**
     * 悲観ロック取得（予約作成の競合防止）
     * → 02_business_rules.md §2.5（先着順・定員管理）
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Availability a WHERE a.id = :id")
    Optional<Availability> findByIdWithLock(@Param("id") Long id);

    /**
     * 予約解放バッチ用（BookingReleaseBatch 毎日 0:00 JST）
     * → 02_business_rules.md §2.1 / 04_backend_specification.md §8
     */
    @Transactional
    @Modifying
    @Query("""
        UPDATE Availability a SET a.bookable = true
        WHERE a.bookable = false
          AND a.startDatetime >= :startUtc
          AND a.startDatetime <  :endUtc
        """)
    int releaseByDate(
        @Param("startUtc") Instant startUtc,
        @Param("endUtc")   Instant endUtc
    );

    /**
     * リマインドメールバッチ用（翌日 JST の CONFIRMED 予約を持つ空き枠）
     * → 04_backend_specification.md §8 ReminderEmailBatch
     *
     * 修正: Availability に bookings コレクションがないため
     *   Booking を主体にして availability を逆引きするサブクエリに変更。
     */
    @Query("""
        SELECT DISTINCT a FROM Availability a
        WHERE EXISTS (
            SELECT 1 FROM Booking b
            WHERE b.availability.id = a.id
              AND b.status = com.airetia.domain.model.booking.BookingStatus.CONFIRMED
        )
          AND a.startDatetime >= :dayStart
          AND a.startDatetime <  :dayEnd
        ORDER BY a.startDatetime ASC
        """)
    List<Availability> findWithConfirmedBookingsBetween(
            @Param("dayStart") Instant dayStart,
            @Param("dayEnd")   Instant dayEnd);
}
