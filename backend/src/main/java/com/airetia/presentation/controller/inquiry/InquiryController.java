// backend/src/main/java/com/airetia/presentation/controller/inquiry/InquiryController.java
package com.airetia.presentation.controller.inquiry;

import jakarta.validation.Valid;
import com.airetia.exception.BusinessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.airetia.application.dto.request.inquiry.InquiryRequest;
import com.airetia.application.dto.request.inquiry.InquiryStatusUpdateRequest;
import com.airetia.application.dto.response.common.ApiResponse;
import com.airetia.application.dto.response.inquiry.InquiryResponse;
import com.airetia.application.service.inquiry.InquiryService;

import lombok.RequiredArgsConstructor;

/**
 * 問い合わせコントローラー
 * → 03_common_specification.md §5 問い合わせ
 *
 * POST  /api/v1/inquiries           - 問い合わせ送信（認証不要）
 * GET   /api/v1/inquiries           - 一覧取得（ADMIN）
 * GET   /api/v1/inquiries/{id}      - 詳細取得（ADMIN）
 * PATCH /api/v1/inquiries/{id}/status - ステータス更新（ADMIN）
 *
 * 例外処理: GlobalExceptionHandler 委譲。
 * SecurityConfig: POST は permitAll() 設定済み。
 */
@RestController
@RequestMapping("/api/v1/inquiries")
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryService inquiryService;

    /**
     * 問い合わせ送信（認証不要・未ログインユーザーも可）
     * POST /api/v1/inquiries  （multipart/form-data）
     * → 01_glossary.md Inquiry（添付最大3件・10MB・JPG/PNG/PDF）
     */
    @PostMapping(consumes = { "application/json", "multipart/form-data" })
    public ResponseEntity<ApiResponse<InquiryResponse>> create(
            @Valid @ModelAttribute InquiryRequest req,
            @RequestParam(value = "files", required = false)
            java.util.List<org.springframework.web.multipart.MultipartFile> files) {

        // 添付ファイル数チェック（最大3件）
        if (files != null && files.size() > 3) {
            throw new BusinessException("添付ファイルは最大3件までです");
        }
        InquiryResponse res = inquiryService.create(req, files != null ? files : java.util.List.of());
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse.success("お問い合わせを受け付けました", res)
        );
    }

    /**
     * 問い合わせ一覧（管理者）
     * GET /api/v1/inquiries?page=0&size=20
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<InquiryResponse>>> getAll(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(
            ApiResponse.success("取得しました", inquiryService.getAll(pageable))
        );
    }

    /**
     * 問い合わせ詳細（管理者）
     * GET /api/v1/inquiries/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InquiryResponse>> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(
            ApiResponse.success("取得しました", inquiryService.getById(id))
        );
    }

    /**
     * ステータス更新（管理者）
     * PATCH /api/v1/inquiries/{id}/status
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InquiryResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody InquiryStatusUpdateRequest req) {
        return ResponseEntity.ok(
            ApiResponse.success("ステータスを更新しました", inquiryService.updateStatus(id, req))
        );
    }
}
