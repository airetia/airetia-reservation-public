// backend/src/main/java/com/airetia/repository/AuditLogRepository.java
package com.airetia.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.airetia.domain.model.audit.AuditLog;

/**
 * 監査ログリポジトリ
 * → 02_business_rules.md §7.1「代理操作は全て監査ログに記録」
 * → V18__create_audit_logs.sql
 */
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
}
