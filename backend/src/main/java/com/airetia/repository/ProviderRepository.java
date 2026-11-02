// backend/src/main/java/com/airetia/repository/ProviderRepository.java

package com.airetia.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.airetia.domain.model.provider.Provider;
import com.airetia.domain.model.provider.ProviderStatus;

@Repository
public interface ProviderRepository extends JpaRepository<Provider, Long> {

    Optional<Provider> findByMemberId(Long memberId);

    boolean existsByMemberId(Long memberId);

    boolean existsByMemberIdAndStatus(Long memberId, ProviderStatus status);

    List<Provider> findByStatus(ProviderStatus status);

    /**
     * 重複プロバイダー検知（ビジネスルール §5.1.4）
     * 以下のいずれかが既存の APPROVED プロバイダーと一致する場合に true を返す:
     *   - メールアドレス（完全一致）
     *   - 電話番号（完全一致）
     *   - 氏名（姓 + 名）+ 生年月日（完全一致）
     */
    @Query("""
        SELECT COUNT(p) > 0 FROM Provider p
        JOIN p.member m
        WHERE p.status = com.airetia.domain.model.provider.ProviderStatus.APPROVED
          AND (
            m.email = :email
            OR (m.phoneNumber IS NOT NULL AND m.phoneNumber = :phoneNumber)
            OR (m.firstName = :firstName
                AND m.lastName = :lastName
                AND m.birthDate IS NOT NULL
                AND m.birthDate = :birthDate)
          )
        """)
    boolean existsDuplicateApprovedProvider(
        @Param("email")       String email,
        @Param("phoneNumber") String phoneNumber,
        @Param("firstName")   String firstName,
        @Param("lastName")    String lastName,
        @Param("birthDate")   LocalDate birthDate
    );
}
