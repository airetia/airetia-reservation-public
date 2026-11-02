-- backend/src/main/resources/db/migration/V15__create_tickets.sql
-- V19(quantity追加)/V20(updated_at追加) を統合済み
CREATE TABLE tickets (
    id          BIGINT     AUTO_INCREMENT PRIMARY KEY,
    member_id   BIGINT     NOT NULL,
    quantity    INT        NOT NULL DEFAULT 1,
    expiry_date TIMESTAMP  NOT NULL,
    is_active   TINYINT(1) NOT NULL DEFAULT 1,
    created_at  TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY fk_tickets_member (member_id) REFERENCES members(id),
    INDEX idx_tickets_member_expiry (member_id, expiry_date, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;