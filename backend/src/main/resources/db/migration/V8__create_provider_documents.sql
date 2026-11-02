-- backend/src/main/resources/db/migration/V8__create_provider_documents.sql
CREATE TABLE provider_documents (
    id                BIGINT       AUTO_INCREMENT PRIMARY KEY,
    provider_id       BIGINT       NOT NULL,
    document_type     VARCHAR(20)  NOT NULL,
    s3_key            VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    content_type      VARCHAR(100) NOT NULL,
    uploaded_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY fk_pdoc_provider (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    INDEX idx_pdoc_provider_type (provider_id, document_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
