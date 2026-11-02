-- backend/src/main/resources/db/migration/V20__create_inquiry_attachments.sql
CREATE TABLE inquiry_attachments (
    id                BIGINT       AUTO_INCREMENT PRIMARY KEY,
    inquiry_id        BIGINT       NOT NULL,
    s3_key            VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    content_type      VARCHAR(100) NOT NULL,
    uploaded_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY fk_iattach_inquiry (inquiry_id) REFERENCES inquiries(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
