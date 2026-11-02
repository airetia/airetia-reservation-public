// backend/src/main/java/com/airetia/domain/model/provider/ProviderAchievement.java
package com.airetia.domain.model.provider;

import jakarta.persistence.*;
import lombok.*;

/**
 * プロバイダー賞歴・実績
 * ビジネスルール §5.1.1: 最大5件、各255文字以内
 */
@Entity
@Table(name = "provider_achievements")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class ProviderAchievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private Provider provider;

    @Column(nullable = false, length = 255)
    private String achievement;

    @Column(nullable = false)
    private int sortOrder;
}
