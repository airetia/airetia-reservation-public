// backend/src/main/java/com/airetia/application/dto/request/offering/OfferingRequest.java
package com.airetia.application.dto.request.offering;

import java.util.Set;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.airetia.domain.model.offering.DeliveryMethod;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * オファリング作成・更新リクエスト
 * → 03_common_specification.md §7 バリデーション
 */
@Getter @Setter @NoArgsConstructor
public class OfferingRequest {

    /** 管理者代理作成時に指定（プロバイダー自身は不要）*/
    private Long providerId;

    @NotNull(message = "サービス種別を選択してください")
    private String serviceTypeCode;   // 'TUTORING' 等

    @NotNull(message = "大分類を選択してください")
    private String majorCategoryCode; // 'STUDY', 'SPORTS' 等

    /** 中分類コード（任意・複数）*/
    private Set<String> middleCategoryCodes;

    /** タグコード（任意・複数）*/
    private Set<String> tagCodes;

    @NotBlank(message = "タイトルを入力してください")
    @Size(max = 255)
    private String title;

    @Size(max = 1000)
    private String description;

    @NotNull(message = "提供形式を選択してください")
    private DeliveryMethod deliveryMethod;

    @NotNull @Min(15) @Max(120)
    private Integer durationMinutes;

    @NotNull @Min(1)
    private Integer ticketsRequired;

    @NotNull @Min(1) @Max(15)
    private Integer capacity;
}