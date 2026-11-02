// backend/src/main/java/com/airetia/domain/rule/AdminAccessRule.java
package com.airetia.domain.rule;

import org.springframework.stereotype.Component;
import com.airetia.domain.model.member.Member;
import com.airetia.domain.model.member.MemberRole;
import com.airetia.exception.BusinessException;

/**
 * 管理者によるメンバー機能利用禁止チェック
 * → 04_backend_specification.md §4.4
 * → 02_business_rules.md §7.1（禁止事項）
 *
 * 各 Service メソッドの冒頭で呼び出す。
 * Admin は予約・チケット消費・Participant 作成などメンバー専用機能は利用不可。
 *
 * 設計注記: MemberDetails（infrastructure）ではなく Member（domain）を受け取ることで
 * domain → infrastructure の逆依存を回避する。
 * 呼び出し元 Service は MemberDetails.getMember() を渡すこと。
 */
@Component
public class AdminAccessRule {

    /**
     * ADMIN ロールによるメンバー機能利用を禁止する。
     * @param member 操作を行うメンバーエンティティ
     * @throws BusinessException ADMIN が呼び出した場合
     */
    public void denyIfAdmin(Member member) {
        if (member.getRole() == MemberRole.ADMIN) {
            throw new BusinessException(
                "管理者アカウントはこの機能を使用できません",
                "AUTH_ADMIN_MEMBER_FEATURE_FORBIDDEN"
            );
        }
    }
}
