-- backend/src/main/resources/db/migration/V1__create_members.sql
CREATE TABLE members (
    id               BIGINT       AUTO_INCREMENT PRIMARY KEY,
    email            VARCHAR(255) NOT NULL UNIQUE,
    password_hash    VARCHAR(255) NOT NULL,
    role             VARCHAR(20)  NOT NULL,
    first_name       VARCHAR(50)  NOT NULL,
    last_name        VARCHAR(50)  NOT NULL,
    first_name_kana  VARCHAR(50),
    last_name_kana   VARCHAR(50),
    birth_date       DATE,
    gender           VARCHAR(20),
    phone_number     VARCHAR(11),
    postal_code      VARCHAR(7),
    address          VARCHAR(255),
    is_active        TINYINT(1)   NOT NULL DEFAULT 1,
    is_locked        TINYINT(1)   NOT NULL DEFAULT 0,
    suspended_until  TIMESTAMP    NULL,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role  (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;