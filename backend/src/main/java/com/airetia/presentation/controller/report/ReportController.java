// backend/src/main/java/com/airetia/presentation/controller/report/ReportController.java
package com.airetia.presentation.controller.report;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.airetia.application.dto.request.report.ReportRequest;
import com.airetia.application.dto.response.common.ApiResponse;
import com.airetia.application.dto.response.report.ReportResponse;
import com.airetia.application.service.report.ReportService;
import com.airetia.infrastructure.security.MemberDetails;

import lombok.RequiredArgsConstructor;

/**
 * 報告書コントローラー
 *
 * POST /api/v1/reports         - 報告書作成（APPROVED プロバイダーのみ）
 * GET  /api/v1/reports         - 一覧取得（プロバイダー: 自分のみ / ADMIN: 全件）
 * GET  /api/v1/reports/{id}    - 詳細取得
 *
 * → 03_common_specification.md §5 報告書
 * → 02_business_rules.md §2.6（報告可能期間）
 */
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * 報告書作成
     * POST /api/v1/reports
     * APPROVED プロバイダーのみ実行可
     */
    @PostMapping
    @PreAuthorize("@providerAuthService.hasProviderCapability(principal)")
    public ResponseEntity<ApiResponse<ReportResponse>> create(
            @Valid @RequestBody ReportRequest request,
            @AuthenticationPrincipal MemberDetails memberDetails) {

        ReportResponse response = reportService.createReport(memberDetails, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("報告書を作成しました", response));
    }

    /**
     * 報告書一覧
     * GET /api/v1/reports
     * - ADMIN: 全件
     * - PROVIDER: 自分が作成した報告書のみ
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ReportResponse>>> list(
            @AuthenticationPrincipal MemberDetails memberDetails) {

        boolean isAdmin = memberDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        List<ReportResponse> reports = isAdmin
                ? reportService.getAllReports()
                : reportService.getMyReports(memberDetails);

        return ResponseEntity.ok(ApiResponse.success("報告書一覧を取得しました", reports));
    }

    /**
     * 報告書詳細
     * GET /api/v1/reports/{id}
     * - PROVIDER: 自分の報告書のみ
     * - ADMIN: 全件
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReportResponse>> get(
            @PathVariable Long id,
            @AuthenticationPrincipal MemberDetails memberDetails) {

        ReportResponse response = reportService.getReport(id, memberDetails);
        return ResponseEntity.ok(ApiResponse.success("報告書を取得しました", response));
    }
}
