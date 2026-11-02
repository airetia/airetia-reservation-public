-- backend/src/main/resources/db/migration/V7__create_provider_cancellation_warnings.sql
CREATE TABLE provider_cancellation_warnings (
    id          BIGINT    AUTO_INCREMENT PRIMARY KEY,
    provider_id BIGINT    NOT NULL,
    booking_id  BIGINT    NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY fk_pcw_provider (provider_id) REFERENCES providers(id),
    INDEX idx_pcw_provider (provider_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
