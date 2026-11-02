// backend/src/main/java/com/airetia/repository/TicketRepository.java
package com.airetia.repository;

import java.time.Instant;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.airetia.domain.model.ticket.Ticket;

/**
 * チケットリポジトリ
 *
 * 修正点:
 *   consumeByIds() の JPQL から t.usedBookingId を削除。
 *   Ticket エンティティに usedBookingId フィールドは存在しない。
 *   チケット使用履歴は ticket_usages テーブル（TicketUsage エンティティ）で管理する。
 *   → TicketService.consumeTickets() で TicketUsage レコードを作成すること。
 */
@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    /** 有効チケット枚数（残高確認用 / ビジネスルール §1.3） */
    @Query("""
        SELECT COUNT(t) FROM Ticket t
        WHERE t.member.id = :memberId
          AND t.isActive = true
          AND t.expiryDate >= :now
    """)
    long countValidTickets(@Param("memberId") Long memberId, @Param("now") Instant now);

    /** 有効チケット一覧（FIFO順: 有効期限が近いものから / ビジネスルール §1.3） */
    @Query("""
        SELECT t FROM Ticket t
        WHERE t.member.id = :memberId
          AND t.isActive = true
          AND t.expiryDate >= :now
        ORDER BY t.expiryDate ASC
    """)
    List<Ticket> findValidTickets(@Param("memberId") Long memberId, @Param("now") Instant now);

    /** メンバーの全チケット一覧（履歴表示用） */
    List<Ticket> findByMember_IdOrderByCreatedAtDesc(Long memberId);

    /**
     * 指定IDのチケットを一括消費（isActive = false に更新）
     *
     * NOTE: usedBookingId は DB スキーマに存在しないため SET に含めない。
     *       消費の紐付けは TicketUsage レコードで行う。
     */
    @Modifying
    @Transactional
    @Query("UPDATE Ticket t SET t.isActive = false WHERE t.id IN :ticketIds")
    void consumeByIds(@Param("ticketIds") List<Long> ticketIds);

    /** 期限切れチケットを一括無効化（TicketExpiryBatch / ビジネスルール §1.2） */
    @Modifying
    @Transactional
    @Query("UPDATE Ticket t SET t.isActive = false WHERE t.isActive = true AND t.expiryDate < :now")
    int deactivateExpired(@Param("now") Instant now);
}