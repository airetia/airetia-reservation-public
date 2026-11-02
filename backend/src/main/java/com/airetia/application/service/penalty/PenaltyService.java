// backend/src/main/java/com/airetia/application/service/penalty/PenaltyService.java
package com.airetia.application.service.penalty;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.airetia.application.dto.response.penalty.PenaltyResponse;
import com.airetia.domain.model.audit.AuditLog;
import com.airetia.domain.model.penalty.Penalty;
import com.airetia.exception.ResourceNotFoundException;
import com.airetia.exception.BusinessException;
import com.airetia.repository.PenaltyRepository;
import com.airetia.repository.AuditLogRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import com.airetia.infrastructure.security.MemberDetails;

/**
 * ペナルティサービス
 * → 02_business_rules.md §4（ペナルティルール）
 *
 * 自動付与: ReportService（NO_SHOW報告時）
 * 自動解除: BatchConfig.PenaltyExpiryBatch（毎日 1:00 JST）
 * 手動解除: AdminPenaltyController（管理者・解除理由必須・監査ログ）
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PenaltyService {

    private final PenaltyRepository penaltyRepository;
    private final AuditLogRepository auditLogRepository;

    /**
     * ペナルティ一覧取得（管理者）
     * GET /api/v1/admin/penalties?participantId=...&memberId=...
     * memberId 指定時: そのメンバー配下の全参加者のペナルティを返す
     */
    @Transactional(readOnly = true)
    public List<PenaltyResponse> getAll(Long participantId, Long memberId) {
        List<Penalty> penalties;
        if (participantId != null) {
            penalties = penaltyRepository.findByParticipantIdOrderByCreatedAtDesc(participantId);
        } else if (memberId != null) {
            penalties = penaltyRepository.findByParticipantMemberIdOrderByCreatedAtDesc(memberId);
        } else {
            penalties = penaltyRepository.findAllOrderByCreatedAtDesc();
        }
        return penalties.stream().map(PenaltyResponse::from).toList();
    }

    /**
     * ペナルティ手動解除（管理者）
     * DELETE /api/v1/admin/penalties/{id}
     * → 02_business_rules.md §4.4（解除理由記録必須）
     */
    @Transactional
    public void revoke(Long id, String reason) {
        if (reason == null || reason.isBlank()) {
            throw new com.airetia.exception.BusinessException("解除理由は必須です");
        }
        Penalty penalty = penaltyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("ペナルティが見つかりません: id=" + id));
        if (!penalty.isActive()) {
            throw new com.airetia.exception.BusinessException("既に解除済みのペナルティです");
        }
        auditLogRepository.save(AuditLog.builder()
            .adminId(getCurrentAdminId())
            .action("PENALTY_REVOKE")
            .targetId(id)
            .targetType("Penalty")
            .note(reason)
            .build());
        penalty.deactivate();
        penaltyRepository.save(penalty);
        log.info("Penalty manually revoked: id={}, reason={}", id, reason);
    }
    private Long getCurrentAdminId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof MemberDetails md) return md.getId();
        return null;
    }
}
