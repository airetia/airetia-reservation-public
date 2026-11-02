-- backend/src/main/resources/db/migration/V5__create_tags.sql
-- タグ（カテゴリとは独立・複数選択可・OR検索）
CREATE TABLE tags (
    id               BIGINT      AUTO_INCREMENT PRIMARY KEY,
    service_type_id  BIGINT      NOT NULL,
    code             VARCHAR(30) NOT NULL UNIQUE,
    name             VARCHAR(50) NOT NULL,
    display_order    INT         NOT NULL DEFAULT 0,
    created_at       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_type_id) REFERENCES service_types(id),
    INDEX idx_service_type (service_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- service_type_id=1 (TUTORING)
INSERT INTO tags (service_type_id, code, name, display_order) VALUES
  (1, 'EXAM',          '受験', 10),
  (1, 'SUPPLEMENT',    '補習', 20),
  (1, 'QUALIFICATION', '資格', 30);