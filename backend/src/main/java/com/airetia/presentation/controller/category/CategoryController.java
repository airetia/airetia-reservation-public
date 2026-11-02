// backend/src/main/java/com/airetia/presentation/controller/category/CategoryController.java
package com.airetia.presentation.controller.category;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.airetia.application.dto.response.common.ApiResponse;
import com.airetia.repository.MajorCategoryRepository;
import com.airetia.repository.MiddleCategoryRepository;
import com.airetia.repository.ServiceTypeRepository;
import com.airetia.repository.TagRepository;

import lombok.RequiredArgsConstructor;

/**
 * カテゴリ・タグ API（認証不要）
 * GET /api/v1/categories?serviceTypeCode=TUTORING
 *   → { majorCategories: [{ ...middleCategories }], tags }
 * GET /api/v1/categories/service-types
 *   → サービス種別一覧
 */
@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final ServiceTypeRepository    serviceTypeRepository;
    private final MajorCategoryRepository  majorCategoryRepository;
    private final MiddleCategoryRepository middleCategoryRepository;
    private final TagRepository            tagRepository;

    @GetMapping("/service-types")
    public ResponseEntity<ApiResponse<List<ServiceTypeDto>>> getServiceTypes() {
        var list = serviceTypeRepository.findAll().stream()
            .map(s -> new ServiceTypeDto(s.getId(), s.getCode(), s.getName()))
            .toList();
        return ResponseEntity.ok(ApiResponse.success("サービス種別一覧", list));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CategoryTreeDto>> getCategories(
            @RequestParam(defaultValue = "TUTORING") String serviceTypeCode) {

        var majors = majorCategoryRepository
            .findByServiceType_CodeOrderByDisplayOrderAsc(serviceTypeCode)
            .stream()
            .map(m -> new MajorCategoryDto(
                m.getId(), m.getCode(), m.getName(),
                middleCategoryRepository
                    .findByMajorCategory_IdOrderByDisplayOrderAsc(m.getId())
                    .stream()
                    .map(mid -> new MiddleCategoryDto(mid.getId(), mid.getCode(), mid.getName()))
                    .toList()
            ))
            .toList();

        var tags = tagRepository
            .findByServiceType_CodeOrderByDisplayOrderAsc(serviceTypeCode)
            .stream()
            .map(t -> new TagDto(t.getId(), t.getCode(), t.getName()))
            .toList();

        return ResponseEntity.ok(ApiResponse.success("カテゴリ一覧",
            new CategoryTreeDto(serviceTypeCode, majors, tags)));
    }

    public record ServiceTypeDto(Long id, String code, String name) {}
    public record MajorCategoryDto(Long id, String code, String name, List<MiddleCategoryDto> middleCategories) {}
    public record MiddleCategoryDto(Long id, String code, String name) {}
    public record TagDto(Long id, String code, String name) {}
    public record CategoryTreeDto(String serviceTypeCode, List<MajorCategoryDto> majorCategories, List<TagDto> tags) {}
}