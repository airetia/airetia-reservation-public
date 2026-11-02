// backend/src/main/java/com/airetia/presentation/controller/provider/AdminProviderController.java
package com.airetia.presentation.controller.provider;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.airetia.application.dto.response.common.ApiResponse;
import com.airetia.application.dto.response.provider.ProviderResponse;
import com.airetia.application.service.provider.ProviderService;
import com.airetia.infrastructure.security.MemberDetails;
import com.airetia.application.service.AuditLogService;

import lombok.RequiredArgsConstructor;

/**
 * 管理者専用プロバイダー操作 API（/api/v1/providers 配下）
 * GET    /api/v1/providers                 → 全プロバイダー一覧（管理者）
 * PATCH  /api/v1/providers/{id}/approve   → 承認
 * PATCH  /api/v1/providers/{id}/reject    → 却下
 * PATCH  /api/v1/providers/{id}/hold      → 保留
 * PATCH  /api/v1/providers/{id}/suspend   → 停止
 * PATCH  /api/v1/providers/{id}/unsuspend → 停止解除
 *
 * 全操作を監査ログに記録する。
 * → 02_business_rules.md §7.1「代理操作は全て監査ログに記録される」
 */
@RestController
@RequestMapping("/api/v1/providers")
@RequiredArgsConstructor
public class AdminProviderController {

    private final ProviderService    providerService;
    private final AuditLogService auditLogService;

    /** 全プロバイダー一覧（管理者用） */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ProviderResponse>>> getAllProviders(
            @RequestParam(required = false) String status) {

        List<ProviderResponse> providers = (status != null && !status.isBlank())
            ? providerService.getProvidersByStatus(status)
            : providerService.getAllProviders();
        return ResponseEntity.ok(
            ApiResponse.success("プロバイダー一覧を取得しました", providers));
    }

    /** 承認（PENDING → APPROVED） */
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProviderResponse>> approve(
            @PathVariable Long id,
            @AuthenticationPrincipal MemberDetails admin) {
        ProviderResponse res = providerService.approve(id);
        auditLogService.record(admin.getId(), "PROVIDER_APPROVE", "Provider", id);
        return ResponseEntity.ok(ApiResponse.success("承認しました", res));
    }

    /** 却下（PENDING → REJECTED） */
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProviderResponse>> reject(
            @PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, String> body,
            @AuthenticationPrincipal MemberDetails admin) {
        String reason = body != null ? body.get("reason") : null;
        ProviderResponse res = providerService.reject(id, reason);
        auditLogService.record(admin.getId(), "PROVIDER_REJECT", "Provider", id, reason);
        return ResponseEntity.ok(ApiResponse.success("却下しました", res));
    }

    /** 保留（PENDING → ON_HOLD） */
    @PatchMapping("/{id}/hold")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProviderResponse>> hold(
            @PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, String> body,
            @AuthenticationPrincipal MemberDetails admin) {
        String reason = body != null ? body.get("reason") : null;
        ProviderResponse res = providerService.putOnHold(id, reason);
        auditLogService.record(admin.getId(), "PROVIDER_HOLD", "Provider", id, reason);
        return ResponseEntity.ok(ApiResponse.success("保留にしました", res));
    }

    /** 停止（APPROVED → SUSPENDED） */
    @PatchMapping("/{id}/suspend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProviderResponse>> suspend(
            @PathVariable Long id,
            @AuthenticationPrincipal MemberDetails admin) {
        ProviderResponse res = providerService.suspend(id);
        auditLogService.record(admin.getId(), "PROVIDER_SUSPEND", "Provider", id);
        return ResponseEntity.ok(ApiResponse.success("停止しました", res));
    }

    /** 停止解除（SUSPENDED → APPROVED） */
    @PatchMapping("/{id}/unsuspend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProviderResponse>> unsuspend(
            @PathVariable Long id,
            @AuthenticationPrincipal MemberDetails admin) {
        ProviderResponse res = providerService.unsuspend(id);
        auditLogService.record(admin.getId(), "PROVIDER_UNSUSPEND", "Provider", id);
        return ResponseEntity.ok(ApiResponse.success("停止を解除しました", res));
    }
}
