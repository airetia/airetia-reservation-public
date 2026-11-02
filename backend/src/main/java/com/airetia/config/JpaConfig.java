// backend/src/main/java/com/airetia/config/JpaConfig.java
package com.airetia.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * JPA 設定
 *
 * @EnableJpaAuditing: BaseEntity の @CreatedDate / @LastModifiedDate を有効化する。
 * この設定がないと createdAt / updatedAt が null になる。
 * → 04_backend_specification.md §5 共通基底クラス
 */
@Configuration
@EnableJpaAuditing
public class JpaConfig {
    // AuditorAware は不要（ユーザー操作時刻のみ記録）
}
