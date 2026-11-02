// backend/src/main/java/com/airetia/repository/BookingRepository.java
package com.airetia.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.airetia.domain.model.booking.Booking;
import com.airetia.domain.model.booking.BookingStatus;

/**
 * 予約リポジトリ
 * 修正: BookingService が呼ぶ全メソッドを網羅
 *   countByAvailabilityIdAndStatus / countByParticipantIdAndStatus /
 *   countDailyBookings / countOverlapping / findByMemberId / findByProviderId
 */
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Booking b WHERE b.id = :id")
    Optional<Booking> findByIdWithLock(@Param("id") Long id);

    @Query("SELECT b FROM Booking b ORDER BY b.createdAt DESC")
    List<Booking> findAllOrderByCreatedAtDesc();

    @Query("SELECT b FROM Booking b WHERE b.participant.member.id = :memberId ORDER BY b.createdAt DESC")
    List<Booking> findByMemberId(@Param("memberId") Long memberId);

    @Query("SELECT b FROM Booking b WHERE b.availability.provider.id = :providerId ORDER BY b.createdAt DESC")
    List<Booking> findByProviderId(@Param("providerId") Long providerId);

    long countByAvailabilityIdAndStatus(Long availabilityId, BookingStatus status);

    long countByParticipantIdAndStatus(Long participantId, BookingStatus status);

    long countByParticipantIdAndStatusIn(Long participantId, List<BookingStatus> statuses);

    @Query("SELECT COUNT(b) FROM Booking b"
        + " WHERE b.participant.id = :participantId"
        + " AND b.availability.startDatetime >= :dayStart"
        + " AND b.availability.startDatetime < :dayEnd"
        + " AND b.status IN ('CONFIRMED', 'PENDING')")
    long countDailyBookings(
        @Param("participantId") Long participantId,
        @Param("dayStart") Instant dayStart,
        @Param("dayEnd") Instant dayEnd
    );

    @Query("SELECT COUNT(b) FROM Booking b"
        + " WHERE b.participant.id = :participantId"
        + " AND b.status IN ('CONFIRMED', 'PENDING')"
        + " AND b.availability.startDatetime < :end"
        + " AND b.availability.endDatetime > :start")
    long countOverlapping(
        @Param("participantId") Long participantId,
        @Param("start") Instant start,
        @Param("end") Instant end
    );

    List<Booking> findAllByStatusOrderByCreatedAtDesc(BookingStatus status);

    @Query("SELECT COUNT(b) FROM Booking b"
        + " WHERE b.availability.provider.id = :providerId"
        + " AND b.status = 'CANCELLED_BY_PROVIDER'"
        + " AND b.createdAt >= :since")
    long countByProviderIdSince(
        @Param("providerId") Long providerId,
        @Param("since") Instant since
    );

    @Query("SELECT b FROM Booking b"
        + " WHERE b.participant.id = :participantId"
        + " AND b.status IN ('CONFIRMED', 'PENDING')")
    List<Booking> findActiveByParticipantId(@Param("participantId") Long participantId);

    /** 推薦スコア: 直近 N 日の COMPLETED 件数 */
    @Query("SELECT COUNT(b) FROM Booking b"
        + " WHERE b.availability.provider.id = :providerId"
        + " AND b.status = 'COMPLETED'"
        + " AND b.availability.startDatetime >= :since"
        + " AND b.availability.startDatetime < :until")
    long countCompletedByProviderSince(
        @Param("providerId") Long providerId,
        @Param("since") Instant since,
        @Param("until") Instant until
    );

    /** 推薦スコア: 直近 N 日の COMPLETED + NO_SHOW + CANCELLED_BY_PROVIDER 件数 */
    @Query("SELECT COUNT(b) FROM Booking b"
        + " WHERE b.availability.provider.id = :providerId"
        + " AND b.status IN ('COMPLETED', 'NO_SHOW', 'CANCELLED_BY_PROVIDER')"
        + " AND b.availability.startDatetime >= :since"
        + " AND b.availability.startDatetime < :until")
    long countResolvedByProviderSince(
        @Param("providerId") Long providerId,
        @Param("since") Instant since,
        @Param("until") Instant until
    );

    /** BookingRule 用: Participant の全予約（ルール検証に使用）*/
    @Query("SELECT b FROM Booking b WHERE b.participant.id = :participantId ORDER BY b.createdAt DESC")
    List<Booking> findByParticipantIdOrderByCreatedAtDesc(@Param("participantId") Long participantId);

    /** 無断キャンセル検知バッチ用: 開始時刻が threshold 以前の CONFIRMED 予約 */
    @Query("SELECT b FROM Booking b"
        + " WHERE b.status = 'CONFIRMED'"
        + " AND b.availability.startDatetime <= :threshold")
    List<Booking> findConfirmedWithStartBefore(@Param("threshold") Instant threshold);

    /** リマインドメールバッチ用: 指定日の CONFIRMED 予約一覧 */
    @Query("SELECT b FROM Booking b"
        + " WHERE b.status = 'CONFIRMED'"
        + " AND b.availability.startDatetime >= :startUtc"
        + " AND b.availability.startDatetime < :endUtc")
    List<Booking> findConfirmedByDate(
        @Param("startUtc") Instant startUtc,
        @Param("endUtc") Instant endUtc
    );
}