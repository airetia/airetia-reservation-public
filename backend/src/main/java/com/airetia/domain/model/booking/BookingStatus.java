// backend/src/main/java/com/airetia/domain/model/booking/BookingStatus.java
package com.airetia.domain.model.booking;

/**
 * 予約ステータス
 * → 01_glossary.md §3 BookingStatus
 */
public enum BookingStatus {
    /** リクエスト（未確定）*/
    PENDING,
    /** 予約確定 */
    CONFIRMED,
    /** 完了 */
    COMPLETED,
    /** 利用者都合キャンセル */
    CANCELLED_BY_USER,
    /** 提供者都合キャンセル */
    CANCELLED_BY_PROVIDER,
    /** 無断キャンセル */
    NO_SHOW
}
