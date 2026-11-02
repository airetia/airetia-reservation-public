// backend/src/main/java/com/airetia/repository/ServiceTypeRepository.java
package com.airetia.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.airetia.domain.model.category.ServiceType;

public interface ServiceTypeRepository extends JpaRepository<ServiceType, Long> {
    Optional<ServiceType> findByCode(String code);
}