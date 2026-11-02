// backend/src/main/java/com/airetia/repository/MajorCategoryRepository.java
package com.airetia.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.airetia.domain.model.category.MajorCategory;

public interface MajorCategoryRepository extends JpaRepository<MajorCategory, Long> {
    List<MajorCategory> findByServiceType_CodeOrderByDisplayOrderAsc(String serviceTypeCode);
    Optional<MajorCategory> findByCode(String code);
}