// backend/src/main/java/com/airetia/presentation/controller/member/MemberController.java
package com.airetia.presentation.controller.member;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.airetia.application.dto.request.member.UpdateMemberRequest;
import com.airetia.application.dto.request.member.UpdateNotificationSettingsRequest;
import com.airetia.application.dto.response.common.ApiResponse;
import com.airetia.application.service.member.MemberService;
import com.airetia.infrastructure.security.MemberDetails;

import lombok.RequiredArgsConstructor;

/**
 * メンバーコントローラー
 * → 03_common_specification.md §5 メンバー / 通知設定
 *
 * GET   /api/v1/members/{id}              - 詳細取得（本人 or ADMIN）
 * PATCH /api/v1/members/{id}              - 情報更新（本人 or ADMIN）
 * GET   /api/v1/members/{id}/notifications - 通知設定取得（本人のみ）
 * PATCH /api/v1/members/{id}/notifications - 通知設定更新（本人のみ）
 *
 * 認可: @PreAuthorize 宣言的チェック。
 * 例外処理: GlobalExceptionHandler 委譲。
 */
@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    /** メンバー詳細取得 */
    @GetMapping("/{id}")
    @PreAuthorize("#id == principal.id or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> getMember(@PathVariable Long id) {
        return ResponseEntity.ok(
            ApiResponse.success("メンバー情報を取得しました", memberService.getMemberById(id))
        );
    }

    /** メンバー情報更新 */
    @PatchMapping("/{id}")
    @PreAuthorize("#id == principal.id or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> updateMember(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMemberRequest request) {
        return ResponseEntity.ok(
            ApiResponse.success("プロフィールを更新しました", memberService.updateMember(id, request))
        );
    }

    /** 通知設定取得 */
    @GetMapping("/{id}/notifications")
    @PreAuthorize("#id == principal.id")
    public ResponseEntity<ApiResponse<Object>> getNotifications(@PathVariable Long id) {
        return ResponseEntity.ok(
            ApiResponse.success("取得しました", memberService.getNotificationSettings(id))
        );
    }

    /** 通知設定更新（部分更新） */
    @PatchMapping("/{id}/notifications")
    @PreAuthorize("#id == principal.id")
    public ResponseEntity<ApiResponse<Object>> updateNotifications(
            @PathVariable Long id,
            @RequestBody UpdateNotificationSettingsRequest req) {
        return ResponseEntity.ok(
            ApiResponse.success("通知設定を更新しました", memberService.updateNotificationSettings(id, req))
        );
    }
}
