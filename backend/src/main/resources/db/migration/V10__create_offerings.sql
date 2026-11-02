-- backend/src/main/resources/db/migration/V10__create_offerings.sql
-- V19/V20 の quantity/updated_at を統合済み
-- カテゴリ: service_type_id（必須）/ major_category_id（必須）/ middle は中間テーブル
CREATE TABLE offerings (
    id                  BIGINT       AUTO_INCREMENT PRIMARY KEY,
    provider_id         BIGINT       NOT NULL,
    service_type_id     BIGINT       NOT NULL,
    major_category_id   BIGINT       NOT NULL,
    title               VARCHAR(255) NOT NULL,
    description         TEXT         NULL,
    delivery_method     VARCHAR(20)  NOT NULL,
    duration_minutes    INT          NOT NULL,
    tickets_required    INT          NOT NULL,
    capacity            INT          NOT NULL,
    active              TINYINT(1)   NOT NULL DEFAULT 1,
    created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY fk_offerings_provider      (provider_id)       REFERENCES providers(id),
    FOREIGN KEY fk_offerings_service_type  (service_type_id)   REFERENCES service_types(id),
    FOREIGN KEY fk_offerings_major_cat     (major_category_id) REFERENCES major_categories(id),
    INDEX idx_offerings_provider      (provider_id),
    INDEX idx_offerings_service_type  (service_type_id),
    INDEX idx_offerings_major_category (major_category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
