// backend/src/main/java/com/airetia/domain/model/ticket/UsageType.java
package com.airetia.domain.model.ticket;

/**
 * チケット使用種別
 * → 01_glossary.md §3 UsageType
 */
public enum UsageType {
    /** 予約消費 */
    BOOKING,
    /** キャンセル返還 */
    REFUND,
    /** 管理者手動調整 */
    ADJUSTMENT
}
