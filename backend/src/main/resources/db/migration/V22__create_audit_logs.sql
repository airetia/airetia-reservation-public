-- backend/src/main/resources/db/migration/V22__create_audit_logs.sql
CREATE TABLE audit_logs (
    id          BIGINT       AUTO_INCREMENT PRIMARY KEY,
    admin_id    BIGINT       NOT NULL,
    action      VARCHAR(100) NOT NULL,
    target_type VARCHAR(50)  NULL,
    target_id   BIGINT       NULL,
    note        TEXT         NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_admin   (admin_id),
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
