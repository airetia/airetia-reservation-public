// backend/src/main/java/com/airetia/domain/model/ticket/TicketUsage.java

package com.airetia.domain.model.ticket;

import java.time.Instant;

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

import com.airetia.domain.model.member.Member;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * チケット使用履歴エンティティ
 * DB: ticket_usages テーブル（V12__create_ticket_usages.sql）
 * ビジネスルール §1.3
 *
 * 消費（BOOKING）・返還（REFUND）・調整（ADJUSTMENT）の全操作を記録する。
 * 1チケット1レコード。返還チケットは新規 Ticket + 本レコードで管理する。
 *
 * amount の符号:
 *   BOOKING    → 正（1）: チケット消費（残高減少）
 *   REFUND     → 負（-1）: チケット返還（残高増加）
 *   ADJUSTMENT → 負（-1）: 管理者付与（残高増加）/ 正: 手動回収
 */
@Entity
@Table(name = "ticket_usages")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class TicketUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 対象チケット */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    /** チケット保有メンバー（ticket.member と同一・クエリ効率化のため冗長保持） */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    /**
     * 紐づく予約ID（BOOKING / REFUND 時に設定）
     * ADJUSTMENT の場合は null。
     * 外部キーなし（予約削除後も履歴を保持するため）。
     */
    @Column(name = "booking_id")
    private Long bookingId;

    @Enumerated(EnumType.STRING)
    @Column(name = "usage_type", nullable = false, length = 20)
    private UsageType usageType;

    /**
     * 変化量
     * 正: 消費（残高減少）/ 負: 返還・付与（残高増加）
     */
    @Column(nullable = false)
    private Integer amount;

    /** 管理者調整時のメモ等 */
    @Column(length = 255)
    private String note;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}