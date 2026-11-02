// backend/src/main/java/com/airetia/presentation/controller/admin/AdminMemberController.java
package com.airetia.presentation.controller.admin;

import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.airetia.application.dto.request.auth.RegisterRequest;
import com.airetia.application.dto.response.common.ApiResponse;
import com.airetia.application.dto.response.member.MemberResponse;
import com.airetia.application.service.AuditLogService;
import com.airetia.application.service.member.MemberService;
import com.airetia.infrastructure.security.MemberDetails;

import lombok.RequiredArgsConstructor;

/**
 * 管理者専用メンバー操作 API
 * → 03_common_specification.md §5 管理者専用
 * → 02_business_rules.md §7.1 管理者権限
 *
 * POST   /api/v1/admin/members/accounts   - 管理者アカウント作成
 * GET    /api/v1/admin/members            - 全メンバー一覧
 * PATCH  /api/v1/admin/members/{id}/suspend   - 利用停止
 * PATCH  /api/v1/admin/members/{id}/unsuspend - 停止解除
 * DELETE /api/v1/admin/members/{id}       - アカウント削除
 *
 * 全操作を監査ログに記録。
 */
@RestController
@RequestMapping("/api/v1/admin/members")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminMemberController {

    private final MemberService    memberService;
    private final AuditLogService  auditLogService;

    /**
     * 管理者アカウント作成
     * POST /api/v1/admin/members/accounts
     * → 既存管理者のみ実行可（SecurityConfig の hasRole("ADMIN") で担保）
     */
    @PostMapping("/accounts")
    public ResponseEntity<ApiResponse<MemberResponse>> createAdmin(
            @Valid @RequestBody RegisterRequest req,
            @AuthenticationPrincipal MemberDetails admin) {

        MemberResponse created = memberService.createAdminAccount(req);
        auditLogService.record(admin.getId(), "ADMIN_CREATE", "Member", created.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("管理者アカウントを作成しました", created));
    }

    /**
     * 全メンバー一覧
     * GET /api/v1/admin/members
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<MemberResponse>>> getAll() {
        return ResponseEntity.ok(
            ApiResponse.success("メンバー一覧を取得しました", memberService.getAllMembers()));
    }

    /**
     * 利用停止
     * PATCH /api/v1/admin/members/{id}/suspend
     * body: { "days": N }（省略時はデフォルト 7 日）
     * → 02_business_rules.md §4.3
     */
    @PatchMapping("/{id}/suspend")
    public ResponseEntity<ApiResponse<Void>> suspend(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body,
            @AuthenticationPrincipal MemberDetails admin) {

        int days = 7;
        if (body != null && body.get("days") instanceof Number n) {
            days = n.intValue();
        }
        memberService.suspendMember(id, days);
        auditLogService.record(admin.getId(), "MEMBER_SUSPEND", "Member", id,
            String.format("停止日数: %d日", days));
        return ResponseEntity.ok(ApiResponse.success(
            String.format("%d日間停止しました", days), null));
    }

    /**
     * 停止解除
     * PATCH /api/v1/admin/members/{id}/unsuspend
     */
    @PatchMapping("/{id}/unsuspend")
    public ResponseEntity<ApiResponse<Void>> unsuspend(
            @PathVariable Long id,
            @AuthenticationPrincipal MemberDetails admin) {

        memberService.unsuspendMember(id);
        auditLogService.record(admin.getId(), "MEMBER_UNSUSPEND", "Member", id);
        return ResponseEntity.ok(ApiResponse.success("停止を解除しました", null));
    }

    /**
     * アカウント削除（論理削除）
     * DELETE /api/v1/admin/members/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal MemberDetails admin) {

        memberService.deleteMember(id);
        auditLogService.record(admin.getId(), "MEMBER_DELETE", "Member", id);
        return ResponseEntity.ok(ApiResponse.success("アカウントを削除しました", null));
    }
}