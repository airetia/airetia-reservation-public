// backend/src/main/java/com/airetia/application/dto/response/inquiry/InquiryResponse.java
package com.airetia.application.dto.response.inquiry;

import java.time.Instant;
import java.util.List;

import lombok.Builder;
import lombok.Getter;

import com.airetia.domain.model.inquiry.Inquiry;
import com.airetia.domain.model.inquiry.InquiryStatus;

/**
 * 問い合わせレスポンス DTO
 * → 03_common_specification.md §5 問い合わせ
 */
@Getter
@Builder
public class InquiryResponse {
    private Long          id;
    private String        email;
    private String        name;
    private String        subject;
    private String        body;
    private InquiryStatus status;
    private List<String>  attachmentUrls;  // S3 署名付きURL（ADMIN閲覧時）
    private Instant       createdAt;
    private Instant       updatedAt;

    public static InquiryResponse from(Inquiry inquiry) {
        return InquiryResponse.builder()
            .id(inquiry.getId())
            .email(inquiry.getEmail())
            .name(inquiry.getName())
            .subject(inquiry.getSubject())
            .body(inquiry.getBody())
            .status(inquiry.getStatus())
            .createdAt(inquiry.getCreatedAt())
            .updatedAt(inquiry.getUpdatedAt())
            .build();
    }
}
