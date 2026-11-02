// backend/src/main/java/com/airetia/application/dto/response/member/NotificationSettingsResponse.java
package com.airetia.application.dto.response.member;

import com.airetia.domain.model.member.NotificationSettings;

import lombok.Builder;
import lombok.Getter;

/**
 * 通知設定レスポンス DTO
 * GET/PATCH /api/v1/members/{id}/notifications
 * 02_business_rules.md §9
 */
@Getter
@Builder
public class NotificationSettingsResponse {

    private Long    memberId;
    private boolean notifyBookingConfirmed;
    private boolean notifyBookingCancelled;
    private boolean notifyBookingReminder;
    private boolean notifyTicketExpiry;
    private boolean notifyPenaltyApplied;
    private boolean notifyProviderStatus;
    private boolean notifyReportFeedback;

    public static NotificationSettingsResponse from(NotificationSettings s) {
        return NotificationSettingsResponse.builder()
            .memberId(s.getMemberId())
            .notifyBookingConfirmed(s.isNotifyBookingConfirmed())
            .notifyBookingCancelled(s.isNotifyBookingCancelled())
            .notifyBookingReminder(s.isNotifyBookingReminder())
            .notifyTicketExpiry(s.isNotifyTicketExpiry())
            .notifyPenaltyApplied(s.isNotifyPenaltyApplied())
            .notifyProviderStatus(s.isNotifyProviderStatus())
            .notifyReportFeedback(s.isNotifyReportFeedback())
            .build();
    }
}