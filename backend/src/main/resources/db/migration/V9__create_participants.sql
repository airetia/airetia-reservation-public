-- backend/src/main/resources/db/migration/V9__create_participants.sql
CREATE TABLE participants (
    id               BIGINT      AUTO_INCREMENT PRIMARY KEY,
    member_id        BIGINT      NOT NULL,
    participant_type VARCHAR(20) NOT NULL,
    first_name       VARCHAR(50) NOT NULL,
    last_name        VARCHAR(50) NOT NULL,
    first_name_kana  VARCHAR(50) NULL,
    last_name_kana   VARCHAR(50) NULL,
    birth_date       DATE        NULL,
    gender           VARCHAR(20) NULL,
    notes            TEXT        NULL,
    is_active        TINYINT(1)  NOT NULL DEFAULT 1,
    created_at       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY fk_participants_member (member_id) REFERENCES members(id),
    INDEX idx_participants_member (member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
