// backend/src/main/java/com/airetia/repository/ProviderDocumentRepository.java
package com.airetia.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.airetia.domain.model.provider.DocumentType;
import com.airetia.domain.model.provider.ProviderDocument;

/**
 * プロバイダー書類リポジトリ
 * → ProviderDocumentService で使用
 * → V6__create_provider_documents.sql
 * → 02_business_rules.md §5.1.2（必要書類 3 種類）
 */
@Repository
public interface ProviderDocumentRepository extends JpaRepository<ProviderDocument, Long> {

    /** プロバイダーの書類一覧 */
    List<ProviderDocument> findByProviderId(Long providerId);

    /**
     * 種別指定で 1 件取得（差し替え判定用）
     * 同種別は 1 プロバイダーにつき 1 ファイルのみ保持する。
     */
    Optional<ProviderDocument> findByProviderIdAndDocumentType(
            Long providerId, DocumentType documentType);
}
