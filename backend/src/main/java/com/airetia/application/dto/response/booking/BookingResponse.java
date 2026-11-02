// backend/src/main/java/com/airetia/application/dto/response/booking/BookingResponse.java
package com.airetia.application.dto.response.booking;

import java.time.Instant;

import com.airetia.domain.model.booking.Booking;
import com.airetia.domain.model.booking.BookingStatus;
import com.airetia.domain.model.offering.DeliveryMethod;

import lombok.Builder;
import lombok.Getter;

/**
 * 予約レスポンス DTO
 * → 03_common_specification.md §5（ブッキング）
 * → frontend/src/models/booking.ts BookingResponse との整合
 *
 * フィールドはすべて camelCase（Jackson デフォルト設定に準拠）
 */
@Getter
@Builder
public class BookingResponse {

    private Long           id;
    private Long           participantId;
    private String         participantName;   // 姓名結合（lastName + firstName）
    private Long           availabilityId;
    private Long           providerId;
    private String         providerName;      // プロバイダーの姓名
    private String         serviceTitle;      // offering.title
    private Instant        startDatetime;
    private Instant        endDatetime;
    private int            durationMinutes;
    private DeliveryMethod deliveryMethod;
    private BookingStatus  status;
    private int            ticketsConsumed;
    private Instant        createdAt;

    public static BookingResponse from(Booking booking) {
        var participant  = booking.getParticipant();
        var availability = booking.getAvailability();
        var offering     = availability.getOffering();
        var providerMember = availability.getProvider().getMember();

        return BookingResponse.builder()
                .id(booking.getId())
                .participantId(participant.getId())
                .participantName(participant.getLastName() + " " + participant.getFirstName())
                .availabilityId(availability.getId())
                .providerId(availability.getProvider().getId())
                .providerName(providerMember.getLastName() + " " + providerMember.getFirstName())
                .serviceTitle(offering.getTitle())
                .startDatetime(availability.getStartDatetime())
                .endDatetime(availability.getEndDatetime())
                .durationMinutes(offering.getDurationMinutes())
                .deliveryMethod(offering.getDeliveryMethod())
                .status(booking.getStatus())
                .ticketsConsumed(booking.getTicketsConsumed())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
