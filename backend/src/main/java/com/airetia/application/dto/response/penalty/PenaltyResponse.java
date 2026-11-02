// backend/src/main/java/com/airetia/application/dto/response/penalty/PenaltyResponse.java
package com.airetia.application.dto.response.penalty;

import java.time.Instant;

import lombok.Builder;
import lombok.Getter;

import com.airetia.domain.model.penalty.Penalty;
import com.airetia.domain.model.penalty.PenaltyType;

/**
 * ペナルティレスポンス DTO
 * → GET /api/v1/admin/penalties
 * → 02_business_rules.md §4
 */
@Getter
@Builder
public class PenaltyResponse {
    private Long        id;
    private Long        participantId;
    private String      participantName;   // 姓名結合（管理画面表示用）
    private Long        bookingId;
    private PenaltyType penaltyType;
    private boolean     active;
    private Instant     expiresAt;
    private Instant     createdAt;

    public static PenaltyResponse from(Penalty p) {
        return PenaltyResponse.builder()
            .id(p.getId())
            .participantId(p.getParticipant().getId())
            .participantName(
                p.getParticipant().getLastName() + " " + p.getParticipant().getFirstName())
            .bookingId(p.getBooking().getId())
            .penaltyType(p.getPenaltyType())
            .active(p.isActive())
            .expiresAt(p.getExpiresAt())
            .createdAt(p.getCreatedAt())
            .build();
    }
}
