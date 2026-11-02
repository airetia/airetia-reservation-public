// backend/src/main/java/com/airetia/presentation/controller/participant/ParticipantController.java
package com.airetia.presentation.controller.participant;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.airetia.application.dto.request.participant.ParticipantRequest;
import com.airetia.application.dto.response.common.ApiResponse;
import com.airetia.application.service.participant.ParticipantService;
import com.airetia.infrastructure.security.MemberDetails;

import lombok.RequiredArgsConstructor;

/**
 * パーティシパント（利用者）コントローラー
 * → 03_common_specification.md §5 パーティシパント
 *
 * GET    /api/v1/participants      - 自分の利用者一覧
 * GET    /api/v1/participants/{id} - 詳細
 * POST   /api/v1/participants      - 登録
 * PATCH  /api/v1/participants/{id} - 更新
 * DELETE /api/v1/participants/{id} - 削除（予約なしのみ）
 *
 * 例外処理は GlobalExceptionHandler に委譲（手動 try/catch 廃止）。
 */
@RestController
@RequestMapping("/api/v1/participants")
@RequiredArgsConstructor
public class ParticipantController {

    private final ParticipantService participantService;

    /** 自分の利用者一覧 */
    @GetMapping
    public ResponseEntity<ApiResponse<Object>> list(
            @AuthenticationPrincipal MemberDetails memberDetails) {
        return ResponseEntity.ok(
            ApiResponse.success("取得しました", participantService.getMyParticipants(memberDetails))
        );
    }

    /** 利用者詳細 */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> get(
            @PathVariable Long id,
            @AuthenticationPrincipal MemberDetails memberDetails) {
        return ResponseEntity.ok(
            ApiResponse.success("取得しました", participantService.getParticipant(id, memberDetails))
        );
    }

    /** 利用者登録 */
    @PostMapping
    public ResponseEntity<ApiResponse<Object>> create(
            @Valid @RequestBody ParticipantRequest req,
            @AuthenticationPrincipal MemberDetails memberDetails) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse.success("利用者を登録しました", participantService.create(memberDetails, req))
        );
    }

    /** 利用者更新 */
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> update(
            @PathVariable Long id,
            @Valid @RequestBody ParticipantRequest req,
            @AuthenticationPrincipal MemberDetails memberDetails) {
        return ResponseEntity.ok(
            ApiResponse.success("更新しました", participantService.update(id, memberDetails, req))
        );
    }

    /** 利用者削除（予約があるParticipantは削除不可） */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal MemberDetails memberDetails) {
        participantService.delete(id, memberDetails);
        return ResponseEntity.ok(ApiResponse.success("削除しました", null));
    }
}
