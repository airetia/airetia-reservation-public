// backend/src/main/java/com/airetia/application/dto/response/availability/AvailabilityResponse.java
package com.airetia.application.dto.response.availability;

import java.time.Instant;

import com.airetia.domain.model.availability.Availability;
import com.airetia.domain.model.offering.DeliveryMethod;

import lombok.Builder;
import lombok.Getter;

/**
 * 空き枠レスポンス DTO
 * → 03_common_specification.md §5（アベイラビリティ）
 * → frontend/src/models/availability.ts AvailabilityResponse との整合
 *
 * フィールドはすべて camelCase
 */
@Getter
@Builder
public class AvailabilityResponse {

    private Long           id;
    private Long           offeringId;
    private String         offeringTitle;
    private Long           providerId;
    private String         providerName;
    private Instant        startDatetime;
    private Instant        endDatetime;
    private int            durationMinutes;
    private DeliveryMethod deliveryMethod;
    private int            capacity;
    private long           bookedCount;
    private long           remainingSlots;
    private boolean        bookable;
    private boolean        full;
    private Instant        createdAt;

    public static AvailabilityResponse from(Availability availability, long confirmedCount) {
        var offering = availability.getOffering();
        var providerMember = availability.getProvider().getMember();
        long remaining = Math.max(0, availability.getCapacity() - confirmedCount);

        return AvailabilityResponse.builder()
                .id(availability.getId())
                .offeringId(offering.getId())
                .offeringTitle(offering.getTitle())
                .providerId(availability.getProvider().getId())
                .providerName(providerMember.getLastName() + " " + providerMember.getFirstName())
                .startDatetime(availability.getStartDatetime())
                .endDatetime(availability.getEndDatetime())
                .durationMinutes(offering.getDurationMinutes())
                .deliveryMethod(offering.getDeliveryMethod())
                .capacity(availability.getCapacity())
                .bookedCount(confirmedCount)
                .remainingSlots(remaining)
                .bookable(availability.isBookable())
                .full(remaining == 0)
                .createdAt(availability.getCreatedAt())
                .build();
    }
}
