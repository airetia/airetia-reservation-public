// backend/src/main/java/com/airetia/application/service/AuditLogService.java
package com.airetia.application.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.airetia.domain.model.audit.AuditLog;
import com.airetia.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 監査ログサービス
 * → コントローラーレイヤーから直接 Repository を使用しないようにラップ
 * → 02_business_rules.md §7.1 代理操作は全て監査ログに記録される
 *
 * 修正: AuditLog.builder() → AuditLog.of() に変更。
 *   builder() では createdAt を設定しないため
 *   "Column 'created_at' cannot be null" が発生していた。
 *   AuditLog.of() は内部で Instant.now() をセットする。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void record(Long adminId, String action, String targetType, Long targetId, String note) {
        // 修正: builder() → of()（createdAt = Instant.now() を自動設定）
        auditLogRepository.save(AuditLog.of(adminId, action, targetType, targetId, note));
        log.debug("[AuditLog] adminId={} action={} targetType={} targetId={}", adminId, action, targetType, targetId);
    }

    @Transactional
    public void record(Long adminId, String action, String targetType, Long targetId) {
        record(adminId, action, targetType, targetId, null);
    }
}