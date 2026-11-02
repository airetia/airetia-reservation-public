// backend/src/main/java/com/airetia/presentation/controller/admin/AdminPenaltyController.java
package com.airetia.presentation.controller.admin;

import java.util.List;

import com.airetia.application.dto.response.penalty.PenaltyResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.airetia.application.dto.response.common.ApiResponse;
import com.airetia.application.service.penalty.PenaltyService;

import lombok.RequiredArgsConstructor;

/**
 * ペナルティ管理コントローラー（管理者専用）
 * → 03_common_specification.md §5 管理者専用
 * → 02_business_rules.md §4.4（手動解除・解除理由記録必須・監査ログ）
 *
 * GET    /api/v1/admin/penalties        - ペナルティ一覧
 * DELETE /api/v1/admin/penalties/{id}   - ペナルティ手動解除
 */
@RestController
@RequestMapping("/api/v1/admin/penalties")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminPenaltyController {

    private final PenaltyService   penaltyService;

    /**
     * ペナルティ一覧取得
     * GET /api/v1/admin/penalties?participantId=...&memberId=...
     * memberId: そのメンバー配下の全参加者ペナルティを返す（管理画面 AdminMembersPage 用）
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PenaltyResponse>>> getAll(
            @RequestParam(required = false) Long participantId,
            @RequestParam(required = false) Long memberId) {
        return ResponseEntity.ok(
            ApiResponse.success("取得しました", penaltyService.getAll(participantId, memberId))
        );
    }

    /**
     * ペナルティ手動解除
     * DELETE /api/v1/admin/penalties/{id}
     * → 02_business_rules.md §4.4（解除理由記録必須・監査ログに記録）
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> revoke(
            @PathVariable Long id,
            @RequestParam String reason) {
        penaltyService.revoke(id, reason);  // 監査ログは Service 内で記録
        return ResponseEntity.ok(ApiResponse.success("ペナルティを解除しました", null));
    }
}
