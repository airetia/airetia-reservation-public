// backend/src/main/java/com/airetia/presentation/controller/provider/ProviderDocumentController.java
package com.airetia.presentation.controller.provider;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.airetia.application.dto.response.common.ApiResponse;
import com.airetia.application.dto.response.provider.ProviderDocumentResponse;
import com.airetia.application.service.provider.ProviderDocumentService;
import com.airetia.domain.model.provider.DocumentType;
import com.airetia.infrastructure.security.MemberDetails;

import lombok.RequiredArgsConstructor;

/**
 * プロバイダー書類コントローラー
 *
 * POST /api/v1/providers/{id}/documents  - 書類アップロード（本人 or ADMIN）
 * GET  /api/v1/providers/{id}/documents  - 書類一覧（ADMIN のみ）
 *
 * → 03_common_specification.md §5 プロバイダー
 * → 02_business_rules.md §5.1.2（必要書類）
 */
@RestController
@RequestMapping("/api/v1/providers/{id}/documents")
@RequiredArgsConstructor
public class ProviderDocumentController {

    private final ProviderDocumentService documentService;

    /**
     * 書類アップロード
     * POST /api/v1/providers/{id}/documents
     *
     * - 本人（MEMBER）: 自分の providerId のみ可
     * - 管理者: 任意の providerId 可
     * - 1 種別 1 ファイル（差し替え時は旧ファイルを自動削除）
     * - アップロード完了後に Provider の tryTransitionToPending() を呼ぶ
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProviderDocumentResponse>> upload(
            @PathVariable Long id,
            @RequestParam("documentType") DocumentType documentType,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal MemberDetails memberDetails) {

        boolean isAdmin = memberDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        ProviderDocumentResponse response;
        if (isAdmin) {
            response = documentService.uploadDocumentByAdmin(id, documentType, file);
        } else {
            response = documentService.uploadDocument(id, documentType, file,
                    memberDetails.getId());
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("書類をアップロードしました", response));
    }

    /**
     * 書類一覧取得（管理者専用）
     * GET /api/v1/providers/{id}/documents
     *
     * Phase2 では署名付き URL を返す予定。Phase1 はメタデータのみ返す。
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ProviderDocumentResponse>>> list(
            @PathVariable Long id) {

        List<ProviderDocumentResponse> docs = documentService.listDocuments(id);
        return ResponseEntity.ok(ApiResponse.success("書類一覧を取得しました", docs));
    }

    /**
     * 書類ダウンロード用 URL 発行（管理者）
     * GET /api/v1/providers/{id}/documents/{docId}/download
     * Phase1: ローカルファイルを返却 / Phase2: S3 署名付き URL にリダイレクト
     */
    @GetMapping("/{docId}/download")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<org.springframework.core.io.Resource> download(
            @PathVariable Long id,
            @PathVariable Long docId) {
        return documentService.getDownloadResource(id, docId);
    }

}
