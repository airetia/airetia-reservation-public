-- backend/src/main/resources/db/migration/V12__create_offering_tags.sql
-- offerings ↔ tags 多対多（任意・複数選択可・OR検索）
CREATE TABLE offering_tags (
    offering_id BIGINT NOT NULL,
    tag_id      BIGINT NOT NULL,
    PRIMARY KEY (offering_id, tag_id),
    FOREIGN KEY fk_otag_offering (offering_id) REFERENCES offerings(id) ON DELETE CASCADE,
    FOREIGN KEY fk_otag_tag      (tag_id)      REFERENCES tags(id)      ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
