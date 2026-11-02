// backend/src/main/java/com/airetia/application/dto/response/ticket/TicketUsageResponse.java
package com.airetia.application.dto.response.ticket;

import java.time.Instant;

import com.airetia.domain.model.ticket.TicketUsage;
import com.airetia.domain.model.ticket.UsageType;

import lombok.Builder;
import lombok.Getter;

/**
 * チケット使用履歴レスポンス DTO
 * → GET /api/v1/tickets/usages
 * → 01_glossary.md §2 Ticket / 03_common_specification.md §5 チケット
 *
 * frontend/src/models/ticket.ts の TicketUsageResponse と対応する。
 */
@Getter
@Builder
public class TicketUsageResponse {

    private Long      id;
    private Long      ticketId;
    private Long      memberId;
    private Long      bookingId;    // null の場合あり（ADJUSTMENT 等）
    private UsageType usageType;
    private Integer   amount;
    private String    note;
    private Instant   createdAt;

    public static TicketUsageResponse from(TicketUsage usage) {
        return TicketUsageResponse.builder()
                .id(usage.getId())
                .ticketId(usage.getTicket().getId())
                .memberId(usage.getMember().getId())
                .bookingId(usage.getBookingId())
                .usageType(usage.getUsageType())
                .amount(usage.getAmount())
                .note(usage.getNote())
                .createdAt(usage.getCreatedAt())
                .build();
    }
}
