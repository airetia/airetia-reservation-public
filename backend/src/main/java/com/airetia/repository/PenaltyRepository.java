// backend/src/main/java/com/airetia/repository/PenaltyRepository.java
package com.airetia.repository;

import java.time.Instant;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.airetia.domain.model.penalty.Penalty;

/**
 * ペナルティリポジトリ
 * → 02_business_rules.md §4（ペナルティルール）
 * → 06_infrastructure.md §2.2（penalties テーブル）
 *
 * ★ @Transactional をメソッドレベルに付けない。
 *   Spring Data JPA が JpaRepository 基底で既に付与するため、
 *   Spring Boot 3.2.x / Java 17 では AnnotationFormatError: Duplicate annotation になる。
 *   @Modifying メソッドのトランザクションは呼び出し元（BatchConfig / Service）が担保する。
 */
@Repository
public interface PenaltyRepository extends JpaRepository<Penalty, Long> {

    /** 参加者の有効ペナルティ一覧（要注意マーク表示用） */
    List<Penalty> findByParticipantIdAndActiveTrue(Long participantId);

    /** 参加者の全ペナルティ一覧（新しい順、管理画面用） */
    List<Penalty> findByParticipantIdOrderByCreatedAtDesc(Long participantId);

    /** メンバー配下の全参加者ペナルティ一覧（AdminMembersPage ペナルティ管理用） */
    @Query("SELECT p FROM Penalty p WHERE p.participant.member.id = :memberId ORDER BY p.createdAt DESC")
    List<Penalty> findByParticipantMemberIdOrderByCreatedAtDesc(@Param("memberId") Long memberId);

    /** 全ペナルティ一覧（管理者用・新しい順） */
    @Query("SELECT p FROM Penalty p ORDER BY p.createdAt DESC")
    List<Penalty> findAllOrderByCreatedAtDesc();

    /**
     * 指定参加者の有効ペナルティ数（3ヶ月以内）
     * → §4.1: 有効期間 = 付与日時 + 3ヶ月
     */
    @Query("""
        SELECT COUNT(p) FROM Penalty p
        WHERE p.participant.id = :participantId
          AND p.active = true
          AND p.expiresAt > :now
        """)
    long countActiveByParticipantId(
        @Param("participantId") Long participantId,
        @Param("now")           Instant now
    );

    /**
     * 期限切れペナルティを一括無効化
     * → BatchConfig PenaltyExpiryBatch（毎日 1:00 JST）
     * → §4.1 有効期間
     *
     * @Transactional は付けない（重複エラー回避）。
     * BatchConfig.PenaltyExpiryBatch で @Transactional を付けて呼び出すこと。
     */
    @Modifying
    @Query("UPDATE Penalty p SET p.active = false WHERE p.active = true AND p.expiresAt <= :now")
    int deactivateExpired(@Param("now") Instant now);
}
