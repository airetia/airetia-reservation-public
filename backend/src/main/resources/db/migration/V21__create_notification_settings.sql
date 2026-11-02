-- backend/src/main/resources/db/migration/V21__create_notification_settings.sql
CREATE TABLE notification_settings (
    id                       BIGINT     AUTO_INCREMENT PRIMARY KEY,
    member_id                BIGINT     NOT NULL,
    notify_booking_confirmed TINYINT(1) NOT NULL DEFAULT 1,
    notify_booking_cancelled TINYINT(1) NOT NULL DEFAULT 1,
    notify_booking_reminder  TINYINT(1) NOT NULL DEFAULT 1,
    notify_ticket_expiry     TINYINT(1) NOT NULL DEFAULT 1,
    notify_penalty_applied   TINYINT(1) NOT NULL DEFAULT 1,
    notify_provider_status   TINYINT(1) NOT NULL DEFAULT 1,
    notify_report_feedback   TINYINT(1) NOT NULL DEFAULT 1,
    created_at               TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_notif_member (member_id),
    FOREIGN KEY fk_notif_member (member_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
