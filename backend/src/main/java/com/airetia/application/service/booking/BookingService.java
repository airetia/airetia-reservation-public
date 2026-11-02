// backend/src/main/java/com/airetia/application/service/booking/BookingService.java
package com.airetia.application.service.booking;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.airetia.application.dto.request.booking.BookingRequest;
import com.airetia.application.dto.response.booking.BookingResponse;
import com.airetia.application.service.email.EmailService;
import com.airetia.application.service.ticket.TicketService;
import com.airetia.domain.model.booking.Booking;
import com.airetia.domain.model.booking.BookingStatus;
import com.airetia.domain.model.member.MemberRole;
import com.airetia.domain.model.provider.ProviderCancellationWarning;
import com.airetia.domain.model.provider.ProviderStatus;
import com.airetia.domain.rule.AdminAccessRule;
import com.airetia.exception.BusinessException;
import com.airetia.exception.ResourceNotFoundException;
import com.airetia.infrastructure.security.MemberDetails;
import com.airetia.repository.AvailabilityRepository;
import com.airetia.repository.BookingRepository;
import com.airetia.repository.ParticipantRepository;
import com.airetia.repository.ProviderCancellationWarningRepository;
import com.airetia.repository.ProviderRepository;
import com.airetia.repository.TicketRepository;
import com.airetia.repository.TicketUsageRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 予約サービス
 * ビジネスルール → 02_business_rules.md §2 / §3
 *
 * 予約上限（§2.2）:
 *   - CONFIRMED + PENDING 合計 ≤ 90件（participant単位）
 *   - PENDING のみ          ≤ 10件（participant単位）
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private static final ZoneId JST        = ZoneId.of("Asia/Tokyo");
    private static final int MAX_TOTAL     = 90;
    private static final int MAX_PENDING   = 10;
    private static final int MAX_DAILY     = 3;

    private final BookingRepository      bookingRepository;
    private final AvailabilityRepository availabilityRepository;
    private final AdminAccessRule adminAccessRule;
    private final ParticipantRepository  participantRepository;
    private final ProviderRepository     providerRepository;
    private final TicketRepository       ticketRepository;
    private final TicketUsageRepository                  ticketUsageRepository;
    private final ProviderCancellationWarningRepository   cancellationWarningRepository;
    private final EmailService                            emailService;
    private final TicketService          ticketService;

    // ─────────────────────────────────────────────────────────────────────────
    // 予約作成（§2）
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public BookingResponse createBooking(MemberDetails memberDetails, BookingRequest request) {

        
        adminAccessRule.denyIfAdmin(memberDetails.getMember());

        // 利用停止チェック（§4.3）
        if (memberDetails.getMember().isSuspended()) {
            throw new com.airetia.exception.AccountSuspendedException(
                "アカウントが一時停止中です。停止期間終了まで新規予約できません");
        }

        var participant = participantRepository.findById(request.getParticipantId())
            .orElseThrow(() -> new ResourceNotFoundException("利用者が見つかりません"));
        if (!participant.getMember().getId().equals(memberDetails.getId())) {
            throw new BusinessException("この利用者プロフィールへのアクセス権がありません");
        }

        var availability = availabilityRepository.findByIdWithLock(request.getAvailabilityId())
            .orElseThrow(() -> new ResourceNotFoundException("空き枠が見つかりません"));

        if (!availability.isBookable()) {
            throw new BusinessException("この空き枠はまだ予約受付前です");
        }

        // 自分のサービスへの予約禁止（§5.4）
        if (availability.getProvider().getMember().getId().equals(memberDetails.getId())) {
            throw new BusinessException("自分が提供するサービスには予約できません");
        }

        Instant serviceStart = availability.getStartDatetime();
        Instant serviceEnd   = availability.getEndDatetime();

        // 定員チェック（§2.5）
        long bookedCount = bookingRepository.countByAvailabilityIdAndStatus(
            availability.getId(), BookingStatus.CONFIRMED);
        if (bookedCount >= availability.getCapacity()) {
            throw new BusinessException("この空き枠は満席です");
        }

        // 予約上限チェック（§2.2）: PENDING チェックを先に行う
        long pendingCount = bookingRepository.countByParticipantIdAndStatus(
            participant.getId(), BookingStatus.PENDING);
        long totalCount   = bookingRepository.countByParticipantIdAndStatusIn(
            participant.getId(), List.of(BookingStatus.CONFIRMED, BookingStatus.PENDING));

        if (pendingCount >= MAX_PENDING) {
            throw new BusinessException(
                String.format("リクエスト上限（%d件）に達しています。確定後に再度リクエストしてください", MAX_PENDING));
        }
        if (totalCount >= MAX_TOTAL) {
            throw new BusinessException(
                String.format("予約上限（%d件）に達しています", MAX_TOTAL));
        }

        // 1日3件上限（§2.3）: participant単位・JST基準
        ZonedDateTime jstStart = serviceStart.atZone(JST);
        ZonedDateTime dayStart = jstStart.toLocalDate().atStartOfDay(JST);
        ZonedDateTime dayEnd   = dayStart.plusDays(1);
        long dailyCount = bookingRepository.countDailyBookings(
            participant.getId(), dayStart.toInstant(), dayEnd.toInstant());
        if (dailyCount >= MAX_DAILY) {
            throw new BusinessException(
                String.format("%s %s さんは %s に既に%d件のサービスを予約しています",
                    participant.getLastName(), participant.getFirstName(),
                    jstStart.toLocalDate(), MAX_DAILY));
        }

        // 時間重複チェック（§2.4）
        long overlapping = bookingRepository.countOverlapping(
            participant.getId(), serviceStart, serviceEnd);
        if (overlapping > 0) {
            throw new BusinessException("同じ時間帯に別の予約があります");
        }

        // チケット残高チェック（§1.3）
        int ticketsRequired = availability.getOffering().getTicketsRequired();
        long validCount = ticketRepository.countValidTickets(memberDetails.getId(), Instant.now());
        if (validCount < ticketsRequired) {
            throw new BusinessException(
                String.format("チケットが不足しています（必要: %d枚、残高: %d枚）",
                    ticketsRequired, validCount));
        }

        // チケット有効期限 >= サービス開始時刻チェック（§1.2）
        List<com.airetia.domain.model.ticket.Ticket> validTickets =
            ticketRepository.findValidTickets(memberDetails.getId(), Instant.now());
        long validForService = validTickets.stream()
            .filter(t -> !t.getExpiryDate().isBefore(serviceStart))
            .count();
        if (validForService < ticketsRequired) {
            throw new BusinessException(
                "サービス開始日時までにチケットの有効期限が切れます。チケットを追加購入してください");
        }

        // 予約作成（PENDING: チケット消費は CONFIRM 時）
        Booking booking = Booking.builder()
            .participant(participant)
            .availability(availability)
            .status(BookingStatus.PENDING)
            .ticketsConsumed(ticketsRequired)
            .build();
        booking = bookingRepository.save(booking);

        log.info("予約リクエスト: bookingId={}, participantId={}, memberId={}",
            booking.getId(), participant.getId(), memberDetails.getId());
        return BookingResponse.from(booking);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 予約確定（PENDING → CONFIRMED）・チケット消費（§1.3）
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public BookingResponse confirmBooking(Long bookingId, MemberDetails memberDetails) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("予約が見つかりません"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BusinessException("リクエスト中の予約のみ確定できます");
        }

        // 権限チェック: ADMIN は全件可、PROVIDER は自分のサービスへの予約のみ可
        if (memberDetails.getMember().getRole() != MemberRole.ADMIN) {
            var myProvider = providerRepository.findByMemberId(memberDetails.getId())
                .orElseThrow(() -> new BusinessException("プロバイダー情報が見つかりません"));
            Long bookingProviderId = booking.getAvailability().getProvider().getId();
            if (!myProvider.getId().equals(bookingProviderId)) {
                throw new BusinessException("この予約を確定する権限がありません");
            }
        }

        Long memberId = booking.getParticipant().getMember().getId();
        ticketService.consumeTickets(memberId, booking.getTicketsConsumed(), bookingId);

        booking.confirm();
        bookingRepository.save(booking);

        emailService.sendBookingConfirmation(booking);
        log.info("予約確定: bookingId={}", bookingId);
        return BookingResponse.from(booking);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 予約一覧・詳細
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(MemberDetails memberDetails) {
        return bookingRepository.findByMemberId(memberDetails.getId())
            .stream().map(BookingResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsAsProvider(MemberDetails memberDetails) {
        var provider = providerRepository.findByMemberId(memberDetails.getId())
            .orElseThrow(() -> new BusinessException("プロバイダー情報が見つかりません"));
        if (provider.getStatus() != ProviderStatus.APPROVED) {
            throw new BusinessException("承認済みのプロバイダーのみ利用できます");
        }
        return bookingRepository.findByProviderId(provider.getId())
            .stream().map(BookingResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAllOrderByCreatedAtDesc()
            .stream().map(BookingResponse::from).toList();
    }

    /**
     * ステータス絞り込み（管理者専用）
     * → BookingController GET ?status= パラメータ対応
     */
    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookingsByStatus(String status) {
        try {
            BookingStatus bs = BookingStatus.valueOf(status.toUpperCase());
            return bookingRepository.findAllByStatusOrderByCreatedAtDesc(bs)
                .stream().map(BookingResponse::from).toList();
        } catch (IllegalArgumentException e) {
            // 不正な status 値は全件返す
            return getAllBookings();
        }
    }

    @Transactional(readOnly = true)
    public BookingResponse getBooking(Long bookingId, MemberDetails memberDetails) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("予約が見つかりません"));

        if (memberDetails.getMember().getRole() != MemberRole.ADMIN) {
            boolean isOwner = booking.getParticipant().getMember().getId()
                .equals(memberDetails.getId());
            boolean isProvider = providerRepository.findByMemberId(memberDetails.getId())
                .map(p -> p.getId().equals(booking.getAvailability().getProvider().getId()))
                .orElse(false);
            if (!isOwner && !isProvider) {
                throw new BusinessException("この予約へのアクセス権がありません");
            }
        }
        return BookingResponse.from(booking);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 利用者都合キャンセル（§3.1）
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public void cancelBooking(Long bookingId, MemberDetails memberDetails) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("予約が見つかりません"));

        BookingStatus currentStatus = booking.getStatus();
        if (currentStatus != BookingStatus.CONFIRMED && currentStatus != BookingStatus.PENDING) {
            throw new BusinessException("確定中またはリクエスト中の予約のみキャンセルできます");
        }

        boolean isAdmin = memberDetails.getMember().getRole() == MemberRole.ADMIN;
        boolean isOwner = booking.getParticipant().getMember().getId()
            .equals(memberDetails.getId());
        if (!isAdmin && !isOwner) {
            throw new BusinessException("この予約をキャンセルする権限がありません");
        }

        Instant now          = Instant.now();
        Instant serviceStart = booking.getAvailability().getStartDatetime();
        long minutesBefore   = Duration.between(now, serviceStart).toMinutes();

        // 利用停止中は24時間以上前のキャンセルのみ可（§3.1）
        if (Boolean.TRUE.equals(memberDetails.getMember().getIsLocked()) && minutesBefore < 1440) {
            throw new BusinessException("利用停止中は24時間以上前のキャンセルのみ可能です");
        }

        // ★ 修正: status 判定は booking.cancel() 呼び出し前に行う
        //    cancel() 後は status が CANCELLED_BY_USER に変わるため
        //    「if (booking.getStatus() == CONFIRMED)」では常に false になっていた
        boolean wasConfirmed = (currentStatus == BookingStatus.CONFIRMED);

        booking.cancel(BookingStatus.CANCELLED_BY_USER);
        bookingRepository.save(booking);

        // CONFIRMED のキャンセルのみチケット返還（PENDING はチケット未消費のため不要）
        if (wasConfirmed) {
            // 消費時の最長有効期限を ticket_usages から取得（§3.3）
            Instant originalExpiry = ticketUsageRepository
                .findBookingUsagesByBookingId(bookingId).stream()
                .map(tu -> tu.getTicket().getExpiryDate())
                .max(Instant::compareTo)
                .orElse(serviceStart.plus(365, ChronoUnit.DAYS)); // フォールバック
            ticketService.refundTickets(
                booking.getParticipant().getMember().getId(),
                booking.getTicketsConsumed(),
                now, serviceStart, originalExpiry, bookingId
            );
        }

        emailService.sendBookingCancelled(booking);
        log.info("予約キャンセル（利用者都合）: bookingId={}, memberId={}", bookingId, memberDetails.getId());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // プロバイダー都合キャンセル（§3.4）
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public void cancelByProvider(Long bookingId, MemberDetails memberDetails) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("予約が見つかりません"));

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new BusinessException("確定済みの予約のみキャンセルできます");
        }

        boolean isAdmin = memberDetails.getMember().getRole() == MemberRole.ADMIN;
        if (!isAdmin) {
            boolean isProvider = providerRepository.findByMemberId(memberDetails.getId())
                .map(p -> p.getId().equals(booking.getAvailability().getProvider().getId()))
                .orElse(false);
            if (!isProvider) {
                throw new BusinessException("この予約をキャンセルする権限がありません");
            }
        }

        booking.cancel(BookingStatus.CANCELLED_BY_PROVIDER);
        bookingRepository.save(booking);

        // 100%返還・元有効期限を ticket_usages から取得（§3.4）
        Instant originalExpiry = ticketUsageRepository
            .findBookingUsagesByBookingId(bookingId).stream()
            .map(tu -> tu.getTicket().getExpiryDate())
            .max(Instant::compareTo)
            .orElse(booking.getAvailability().getStartDatetime().plus(365, ChronoUnit.DAYS));
        ticketService.refundTicketsByProvider(
            booking.getParticipant().getMember().getId(),
            booking.getTicketsConsumed(),
            originalExpiry, bookingId
        );

        // プロバイダー都合キャンセル警告履歴を記録（§3.4）
        var provider = booking.getAvailability().getProvider();
        cancellationWarningRepository.save(
            ProviderCancellationWarning.builder()
                .providerId(provider.getId())
                .bookingId(bookingId)
                .build()
        );

        // 年間累積警告数チェック（§3.4）
        Instant oneYearAgo = Instant.now().minus(365, ChronoUnit.DAYS);
        long annualCount = cancellationWarningRepository
            .countByProviderIdSince(provider.getId(), oneYearAgo);
        if (annualCount >= 10) {
            log.warn("[警告] プロバイダー都合キャンセル年間10回超過 → 停止検討: providerId={}", provider.getId());
        } else if (annualCount >= 5) {
            log.warn("[警告] プロバイダー都合キャンセル年間5回 → 管理者面談: providerId={}", provider.getId());
        } else if (annualCount >= 3) {
            log.warn("[警告] プロバイダー都合キャンセル年間3回 → 警告メール送信: providerId={}", provider.getId());
        }

        log.info("予約キャンセル（プロバイダー都合）: bookingId={}", bookingId);
    }
}