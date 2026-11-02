// backend/src/main/java/com/airetia/repository/ProviderCancellationWarningRepository.java
package com.airetia.repository;

import java.time.Instant;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.airetia.domain.model.provider.ProviderCancellationWarning;

/**
 * プロバイダーキャンセル警告リポジトリ
 * → 02_business_rules.md §3.4
 */
@Repository
public interface ProviderCancellationWarningRepository
    extends JpaRepository<ProviderCancellationWarning, Long> {

    /**
     * 年間キャンセル回数（§3.4 累積警告判定）
     * 基準: createdAt が1年以内のレコード数
     */
    @Query("""
        SELECT COUNT(w) FROM ProviderCancellationWarning w
        WHERE w.providerId = :providerId
          AND w.createdAt >= :since
        """)
    long countByProviderIdSince(@Param("providerId") Long providerId,
                                @Param("since") Instant since);
}
