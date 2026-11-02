// backend/src/main/java/com/airetia/application/dto/response/common/PageResponse.java
package com.airetia.application.dto.response.common;

import java.util.List;

import org.springframework.data.domain.Page;

import lombok.Getter;

/**
 * ページネーションレスポンス共通ラッパー
 * → 03_common_specification.md §4 PageResponse
 *
 * 使用例:
 *   PageResponse<MemberResponse> res = PageResponse.of(page);
 *   return ApiResponse.success("取得しました", res);
 */
@Getter
public class PageResponse<T> {

    private final List<T> content;
    private final PageMeta page;

    private PageResponse(List<T> content, PageMeta page) {
        this.content = content;
        this.page    = page;
    }

    /** Spring Data の Page オブジェクトから変換 */
    public static <T> PageResponse<T> of(Page<T> page) {
        return new PageResponse<>(
            page.getContent(),
            new PageMeta(
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
            )
        );
    }

    @Getter
    public static class PageMeta {
        /** 現在ページ番号（0始まり） */
        private final int  number;
        private final int  size;
        private final long totalElements;
        private final int  totalPages;

        PageMeta(int number, int size, long totalElements, int totalPages) {
            this.number        = number;
            this.size          = size;
            this.totalElements = totalElements;
            this.totalPages    = totalPages;
        }
    }
}
