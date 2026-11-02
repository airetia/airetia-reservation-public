// backend/src/main/java/com/airetia/application/dto/request/member/UpdateNotificationSettingsRequest.java
package com.airetia.application.dto.request.member;

import lombok.Data;

/**
 * 通知設定更新リクエスト DTO（部分更新: null = 変更しない）
 * PATCH /api/v1/members/{id}/notifications
 * 02_business_rules.md §9（通知設定 / デフォルト全 ON）
 */
@Data
public class UpdateNotificationSettingsRequest {

    /** 予約確定通知 */
    private Boolean notifyBookingConfirmed;

    /** 予約キャンセル通知 */
    private Boolean notifyBookingCancelled;

    /** 前日リマインド通知 */
    private Boolean notifyBookingReminder;

    /** チケット期限切れ警告 */
    private Boolean notifyTicketExpiry;

    /** ペナルティ付与通知 */
    private Boolean notifyPenaltyApplied;

    /** プロバイダー審査結果通知 */
    private Boolean notifyProviderStatus;

    /** 報告書フィードバック受信通知 */
    private Boolean notifyReportFeedback;
}