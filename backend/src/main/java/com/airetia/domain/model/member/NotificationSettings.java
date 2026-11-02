// backend/src/main/java/com/airetia/domain/model/member/NotificationSettings.java
package com.airetia.domain.model.member;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import com.airetia.application.dto.request.member.UpdateNotificationSettingsRequest;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 通知設定エンティティ
 * DB: V17__create_notification_settings.sql
 * 02_business_rules.md §9（デフォルト全 ON）
 *
 * member_id は FK だが、循環依存回避のため Long で保持する。
 * MemberService 登録時に自動生成される（AuthService.register() で呼び出し）。
 */
@Entity
@Table(name = "notification_settings")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class NotificationSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "member_id", nullable = false, unique = true)
    private Long memberId;

    @Column(name = "notify_booking_confirmed", nullable = false)
    @Builder.Default
    private boolean notifyBookingConfirmed = true;

    @Column(name = "notify_booking_cancelled", nullable = false)
    @Builder.Default
    private boolean notifyBookingCancelled = true;

    @Column(name = "notify_booking_reminder", nullable = false)
    @Builder.Default
    private boolean notifyBookingReminder = true;

    @Column(name = "notify_ticket_expiry", nullable = false)
    @Builder.Default
    private boolean notifyTicketExpiry = true;

    @Column(name = "notify_penalty_applied", nullable = false)
    @Builder.Default
    private boolean notifyPenaltyApplied = true;

    @Column(name = "notify_provider_status", nullable = false)
    @Builder.Default
    private boolean notifyProviderStatus = true;

    @Column(name = "notify_report_feedback", nullable = false)
    @Builder.Default
    private boolean notifyReportFeedback = true;

    /**
     * デフォルト設定（全 ON）でインスタンスを生成する
     * DB に未登録の場合のフォールバックとして MemberService で使用する
     */
    public static NotificationSettings defaultFor(Long memberId) {
        return NotificationSettings.builder()
            .memberId(memberId)
            .build();
    }

    /**
     * 部分更新（null フィールドは変更しない）
     * PATCH /api/v1/members/{id}/notifications
     */
    public void update(UpdateNotificationSettingsRequest req) {
        if (req.getNotifyBookingConfirmed() != null)
            this.notifyBookingConfirmed = req.getNotifyBookingConfirmed();
        if (req.getNotifyBookingCancelled() != null)
            this.notifyBookingCancelled = req.getNotifyBookingCancelled();
        if (req.getNotifyBookingReminder() != null)
            this.notifyBookingReminder = req.getNotifyBookingReminder();
        if (req.getNotifyTicketExpiry() != null)
            this.notifyTicketExpiry = req.getNotifyTicketExpiry();
        if (req.getNotifyPenaltyApplied() != null)
            this.notifyPenaltyApplied = req.getNotifyPenaltyApplied();
        if (req.getNotifyProviderStatus() != null)
            this.notifyProviderStatus = req.getNotifyProviderStatus();
        if (req.getNotifyReportFeedback() != null)
            this.notifyReportFeedback = req.getNotifyReportFeedback();
    }
}