// backend/src/main/java/com/airetia/application/dto/response/offering/OfferingResponse.java
package com.airetia.application.dto.response.offering;

import java.util.List;
import java.util.stream.Collectors;

import com.airetia.domain.model.offering.Offering;

import lombok.Builder;
import lombok.Getter;

/**
 * オファリングレスポンス DTO
 * from()       → 一覧用（推薦スコアのみ）
 * fromDetail() → 詳細用（プロバイダープロフィール含む）
 */
@Getter @Builder
public class OfferingResponse {

    private Long   id;
    private Long   providerId;
    private String providerName;

    // ── 分類 ──────────────────────────────────────────────────────────
    private String       serviceTypeCode;
    private String       serviceTypeName;
    private Long         majorCategoryId;
    private String       majorCategoryCode;
    private String       majorCategoryName;
    private List<CategoryItem> middleCategories;
    private List<CategoryItem> tags;

    // ── 詳細時のプロバイダープロフィール ──────────────────────────────
    private String       providerAppealPoint;
    private String       providerBio;
    private List<String> providerQualifications;
    private List<String> providerAchievements;
    private String       providerHighSchool;
    private String       providerUniversity;

    // ── サービス情報 ──────────────────────────────────────────────────
    private String  title;
    private String  description;
    private String  deliveryMethod;
    private Integer durationMinutes;
    private Integer ticketsRequired;
    private Integer capacity;
    private Boolean active;
    private Double  recommendScore;

    public record CategoryItem(Long id, String code, String name) {}

    /** 一覧用 */
    public static OfferingResponse from(Offering o, double score) {
        return base(o).recommendScore(score).build();
    }

    public static OfferingResponse from(Offering o) {
        return from(o, 0.0);
    }

    /** 詳細用（プロバイダープロフィール含む）*/
    public static OfferingResponse fromDetail(Offering o, double score) {
        var p = o.getProvider();
        return base(o)
            .recommendScore(score)
            .providerAppealPoint(p.getAppealPoint())
            .providerBio(p.getBio())
            .providerQualifications(p.getQualifications())
            .providerAchievements(p.getAchievements())
            .providerHighSchool(p.getHighSchool())
            .providerUniversity(p.getUniversity())
            .build();
    }

    private static OfferingResponseBuilder base(Offering o) {
        var member = o.getProvider().getMember();
        var st     = o.getServiceType();
        var major  = o.getMajorCategory();
        return OfferingResponse.builder()
            .id(o.getId())
            .providerId(o.getProvider().getId())
            .providerName(member.getLastName() + " " + member.getFirstName())
            .serviceTypeCode(st.getCode())
            .serviceTypeName(st.getName())
            .majorCategoryId(major.getId())
            .majorCategoryCode(major.getCode())
            .majorCategoryName(major.getName())
            .middleCategories(o.getMiddleCategories().stream()
                .map(m -> new CategoryItem(m.getId(), m.getCode(), m.getName()))
                .collect(Collectors.toList()))
            .tags(o.getTags().stream()
                .map(t -> new CategoryItem(t.getId(), t.getCode(), t.getName()))
                .collect(Collectors.toList()))
            .title(o.getTitle())
            .description(o.getDescription())
            .deliveryMethod(o.getDeliveryMethod().name())
            .durationMinutes(o.getDurationMinutes())
            .ticketsRequired(o.getTicketsRequired())
            .capacity(o.getCapacity())
            .active(o.isActive());
    }
}