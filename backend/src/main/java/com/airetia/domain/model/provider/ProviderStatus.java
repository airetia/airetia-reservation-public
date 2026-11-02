// backend/src/main/java/com/airetia/domain/model/provider/ProviderStatus.java

package com.airetia.domain.model.provider;

/**
 * プロバイダー承認ステータス
 * 遷移ルール → 01_glossary.md §3 ProviderStatus / 02_business_rules.md §5.1
 */
public enum ProviderStatus {

    /** 書類アップロード待ち（初期値・再申請後の初期値） */
    PENDING_DOCUMENTS,

    /** 保留（書類不備等）→ 即時再申請可 */
    ON_HOLD,

    /** 審査中（書類3種類提出完了後に自動遷移） */
    PENDING,

    /** 承認済み */
    APPROVED,

    /** 却下 → 却下日 + 1ヶ月後に再申請可 */
    REJECTED,

    /** 一時停止 */
    SUSPENDED
}
