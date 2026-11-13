-- =============================================================================
-- seed.sql  ―  開発・検証用 初期データ投入スクリプト
-- =============================================================================
-- 【使い方】
--   $ mysql -u root -p airetia < seed.sql
--
-- 【パスワード】
--   全テストアカウント共通: Password1!
--   (BCrypt strength=12 でハッシュ済み)
--
-- 【アカウント一覧】
--   admin@example.com        ← 管理者
--   member@example.com       ← 一般メンバー（SELF Participant あり）
--   parent@example.com       ← 保護者メンバー（CHILD Participant x2）
--   provider@example.com     ← APPROVED プロバイダー兼メンバー
--   pending@example.com      ← 審査中プロバイダー (PENDING)
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 既存データを全削除（開発用リセット）
-- -----------------------------------------------------------------------------
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE reports;
TRUNCATE TABLE penalties;
TRUNCATE TABLE ticket_usages;
TRUNCATE TABLE tickets;
TRUNCATE TABLE bookings;
TRUNCATE TABLE availabilities;
TRUNCATE TABLE offerings;
TRUNCATE TABLE provider_documents;
TRUNCATE TABLE providers;
TRUNCATE TABLE participants;
TRUNCATE TABLE offering_types;
TRUNCATE TABLE categories;
TRUNCATE TABLE members;

SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- 1. マスターデータ
-- -----------------------------------------------------------------------------

INSERT INTO categories (id, category_name, display_order) VALUES
    (1, '音楽',       1),
    (2, 'スポーツ',   2),
    (3, '語学',       3),
    (4, '学習サポート', 4),
    (5, 'アート',     5);

INSERT INTO offering_types (id, type_code, type_name, is_active) VALUES
    (1, 'LESSON', 'レッスン', 1);

-- -----------------------------------------------------------------------------
-- 2. メンバー
--    password_hash = BCrypt('Password1!', strength=12)
-- -----------------------------------------------------------------------------

INSERT INTO members (id, email, password_hash, role,
                     first_name, last_name, first_name_kana, last_name_kana,
                     birth_date, gender, phone_number, postal_code, address,
                     is_active, is_locked, suspended_until) VALUES

-- 管理者
(1, 'admin@example.com',
    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'ADMIN',
    '管理', '太郎', 'かんり', 'たろう',
    '1980-01-01', 'MALE', '0312345678', '1000001', '東京都千代田区千代田1-1',
    1, 0, NULL),

-- 一般メンバー
(2, 'member@example.com',
    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'MEMBER',
    '山田', '花子', 'やまだ', 'はなこ',
    '1990-05-15', 'FEMALE', '0901234567', '1500001', '東京都渋谷区神南1-1-1',
    1, 0, NULL),

-- 保護者メンバー
(3, 'parent@example.com',
    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'MEMBER',
    '鈴木', '一郎', 'すずき', 'いちろう',
    '1985-08-20', 'MALE', '0801234567', '2230057', '神奈川県横浜市港北区新横浜1-1-1',
    1, 0, NULL),

-- プロバイダー兼メンバー（APPROVED）
(4, 'provider@example.com',
    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'MEMBER',
    '佐藤', '健', 'さとう', 'けん',
    '1988-03-10', 'MALE', '0701234567', '1600023', '東京都新宿区西新宿1-1-1',
    1, 0, NULL),

-- プロバイダー審査中メンバー（PENDING）
(5, 'pending@example.com',
    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'MEMBER',
    '田中', '美咲', 'たなか', 'みさき',
    '1992-11-25', 'FEMALE', '0601234567', '5300001', '大阪府大阪市北区梅田1-1-1',
    1, 0, NULL);

-- -----------------------------------------------------------------------------
-- 3. パーティシパント
-- -----------------------------------------------------------------------------

INSERT INTO participants (id, member_id, participant_type,
                          first_name, last_name, first_name_kana, last_name_kana,
                          date_of_birth, gender, notes) VALUES

-- member@example.com の SELF
(1, 2, 'SELF',
    '花子', '山田', 'はなこ', 'やまだ',
    '1990-05-15', 'FEMALE', NULL),

-- parent@example.com の SELF
(2, 3, 'SELF',
    '一郎', '鈴木', 'いちろう', 'すずき',
    '1985-08-20', 'MALE', NULL),

