// backend/src/main/java/com/airetia/repository/InquiryRepository.java
package com.airetia.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.airetia.domain.model.inquiry.Inquiry;
import com.airetia.domain.model.inquiry.InquiryStatus;

/**
 * 問い合わせリポジトリ
 * → 03_common_specification.md §5 問い合わせ
 */
@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    Page<Inquiry> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<Inquiry> findByStatus(InquiryStatus status);
}
