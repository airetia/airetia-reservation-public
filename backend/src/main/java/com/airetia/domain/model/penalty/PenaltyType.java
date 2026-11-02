// backend/src/main/java/com/airetia/domain/model/penalty/PenaltyType.java
package com.airetia.domain.model.penalty;

/**
 * ペナルティ種別
 * DB: penalties.penalty_type VARCHAR(20) NOT NULL DEFAULT 'NO_SHOW'
 * ビジネスルール §4
 */
public enum PenaltyType {
    /** 無断キャンセル（ビジネスルール §4.1） */
    NO_SHOW
}