-- parent@example.com の CHILD x2
(3, 3, 'CHILD',
    '太郎', '鈴木', 'たろう', 'すずき',
    '2015-04-01', 'MALE', 'ピアノ経験3年'),

(4, 3, 'CHILD',
    '花子', '鈴木', 'はなこ', 'すずき',
    '2018-07-15', 'FEMALE', NULL),

-- provider@example.com の SELF
(5, 4, 'SELF',
    '健', '佐藤', 'けん', 'さとう',
    '1988-03-10', 'MALE', NULL);

-- -----------------------------------------------------------------------------
-- 4. プロバイダー
-- -----------------------------------------------------------------------------

INSERT INTO providers (id, member_id, status,
                       high_school, university,
                       qualifications, achievements,
                       appeal_point, bio,
                       approved_at) VALUES

-- APPROVED
(1, 4, 'APPROVED',
    '東京都立進学高校', '東京音楽大学',
    '["ピアノ教師資格", "音楽療法士"]',
    '["全日本ピアノコンクール3位", "東京音楽大学優秀賞"]',
    '丁寧な指導で初心者から上級者まで対応します。楽しく音楽を学びましょう！',
    'ピアノ指導歴10年。子どもから大人まで幅広く指導してきました。',
    '2025-01-15 00:00:00'),

-- PENDING（書類提出済み・審査中）
(2, 5, 'PENDING',
    '大阪府立芸術高校', '大阪音楽大学',
    '["バイオリン演奏資格"]',
    '["関西学生音楽コンクール優勝"]',
    'バイオリンの楽しさを伝えたいと思っています。一緒に音楽を楽しみましょう！',
    'バイオリン演奏歴15年。オーケストラでの演奏経験も豊富です。',
    NULL);

-- -----------------------------------------------------------------------------
-- 5. オファリング（プロバイダー佐藤健のサービス）
-- -----------------------------------------------------------------------------

INSERT INTO offerings (id, provider_id, service_type_id, category_id,
                       service_name, description,
                       duration_minutes, delivery_method,
                       location, online_url,
                       tickets_required, capacity, is_active) VALUES

(1, 1, 1, 1,
    '初心者向けピアノレッスン',
    '楽譜の読み方から丁寧に指導します。まったくの初心者でも安心してご参加ください。',
    60, 'ONLINE',
    NULL, 'https://zoom.us/j/example',
    2, 1, 1),

(2, 1, 1, 1,
    '中級者向けピアノレッスン',
    'ソナタやショパンなど中級曲の習得を目指します。',
    60, 'IN_PERSON',
    '東京都新宿区西新宿1-1-1 レッスンルーム101',
    NULL,
    3, 1, 1),

(3, 1, 1, 1,
    'グループピアノレッスン（親子）',
    '親子で楽しめるグループレッスンです。お子様と一緒に音楽を始めましょう。',
    45, 'IN_PERSON',
    '東京都新宿区西新宿1-1-1 レッスンルーム102',
    NULL,
    2, 4, 1);

-- -----------------------------------------------------------------------------
-- 6. アベイラビリティ（今後2週間分のサンプル枠）
--    bookable=1: 予約解放済み
-- -----------------------------------------------------------------------------

INSERT INTO availabilities (id, provider_id, offering_id,
                             start_datetime, end_datetime,
                             capacity, bookable) VALUES

-- 初心者向けオンラインレッスン
(1, 1, 1, '2026-03-01 10:00:00', '2026-03-01 11:00:00', 1, 1),
(2, 1, 1, '2026-03-03 14:00:00', '2026-03-03 15:00:00', 1, 1),
(3, 1, 1, '2026-03-05 10:00:00', '2026-03-05 11:00:00', 1, 1),
(4, 1, 1, '2026-03-08 10:00:00', '2026-03-08 11:00:00', 1, 1),

-- 中級者向け対面レッスン
(5, 1, 2, '2026-03-02 13:00:00', '2026-03-02 14:00:00', 1, 1),
(6, 1, 2, '2026-03-04 13:00:00', '2026-03-04 14:00:00', 1, 1),
(7, 1, 2, '2026-03-07 13:00:00', '2026-03-07 14:00:00', 1, 1),

-- グループレッスン（親子）
(8, 1, 3, '2026-03-01 15:00:00', '2026-03-01 15:45:00', 4, 1),
(9, 1, 3, '2026-03-08 15:00:00', '2026-03-08 15:45:00', 4, 1);

