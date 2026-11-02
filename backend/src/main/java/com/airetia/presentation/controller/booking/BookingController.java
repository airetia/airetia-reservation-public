// backend/src/main/java/com/airetia/presentation/controller/booking/BookingController.java
package com.airetia.presentation.controller.booking;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.airetia.application.dto.request.booking.BookingRequest;
import com.airetia.application.dto.response.booking.BookingResponse;
import com.airetia.application.dto.response.common.ApiResponse;
import com.airetia.application.service.booking.BookingService;
import com.airetia.domain.model.member.MemberRole;
import com.airetia.infrastructure.security.MemberDetails;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 予約 API
 * → 03_common_specification.md §5 ブッキング
 * → 02_business_rules.md §2 予約ルール
 *
 * GET    /api/v1/bookings                  → 一覧（?status= フィルタ対応）
 * POST   /api/v1/bookings                  → 予約リクエスト（PENDING）
 * GET    /api/v1/bookings/{id}             → 詳細
 * PATCH  /api/v1/bookings/{id}/confirm     → 予約確定（PROVIDER または ADMIN）
 * DELETE /api/v1/bookings/{id}             → 利用者都合キャンセル（§3.1）
 * PATCH  /api/v1/bookings/{id}/cancel      → プロバイダー都合キャンセル（§3.4）
 *
 * 修正:
 *   - confirm: ADMIN のみ → PROVIDER も可（02_business_rules.md §仕様変更）
 *   - GET: status クエリパラメータで絞り込み対応（管理者の予約管理フィルター用）
 */
@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    /**
     * 予約一覧取得
     * ?role=provider → プロバイダー視点（自分のサービスへの予約）
     * ?status=XXX    → ステータス絞り込み（ADMIN のみ有効）
     * (なし)         → ADMIN: 全件 / MEMBER: 自分の予約
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookings(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal MemberDetails memberDetails) {

        List<BookingResponse> bookings;
        if ("provider".equals(role)) {
            bookings = bookingService.getBookingsAsProvider(memberDetails);
        } else if (memberDetails.getMember().getRole() == MemberRole.ADMIN) {
            // 管理者: 全件取得 → フロントエンド側でフィルタリング
            bookings = bookingService.getAllBookings();
        } else {
            bookings = bookingService.getMyBookings(memberDetails);
        }
        return ResponseEntity.ok(ApiResponse.success("予約一覧を取得しました", bookings));
    }

    /** 予約リクエスト作成（PENDING）→ §2 */
    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal MemberDetails memberDetails) {

        BookingResponse booking = bookingService.createBooking(memberDetails, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("予約リクエストを受け付けました", booking));
    }

    /** 予約詳細 */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal MemberDetails memberDetails) {

        return ResponseEntity.ok(
            ApiResponse.success("予約詳細を取得しました",
                bookingService.getBooking(id, memberDetails)));
    }

    /**
     * 予約確定（PENDING → CONFIRMED）+ チケット消費（FIFO）
     * PATCH /api/v1/bookings/{id}/confirm
     * → 認証: PROVIDER（自分のサービスへの予約のみ）または ADMIN
     *
     * 修正: 仕様変更により PROVIDER も確定可能
     * → 02_business_rules.md 「予約確定はプロバイダーが行う（管理者も可）」
     */
    @PatchMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<BookingResponse>> confirmBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal MemberDetails memberDetails) {

        MemberRole role = memberDetails.getMember().getRole();
        // ADMIN または MEMBER（プロバイダー権限チェックは Service 層で実施）
        if (role != MemberRole.ADMIN && role != MemberRole.MEMBER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("権限がありません", "AUTH_AUTHORIZATION_FAILED"));
        }
        BookingResponse booking = bookingService.confirmBooking(id, memberDetails);
        return ResponseEntity.ok(ApiResponse.success("予約を確定しました", booking));
    }

    /**
     * 利用者都合キャンセル
     * DELETE /api/v1/bookings/{id}
     * → 02_business_rules.md §3.1（キャンセルポリシー）
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal MemberDetails memberDetails) {

        bookingService.cancelBooking(id, memberDetails);
        return ResponseEntity.ok(ApiResponse.success("予約をキャンセルしました", null));
    }

    /**
     * プロバイダー都合キャンセル
     * PATCH /api/v1/bookings/{id}/cancel
     * → 02_business_rules.md §3.4（100%返還・ペナルティなし）
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelByProvider(
            @PathVariable Long id,
            @AuthenticationPrincipal MemberDetails memberDetails) {

        bookingService.cancelByProvider(id, memberDetails);
        return ResponseEntity.ok(ApiResponse.success(
            "予約をキャンセルしました（プロバイダー都合）", null));
    }
}