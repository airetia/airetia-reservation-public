// backend/src/main/java/com/airetia/repository/MiddleCategoryRepository.java
package com.airetia.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.airetia.domain.model.category.MiddleCategory;

public interface MiddleCategoryRepository extends JpaRepository<MiddleCategory, Long> {
    List<MiddleCategory> findByMajorCategory_IdOrderByDisplayOrderAsc(Long majorCategoryId);
    Optional<MiddleCategory> findByCode(String code);
}