-- -----------------------------------------------------------------------------
-- 7. チケット（member@example.com と parent@example.com に付与）
-- -----------------------------------------------------------------------------

INSERT INTO tickets (id, member_id, expiry_date, is_active, used_booking_id) VALUES
-- member@example.com: 10枚（有効）
(1,  2, '2027-02-27 23:59:59', 1, NULL),
(2,  2, '2027-02-27 23:59:59', 1, NULL),
(3,  2, '2027-02-27 23:59:59', 1, NULL),
(4,  2, '2027-02-27 23:59:59', 1, NULL),
(5,  2, '2027-02-27 23:59:59', 1, NULL),
(6,  2, '2027-02-27 23:59:59', 1, NULL),
(7,  2, '2027-02-27 23:59:59', 1, NULL),
(8,  2, '2027-02-27 23:59:59', 1, NULL),
(9,  2, '2027-02-27 23:59:59', 1, NULL),
(10, 2, '2027-02-27 23:59:59', 1, NULL),
-- parent@example.com: 20枚（有効）
(11, 3, '2027-02-27 23:59:59', 1, NULL),
(12, 3, '2027-02-27 23:59:59', 1, NULL),
(13, 3, '2027-02-27 23:59:59', 1, NULL),
(14, 3, '2027-02-27 23:59:59', 1, NULL),
(15, 3, '2027-02-27 23:59:59', 1, NULL),
(16, 3, '2027-02-27 23:59:59', 1, NULL),
(17, 3, '2027-02-27 23:59:59', 1, NULL),
(18, 3, '2027-02-27 23:59:59', 1, NULL),
(19, 3, '2027-02-27 23:59:59', 1, NULL),
(20, 3, '2027-02-27 23:59:59', 1, NULL),
(21, 3, '2027-02-27 23:59:59', 1, NULL),
(22, 3, '2027-02-27 23:59:59', 1, NULL),
(23, 3, '2027-02-27 23:59:59', 1, NULL),
(24, 3, '2027-02-27 23:59:59', 1, NULL),
(25, 3, '2027-02-27 23:59:59', 1, NULL),
(26, 3, '2027-02-27 23:59:59', 1, NULL),
(27, 3, '2027-02-27 23:59:59', 1, NULL),
(28, 3, '2027-02-27 23:59:59', 1, NULL),
(29, 3, '2027-02-27 23:59:59', 1, NULL),
(30, 3, '2027-02-27 23:59:59', 1, NULL);

-- -----------------------------------------------------------------------------
-- 8. 予約サンプル（CONFIRMED）
-- -----------------------------------------------------------------------------

INSERT INTO bookings (id, participant_id, availability_id, status, tickets_consumed) VALUES
-- member@example.com の SELF participant が初心者レッスンを予約（2チケット消費）
(1, 1, 1, 'CONFIRMED', 2),
-- parent@example.com の CHILD(太郎) が初心者レッスンを予約（2チケット消費）
(2, 3, 3, 'CONFIRMED', 2),
-- parent@example.com の SELF が中級者レッスンを予約（3チケット消費）
(3, 2, 5, 'CONFIRMED', 3);

-- チケット使用履歴
INSERT INTO ticket_usages (ticket_id, member_id, booking_id, usage_type, amount, note) VALUES
(1,  2, 1, 'BOOKING', 1, '予約ID:1 チケット消費'),
(2,  2, 1, 'BOOKING', 1, '予約ID:1 チケット消費'),
(11, 3, 2, 'BOOKING', 1, '予約ID:2 チケット消費'),
(12, 3, 2, 'BOOKING', 1, '予約ID:2 チケット消費'),
(13, 3, 3, 'BOOKING', 1, '予約ID:3 チケット消費'),
(14, 3, 3, 'BOOKING', 1, '予約ID:3 チケット消費'),
(15, 3, 3, 'BOOKING', 1, '予約ID:3 チケット消費');

-- bookings に対応するチケットの used_booking_id を更新
UPDATE tickets SET used_booking_id = 1  WHERE id IN (1, 2);
UPDATE tickets SET used_booking_id = 2  WHERE id IN (11, 12);
UPDATE tickets SET used_booking_id = 3  WHERE id IN (13, 14, 15);
