// backend/src/main/java/com/airetia/domain/model/offering/DeliveryMethod.java
package com.airetia.domain.model.offering;

/**
 * サービス提供形態
 * → 01_glossary.md §3 Enum定義 DeliveryMethod
 * → offerings.delivery_method カラム（VARCHAR(20)）
 */
public enum DeliveryMethod {
    ONLINE,
    IN_PERSON
}
