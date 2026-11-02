package com.airetia.application.dto.response.common;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * API共通エラーレスポンス形式
 * 
 * 使用例:
 * return ErrorResponse.of("VALIDATION_ERROR", "入力エラー", errors);
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    
    /**
     * 成功フラグ（常にfalse）
     */
    private boolean success;
    
    /**
     * エラーコード（例: VALIDATION_ERROR, INSUFFICIENT_TICKETS）
     */
    private String errorCode;
    
    /**
     * エラーメッセージ
     */
    private String message;
    
    /**
     * 詳細エラー情報のリスト
     */
    @Builder.Default
    private List<ErrorDetail> errors = new ArrayList<>();
    
    /**
     * タイムスタンプ（UTC）
     */
    private Instant timestamp;
    
    /**
     * エラーレスポンスを生成
     */
    public static ErrorResponse of(String errorCode, String message, List<ErrorDetail> errors) {
        return ErrorResponse.builder()
                .success(false)
                .errorCode(errorCode)
                .message(message)
                .errors(errors != null ? errors : new ArrayList<>())
                .timestamp(Instant.now())
                .build();
    }
    
    /**
     * エラーレスポンスを生成（詳細なし）
     */
    public static ErrorResponse of(String errorCode, String message) {
        return of(errorCode, message, null);
    }
    
    /**
     * 個別エラー詳細
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorDetail {
        
        /**
         * エラーが発生したフィールド名（バリデーションエラー時）
         */
        private String field;
        
        /**
         * エラーコード（詳細）
         */
        private String code;
        
        /**
         * エラーメッセージ
         */
        private String message;
    }
}