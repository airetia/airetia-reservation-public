// backend/src/main/java/com/airetia/domain/model/inquiry/InquiryAttachment.java
package com.airetia.domain.model.inquiry;

import java.time.Instant;

import jakarta.persistence.*;
import lombok.*;

/**
 * 問い合わせ添付ファイルエンティティ
 * → 01_glossary.md Inquiry
 * → 02_business_rules.md §8（最大3件・10MB・JPG/PNG/PDF）
 * DB: inquiry_attachments テーブル
 */
@Entity
@Table(name = "inquiry_attachments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class InquiryAttachment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inquiry_id", nullable = false)
    private Inquiry inquiry;

    @Column(name = "s3_key", nullable = false, length = 500)
    private String s3Key;

    @Column(name = "original_filename", nullable = false, length = 255)
    private String originalFilename;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "uploaded_at", nullable = false)
    @Builder.Default
    private Instant uploadedAt = Instant.now();
}
