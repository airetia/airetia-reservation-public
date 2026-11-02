-- backend/src/main/resources/db/migration/V13__create_availabilities.sql
CREATE TABLE availabilities (
    id             BIGINT     AUTO_INCREMENT PRIMARY KEY,
    provider_id    BIGINT     NOT NULL,
    offering_id    BIGINT     NOT NULL,
    start_datetime TIMESTAMP  NOT NULL,
    end_datetime   TIMESTAMP  NOT NULL,
    capacity       INT        NOT NULL,
    bookable       TINYINT(1) NOT NULL DEFAULT 0,
    created_at     TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY fk_avail_provider (provider_id) REFERENCES providers(id),
    FOREIGN KEY fk_avail_offering (offering_id) REFERENCES offerings(id),
    INDEX idx_avail_start           (start_datetime),
    INDEX idx_avail_provider_start  (provider_id, start_datetime),
    INDEX idx_avail_offering        (offering_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
