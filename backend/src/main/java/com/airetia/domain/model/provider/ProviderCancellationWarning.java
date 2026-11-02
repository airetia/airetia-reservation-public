// backend/src/main/java/com/airetia/domain/model/provider/ProviderCancellationWarning.java
package com.airetia.domain.model.provider;

import java.time.Instant;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * プロバイダー都合キャンセル警告履歴
 * DB: provider_cancellation_warnings テーブル
 * → 02_business_rules.md §3.4（累積警告: 3回→警告メール / 5回→管理者面談 / 10回以上→停止検討）
 */
@Entity
@Table(name = "provider_cancellation_warnings")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class ProviderCancellationWarning {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "provider_id", nullable = false)
    private Long providerId;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
