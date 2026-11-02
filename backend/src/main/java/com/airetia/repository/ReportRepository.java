// backend/src/main/java/com/airetia/repository/ReportRepository.java
package com.airetia.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.airetia.domain.model.report.Report;

/**
 * 報告書リポジトリ
 * DB: reports テーブル → V14__create_reports.sql
 * → 02_business_rules.md §2.6（完了報告 / 無断キャンセル報告）
 */
@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    /** 予約の報告書存在確認（重複作成防止） */
    boolean existsByBookingId(Long bookingId);

    /** プロバイダーの報告書一覧（新しい順） */
    List<Report> findByProvider_IdOrderByCreatedAtDesc(Long providerId);

    /** 全報告書（管理者用・新しい順） */
    @Query("SELECT r FROM Report r ORDER BY r.createdAt DESC")
    List<Report> findAllOrderByCreatedAtDesc();
}
