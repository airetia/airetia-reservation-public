// backend/src/main/java/com/airetia/presentation/controller/ticket/TicketController.java
package com.airetia.presentation.controller.ticket;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.airetia.application.dto.request.ticket.TicketGrantRequest;
import com.airetia.application.dto.response.common.ApiResponse;
import com.airetia.application.dto.response.ticket.TicketResponse;
import com.airetia.application.dto.response.ticket.TicketBalanceResponse;
import com.airetia.application.dto.response.ticket.TicketUsageResponse;
import com.airetia.application.service.ticket.TicketService;
import com.airetia.infrastructure.security.MemberDetails;

import lombok.RequiredArgsConstructor;

/**
 * チケットコントローラー
 * → 03_common_specification.md §5（チケット）
 *
 * GET  /api/v1/tickets         - 残高 + 有効チケット一覧（メンバー）
 * GET  /api/v1/tickets/usages  - 使用履歴（メンバー）
 * POST /api/v1/tickets         - 手動付与（管理者のみ）
 *
 * レスポンス構造:
 *   GET /tickets → { success: true, data: { balance: {balance, nearestExpiry}, tickets: [...] } }
 *   GET /tickets/usages → { success: true, data: [...] }
 *   POST /tickets → { success: true, data: [...] }
 */
@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    /**
     * チケット残高 + 有効チケット一覧取得
     * frontend: ticketApi.ts → getTickets()
     *   期待: res.data.data.balance / res.data.data.tickets
     */
    @GetMapping
    public ResponseEntity<ApiResponse<TicketBalanceResponse>> getTickets(
            @AuthenticationPrincipal MemberDetails memberDetails) {

        // TicketBalanceResponse に balance / nearestExpiry / tickets をまとめて返す
        // → frontend ticketApi.ts getTickets() の期待形式と一致
        TicketBalanceResponse data = ticketService.getBalance(memberDetails);
        return ResponseEntity.ok(ApiResponse.success("チケット情報を取得しました", data));
    }

    /**
     * チケット使用履歴取得
     * frontend: ticketApi.ts → getTicketUsages()
     */
    @GetMapping("/usages")
    public ResponseEntity<ApiResponse<List<TicketUsageResponse>>> getTicketUsages(
            @AuthenticationPrincipal MemberDetails memberDetails) {

        List<TicketUsageResponse> usages = ticketService.getTicketUsages(memberDetails);
        return ResponseEntity.ok(ApiResponse.success("使用履歴を取得しました", usages));
    }

    /**
     * チケット手動付与（管理者のみ）
     * → 02_business_rules.md §7.1 / 06_infrastructure.md §7.2
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> grantTickets(
            @AuthenticationPrincipal MemberDetails adminDetails,
            @Valid @RequestBody TicketGrantRequest request) {

        List<TicketResponse> granted = ticketService.grantTickets(adminDetails, request);
        return ResponseEntity.ok(ApiResponse.success(
            String.format("%d枚のチケットを付与しました", granted.size()), granted));
    }
}
