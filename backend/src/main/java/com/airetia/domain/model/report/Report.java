// backend/src/main/java/com/airetia/domain/model/report/Report.java
package com.airetia.domain.model.report;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import com.airetia.domain.model.booking.Booking;
import com.airetia.domain.model.provider.Provider;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 報告書エンティティ
 * DB: reports
 * ビジネスルール §2.6
 *
 * 修正点:
 *   - @AllArgsConstructor(access = PRIVATE) 追加（@Builder + @NoArgsConstructor の組み合わせに必須）
 */
@Entity
@Table(name = "reports")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private Provider provider;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReportType reportType;

    /** 利用者へのフィードバック（公開） */
    @Column(columnDefinition = "TEXT")
    private String feedback;

    /** 利用者の特徴（全プロバイダー共有） */
    @Column(columnDefinition = "TEXT")
    private String sharedNote;

    /** 詳細メモ（報告者のみ閲覧） */
    @Column(columnDefinition = "TEXT")
    private String privateNote;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}