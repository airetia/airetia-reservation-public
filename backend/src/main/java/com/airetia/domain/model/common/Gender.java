// backend/src/main/java/com/airetia/domain/model/common/Gender.java
package com.airetia.domain.model.common;

/**
 * 性別 Enum
 * → 01_glossary.md §3 Enum定義 Gender
 * Member.gender / Participant.gender で使用（共有のため common パッケージに配置）
 */
public enum Gender {
    MALE,
    FEMALE,
    OTHER
}