// backend/src/main/java/com/airetia/domain/model/offering/Offering.java
package com.airetia.domain.model.offering;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import com.airetia.domain.model.category.MajorCategory;
import com.airetia.domain.model.category.MiddleCategory;
import com.airetia.domain.model.category.ServiceType;
import com.airetia.domain.model.category.Tag;
import com.airetia.domain.model.common.BaseEntity;
import com.airetia.domain.model.provider.Provider;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * オファリング（サービス）エンティティ
 * → V9__create_offerings.sql / V10 / V11
 *
 * 分類構造:
 *   serviceType      必須・1つ（TUTORING 等）
 *   majorCategory    必須・1つ（勉強 / スポーツ / 芸術 / その他）
 *   middleCategories 任意・複数（英語・数学 等）
 *   tags             任意・複数（受験・補習・資格 等）
 */
@Entity
@Table(name = "offerings")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Offering extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private Provider provider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_type_id", nullable = false)
    private ServiceType serviceType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "major_category_id", nullable = false)
    private MajorCategory majorCategory;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "offering_middle_categories",
        joinColumns        = @JoinColumn(name = "offering_id"),
        inverseJoinColumns = @JoinColumn(name = "middle_category_id")
    )
    private Set<MiddleCategory> middleCategories = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "offering_tags",
        joinColumns        = @JoinColumn(name = "offering_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_method", nullable = false, length = 20)
    private DeliveryMethod deliveryMethod;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "tickets_required", nullable = false)
    private Integer ticketsRequired;

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private boolean active = true;

    @Builder
    public Offering(Provider provider, ServiceType serviceType, MajorCategory majorCategory,
                    Set<MiddleCategory> middleCategories, Set<Tag> tags,
                    String title, String description, DeliveryMethod deliveryMethod,
                    Integer durationMinutes, Integer ticketsRequired, Integer capacity) {
        this.provider         = provider;
        this.serviceType      = serviceType;
        this.majorCategory    = majorCategory;
        this.middleCategories = middleCategories != null ? middleCategories : new HashSet<>();
        this.tags             = tags             != null ? tags             : new HashSet<>();
        this.title            = title;
        this.description      = description;
        this.deliveryMethod   = deliveryMethod;
        this.durationMinutes  = durationMinutes;
        this.ticketsRequired  = ticketsRequired;
        this.capacity         = capacity;
    }

    public void update(String title, String description, DeliveryMethod deliveryMethod,
                       Integer durationMinutes, Integer ticketsRequired, Integer capacity,
                       MajorCategory majorCategory,
                       Set<MiddleCategory> middleCategories, Set<Tag> tags) {
        this.title            = title;
        this.description      = description;
        this.deliveryMethod   = deliveryMethod;
        this.durationMinutes  = durationMinutes;
        this.ticketsRequired  = ticketsRequired;
        this.capacity         = capacity;
        this.majorCategory    = majorCategory;
        this.middleCategories = middleCategories != null ? middleCategories : new HashSet<>();
        this.tags             = tags             != null ? tags             : new HashSet<>();
    }

    public void deactivate() { this.active = false; }
}