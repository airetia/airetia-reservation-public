// backend/src/main/java/com/airetia/repository/CategoryRepository.java
package com.airetia.repository;

import com.airetia.domain.model.category.MajorCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * カテゴリリポジトリ
 * Phase1 では読み取り専用（管理者がDBから直接投入）。
 */
@Repository
public interface CategoryRepository extends JpaRepository<MajorCategory, Long> {

    /** 表示順でカテゴリ一覧取得 */
    List<MajorCategory> findAllByOrderByDisplayOrderAsc();
}
