-- backend/src/main/resources/db/migration/V19__create_inquiries.sql
-- name は NULL 許容（非ログインユーザー対応）
CREATE TABLE inquiries (
    id         BIGINT        AUTO_INCREMENT PRIMARY KEY,
    member_id  BIGINT        NULL,
    name       VARCHAR(100)  NULL,
    email      VARCHAR(255)  NOT NULL,
    subject    VARCHAR(255)  NULL,
    body       VARCHAR(1000) NOT NULL,
    status     VARCHAR(20)   NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY fk_inquiries_member (member_id) REFERENCES members(id) ON DELETE SET NULL,
    INDEX idx_inquiries_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
