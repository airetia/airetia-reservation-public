// backend/src/main/java/com/airetia/repository/MemberRepository.java
package com.airetia.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.airetia.domain.model.member.Member;

/**
 * メンバーリポジトリ
 * → MemberService / AuthService / MemberDetailsService で使用
 * → V1__create_members.sql
 */
@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    /** ログイン・重複チェックに使用 */
    Optional<Member> findByEmail(String email);

    /** 登録時の重複メールチェック */
    boolean existsByEmail(String email);

    /** 全メンバー一覧（管理画面用・新しい順） */
    List<Member> findAllByOrderByCreatedAtDesc();
}
