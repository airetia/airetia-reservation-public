// backend/src/main/java/com/airetia/application/service/provider/ProviderService.java
package com.airetia.application.service.provider;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.airetia.application.dto.request.provider.ProviderRequest;
import com.airetia.application.dto.response.provider.ProviderResponse;
import com.airetia.application.service.email.EmailService;
import com.airetia.domain.model.audit.AuditLog;
import com.airetia.domain.model.member.Member;
import com.airetia.domain.model.member.MemberRole;
import com.airetia.domain.model.provider.Provider;
import com.airetia.domain.model.provider.ProviderStatus;
import com.airetia.exception.BusinessException;
import com.airetia.exception.ResourceNotFoundException;
import com.airetia.infrastructure.security.MemberDetails;
import com.airetia.repository.AuditLogRepository;
import com.airetia.repository.MemberRepository;
import com.airetia.repository.ProviderRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * プロバイダーサービス
 * ビジネスルール → 02_business_rules.md §5
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProviderService {

    private final ProviderRepository providerRepository;
    private final MemberRepository   memberRepository;
    private final AuditLogRepository auditLogRepository;
    private final EmailService       emailService;

    /** プロバイダー申請（初回）*/
    @Transactional
    public ProviderResponse applyProvider(MemberDetails memberDetails, ProviderRequest request) {
        Long memberId = memberDetails.getId();

        // 管理者は申請不可（§7.1）
        if (memberDetails.getMember().getRole() == MemberRole.ADMIN) {
            throw new BusinessException("管理者アカウントはプロバイダー申請できません");
        }

        // 重複チェック: 既存申請がある場合は再申請可能日時を確認（§5.1.3）
        providerRepository.findByMemberId(memberId).ifPresent(existing -> {
            if (existing.getStatus() == ProviderStatus.REJECTED) {
                if (existing.getReapplicationAvailableAt() != null
                        && existing.getReapplicationAvailableAt().isAfter(Instant.now())) {
                    throw new BusinessException("却下から1ヶ月は再申請できません");
                }
            } else if (existing.getStatus() != ProviderStatus.ON_HOLD) {
                throw new BusinessException("既にプロバイダー申請済みです");
            }
            // ON_HOLD の場合は再申請可能（即時）
        });

        // 重複申請チェック: 他アカウントとの同一人物判定（§5.1.3）
        // 電話番号・メールアドレス・氏名+生年月日のいずれかが一致する APPROVED Provider が存在する場合は拒否
        Member memberCheck = memberRepository.findById(memberId)
            .orElseThrow(() -> new ResourceNotFoundException("メンバーが見つかりません"));

        if (providerRepository.existsDuplicateApprovedProvider(
                memberCheck.getEmail(),
                memberCheck.getPhoneNumber(),
                memberCheck.getFirstName(),
                memberCheck.getLastName(),
                memberCheck.getBirthDate())) {
            throw new BusinessException("同一人物と判断される既存の承認済みプロバイダーが存在します");
        }

        Member member = memberCheck;

        Provider provider = Provider.builder()
            .member(member)
            .status(ProviderStatus.PENDING_DOCUMENTS)
            .highSchool(request.getHighSchool())
            .university(request.getUniversity())
            .appealPoint(request.getAppealPoint())
            .qualifications(request.getQualifications() != null
                ? request.getQualifications() : List.of())
            .achievements(request.getAchievements() != null
                ? request.getAchievements() : List.of())
            .build();

        provider = providerRepository.save(provider);
        emailService.sendProviderApplicationReceived(provider);
        log.info("Provider application: memberId={}, providerId={}", memberId, provider.getId());
        return ProviderResponse.from(provider);
    }

    /** プロバイダー詳細取得 */
    @Transactional(readOnly = true)
    public ProviderResponse getProvider(Long providerId) {
        return providerRepository.findById(providerId)
            .map(ProviderResponse::from)
            .orElseThrow(() -> new ResourceNotFoundException("プロバイダーが見つかりません"));
    }

    /** ID でプロバイダー取得 */
    @Transactional(readOnly = true)
    public Optional<Provider> findById(Long providerId) {
        return providerRepository.findById(providerId);
    }

    /** memberId でプロバイダー取得 */
    @Transactional(readOnly = true)
    public Optional<Provider> findByMemberId(Long memberId) {
        return providerRepository.findByMemberId(memberId);
    }

    /** 全プロバイダー一覧（管理者用） */
    @Transactional(readOnly = true)
    public List<ProviderResponse> getAllProviders() {
        return providerRepository.findAll()
            .stream().map(ProviderResponse::from).toList();
    }

    /** ステータス指定プロバイダー一覧（管理者用・AdminDashboardPage の ?status=PENDING 対応）*/
    @Transactional(readOnly = true)
    public List<ProviderResponse> getProvidersByStatus(String statusStr) {
        try {
            ProviderStatus status = ProviderStatus.valueOf(statusStr.toUpperCase());
            return providerRepository.findByStatus(status)
                .stream().map(ProviderResponse::from).toList();
        } catch (IllegalArgumentException e) {
            return List.of();   // 不正ステータスは空リストを返す
        }
    }

    /** 承認（PENDING → APPROVED）*/
    @Transactional
    public ProviderResponse approve(Long providerId) {
        auditLogRepository.save(AuditLog.builder()
            .adminId(getCurrentAdminId())
            .action("PROVIDER_APPROVE")
            .targetId(providerId)
            .targetType("Provider")
            .build());
        Provider provider = findOrThrow(providerId);
        provider.approve();
        providerRepository.save(provider);
        emailService.sendProviderApproved(provider);
        log.info("Provider approved: providerId={}", providerId);
        return ProviderResponse.from(provider);
    }

    /**
     * 却下（PENDING → REJECTED）
     * 却下理由は申請者へメール通知される。再申請は1ヶ月後。
     * → 02_business_rules.md §5.1.3
     */
    @Transactional
    public ProviderResponse reject(Long providerId, String reason) {
        auditLogRepository.save(AuditLog.builder()
            .adminId(getCurrentAdminId())
            .action("PROVIDER_REJECT")
            .targetId(providerId)
            .targetType("Provider")
            .build());
        if (reason == null || reason.isBlank()) {
            throw new BusinessException("却下理由を入力してください");
        }
        Provider provider = findOrThrow(providerId);
        provider.reject(reason);
        providerRepository.save(provider);
        emailService.sendProviderRejected(provider, reason);
        log.info("Provider rejected: providerId={}, reason={}", providerId, reason);
        return ProviderResponse.from(provider);
    }

    /**
     * 保留（PENDING → ON_HOLD）
     * 不足書類・不備内容を onHoldReason に記載。再申請は即時可。
     * → 02_business_rules.md §5.1.3
     */
    @Transactional
    public ProviderResponse putOnHold(Long providerId, String reason) {
        auditLogRepository.save(AuditLog.builder()
            .adminId(getCurrentAdminId())
            .action("PROVIDER_HOLD")
            .targetId(providerId)
            .targetType("Provider")
            .build());
        if (reason == null || reason.isBlank()) {
            throw new BusinessException("保留理由（不足内容）を入力してください");
        }
        Provider provider = findOrThrow(providerId);
        provider.putOnHold(reason);
        providerRepository.save(provider);
        emailService.sendProviderOnHold(provider, reason);
        log.info("Provider on hold: providerId={}, reason={}", providerId, reason);
        return ProviderResponse.from(provider);
    }

    /** 停止（APPROVED → SUSPENDED）*/
    @Transactional
    public ProviderResponse suspend(Long providerId) {
        auditLogRepository.save(AuditLog.builder()
            .adminId(getCurrentAdminId())
            .action("PROVIDER_SUSPEND")
            .targetId(providerId)
            .targetType("Provider")
            .build());
        Provider provider = findOrThrow(providerId);
        provider.suspend();
        providerRepository.save(provider);
        log.info("Provider suspended: providerId={}", providerId);
        return ProviderResponse.from(provider);
    }

    /** 停止解除（SUSPENDED → APPROVED）*/
    @Transactional
    public ProviderResponse unsuspend(Long providerId) {
        auditLogRepository.save(AuditLog.builder()
            .adminId(getCurrentAdminId())
            .action("PROVIDER_UNSUSPEND")
            .targetId(providerId)
            .targetType("Provider")
            .build());
        Provider provider = findOrThrow(providerId);
        provider.unsuspend();
        providerRepository.save(provider);
        log.info("Provider unsuspended: providerId={}", providerId);
        return ProviderResponse.from(provider);
    }

    private Provider findOrThrow(Long providerId) {
        return providerRepository.findById(providerId)
            .orElseThrow(() -> new ResourceNotFoundException("プロバイダーが見つかりません"));
    }

    /** 現在の認証済み管理者 ID を取得（監査ログ用） */
    private Long getCurrentAdminId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof MemberDetails md) {
            return md.getId();
        }
        return null;
    }
    /**
     * プロバイダー情報更新（APPROVED のみ・本人 or ADMIN）
     * PATCH /api/v1/providers/{id}
     * → 03_common_specification.md §5
     */
    @Transactional
    public ProviderResponse updateProfile(Long id, MemberDetails memberDetails, ProviderRequest req) {
        Provider provider = providerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("プロバイダー情報が見つかりません"));

        // 権限チェック: 本人 or ADMIN
        boolean isAdmin = memberDetails.getMember().getRole() == MemberRole.ADMIN;
        if (!isAdmin) {
            if (!provider.getMember().getId().equals(memberDetails.getId())) {
                throw new BusinessException("他のプロバイダー情報は更新できません");
            }
            if (provider.getStatus() != ProviderStatus.APPROVED) {
                throw new BusinessException("承認済みプロバイダーのみ情報を更新できます");
            }
        }

        provider.updateProfile(
            req.getHighSchool(),
            req.getUniversity(),
            req.getAppealPoint(),
            null,   // bio は申請フォームに含まれないため変更しない
            req.getQualifications() != null ? req.getQualifications() : List.of(),
            req.getAchievements()   != null ? req.getAchievements()   : List.of()
        );
        return ProviderResponse.from(providerRepository.save(provider));
    }


}