// backend/src/main/java/com/airetia/application/service/member/MemberService.java
package com.airetia.application.service.member;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.airetia.application.dto.request.auth.RegisterRequest;
import com.airetia.application.dto.request.member.UpdateMemberRequest;
import com.airetia.application.dto.request.member.UpdateNotificationSettingsRequest;
import com.airetia.application.dto.response.member.MemberResponse;
import com.airetia.application.dto.response.member.NotificationSettingsResponse;
import com.airetia.domain.model.member.Member;
import com.airetia.domain.model.member.MemberRole;
import com.airetia.domain.model.member.NotificationSettings;
import com.airetia.exception.BusinessException;
import com.airetia.exception.ResourceNotFoundException;
import com.airetia.repository.MemberRepository;
import com.airetia.repository.NotificationSettingsRepository;
import com.airetia.repository.ParticipantRepository;
import com.airetia.repository.ProviderRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * メンバー管理サービス
 * 02_business_rules.md §7.2 / §4.3 / §4.4
 * 03_common_specification.md §5 メンバー・通知設定・管理者専用
 *
 * 追加メソッド:
 *   - getNotificationSettings()       GET  /api/v1/members/{id}/notifications
 *   - updateNotificationSettings()    PATCH /api/v1/members/{id}/notifications
 *   - createAdminAccount()            POST /api/v1/admin/accounts
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository               memberRepository;
    private final ProviderRepository             providerRepository;
    private final ParticipantRepository          participantRepository;
    private final NotificationSettingsRepository notificationSettingsRepository;
    private final PasswordEncoder                passwordEncoder;

    // ── メンバー取得・更新 ───────────────────────────────────────────────

    /** メンバー詳細取得 */
    @Transactional(readOnly = true)
    public MemberResponse getMemberById(Long memberId) {
        var member = memberRepository.findById(memberId)
            .orElseThrow(() -> new ResourceNotFoundException("メンバーが見つかりません"));

        boolean hasProvider = providerRepository.existsByMemberIdAndStatus(
            memberId, com.airetia.domain.model.provider.ProviderStatus.APPROVED);
        boolean hasParent = participantRepository.existsByMemberIdAndParticipantType(
            memberId, com.airetia.domain.model.participant.ParticipantType.CHILD);

        return MemberResponse.builder()
            .id(member.getId())
            .email(member.getEmail())
            .firstName(member.getFirstName())
            .lastName(member.getLastName())
            .firstNameKana(member.getFirstNameKana())
            .lastNameKana(member.getLastNameKana())
            .phoneNumber(member.getPhoneNumber())
            .postalCode(member.getPostalCode())
            .address(member.getAddress())
            .gender(member.getGender())
            .birthDate(member.getBirthDate())
            .role(member.getRole())
            .isActive(member.getIsActive())
            .isLocked(member.getIsLocked())
            .suspendedUntil(member.getSuspendedUntil())
            .capabilities(MemberResponse.Capabilities.builder()
                .hasProvider(hasProvider)
                .hasParent(hasParent)
                .build())
            .createdAt(member.getCreatedAt())
            .build();
    }

    /** メンバー情報更新 */
    @Transactional
    public MemberResponse updateMember(Long memberId, UpdateMemberRequest request) {
        var member = memberRepository.findById(memberId)
            .orElseThrow(() -> new ResourceNotFoundException("メンバーが見つかりません"));

        member.updateProfile(
            request.getFirstName(),
            request.getLastName(),
            request.getFirstNameKana(),
            request.getLastNameKana(),
            request.getPhoneNumber(),
            request.getPostalCode(),
            request.getAddress()
        );
        if (request.getGender() != null) {
            member.updateGender(request.getGender());
        }
        memberRepository.save(member);
        return getMemberById(memberId);
    }

    // ── 通知設定 ──────────────────────────────────────────────────────────

    /**
     * 通知設定取得
     * GET /api/v1/members/{id}/notifications
     * 02_business_rules.md §9（デフォルト全 ON）
     */
    @Transactional(readOnly = true)
    public NotificationSettingsResponse getNotificationSettings(Long memberId) {
        memberRepository.findById(memberId)
            .orElseThrow(() -> new ResourceNotFoundException("メンバーが見つかりません"));

        NotificationSettings settings = notificationSettingsRepository
            .findByMemberId(memberId)
            .orElseGet(() -> NotificationSettings.defaultFor(memberId));

        return NotificationSettingsResponse.from(settings);
    }

    /**
     * 通知設定更新（部分更新）
     * PATCH /api/v1/members/{id}/notifications
     * null フィールドは変更しない
     */
    @Transactional
    public NotificationSettingsResponse updateNotificationSettings(
            Long memberId, UpdateNotificationSettingsRequest req) {

        memberRepository.findById(memberId)
            .orElseThrow(() -> new ResourceNotFoundException("メンバーが見つかりません"));

        NotificationSettings settings = notificationSettingsRepository
            .findByMemberId(memberId)
            .orElseGet(() -> NotificationSettings.defaultFor(memberId));

        settings.update(req);
        notificationSettingsRepository.save(settings);
        return NotificationSettingsResponse.from(settings);
    }

    // ── 管理者専用操作 ────────────────────────────────────────────────────

    /** 全メンバー一覧（管理者用） */
    @Transactional(readOnly = true)
    public List<MemberResponse> getAllMembers() {
        return memberRepository.findAll().stream()
            .map(m -> MemberResponse.builder()
                .id(m.getId())
                .email(m.getEmail())
                .firstName(m.getFirstName())
                .lastName(m.getLastName())
                .role(m.getRole())
                .isActive(m.getIsActive())
                .isLocked(m.getIsLocked())
                .suspendedUntil(m.getSuspendedUntil())
                .createdAt(m.getCreatedAt())
                .build())
            .toList();
    }

    /**
     * 管理者アカウント作成
     * POST /api/v1/admin/accounts（既存管理者のみ実行可）
     * 03_common_specification.md §5 管理者専用
     * 02_business_rules.md §7.4（自己登録不可・既存管理者のみ）
     *
     * パスワード要件: 12文字以上・大小英数字記号必須（§7 管理者パスワード要件）
     * バリデーションは RegisterRequest の @Pattern で担保する。
     */
    @Transactional
    public MemberResponse createAdminAccount(RegisterRequest req) {
        if (memberRepository.existsByEmail(req.getEmail())) {
            throw new BusinessException("このメールアドレスは既に使用されています");
        }

        Member admin = Member.builder()
            .email(req.getEmail())
            .passwordHash(passwordEncoder.encode(req.getPassword()))
            .role(MemberRole.ADMIN)
            .firstName(req.getFirstName())
            .lastName(req.getLastName())
            .build();

        admin = memberRepository.save(admin);
        log.info("Admin account created: memberId={}, email={}", admin.getId(), admin.getEmail());

        return MemberResponse.builder()
            .id(admin.getId())
            .email(admin.getEmail())
            .firstName(admin.getFirstName())
            .lastName(admin.getLastName())
            .role(admin.getRole())
            .isActive(admin.getIsActive())
            .isLocked(admin.getIsLocked())
            .createdAt(admin.getCreatedAt())
            .build();
    }

    /** 利用停止 */
    @Transactional
    public void suspendMember(Long memberId, int days) {
        var member = memberRepository.findById(memberId)
            .orElseThrow(() -> new ResourceNotFoundException("メンバーが見つかりません"));
        if (member.getRole() == MemberRole.ADMIN) {
            throw new BusinessException("管理者アカウントは停止できません");
        }
        int d = (days > 0) ? days : 7;
        member.suspend(Instant.now().plus(d, ChronoUnit.DAYS));
        memberRepository.save(member);
        log.info("Member suspended: memberId={}, days={}", memberId, d);
    }

    /** 利用停止解除 */
    @Transactional
    public void unsuspendMember(Long memberId) {
        var member = memberRepository.findById(memberId)
            .orElseThrow(() -> new ResourceNotFoundException("メンバーが見つかりません"));
        member.unsuspend();
        memberRepository.save(member);
        log.info("Member unsuspended: memberId={}", memberId);
    }

    /** アカウント削除（論理削除） */
    @Transactional
    public void deleteMember(Long memberId) {
        var member = memberRepository.findById(memberId)
            .orElseThrow(() -> new ResourceNotFoundException("メンバーが見つかりません"));
        if (member.getRole() == MemberRole.ADMIN) {
            throw new BusinessException("管理者アカウントは削除できません");
        }
        member.deactivate();
        memberRepository.save(member);
        log.info("Member deactivated: memberId={}", memberId);
    }
}