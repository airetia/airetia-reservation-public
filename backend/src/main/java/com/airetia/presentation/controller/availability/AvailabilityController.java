// backend/src/main/java/com/airetia/presentation/controller/availability/AvailabilityController.java
package com.airetia.presentation.controller.availability;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.airetia.application.dto.response.common.ApiResponse;
import com.airetia.application.dto.request.availability.AvailabilityRequest;
import com.airetia.application.dto.response.availability.AvailabilityResponse;
import com.airetia.application.service.availability.AvailabilityService;
import com.airetia.infrastructure.security.MemberDetails;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 空き枠（Availability）API
 *
 * GET    /api/v1/availabilities             - 一覧検索（?date=&offeringId=、認証不要）
 * GET    /api/v1/availabilities/{id}        - 詳細（認証不要）
 * POST   /api/v1/availabilities             - 作成（APPROVED プロバイダー）
 * PATCH  /api/v1/availabilities/{id}        - 定員更新（所有者 or ADMIN）
 * DELETE /api/v1/availabilities/{id}        - 削除（所有者 or ADMIN、予約0件のみ）
 *
 * 修正:
 *   - @RequestParam(name = "offering_id") → @RequestParam(name = "offeringId")
 *     camelCase 統一（frontend AvailabilitySearchParams.offeringId と一致）
 * 例外処理は GlobalExceptionHandler に委譲。
 */
@RestController
@RequestMapping("/api/v1/availabilities")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AvailabilityResponse>>> search(
            @RequestParam(required = false) LocalDate date,
            @RequestParam(name = "offeringId", required = false) Long offeringId,
            @RequestParam(required = false) Boolean mySlots,
            @Nullable @AuthenticationPrincipal MemberDetails memberDetails) {

        List<AvailabilityResponse> data;
        if (Boolean.TRUE.equals(mySlots) && memberDetails != null) {
            // プロバイダーが自分の空き枠一覧を取得（AvailabilitiesPage 用）
            data = availabilityService.searchByProvider(memberDetails);
        } else {
            data = availabilityService.search(date, offeringId);
        }
        return ResponseEntity.ok(ApiResponse.success("取得しました", data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AvailabilityResponse>> get(@PathVariable Long id) {
        AvailabilityResponse data = availabilityService.getOne(id);
        return ResponseEntity.ok(ApiResponse.success("取得しました", data));
    }

    @PostMapping
    @PreAuthorize("@providerAuthService.hasProviderCapability(principal)")
    public ResponseEntity<ApiResponse<AvailabilityResponse>> create(
            @Valid @RequestBody AvailabilityRequest req,
            @AuthenticationPrincipal MemberDetails memberDetails) {

        AvailabilityResponse data = availabilityService.create(memberDetails, req);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("空き枠を作成しました", data));
    }

    /**
     * 定員変更のみ受け付ける（予約ありの場合は新定員 >= 既存予約数）
     * → 02_business_rules.md §5.2
     */
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<AvailabilityResponse>> update(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body,
            @AuthenticationPrincipal MemberDetails memberDetails) {

        Integer capacity = body.get("capacity");
        if (capacity == null) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("capacity は必須です", "VALIDATION_ERROR"));
        }
        AvailabilityResponse data = availabilityService.updateCapacity(id, memberDetails, capacity);
        return ResponseEntity.ok(ApiResponse.success("更新しました", data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal MemberDetails memberDetails) {

        availabilityService.delete(id, memberDetails);
        return ResponseEntity.ok(ApiResponse.success("削除しました", null));
    }
}
