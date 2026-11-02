// backend/src/main/java/com/airetia/domain/model/provider/Provider.java
package com.airetia.domain.model.provider;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import com.airetia.domain.model.common.BaseEntity;
import com.airetia.domain.model.member.Member;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * プロバイダーエンティティ
 * DB定義 → V4__create_providers.sql
 * ビジネスルール → 02_business_rules.md §5
 *
 * 修正:
 *   - qualifications / achievements: @OneToMany → @JdbcTypeCode(JSON)（DBがJSON型のため）
 *   - ON_HOLD ステータス対応: onHoldReason / reapplicationAvailableAt 追加
 *   - rejectionReason を reject() メソッドで保存
 */
@Entity
@Table(name = "providers")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class Provider extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false, unique = true)
    private Member member;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ProviderStatus status = ProviderStatus.PENDING_DOCUMENTS;

    @Column(length = 255)
    private String highSchool;

    @Column(length = 255)
    private String university;

    /**
     * 保有資格（最大5件）。DB: JSON型。
     * 形式: ["資格名1", "資格名2", ...]
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    @Builder.Default
    private List<String> qualifications = new ArrayList<>();

    /**
     * 賞歴・実績（最大5件）。DB: JSON型。
     * 形式: ["実績1", "実績2", ...]
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    @Builder.Default
    private List<String> achievements = new ArrayList<>();

    @Column(length = 2000)
    private String appealPoint;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(columnDefinition = "TEXT")
    private String approvalNote;

    /** 却下理由（申請者へメール通知・画面表示） */
    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    /**
     * 保留理由・不足書類の明記（申請者へ通知）
     * ON_HOLD時に管理者が記入する
     */
    @Column(columnDefinition = "TEXT")
    private String onHoldReason;

    /**
     * 再申請可能日時
     * REJECTED → 却下日 + 1ヶ月 / ON_HOLD → NULL（即時可）
     */
    @Column
    private Instant reapplicationAvailableAt;

    @Column
    private Instant approvedAt;

    @OneToMany(mappedBy = "provider", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProviderDocument> documents = new ArrayList<>();

    // ── ドメインメソッド ──────────────────────────────────────

    /**
     * PENDING_DOCUMENTS → PENDING への自動遷移
     * IDENTITY / CONTRACT / BANK_INFO の3種類が揃った時のみ遷移
     * → 02_business_rules.md §5.1.2
     */
    public void tryTransitionToPending() {
        if (this.status != ProviderStatus.PENDING_DOCUMENTS) return;
        boolean hasIdentity = documents.stream()
            .anyMatch(d -> d.getDocumentType() == DocumentType.IDENTITY);
        boolean hasContract = documents.stream()
            .anyMatch(d -> d.getDocumentType() == DocumentType.CONTRACT);
        boolean hasBankInfo = documents.stream()
            .anyMatch(d -> d.getDocumentType() == DocumentType.BANK_INFO);
        if (hasIdentity && hasContract && hasBankInfo) {
            this.status = ProviderStatus.PENDING;
        }
    }

    /** PENDING → APPROVED（→ 02_business_rules.md §5.1.3） */
    public void approve() {
        if (this.status != ProviderStatus.PENDING) {
            throw new IllegalStateException("審査待ち（PENDING）のプロバイダーのみ承認できます。現在: " + this.status);
        }
        this.status     = ProviderStatus.APPROVED;
        this.approvedAt = Instant.now();
    }

    /**
     * PENDING → REJECTED（ON_HOLD からも却下可）
     * 再申請可能日時 = 却下日 + 1ヶ月（→ 02_business_rules.md §5.1.3）
     */
    public void reject(String reason) {
        if (this.status != ProviderStatus.PENDING && this.status != ProviderStatus.ON_HOLD) {
            throw new IllegalStateException("PENDING または ON_HOLD のプロバイダーのみ却下できます。現在: " + this.status);
        }
        this.status                    = ProviderStatus.REJECTED;
        this.rejectionReason           = reason;
        this.reapplicationAvailableAt  = Instant.now()
            .atZone(java.time.ZoneId.of("Asia/Tokyo"))
            .toLocalDate()
            .plusMonths(1)
            .atStartOfDay(java.time.ZoneId.of("Asia/Tokyo"))
            .toInstant();
    }

    /**
     * PENDING → ON_HOLD（書類不備等）
     * 再申請は即時可（reapplicationAvailableAt = null）
     * → 02_business_rules.md §5.1.3
     */
    public void putOnHold(String reason) {
        if (this.status != ProviderStatus.PENDING) {
            throw new IllegalStateException("審査待ち（PENDING）のプロバイダーのみ保留にできます。現在: " + this.status);
        }
        this.status                   = ProviderStatus.ON_HOLD;
        this.onHoldReason             = reason;
        this.reapplicationAvailableAt = null;
    }

    /** APPROVED → SUSPENDED */
    public void suspend() {
        if (this.status != ProviderStatus.APPROVED) {
            throw new IllegalStateException("承認済み（APPROVED）のプロバイダーのみ停止できます。現在: " + this.status);
        }
        this.status = ProviderStatus.SUSPENDED;
    }

    /** SUSPENDED → APPROVED */
    public void unsuspend() {
        if (this.status != ProviderStatus.SUSPENDED) {
            throw new IllegalStateException("停止中（SUSPENDED）のプロバイダーのみ解除できます。現在: " + this.status);
        }
        this.status = ProviderStatus.APPROVED;
    }

    /** プロフィール更新（APPROVED状態のみ） */
    public void updateProfile(String highSchool, String university,
                               String appealPoint, String bio,
                               List<String> qualifications, List<String> achievements) {
        if (highSchool != null)     this.highSchool     = highSchool;
        if (university != null)     this.university     = university;
        if (appealPoint != null)    this.appealPoint    = appealPoint;
        if (bio != null)            this.bio            = bio;
        if (qualifications != null) this.qualifications = qualifications;
        if (achievements != null)   this.achievements   = achievements;
    }
}