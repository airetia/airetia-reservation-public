// backend/src/main/java/com/airetia/repository/TagRepository.java
package com.airetia.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.airetia.domain.model.category.Tag;

public interface TagRepository extends JpaRepository<Tag, Long> {
    List<Tag> findByServiceType_CodeOrderByDisplayOrderAsc(String serviceTypeCode);
    Optional<Tag> findByCode(String code);
}