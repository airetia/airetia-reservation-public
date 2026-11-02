-- backend/src/main/resources/db/migration/V3__create_major_categories.sql
-- 大分類（Offering に必須・1つ）
CREATE TABLE major_categories (
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
INSERT INTO major_categories (service_type_id, code, name, display_order) VALUES
  (1, 'STUDY',  '勉強',   10),
  (1, 'SPORTS', 'スポーツ', 20),
  (1, 'ARTS',   '芸術',   30),
  (1, 'OTHER',  'その他', 40);