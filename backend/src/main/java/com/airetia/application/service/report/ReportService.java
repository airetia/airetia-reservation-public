// backend/src/main/java/com/airetia/application/service/report/ReportService.java
package com.airetia.application.service.report;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.airetia.application.dto.request.report.ReportRequest;
import com.airetia.application.dto.response.report.ReportResponse;
import com.airetia.domain.model.booking.Booking;
import com.airetia.domain.model.booking.BookingStatus;
import com.airetia.domain.model.penalty.Penalty;
import com.airetia.domain.model.provider.Provider;
import com.airetia.domain.model.report.Report;
import com.airetia.domain.model.report.ReportType;
import com.airetia.exception.BusinessException;
import com.airetia.exception.ResourceNotFoundException;
import com.airetia.infrastructure.security.MemberDetails;
import com.airetia.repository.BookingRepository;
import com.airetia.repository.MemberRepository;
import com.airetia.repository.PenaltyRepository;
import com.airetia.repository.ProviderRepository;
import com.airetia.application.service.email.EmailService;
import com.airetia.repository.ReportRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 報告書サービス
 * → 02_business_rules.md §2.6（報告可能期間）
 * → 02_business_rules.md §4（ペナルティルール）
 * → 03_common_specification.md §5 報告書
 *
 * 修正:
 *   - findByProviderIdOrderByCreatedAtDesc → findByProvider_IdOrderByCreatedAtDesc
 *     (ReportRepository: Provider は @ManyToOne 関連のため _ 記法)
 *   - applyAutoPenalty: countisActivePenalties → countActivePenalties
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository   reportRepository;
    private final EmailService       emailService;
    private final BookingRepository  bookingRepository;
    private final ProviderRepository providerRepository;
    private final PenaltyRepository  penaltyRepository;
    private final MemberRepository   memberRepository;

    /**
     * 報告書作成
     * POST /api/v1/reports
     */
    @Transactional
    public ReportResponse createReport(MemberDetails memberDetails, ReportRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
            .orElseThrow(() -> new ResourceNotFoundException("予約が見つかりません"));

        Provider provider = providerRepository.findByMemberId(memberDetails.getId())
            .orElseThrow(() -> new BusinessException("プロバイダー情報が見つかりません"));

        if (!booking.getAvailability().getProvider().getId().equals(provider.getId())) {
            throw new BusinessException("自分が担当する予約のみ報告できます");
        }
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new BusinessException("確定済みの予約のみ報告できます");
        }
        if (reportRepository.existsByBookingId(booking.getId())) {
            throw new BusinessException("この予約の報告書は既に作成されています");
        }

        // 報告可能時間チェック（§2.6）
        Instant now       = Instant.now();
        Instant startTime = booking.getAvailability().getStartDatetime();
        Instant endTime   = booking.getAvailability().getEndDatetime();

        if (request.getReportType() == ReportType.COMPLETION) {
            Instant earliest = endTime.minus(15, ChronoUnit.MINUTES);
            Instant latest   = endTime.plus(24, ChronoUnit.HOURS);
            if (now.isBefore(earliest) || now.isAfter(latest)) {
                throw new BusinessException("完了報告はサービス終了15分前〜終了24時間後の間に行ってください");
            }
        } else if (request.getReportType() == ReportType.NO_SHOW) {
            Instant earliest = startTime.plus(15, ChronoUnit.MINUTES);
            if (now.isBefore(earliest)) {
                throw new BusinessException("無断キャンセル報告はサービス開始15分後以降に行ってください");
            }
        }

        Report report = Report.builder()
            .booking(booking)
            .provider(provider)
            .reportType(request.getReportType())
            .feedback(request.getFeedback())
            .sharedNote(request.getSharedNote())
            .privateNote(request.getPrivateNote())
            .build();
        report = reportRepository.save(report);

        if (request.getReportType() == ReportType.NO_SHOW) {
            booking.markNoShow();
            bookingRepository.save(booking);

            // ペナルティ付与（§4.1）
            Penalty penalty = Penalty.forNoShow(booking.getParticipant(), booking);
            penaltyRepository.save(penalty);
            emailService.sendPenaltyApplied(booking);
            log.info("Penalty applied: participantId={}, bookingId={}",
                booking.getParticipant().getId(), booking.getId());

            // 空き枠の解放（§2.6 「該当枠を空き枠として開放」）
            // bookings テーブルは NO_SHOW のまま保持。availability の bookable フラグは
            // 変更しない（当該スロット時刻は過去のため再予約不要）。
            // 定員チェックは CONFIRMED カウントで行うため NO_SHOW 後は自動的に枠が空く。

            // 自動停止判定（§4.2）
            applyAutoPenalty(booking.getParticipant().getId(),
                             booking.getParticipant().getMember().getId());
        } else {
            booking.complete();
            bookingRepository.save(booking);
        }

        log.info("Report created: bookingId={}, type={}", booking.getId(), request.getReportType());
        return ReportResponse.from(report);
    }

    /**
     * 無断キャンセル回数に応じた自動停止（§4.2）
     * 3回 → 7日停止 / 5回 → 90日停止 / 10回以上 → アカウント削除
     */
    private void applyAutoPenalty(Long participantId, Long memberId) {
        // ★ 修正: countisActivePenalties → countActivePenalties
        long noShowCount = penaltyRepository.countActiveByParticipantId(participantId, Instant.now());

        if (noShowCount >= 10) {
            memberRepository.findById(memberId).ifPresent(m -> {
                m.deactivate();
                memberRepository.save(m);
                log.warn("Member deactivated due to 10+ no-shows: memberId={}", memberId);
            });
        } else if (noShowCount >= 5) {
            memberRepository.findById(memberId).ifPresent(m -> {
                m.suspend(Instant.now().plus(90, ChronoUnit.DAYS));
                memberRepository.save(m);
                log.warn("Member suspended 90 days due to 5 no-shows: memberId={}", memberId);
            });
        } else if (noShowCount >= 3) {
            memberRepository.findById(memberId).ifPresent(m -> {
                m.suspend(Instant.now().plus(7, ChronoUnit.DAYS));
                memberRepository.save(m);
                log.warn("Member suspended 7 days due to 3 no-shows: memberId={}", memberId);
            });
        }
    }

    /** プロバイダーの報告書一覧 */
    @Transactional(readOnly = true)
    public List<ReportResponse> getMyReports(MemberDetails memberDetails) {
        Provider provider = providerRepository.findByMemberId(memberDetails.getId())
            .orElseThrow(() -> new ResourceNotFoundException("プロバイダー情報が見つかりません"));
        // ★ 修正: findByProviderIdOrderByCreatedAtDesc → findByProvider_IdOrderByCreatedAtDesc
        return reportRepository.findByProvider_IdOrderByCreatedAtDesc(provider.getId())
            .stream().map(ReportResponse::from).toList();
    }

    /** 報告書詳細 */
    @Transactional(readOnly = true)
    public ReportResponse getReport(Long reportId, MemberDetails memberDetails) {
        Report report = reportRepository.findById(reportId)
            .orElseThrow(() -> new ResourceNotFoundException("報告書が見つかりません"));
        boolean isOwner = report.getProvider().getMember().getId().equals(memberDetails.getId());
        return isOwner ? ReportResponse.from(report) : ReportResponse.fromPublic(report);
    }

    /** 全報告書（管理者用） */
    @Transactional(readOnly = true)
    public List<ReportResponse> getAllReports() {
        return reportRepository.findAllOrderByCreatedAtDesc()
            .stream().map(ReportResponse::from).toList();
    }
}
