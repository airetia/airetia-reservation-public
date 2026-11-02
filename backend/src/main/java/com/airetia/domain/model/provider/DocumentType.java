// backend/src/main/java/com/airetia/domain/model/provider/DocumentType.java
package com.airetia.domain.model.provider;

/**
 * 審査書類種別
 * → 01_glossary.md §3 DocumentType / 02_business_rules.md §5.1.2
 */
public enum DocumentType {
    /** 身分証明書 */
    IDENTITY,
    /** 署名済み契約書 */
    CONTRACT,
    /** 口座情報 */
    BANK_INFO
}
