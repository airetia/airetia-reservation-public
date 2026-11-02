// backend/src/main/java/com/airetia/domain/model/category/MiddleCategory.java
package com.airetia.domain.model.category;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 中分類エンティティ
 * → V4__create_middle_categories.sql
 * Offering に対して任意・複数選択可（offering_middle_categories 中間テーブル）。
 */
@Entity
@Table(name = "middle_categories")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MiddleCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "major_category_id", nullable = false)
    private MajorCategory majorCategory;

    @Column(nullable = false, unique = true, length = 30)
    private String code;   // 'ENGLISH', 'MATH', 'MUSIC', ...

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() { this.createdAt = Instant.now(); }
}