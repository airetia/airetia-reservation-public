-- backend/src/main/resources/db/migration/V11__create_offering_middle_categories.sql
-- offerings ↔ middle_categories 多対多（任意・複数選択可）
CREATE TABLE offering_middle_categories (
    offering_id         BIGINT NOT NULL,
    middle_category_id  BIGINT NOT NULL,
    PRIMARY KEY (offering_id, middle_category_id),
    FOREIGN KEY fk_omc_offering  (offering_id)        REFERENCES offerings(id)          ON DELETE CASCADE,
    FOREIGN KEY fk_omc_middle    (middle_category_id)  REFERENCES middle_categories(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
