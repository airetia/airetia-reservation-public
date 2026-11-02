-- backend/src/main/resources/db/migration/V17__create_penalties.sql
CREATE TABLE penalties (
    id             BIGINT      AUTO_INCREMENT PRIMARY KEY,
    participant_id BIGINT      NOT NULL,
    booking_id     BIGINT      NOT NULL,
    penalty_type   VARCHAR(20) NOT NULL DEFAULT 'NO_SHOW',
    is_active      TINYINT(1)  NOT NULL DEFAULT 1,
    expires_at     TIMESTAMP   NOT NULL,
    created_at     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY fk_penalties_participant (participant_id) REFERENCES participants(id),
    FOREIGN KEY fk_penalties_booking     (booking_id)     REFERENCES bookings(id),
    INDEX idx_penalties_participant_active (participant_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
