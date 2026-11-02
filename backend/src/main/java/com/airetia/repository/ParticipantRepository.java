// backend/src/main/java/com/airetia/repository/ParticipantRepository.java
package com.airetia.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.airetia.domain.model.participant.Participant;
import com.airetia.domain.model.participant.ParticipantType;

/**
 * パーティシパントリポジトリ
 * → ParticipantService / BookingService / AuthController で使用
 * → V8__create_participants.sql
 */
public interface ParticipantRepository extends JpaRepository<Participant, Long> {

    /** メンバーの有効な利用者一覧（論理削除除く） */
    List<Participant> findByMember_IdAndIsActiveTrue(Long memberId);

    /**
     * 同一メンバーの指定タイプ存在チェック
     * SELF タイプ重複防止・AuthController の hasParent 判定に使用
     */
    boolean existsByMemberIdAndParticipantType(Long memberId, ParticipantType participantType);

    /**
     * 有効な CHILD 数カウント（最大 5 名制限）
     * → ParticipantService.create() での CHILD 上限チェック
     * → Participant.isActive フィールドと一致（@Column name = "is_active"）
     */
    long countByMember_IdAndParticipantTypeAndIsActiveTrue(Long memberId, ParticipantType participantType);
}
