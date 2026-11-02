// backend/src/main/java/com/airetia/repository/NotificationSettingsRepository.java
package com.airetia.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.airetia.domain.model.member.NotificationSettings;

/**
 * 通知設定リポジトリ
 * → 02_business_rules.md §9
 */
@Repository
public interface NotificationSettingsRepository extends JpaRepository<NotificationSettings, Long> {
    Optional<NotificationSettings> findByMemberId(Long memberId);
}
