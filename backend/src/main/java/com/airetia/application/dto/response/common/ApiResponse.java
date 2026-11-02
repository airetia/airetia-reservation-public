// backend/src/main/java/com/airetia/application/dto/response/common/ApiResponse.java
package com.airetia.application.dto.response.common;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * 全 API 共通レスポンスラッパー
 *
 * 使用例:
 *   ApiResponse.success("取得しました", data)   // 成功 + data
 *   ApiResponse.success("削除しました")          // 成功 + data なし
 *   ApiResponse.error("エラー", "ERROR_CODE")    // エラー
 *
 * @param <T> data の型
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        boolean success,
        String message,
        T data,
        String errorCode
) {
    /** 成功（data あり）*/
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data, null);
    }

    /** 成功（data なし）*/
    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(true, message, null, null);
    }

    /** エラー（メッセージのみ）*/
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null, null);
    }

    /** エラー（エラーコードあり）*/
    public static <T> ApiResponse<T> error(String message, String errorCode) {
        return new ApiResponse<>(false, message, null, errorCode);
    }

    /** エラー（バリデーション詳細 data あり）*/
    public static <T> ApiResponse<T> errorWithData(String message, String errorCode, T data) {
        return new ApiResponse<>(false, message, data, errorCode);
    }
}