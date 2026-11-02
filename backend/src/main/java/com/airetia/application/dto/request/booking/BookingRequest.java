// backend/src/main/java/com/airetia/application/dto/request/booking/BookingRequest.java
package com.airetia.application.dto.request.booking;

import jakarta.validation.constraints.NotNull;

import lombok.Data;

/**
 * 予約リクエスト DTO
 * POST /api/v1/bookings
 * → 03_common_specification.md §5（ブッキング）
 * → 02_business_rules.md §2（予約ルール）
 */
@Data
public class BookingRequest {

    @NotNull(message = "利用者IDは必須です")
    private Long participantId;

    @NotNull(message = "空き枠IDは必須です")
    private Long availabilityId;
}
