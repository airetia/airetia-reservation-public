// backend/src/main/java/com/airetia/repository/TicketUsageRepository.java

package com.airetia.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.airetia.domain.model.ticket.TicketUsage;

/**
 * チケット使用履歴リポジトリ
 * DB: ticket_usages テーブル（V12__create_ticket_usages.sql）
 * 消費（BOOKING）・返還（REFUND）・調整（ADJUSTMENT）の全履歴を管理する。
 */
@Repository
public interface TicketUsageRepository extends JpaRepository<TicketUsage, Long> {

    /**
     * メンバーの使用履歴一覧（新しい順）
     * 修正: findByMemberIdOrderByCreatedAtDesc → findByMember_IdOrderByCreatedAtDesc
     *   TicketUsage は Long memberId ではなく @ManyToOne Member member を持つため
     *   Spring Data JPA の _ 区切り（JOIN）を使用する必要がある
     */
    List<TicketUsage> findByMember_IdOrderByCreatedAtDesc(Long memberId);

    /** 予約に紐づく使用履歴 */
    List<TicketUsage> findByBookingId(Long bookingId);

    /** チケットの使用履歴 */
    List<TicketUsage> findByTicket_IdOrderByCreatedAtDesc(Long ticketId);

    /** 予約に消費されたチケット使用履歴（返還時の有効期限参照用） */
    @Query("""
        SELECT tu FROM TicketUsage tu
        WHERE tu.bookingId = :bookingId
          AND tu.usageType = com.airetia.domain.model.ticket.UsageType.BOOKING
        """)
    List<TicketUsage> findBookingUsagesByBookingId(@Param("bookingId") Long bookingId);
}
