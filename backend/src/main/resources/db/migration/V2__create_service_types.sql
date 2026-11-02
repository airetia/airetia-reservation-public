-- backend/src/main/resources/db/migration/V2__create_service_types.sql
-- サービス種別（将来: BABYSITTING, TRANSPORT 等に拡張）
CREATE TABLE service_types (
    id            BIGINT      AUTO_INCREMENT PRIMARY KEY,
    code          VARCHAR(30) NOT NULL UNIQUE,
    name          VARCHAR(50) NOT NULL,
    display_order INT         NOT NULL DEFAULT 0,
    created_at    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO service_types (code, name, display_order) VALUES
  ('TUTORING', '家庭教師・レッスン', 10);