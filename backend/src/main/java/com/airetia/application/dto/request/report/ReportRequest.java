package com.airetia.application.dto.request.report;

import com.airetia.domain.model.report.ReportType;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReportRequest {

    @NotNull(message = "予約IDは必須です")
    private Long bookingId;

    @NotNull(message = "報告種別は必須です")
    private ReportType reportType;

    /** 利用者へのフィードバック（公開） */
    private String feedback;

    /** 利用者の特徴（全プロバイダー共有） */
    private String sharedNote;

    /** 詳細メモ（報告者のみ閲覧） */
    private String privateNote;
}
