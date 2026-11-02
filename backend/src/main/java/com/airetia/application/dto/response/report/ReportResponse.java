package com.airetia.application.dto.response.report;

import java.time.Instant;

import com.airetia.domain.model.report.Report;
import com.airetia.domain.model.report.ReportType;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReportResponse {

    private Long id;
    private Long bookingId;
    private Long providerId;
    private ReportType reportType;
    private String feedback;
    private String sharedNote;
    /** privateNote は報告者（プロバイダー）のみに返す。他者には null */
    private String privateNote;
    private Instant createdAt;

    /** 自分の報告書（privateNote あり） */
    public static ReportResponse from(Report report) {
        return ReportResponse.builder()
            .id(report.getId())
            .bookingId(report.getBooking().getId())
            .providerId(report.getProvider().getId())
            .reportType(report.getReportType())
            .feedback(report.getFeedback())
            .sharedNote(report.getSharedNote())
            .privateNote(report.getPrivateNote())
            .createdAt(report.getCreatedAt())
            .build();
    }

    /** 他者向け（privateNote を除外） */
    public static ReportResponse fromPublic(Report report) {
        return ReportResponse.builder()
            .id(report.getId())
            .bookingId(report.getBooking().getId())
            .providerId(report.getProvider().getId())
            .reportType(report.getReportType())
            .feedback(report.getFeedback())
            .sharedNote(report.getSharedNote())
            .privateNote(null) // 非公開
            .createdAt(report.getCreatedAt())
            .build();
    }
}
