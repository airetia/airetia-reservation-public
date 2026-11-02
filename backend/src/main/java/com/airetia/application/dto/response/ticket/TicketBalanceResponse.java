// backend/src/main/java/com/airetia/application/dto/response/ticket/TicketBalanceResponse.java
package com.airetia.application.dto.response.ticket;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

/**
 * チケット残高 + 有効チケット一覧 複合レスポンス
 * GET /api/v1/tickets
 * → frontend: ticketApi.ts getTickets() が期待する形式
 *   { balance: { balance, nearestExpiry }, tickets: [...] }
 */
@Getter
@Builder
public class TicketBalanceResponse {

    /** 有効チケット残高 */
    private final int balance;

    /** 最短有効期限（ISO 8601 UTC）。有効チケットがない場合は null */
    private final String nearestExpiry;

    /** 有効チケット一覧 */
    private final List<TicketResponse> tickets;
}
