// backend/src/main/java/com/airetia/application/dto/request/availability/AvailabilityRequest.java
package com.airetia.application.dto.request.availability;

import java.time.Instant;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import lombok.Data;

@Data
public class AvailabilityRequest {
    
    @NotNull(message = "オファリングIDは必須です")
    private Long offeringId;   // serviceId → offeringId に変更
    
    @NotNull(message = "開始日時は必須です")
    @Future(message = "開始日時は未来の日時を指定してください")
    private Instant startDatetime;   // LocalDateTime → Instant
    
    @NotNull(message = "終了日時は必須です")
    private Instant endDatetime;     // LocalDateTime → Instant
    
    @NotNull(message = "定員は必須です")
    @Min(value = 1, message = "定員は1以上で指定してください")
    @Max(value = 15, message = "定員は15以下で指定してください")
    private Integer capacity;   // maxCapacity → capacity
}