// backend/src/main/java/com/airetia/application/dto/response/provider/ProviderDocumentResponse.java
package com.airetia.application.dto.response.provider;

import java.time.Instant;

import com.airetia.domain.model.provider.DocumentType;
import com.airetia.domain.model.provider.ProviderDocument;

import lombok.Builder;
import lombok.Getter;

/**
 * プロバイダー書類レスポンス DTO
 * → GET /api/v1/providers/{id}/documents（管理者用）
 * → 03_common_specification.md §5 プロバイダー
 *
 * s3Key は外部公開しない。管理者の閲覧 URL は presignedUrl で提供する（Phase2）。
 */
@Getter
@Builder
public class ProviderDocumentResponse {

    private Long         id;
    private Long         providerId;
    private DocumentType documentType;
    private String       originalFilename;
    private String       contentType;
    private Instant      uploadedAt;
    /** Phase1: ローカルパス / Phase2: S3 署名付き URL（有効期限 1 時間） */
    private String       downloadUrl;

    public static ProviderDocumentResponse from(ProviderDocument doc) {
        return ProviderDocumentResponse.builder()
                .id(doc.getId())
                .providerId(doc.getProvider().getId())
                .documentType(doc.getDocumentType())
                .originalFilename(doc.getOriginalFilename())
                .contentType(doc.getContentType())
                .uploadedAt(doc.getUploadedAt())
                .build();
    }

    /** downloadUrl 付きインスタンス生成 */
    public static ProviderDocumentResponse fromWithUrl(ProviderDocument doc, String url) {
        return ProviderDocumentResponse.builder()
                .id(doc.getId())
                .providerId(doc.getProvider().getId())
                .documentType(doc.getDocumentType())
                .originalFilename(doc.getOriginalFilename())
                .contentType(doc.getContentType())
                .uploadedAt(doc.getUploadedAt())
                .downloadUrl(url)
                .build();
    }
}
