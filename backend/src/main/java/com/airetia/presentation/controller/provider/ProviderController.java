// backend/src/main/java/com/airetia/presentation/controller/provider/ProviderController.java
package com.airetia.presentation.controller.provider;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.airetia.application.dto.request.provider.ProviderRequest;
import com.airetia.application.dto.response.common.ApiResponse;
import com.airetia.application.dto.response.provider.ProviderResponse;
import com.airetia.application.service.provider.ProviderService;
import com.airetia.domain.model.member.MemberRole;
import com.airetia.exception.ResourceNotFoundException;
import com.airetia.infrastructure.security.MemberDetails;

import lombok.RequiredArgsConstructor;

/**
 * プロバイダー申請・情報取得 API
 * POST /api/v1/providers     - 申請
 * GET  /api/v1/providers/me  - 自分のプロバイダー情報
 *
 * 修正:
 *   - create(Long, ProviderRequest) → applyProvider(MemberDetails, ProviderRequest) に合わせる
 *   - findByMemberId(Long) → Optional<Provider> なので map(ProviderResponse::from) が必要
 */
@RestController
@RequestMapping("/api/v1/providers")
@RequiredArgsConstructor
public class ProviderController {

    private final ProviderService providerService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProviderResponse>> createProvider(
            @Valid @RequestBody ProviderRequest request,
            @AuthenticationPrincipal MemberDetails memberDetails) {

        ProviderResponse created = providerService.applyProvider(memberDetails, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("サービス提供者登録申請を受け付けました", created));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<ProviderResponse>> getMyProvider(
            @AuthenticationPrincipal MemberDetails memberDetails) {

        ProviderResponse provider = providerService.findByMemberId(memberDetails.getId())
            .map(ProviderResponse::from)
            .orElseThrow(() -> new ResourceNotFoundException("プロバイダー情報が見つかりません"));
        return ResponseEntity.ok(ApiResponse.success("サービス提供者情報を取得しました", provider));
    }

    /**
     * プロバイダー詳細取得
     * GET /api/v1/providers/{id}
     * MEMBER（自分のみ）または ADMIN が参照可能
     * → 03_common_specification.md §5 プロバイダー
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProviderResponse>> getProviderById(
            @PathVariable Long id,
            @AuthenticationPrincipal MemberDetails memberDetails) {

        boolean isAdmin = memberDetails.getMember().getRole() == MemberRole.ADMIN;
        if (!isAdmin) {
            // MEMBER は自分のプロバイダーのみ参照可能
            providerService.findByMemberId(memberDetails.getId())
                .filter(p -> p.getId().equals(id))
                .orElseThrow(() -> new ResourceNotFoundException("プロバイダー情報が見つかりません"));
        }
        ProviderResponse provider = providerService.findById(id)
            .map(ProviderResponse::from)
            .orElseThrow(() -> new ResourceNotFoundException("プロバイダー情報が見つかりません"));
        return ResponseEntity.ok(ApiResponse.success("プロバイダー情報を取得しました", provider));
    }
    /**
     * プロバイダー情報更新（APPROVED のみ・本人 or ADMIN）
     * PATCH /api/v1/providers/{id}
     * → 03_common_specification.md §5
     */
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ProviderResponse>> updateProvider(
            @PathVariable Long id,
            @Valid @RequestBody ProviderRequest request,
            @AuthenticationPrincipal MemberDetails memberDetails) {

        ProviderResponse updated = providerService.updateProfile(id, memberDetails, request);
        return ResponseEntity.ok(ApiResponse.success("プロバイダー情報を更新しました", updated));
    }

}