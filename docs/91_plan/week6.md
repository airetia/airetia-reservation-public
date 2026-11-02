Phase 4: Booking・Ticket（Week 6-7）
重要なビジネスロジック:

チケット即時消費
FIFO（有効期限の近い順）
予約上限チェック
時間重複チェック

トランザクション管理:
java@Transactional(isolation = Isolation.READ_COMMITTED)
public BookingResponse createBooking(BookingRequest request) {
    // 1. チケット残高チェック
    // 2. 予約上限チェック
    // 3. 時間重複チェック
    // 4. 予約作成
    // 5. チケット消費（FIFO）
    // 6. メール送信（非同期推奨）
}