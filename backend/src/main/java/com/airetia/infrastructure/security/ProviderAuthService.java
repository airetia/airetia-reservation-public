// backend/src/main/java/com/airetia/infrastructure/security/ProviderAuthService.java
package com.airetia.infrastructure.security;

import org.springframework.stereotype.Service;

import com.airetia.domain.model.provider.ProviderStatus;
import com.airetia.repository.ProviderRepository;

import lombok.RequiredArgsConstructor;

/**
 * プロバイダー権限チェック
 * @PreAuthorize("@providerAuthService.hasProviderCapability(principal)") で使用
 */
@Service("providerAuthService")
@RequiredArgsConstructor
public class ProviderAuthService {

    private final ProviderRepository providerRepository;

    /**
     * principal が APPROVED プロバイダーかどうかを判定
     * OfferingController / AvailabilityController / ReportController で使用
     */
    public boolean hasProviderCapability(Object principal) {
        if (!(principal instanceof MemberDetails md)) return false;
        return providerRepository.existsByMemberIdAndStatus(
            md.getId(), ProviderStatus.APPROVED
        );
    }
}