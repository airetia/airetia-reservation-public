-- backend/src/main/resources/db/migration/V6__create_providers.sql
CREATE TABLE providers (
    id                          BIGINT        AUTO_INCREMENT PRIMARY KEY,
    member_id                   BIGINT        NOT NULL,
    status                      VARCHAR(30)   NOT NULL DEFAULT 'PENDING_DOCUMENTS',
    high_school                 VARCHAR(255)  NULL,
    university                  VARCHAR(255)  NULL,
    appeal_point                VARCHAR(2000) NULL,
    bio                         TEXT          NULL,
    qualifications              JSON          NULL DEFAULT (JSON_ARRAY()),
    achievements                JSON          NULL DEFAULT (JSON_ARRAY()),
    approval_note               TEXT          NULL,
    rejection_reason            TEXT          NULL,
    on_hold_reason              TEXT          NULL,
    reapplication_available_at  TIMESTAMP     NULL,
    approved_at                 TIMESTAMP     NULL,
    created_at                  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_providers_member (member_id),
    FOREIGN KEY fk_providers_member (member_id) REFERENCES members(id),
    INDEX idx_providers_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
