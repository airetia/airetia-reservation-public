-- backend/src/main/resources/db/migration/V4__create_middle_categories.sql
-- 中分類（Offering に任意・複数選択可）
CREATE TABLE middle_categories (
    id                BIGINT      AUTO_INCREMENT PRIMARY KEY,
    major_category_id BIGINT      NOT NULL,
    code              VARCHAR(30) NOT NULL UNIQUE,
    name              VARCHAR(50) NOT NULL,
    display_order     INT         NOT NULL DEFAULT 0,
    created_at        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (major_category_id) REFERENCES major_categories(id),
    INDEX idx_major (major_category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- STUDY (major_category_id=1)
INSERT INTO middle_categories (major_category_id, code, name, display_order) VALUES
  (1, 'ENGLISH',  '英語', 10),
  (1, 'JAPANESE', '国語', 20),
  (1, 'MATH',     '数学', 30),
  (1, 'SCIENCE',  '理科', 40),
  (1, 'SOCIAL',   '社会', 50);

-- ARTS (major_category_id=3)
INSERT INTO middle_categories (major_category_id, code, name, display_order) VALUES
  (3, 'MUSIC', '音楽',   10),
  (3, 'ART',   'アート', 20);