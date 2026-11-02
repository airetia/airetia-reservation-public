// backend/src/main/java/com/airetia/application/service/participant/ParticipantService.java
package com.airetia.application.service.participant;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.airetia.application.dto.request.participant.ParticipantRequest;
import com.airetia.application.dto.response.participant.ParticipantResponse;
import com.airetia.domain.model.booking.BookingStatus;
import com.airetia.domain.model.member.MemberRole;
import com.airetia.domain.model.participant.Participant;
import com.airetia.domain.model.participant.ParticipantType;
import com.airetia.exception.BusinessException;
import com.airetia.exception.ResourceNotFoundException;
import com.airetia.infrastructure.security.MemberDetails;
import com.airetia.repository.BookingRepository;
import com.airetia.repository.MemberRepository;
import com.airetia.repository.ParticipantRepository;

import lombok.RequiredArgsConstructor;

/**
 * 利用者（Participant）管理サービス
 * ビジネスルール → 02_business_rules.md §7.2 / 01_glossary.md §2 Participant
 *
 * 修正:
 *   - Participant.builder() / update() の呼び出しに firstNameKana / lastNameKana / notes を追加
 *   - ParticipantRepository のメソッド名を Spring Data 命名規則に合わせて修正
 *     countByMember_IdAndParticipantTypeAndIsActiveTrue（isisActive → IsActive）
 */
@Service
@RequiredArgsConstructor
public class ParticipantService {

    private static final int MAX_CHILDREN = 5;

    private final ParticipantRepository participantRepository;
    private final MemberRepository      memberRepository;
    private final BookingRepository     bookingRepository;

    /** 自分の利用者一覧（有効のみ） */
    @Transactional(readOnly = true)
    public List<ParticipantResponse> getMyParticipants(MemberDetails memberDetails) {
        return participantRepository.findByMember_IdAndIsActiveTrue(memberDetails.getId())
            .stream().map(ParticipantResponse::from).toList();
    }

    /** 利用者詳細 */
    @Transactional(readOnly = true)
    public ParticipantResponse getParticipant(Long id, MemberDetails memberDetails) {
        var p = findById(id);
        checkOwner(p, memberDetails);
        return ParticipantResponse.from(p);
    }

    /**
     * 利用者登録
     * 管理者は作成不可（→ 02_business_rules.md §7.1）
     * CHILD は最大 5 名（→ 01_glossary.md §2 Participant）
     */
    @Transactional
    public ParticipantResponse create(MemberDetails memberDetails, ParticipantRequest req) {
        if (memberDetails.getMember().getRole() == MemberRole.ADMIN) {
            throw new BusinessException("管理者アカウントはこの機能を使用できません");
        }

        var member = memberRepository.findById(memberDetails.getId())
            .orElseThrow(() -> new ResourceNotFoundException("メンバーが見つかりません"));

        if (req.getParticipantType() == ParticipantType.CHILD) {
            long childCount = participantRepository
                .countByMember_IdAndParticipantTypeAndIsActiveTrue(memberDetails.getId(), ParticipantType.CHILD);
            if (childCount >= MAX_CHILDREN) {
                throw new BusinessException("お子様は最大" + MAX_CHILDREN + "名まで登録できます");
            }
        } else if (req.getParticipantType() == ParticipantType.SELF) {
            // SELF（本人）はメンバー1名につき1件のみ登録可能
            if (participantRepository.existsByMemberIdAndParticipantType(
                    memberDetails.getId(), ParticipantType.SELF)) {
                throw new BusinessException("本人プロフィールは既に登録されています");
            }
        }

        Participant p = Participant.builder()
            .member(member)
            .participantType(req.getParticipantType())
            .firstName(req.getFirstName())
            .lastName(req.getLastName())
            .firstNameKana(req.getFirstNameKana())    // 追加
            .lastNameKana(req.getLastNameKana())      // 追加
            .gender(req.getGender())
            .birthDate(req.getBirthDate())
            .notes(req.getNotes())                    // 追加
            .build();

        return ParticipantResponse.from(participantRepository.save(p));
    }

    /** 利用者更新 */
    @Transactional
    public ParticipantResponse update(Long id, MemberDetails memberDetails, ParticipantRequest req) {
        var p = findById(id);
        checkOwner(p, memberDetails);
        p.update(
            req.getFirstName(),
            req.getLastName(),
            req.getFirstNameKana(),   // 追加
            req.getLastNameKana(),    // 追加
            req.getGender(),
            req.getBirthDate(),
            req.getNotes()            // 追加
        );
        return ParticipantResponse.from(participantRepository.save(p));
    }

    /**
     * 利用者削除（論理削除）
     * 確定予約がある場合は削除不可（→ 03_common_specification.md §6 BUSINESS_PARTICIPANT_HAS_BOOKING）
     */
    @Transactional
    public void delete(Long id, MemberDetails memberDetails) {
        var p = findById(id);
        checkOwner(p, memberDetails);

        long confirmed = bookingRepository.countByParticipantIdAndStatus(id, BookingStatus.CONFIRMED);
        if (confirmed > 0) {
            throw new BusinessException("確定中の予約があるため削除できません");
        }
        p.deactivate();
        participantRepository.save(p);
    }

    // ── 内部ユーティリティ ────────────────────────────────────────────────────

    private Participant findById(Long id) {
        return participantRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("利用者が見つかりません"));
    }

    /** 所有者チェック（ADMIN はスキップ） */
    private void checkOwner(Participant p, MemberDetails md) {
        if (md.getMember().getRole() == MemberRole.ADMIN) return;
        if (!p.getMember().getId().equals(md.getId())) {
            throw new BusinessException("この利用者へのアクセス権がありません");
        }
    }
}
