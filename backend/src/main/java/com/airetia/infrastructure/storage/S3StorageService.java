// backend/src/main/java/com/airetia/infrastructure/storage/S3StorageService.java
package com.airetia.infrastructure.storage;

import java.io.IOException;
import java.time.Duration;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.airetia.domain.model.provider.DocumentType;
import com.airetia.exception.BusinessException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

/**
 * AWS S3 ファイルアップロード・署名付きURL生成サービス
 * → 04_backend_specification.md §7 ファイルアップロード実装
 *
 * Phase1: ProviderDocumentService がローカルFS使用のため未呼び出し。
 * Phase2: ProviderDocumentService から差し替えて使用する。
 *
 * S3キー構造: providers/{providerId}/documents/{documentType}/{uuid}_{filename}
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class S3StorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES =
        Set.of("image/jpeg", "image/png", "application/pdf");
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024L; // 10 MB

    private final S3Client    s3Client;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket:airetia-documents-dev}")
    private String bucket;

    /**
     * プロバイダー書類をS3にアップロードし、S3キーを返す。
     * → 02_business_rules.md §5.1.2 書類種別: IDENTITY / CONTRACT / BANK_INFO
     *
     * @return S3キー（DBに保存する値）
     */
    public String upload(MultipartFile file, Long providerId, DocumentType type) {
        validateFile(file);

        String key = "providers/%d/documents/%s/%s_%s"
            .formatted(providerId,
                       type.name().toLowerCase(),
                       UUID.randomUUID(),
                       sanitizeFilename(file.getOriginalFilename()));

        try {
            s3Client.putObject(
                PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(file.getContentType())
                    .build(),
                RequestBody.fromInputStream(file.getInputStream(), file.getSize())
            );
            log.info("S3アップロード完了: bucket={}, key={}", bucket, key);
        } catch (IOException e) {
            log.error("S3アップロード失敗: {}", e.getMessage(), e);
            throw new BusinessException("ファイルアップロードに失敗しました");
        }

        return key;
    }

    /**
     * S3キーから署名付きURLを生成する（有効期限: 15分）。
     * 管理者が書類を閲覧する際に使用する。
     * → 03_common_specification.md §5 GET /api/v1/providers/{id}/documents
     */
    public String generatePresignedUrl(String s3Key) {
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(15))
            .getObjectRequest(GetObjectRequest.builder()
                .bucket(bucket)
                .key(s3Key)
                .build())
            .build();

        return s3Presigner.presignGetObject(presignRequest)
            .url()
            .toString();
    }

    /**
     * S3からファイルを削除する。
     * 書類差し替え時に旧ファイルを削除するために使用する。
     */

    /**
     * 汎用ファイルアップロード（問い合わせ添付ファイル等）
     * @param file  アップロードするファイル
     * @param keyPrefix S3 キーのプレフィックス（例: "inquiries/123"）
     * @return S3 キー
     */
    public String uploadWithKey(MultipartFile file, String keyPrefix) {
        validateFile(file);
        String key = "%s/%s_%s".formatted(
            keyPrefix,
            UUID.randomUUID(),
            file.getOriginalFilename()
        );
        try {
            s3Client.putObject(
                PutObjectRequest.builder()
                    .bucket(bucket).key(key).contentType(file.getContentType()).build(),
                RequestBody.fromInputStream(file.getInputStream(), file.getSize())
            );
        } catch (IOException e) {
            throw new BusinessException("ファイルアップロードに失敗しました: " + e.getMessage());
        }
        return key;
    }
    public void delete(String s3Key) {
        s3Client.deleteObject(DeleteObjectRequest.builder()
            .bucket(bucket)
            .key(s3Key)
            .build());
        log.info("S3削除完了: bucket={}, key={}", bucket, s3Key);
    }

    // ── private ──────────────────────────────────────────────────────────────

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("ファイルが選択されていません");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException("ファイルサイズは 10 MB 以内にしてください");
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new BusinessException("JPG / PNG / PDF のみアップロードできます");
        }
    }

    private String sanitizeFilename(String filename) {
        if (filename == null) return "upload";
        // パストラバーサル対策: ディレクトリセパレータを除去
        return filename.replaceAll("[/\\\\]", "_");
    }
}
