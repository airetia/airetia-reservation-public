// backend/src/main/java/com/airetia/application/service/auth/AuthService.java
package com.airetia.application.service.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.airetia.application.dto.request.auth.RegisterRequest;
import com.airetia.application.dto.response.member.MemberResponse;
import com.airetia.application.service.member.MemberService;
import com.airetia.domain.model.member.Member;
import com.airetia.domain.model.member.MemberRole;
import com.airetia.domain.model.member.NotificationSettings;
import com.airetia.domain.model.participant.ParticipantType;
import com.airetia.domain.model.provider.ProviderStatus;
import com.airetia.repository.MemberRepository;
import com.airetia.repository.NotificationSettingsRepository;
import com.airetia.repository.ParticipantRepository;
import com.airetia.repository.ProviderRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 認証サービス
 * → 03_common_specification.md §5 認証
 *
 * 修正: Member.builder() 内の .isisActive(true) → @Builder.Default で自動設定のため不要
 *   Member.java の isActive フィールドは @Builder.Default で true が設定されているため
 *   builder で明示的に指定しなくても true になる。
 *   （明示する場合は .isActive(true)。isisActive というフィールド/メソッドは存在しない）
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final ProviderRepository    providerRepository;
    private final ParticipantRepository participantRepository;
    private final MemberRepository              memberRepository;
    private final NotificationSettingsRepository notificationSettingsRepository;
    private final MemberService                 memberService;
    private final PasswordEncoder               passwordEncoder;

    /**
     * 会員登録（MEMBER ロールのみ）
     * プロフィール（電話・住所等）は登録後にプロフィール編集から更新。
     * → 03_common_specification.md §5 POST /api/v1/auth/register
     */
    @Transactional
    public MemberResponse register(RegisterRequest request) {
        if (memberRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("このメールアドレスは既に登録されています");
        }

        Member member = Member.builder()
            .email(request.getEmail())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .firstNameKana(request.getFirstNameKana())
            .lastNameKana(request.getLastNameKana())
            .role(MemberRole.MEMBER)
            // isActive / isLocked は @Builder.Default（true / false）のため省略
            .build();

        member = memberRepository.save(member);

        // 通知設定をデフォルト（全 ON）で生成（§9）
        notificationSettingsRepository.save(
            NotificationSettings.defaultFor(member.getId())
        );

        log.info("会員登録完了: memberId={}, email={}", member.getId(), member.getEmail());

        return memberService.getMemberById(member.getId());
    }

    public record MemberCapabilities(boolean hasProvider, boolean hasParent) {}

    public MemberCapabilities getCapabilities(Long memberId) {
        boolean hasProvider = providerRepository.existsByMemberIdAndStatus(memberId, ProviderStatus.APPROVED);
        boolean hasParent   = participantRepository.existsByMemberIdAndParticipantType(memberId, ParticipantType.CHILD);
        return new MemberCapabilities(hasProvider, hasParent);
    }
}