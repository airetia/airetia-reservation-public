// backend/src/main/java/com/airetia/application/dto/response/ticket/TicketResponse.java
package com.airetia.application.dto.response.ticket;

import java.time.Instant;

import com.airetia.domain.model.ticket.Ticket;

import lombok.Builder;
import lombok.Getter;

/**
 * チケットレスポンス DTO
 * → GET /api/v1/tickets / POST /api/v1/tickets
 * → 03_common_specification.md §5 チケット
 *
 * from() メソッドで Ticket エンティティから変換する。
 * Ticket.isActive フィールド（Boolean）→ Lombok getter: getIsActive()
 * DTO では active（primitive boolean）として出力 → JSON key: "active"
 */
@Getter
@Builder
public class TicketResponse {

    private Long    id;
    private Long    memberId;
    private Instant expiryDate;
    private boolean active;
    private Instant createdAt;

    public static TicketResponse from(Ticket ticket) {
        return TicketResponse.builder()
            .id(ticket.getId())
            .memberId(ticket.getMember().getId())
            .expiryDate(ticket.getExpiryDate())
            
            .active(ticket.getIsActive() != null ? ticket.getIsActive() : true)
            .createdAt(ticket.getCreatedAt())
            .build();
    }
}
