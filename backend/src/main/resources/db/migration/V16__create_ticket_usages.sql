-- backend/src/main/resources/db/migration/V16__create_ticket_usages.sql
CREATE TABLE ticket_usages (
    id         BIGINT      AUTO_INCREMENT PRIMARY KEY,
    ticket_id  BIGINT      NOT NULL,
    member_id  BIGINT      NOT NULL,
    booking_id BIGINT      NULL,
    usage_type VARCHAR(20) NOT NULL,
    amount     INT         NOT NULL,
    note       VARCHAR(255) NULL,
    created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY fk_tusage_ticket (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY fk_tusage_member (member_id) REFERENCES members(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
