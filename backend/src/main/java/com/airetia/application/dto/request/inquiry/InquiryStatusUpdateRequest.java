// backend/src/main/java/com/airetia/application/dto/request/inquiry/InquiryStatusUpdateRequest.java
package com.airetia.application.dto.request.inquiry;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import com.airetia.domain.model.inquiry.InquiryStatus;

/**
 * 問い合わせステータス更新リクエスト（管理者）
 * → PATCH /api/v1/inquiries/{id}/status
 */
@Data
public class InquiryStatusUpdateRequest {

    @NotNull(message = "ステータスを指定してください")
    private InquiryStatus status;
}
