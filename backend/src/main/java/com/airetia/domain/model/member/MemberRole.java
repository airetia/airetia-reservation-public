// backend/src/main/java/com/airetia/domain/model/member/MemberRole.java
package com.airetia.domain.model.member;

/**
 * メンバーロール
 * → 01_glossary.md §3 Enum定義 MemberRole
 *
 * ADMIN: システム管理者。メンバー機能（予約・チケット消費・Participant作成）は利用不可。
 * MEMBER: 一般メンバー。Provider/Parent 機能は条件付きで追加付与。
 */
public enum MemberRole {
    ADMIN,
    MEMBER
}
