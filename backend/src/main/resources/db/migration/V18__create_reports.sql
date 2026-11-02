-- backend/src/main/resources/db/migration/V18__create_reports.sql
CREATE TABLE reports (
    id           BIGINT      AUTO_INCREMENT PRIMARY KEY,
    booking_id   BIGINT      NOT NULL,
    provider_id  BIGINT      NOT NULL,
    report_type  VARCHAR(20) NOT NULL,
    feedback     VARCHAR(1000) NULL,
    shared_note  VARCHAR(1000) NULL,
    private_note VARCHAR(1000) NULL,
    created_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY fk_reports_booking  (booking_id)  REFERENCES bookings(id),
    FOREIGN KEY fk_reports_provider (provider_id) REFERENCES providers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
