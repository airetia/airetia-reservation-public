// backend/src/main/java/com/airetia/application/service/email/EmailService.java
package com.airetia.application.service.email;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.airetia.domain.model.booking.Booking;
import com.airetia.domain.model.provider.Provider;

import lombok.extern.slf4j.Slf4j;

/**
 * メール送信サービス
 * → 04_backend_specification.md §9（メール送信）
 *
 * Phase1（MVP）: ログ出力のみ（実際のメール送信はPhase2以降）
 * Phase2: Spring Mail / AWS SES に切り替え（Thymeleaf テンプレート使用）
 *
 * 各メソッドは @Async で非同期実行（メイン処理をブロックしない）
 */
@Slf4j
@Service
public class EmailService {

    /** 予約確定メール */
    @Async
    public void sendBookingConfirmation(Booking booking) {
        log.info("[Email] sendBookingConfirmation: bookingId={}, participantId={}",
            booking.getId(), booking.getParticipant().getId());
        // Phase2: booking-confirmation.html テンプレート送信
    }

    /** キャンセルメール */
    @Async
    public void sendBookingCancelled(Booking booking) {
        log.info("[Email] sendBookingCancelled: bookingId={}", booking.getId());
        // Phase2: booking-cancelled.html テンプレート送信
    }

    /** ペナルティ付与メール */
    @Async
    public void sendPenaltyApplied(Booking booking) {
        log.info("[Email] sendPenaltyApplied: bookingId={}", booking.getId());
        // Phase2: penalty-applied.html テンプレート送信
    }

    /** プロバイダー申請受付メール */
    @Async
    public void sendProviderApplicationReceived(Provider provider) {
        log.info("[Email] sendProviderApplicationReceived: providerId={}", provider.getId());
        // Phase2: provider-application-received.html テンプレート送信
    }

    /** プロバイダー承認メール */
    @Async
    public void sendProviderApproved(Provider provider) {
        log.info("[Email] sendProviderApproved: providerId={}", provider.getId());
        // Phase2: provider-approved.html テンプレート送信
    }

    /** プロバイダー却下メール */
    @Async
    public void sendProviderRejected(Provider provider, String reason) {
        log.info("[Email] sendProviderRejected: providerId={}, reason={}", provider.getId(), reason);
        // Phase2: provider-rejected.html テンプレート送信
    }

    /** プロバイダー保留メール */
    @Async
    public void sendProviderOnHold(Provider provider, String reason) {
        log.info("[Email] sendProviderOnHold: providerId={}, reason={}", provider.getId(), reason);
        // Phase2: provider-on-hold.html テンプレート送信
    }

    /** 前日リマインドメール（BatchConfig から呼び出し）*/
    @Async
    public void sendReminder(Booking booking) {
        log.info("[Email] sendReminder: bookingId={}, startDatetime={}",
            booking.getId(), booking.getAvailability().getStartDatetime());
        // Phase2: reminder.html テンプレート送信
    }
}
