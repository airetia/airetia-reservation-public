-- backend/src/main/resources/db/migration/V14__create_bookings.sql
CREATE TABLE bookings (
    id               BIGINT      AUTO_INCREMENT PRIMARY KEY,
    participant_id   BIGINT      NOT NULL,
    availability_id  BIGINT      NOT NULL,
    status           VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    tickets_consumed INT         NOT NULL,
    created_at       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY fk_bookings_participant   (participant_id)  REFERENCES participants(id),
    FOREIGN KEY fk_bookings_availability  (availability_id) REFERENCES availabilities(id),
    INDEX idx_bookings_participant (participant_id),
    INDEX idx_bookings_status      (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
