// backend/src/main/java/com/airetia/application/service/ticket/TicketService.java
package com.airetia.application.service.ticket;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.airetia.application.dto.request.ticket.TicketGrantRequest;
import com.airetia.application.dto.response.ticket.TicketResponse;
import com.airetia.application.dto.response.ticket.TicketBalanceResponse;
import com.airetia.application.dto.response.ticket.TicketUsageResponse;
import com.airetia.domain.model.audit.AuditLog;
import com.airetia.domain.model.member.Member;
import com.airetia.domain.model.member.MemberRole;
import com.airetia.domain.model.ticket.Ticket;
import com.airetia.domain.model.ticket.TicketUsage;
import com.airetia.domain.model.ticket.UsageType;
import com.airetia.exception.BusinessException;
import com.airetia.exception.ResourceNotFoundException;
import com.airetia.infrastructure.security.MemberDetails;
import com.airetia.repository.MemberRepository;
import com.airetia.repository.TicketRepository;
import com.airetia.repository.TicketUsageRepository;
import com.airetia.repository.AuditLogRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * チケットサービス
 * → 02_business_rules.md §1（料金・チケットルール）
 * → 03_common_specification.md §5 チケット
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TicketService {

    private static final ZoneId JST = ZoneId.of("Asia/Tokyo");

    private final TicketRepository      ticketRepository;
    private final TicketUsageRepository ticketUsageRepository;
    private final MemberRepository      memberRepository;
    private final AuditLogRepository auditLogRepository;

    /** チケット残高情報（balance / nearestExpiry） */
    @Transactional(readOnly = true)
    public TicketBalanceResponse getBalance(MemberDetails memberDetails) {
        Instant now        = Instant.now();
        List<Ticket> valid = ticketRepository.findValidTickets(memberDetails.getId(), now);
        Instant nearest    = valid.isEmpty() ? null : valid.get(0).getExpiryDate();
        List<TicketResponse> tickets = valid.stream().map(TicketResponse::from).toList();
        return TicketBalanceResponse.builder()
            .balance(valid.size())
            .nearestExpiry(nearest != null ? nearest.toString() : null)
            .tickets(tickets)
            .build();
    }

    /** 使用履歴（消費・返還・調整） */
    @Transactional(readOnly = true)
    public List<TicketUsageResponse> getTicketUsages(MemberDetails memberDetails) {
        return ticketUsageRepository.findByMember_IdOrderByCreatedAtDesc(memberDetails.getId())
            .stream().map(TicketUsageResponse::from).toList();
    }

    /**
     * チケット消費（FIFO順 / §1.3）
     * TicketUsage(BOOKING) を ticket ごとに 1 件ずつ作成する。
     * @return 消費チケットの最長有効期限（返還期限計算に使用）
     */
    @Transactional
    public Instant consumeTickets(Long memberId, int count, Long bookingId) {
        List<Ticket> valid = ticketRepository.findValidTickets(memberId, Instant.now());
        if (valid.size() < count) {
            throw new BusinessException(
                String.format("チケット残高が不足しています（必要: %d枚、残高: %d枚）", count, valid.size()));
        }

        List<Ticket> toConsume = valid.subList(0, count);
        List<Long> ids = toConsume.stream().map(Ticket::getId).toList();

        // 最長有効期限（返還有効期限の上限計算用）
        Instant originalExpiry = toConsume.stream()
            .map(Ticket::getExpiryDate)
            .max(Instant::compareTo)
            .orElse(Instant.now().plus(365, ChronoUnit.DAYS));

        // チケットを論理削除（isActive = false）
        ticketRepository.consumeByIds(ids);

        // TicketUsage 記録（ticket ごとに 1 件、amount=1 / 正: 消費）
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new ResourceNotFoundException("メンバーが見つかりません"));
        List<TicketUsage> usages = toConsume.stream().map(ticket ->
            TicketUsage.builder()
                .ticket(ticket)
                .member(member)
                .bookingId(bookingId)
                .usageType(UsageType.BOOKING)
                .amount(1)
                .build()
        ).toList();
        ticketUsageRepository.saveAll(usages);

        log.info("Tickets consumed: memberId={}, count={}, bookingId={}", memberId, count, bookingId);
        return originalExpiry;
    }

    /**
     * 返還チケット作成（利用者都合キャンセル / §3.1・§3.2）
     * キャンセル時刻 ↔ サービス開始時刻の差分で返還率を決定。
     * @return 実際に返還した枚数
     */
    @Transactional
    public int refundTickets(Long memberId, int consumedCount, Instant cancelTime,
                             Instant serviceStart, Instant originalExpiry, Long bookingId) {
        long minutesBefore = java.time.Duration.between(cancelTime, serviceStart).toMinutes();
        double refundRate;
        Instant refundExpiry;

        // 境界ちょうどは返還率が高い方を適用（§3.1 注記）
        if      (minutesBefore >= 1440) { refundRate = 1.0; refundExpiry = originalExpiry; }
        else if (minutesBefore >= 720)  { refundRate = 0.5; refundExpiry = cancelTime.plus(7, ChronoUnit.DAYS); }
        else if (minutesBefore >= 30)   { refundRate = 0.2; refundExpiry = cancelTime.plus(7, ChronoUnit.DAYS); }
        else                            { return 0; }

        int refundCount = (int) Math.floor(consumedCount * refundRate);
        if (refundCount == 0) return 0;

        // 返還有効期限 = MIN(計算値, 元チケット有効期限) → §3.3
        Instant finalExpiry = refundExpiry.isBefore(originalExpiry) ? refundExpiry : originalExpiry;

        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new ResourceNotFoundException("メンバーが見つかりません"));

        List<Ticket> tickets = new ArrayList<>();
        for (int i = 0; i < refundCount; i++) {
            tickets.add(Ticket.builder().member(member).expiryDate(finalExpiry).build());
        }
        List<Ticket> saved = ticketRepository.saveAll(tickets);

        // TicketUsage 記録（amount = -1: 返還）
        List<TicketUsage> usages = saved.stream().map(ticket ->
            TicketUsage.builder()
                .ticket(ticket)
                .member(member)
                .bookingId(bookingId)
                .usageType(UsageType.REFUND)
                .amount(-1)
                .build()
        ).toList();
        ticketUsageRepository.saveAll(usages);

        log.info("Tickets refunded: memberId={}, count={}, bookingId={}", memberId, refundCount, bookingId);
        return refundCount;
    }

    /**
     * 返還チケット作成（プロバイダー都合キャンセル / §3.4）
     * 全枚数返還・元の有効期限を維持。
     */
    @Transactional
    public int refundTicketsByProvider(Long memberId, int consumedCount,
                                       Instant originalExpiry, Long bookingId) {
        if (consumedCount == 0) return 0;

        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new ResourceNotFoundException("メンバーが見つかりません"));

        List<Ticket> tickets = new ArrayList<>();
        for (int i = 0; i < consumedCount; i++) {
            tickets.add(Ticket.builder().member(member).expiryDate(originalExpiry).build());
        }
        List<Ticket> saved = ticketRepository.saveAll(tickets);

        List<TicketUsage> usages = saved.stream().map(ticket ->
            TicketUsage.builder()
                .ticket(ticket)
                .member(member)
                .bookingId(bookingId)
                .usageType(UsageType.REFUND)
                .amount(-1)
                .build()
        ).toList();
        ticketUsageRepository.saveAll(usages);

        log.info("Tickets refunded(provider): memberId={}, count={}, bookingId={}", memberId, consumedCount, bookingId);
        return consumedCount;
    }

    /**
     * チケット手動付与（管理者用 / §7.1）
     * 有効期限: 付与日（JST）+ 1 年（§1.2）
     * → 管理者 → メンバー付与。管理者自身への付与は不可。
     */
    @Transactional
    public List<TicketResponse> grantTickets(MemberDetails admin, TicketGrantRequest request) {
        auditLogRepository.save(AuditLog.builder()
            .adminId(admin.getId())
            .action("TICKET_GRANT")
            .targetId(request.getMemberId())
            .targetType("Ticket")
            .build());
        if (admin.getMember().getRole() != MemberRole.ADMIN) {
            throw new BusinessException("管理者のみチケットを付与できます");
        }
        Member member = memberRepository.findById(request.getMemberId())
            .orElseThrow(() -> new ResourceNotFoundException("メンバーが見つかりません"));
        if (member.getRole() == MemberRole.ADMIN) {
            throw new BusinessException("管理者アカウントにはチケットを付与できません");
        }

        // §1.2: 有効期限 = 付与日(JST) + 1 年（同日ベース）
        // 管理者が expiryDate を指定した場合はその日の 23:59:59 JST を使用（→ §1.2）
        Instant expiry;
        if (request.getExpiryDate() != null) {
            expiry = request.getExpiryDate()
                .atTime(23, 59, 59)
                .atZone(JST)
                .toInstant();
        } else {
            expiry = Instant.now().atZone(JST).plusYears(1).toInstant();
        }

        List<Ticket> tickets = new ArrayList<>();
        for (int i = 0; i < request.getQuantity(); i++) {
            tickets.add(Ticket.builder().member(member).expiryDate(expiry).build());
        }
        List<Ticket> saved = ticketRepository.saveAll(tickets);

        // TicketUsage 記録（ADJUSTMENT: 管理者調整）
        List<TicketUsage> usages = saved.stream().map(ticket ->
            TicketUsage.builder()
                .ticket(ticket)
                .member(member)
                .bookingId(null)
                .usageType(UsageType.ADJUSTMENT)
                .amount(1)
                .note(String.format("管理者による手動付与（adminId=%d）", admin.getId()))
                .build()
        ).toList();
        ticketUsageRepository.saveAll(usages);

        log.info("Tickets granted: memberId={}, quantity={}, adminId={}",
            member.getId(), request.getQuantity(), admin.getId());
        return saved.stream().map(TicketResponse::from).toList();
    }


    /**
     * チケット有効期限を計算（購入日 + 1年 / §1.2）
     * DataInitializer・手動付与時に利用。
     * 2/29 → 翌年 2/28 は LocalDate.plusYears が自動的に処理する。
     */
    public java.time.Instant calculateExpiryDate(LocalDate baseDate) {
        return baseDate.plusYears(1)
            .atTime(23, 59, 59)
            .atZone(JST)
            .toInstant();
    }


}
