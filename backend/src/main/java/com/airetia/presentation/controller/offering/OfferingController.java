// backend/src/main/java/com/airetia/presentation/controller/offering/OfferingController.java
package com.airetia.presentation.controller.offering;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.airetia.application.dto.request.offering.OfferingRequest;
import com.airetia.application.dto.response.common.ApiResponse;
import com.airetia.application.dto.response.offering.OfferingResponse;
import com.airetia.application.service.offering.OfferingService;
import com.airetia.domain.model.member.MemberRole;
import com.airetia.infrastructure.security.MemberDetails;

import lombok.RequiredArgsConstructor;

/**
 * オファリング（サービス）API
 * → 03_common_specification.md §5 オファリング
 * → 02_business_rules.md §5.4 サービス制約
 *
 * GET    /api/v1/offerings           → 一覧（認証不要）
 * POST   /api/v1/offerings           → 作成（PROVIDER/APPROVED または ADMIN）
 * GET    /api/v1/offerings/{id}      → 詳細（認証不要）
 * PATCH  /api/v1/offerings/{id}      → 更新（所有 PROVIDER または ADMIN）
 * DELETE /api/v1/offerings/{id}      → 削除（所有 PROVIDER または ADMIN）
 *
 * POST 認可:
 *   PROVIDER → hasProviderCapability チェック（ProviderAuthService）
 *   ADMIN    → OfferingService.create() 内で providerId 指定の代理作成
 */
@RestController
@RequestMapping("/api/v1/offerings")
@RequiredArgsConstructor
public class OfferingController {

    private final OfferingService offeringService;

    /**
     * 公開中サービス一覧（推薦スコア付き）
     * 認証不要
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<OfferingResponse>>> getOfferings(
            @RequestParam(required = false) Boolean myOfferings,
            @AuthenticationPrincipal MemberDetails memberDetails) {

        List<OfferingResponse> list;
        if (Boolean.TRUE.equals(myOfferings) && memberDetails != null) {
            list = offeringService.getMyOfferings(memberDetails);
        } else {
            list = offeringService.getActiveOfferings();
        }
        return ResponseEntity.ok(ApiResponse.success("サービス一覧を取得しました", list));
    }

    /**
     * サービス詳細（プロバイダープロフィール付き）
     * 認証不要
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OfferingResponse>> getOffering(
            @PathVariable Long id) {
        return ResponseEntity.ok(
            ApiResponse.success("サービス詳細を取得しました", offeringService.getOffering(id)));
    }

    /**
     * サービス作成
     * - PROVIDER（APPROVED）: 自分のサービスを作成
     * - ADMIN: req.providerId で指定したプロバイダーの代理作成
     */
    @PostMapping
    public ResponseEntity<ApiResponse<OfferingResponse>> create(
            @Valid @RequestBody OfferingRequest req,
            @AuthenticationPrincipal MemberDetails memberDetails) {

        // PROVIDER か ADMIN のみ許可
        boolean isAdmin    = memberDetails.getMember().getRole() == MemberRole.ADMIN;
        boolean isProvider = memberDetails.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_MEMBER")); // PROVIDER は MEMBER ロール

        if (!isAdmin && !isProvider) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("権限がありません", "AUTH_AUTHORIZATION_FAILED"));
        }

        OfferingResponse created = offeringService.create(memberDetails, req);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("サービスを作成しました", created));
    }

    /**
     * サービス更新（所有 PROVIDER または ADMIN）
     */
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<OfferingResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody OfferingRequest req,
            @AuthenticationPrincipal MemberDetails memberDetails) {

        return ResponseEntity.ok(
            ApiResponse.success("サービスを更新しました",
                offeringService.update(id, memberDetails, req)));
    }

    /**
     * サービス削除（CONFIRMED 予約なし / 所有 PROVIDER または ADMIN）
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal MemberDetails memberDetails) {

        offeringService.delete(id, memberDetails);
        return ResponseEntity.ok(ApiResponse.success("サービスを削除しました", null));
    }
}