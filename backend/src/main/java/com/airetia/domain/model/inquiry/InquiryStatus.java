// backend/src/main/java/com/airetia/domain/model/inquiry/InquiryStatus.java
package com.airetia.domain.model.inquiry;

/**
 * 問い合わせステータス
 * → 01_glossary.md InquiryStatus
 */
public enum InquiryStatus {
    OPEN,        // 未対応
    IN_PROGRESS, // 対応中
    RESOLVED,    // 解決済み
    CLOSED       // クローズ
}
