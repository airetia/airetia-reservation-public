// backend/src/main/java/com/airetia/domain/model/inquiry/Inquiry.java
package com.airetia.domain.model.inquiry;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import lombok.*;

import com.airetia.domain.model.common.BaseEntity;

/**
 * 問い合わせエンティティ
 * → 01_glossary.md Inquiry
 * → 02_business_rules.md §8（本文1000文字以内・添付最大3件・10MB）
 * DB: inquiries テーブル
 */
@Entity
@Table(name = "inquiries")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Inquiry extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 問い合わせ者のメールアドレス（未ログインユーザーも可） */
    @Column(nullable = false, length = 255)
    private String email;

    /** 問い合わせ者氏名 */
    @Column(length = 100)
    private String name;

    /** 件名 */
    @Column(length = 255)
    private String subject;

    /** 本文（1000文字以内） */
    @Column(nullable = false, length = 1000)
    private String body;

    /** ステータス */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private InquiryStatus status = InquiryStatus.OPEN;

    /** 添付ファイル（最大3件）*/
    @OneToMany(mappedBy = "inquiry", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<InquiryAttachment> attachments = new ArrayList<>();

    /** ステータス更新 */
    public void updateStatus(InquiryStatus newStatus) {
        this.status = newStatus;
    }
}
