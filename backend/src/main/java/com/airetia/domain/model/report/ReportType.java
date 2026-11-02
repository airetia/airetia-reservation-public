// backend/src/main/java/com/airetia/domain/model/report/ReportType.java
package com.airetia.domain.model.report;

/**
 * 報告書種別
 * → 01_glossary.md §3 ReportType / 02_business_rules.md §2.6
 */
public enum ReportType {
    /** 完了報告（サービス終了15分前〜終了24時間後）*/
    COMPLETION,
    /** 無断キャンセル報告（開始15分後〜）*/
    NO_SHOW
}
