// backend/src/main/java/com/airetia/application/service/provider/ProviderDocumentService.java

package com.airetia.application.service.provider;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.airetia.application.dto.response.provider.ProviderDocumentResponse;
import com.airetia.domain.model.provider.DocumentType;
import com.airetia.domain.model.provider.Provider;
import com.airetia.domain.model.provider.ProviderDocument;
import com.airetia.exception.BusinessException;
import com.airetia.exception.ResourceNotFoundException;
import com.airetia.repository.ProviderDocumentRepository;
import com.airetia.repository.ProviderRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * プロバイダー書類管理サービス
 * POST /api/v1/providers/{id}/documents → 書類アップロード
 * GET  /api/v1/providers/{id}/documents → 書類一覧（管理者用）
 *
 * Phase1: ローカルファイルシステムに保存（./uploads）
 * Phase2: S3StorageService に差し替える
 *
 * 修正: provider.transitionToPending() → provider.tryTransitionToPending()
 *       （Provider エンティティのメソッド名と一致させる）
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProviderDocumentService {

    private final ProviderDocumentRepository documentRepository;
    private final ProviderRepository         providerRepository;

    @Value("${airetia.upload.dir:./uploads}")
    private String uploadDir;

    private static final long        MAX_FILE_SIZE  = 10 * 1024 * 1024L;
    private static final Set<String> ALLOWED_TYPES  = Set.of(
        "image/jpeg", "image/png", "application/pdf");

    /** 書類アップロード（メンバー本人） */
    @Transactional
    public ProviderDocumentResponse uploadDocument(
            Long providerId,
            DocumentType documentType,
            MultipartFile file,
            Long requestMemberId) {

        validateFile(file);

        Provider provider = providerRepository.findById(providerId)
            .orElseThrow(() -> new ResourceNotFoundException("プロバイダーが見つかりません"));

        if (!provider.getMember().getId().equals(requestMemberId)) {
            throw new BusinessException("このプロバイダーへのアクセス権がありません");
        }

        return saveAndTransition(provider, documentType, file);
    }

    /** 書類アップロード（管理者・所有者チェックなし） */
    @Transactional
    public ProviderDocumentResponse uploadDocumentByAdmin(
            Long providerId, DocumentType documentType, MultipartFile file) {

        validateFile(file);

        Provider provider = providerRepository.findById(providerId)
            .orElseThrow(() -> new ResourceNotFoundException("プロバイダーが見つかりません"));

        return saveAndTransition(provider, documentType, file);
    }

    /** 書類一覧取得（管理者用） */
    @Transactional(readOnly = true)
    public List<ProviderDocumentResponse> listDocuments(Long providerId) {
        return documentRepository.findByProviderId(providerId)
            .stream().map(ProviderDocumentResponse::from).toList();
    }

    // ── private ────────────────────────────────────────────────────────

    private ProviderDocumentResponse saveAndTransition(
            Provider provider, DocumentType documentType, MultipartFile file) {

        // 旧ファイルを先に取得（S3 キー保存用）
        var existing = documentRepository.findByProviderIdAndDocumentType(
            provider.getId(), documentType);

        String savedKey = saveFile(file, provider.getId(), documentType);

        // 同種類が既にある場合: 旧 DB レコード削除 + 旧 S3 ファイル削除
        existing.ifPresent(old -> {
            documentRepository.delete(old);
            // Phase1: ローカルファイル削除
            try {
                Files.deleteIfExists(Paths.get(old.getS3Key()));
            } catch (Exception e) {
                log.warn("旧書類ファイルの削除に失敗（継続）: path={}", old.getS3Key(), e);
            }
        });

        ProviderDocument doc = ProviderDocument.builder()
            .provider(provider)
            .documentType(documentType)
            .s3Key(savedKey)
            .originalFilename(file.getOriginalFilename())
            .contentType(file.getContentType())
            .build();
        doc = documentRepository.save(doc);

        // 3種類揃ったら PENDING_DOCUMENTS → PENDING へ自動遷移（Provider エンティティが判定）
        // 修正: transitionToPending() → tryTransitionToPending()
        provider.tryTransitionToPending();
        providerRepository.save(provider);

        log.info("Document uploaded: providerId={}, type={}", provider.getId(), documentType);
        return ProviderDocumentResponse.from(doc);
    }

    private void validateFile(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException("ファイルサイズは10MB以内にしてください");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new BusinessException("JPG / PNG / PDF のみアップロードできます");
        }
    }

    private String saveFile(MultipartFile file, Long providerId, DocumentType type) {
        try {
            Path dir = Paths.get(uploadDir, "providers",
                String.valueOf(providerId), type.name().toLowerCase());
            Files.createDirectories(dir);
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path dest = dir.resolve(filename);
            file.transferTo(dest);
            return dest.toString();
        } catch (IOException e) {
            throw new BusinessException("ファイルの保存に失敗しました: " + e.getMessage());
        }
    }

    /**
     * 書類ダウンロードリソース取得
     * Phase1: ローカルファイルシステムから返す
     */
    @Transactional(readOnly = true)
    public ResponseEntity<Resource> getDownloadResource(Long providerId, Long docId) {
        ProviderDocument doc = documentRepository.findById(docId)
            .orElseThrow(() -> new ResourceNotFoundException("書類が見つかりません"));
        if (!doc.getProvider().getId().equals(providerId)) {
            throw new BusinessException("この書類へのアクセス権がありません");
        }
        Path filePath = Paths.get(doc.getS3Key());
        Resource resource = new FileSystemResource(filePath);
        if (!resource.exists()) {
            throw new ResourceNotFoundException("ファイルが見つかりません: " + doc.getOriginalFilename());
        }
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(doc.getContentType()))
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + doc.getOriginalFilename() + "\"")
            .body(resource);
    }

}
