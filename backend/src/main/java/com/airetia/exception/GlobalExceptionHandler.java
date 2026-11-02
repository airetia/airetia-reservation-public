// backend/src/main/java/com/airetia/exception/GlobalExceptionHandler.java
package com.airetia.exception;

import java.util.List;
import com.airetia.exception.BusinessException;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import com.airetia.application.dto.response.common.ApiResponse;

import lombok.extern.slf4j.Slf4j;

/**
 * 全コントローラー共通の例外ハンドラー
 *
 * ※ 認証例外（BadCredentials, Disabled, Locked）は AuthExceptionHandler が担当する。
 * ※ 各 Controller は try/catch 不要。例外を throw するだけでよい。
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** バリデーションエラー（@Valid 失敗）→ 400 */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<List<FieldError>>> handleValidation(
            MethodArgumentNotValidException ex) {

        List<FieldError> errors = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> new FieldError(e.getField(), e.getDefaultMessage()))
            .collect(Collectors.toList());

        return ResponseEntity.badRequest().body(
            ApiResponse.errorWithData("入力内容に誤りがあります", "VALIDATION_ERROR", errors)
        );
    }

    /** ビジネスルール違反 → 422 */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusiness(BusinessException ex) {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(
            ApiResponse.error(ex.getMessage(), ex.getErrorCode())
        );
    }

    /** リソース不存在 → 404 */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
            ApiResponse.error(ex.getMessage(), "RESOURCE_NOT_FOUND")
        );
    }

    /** 権限不足 → 403 */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
            ApiResponse.error("この操作を行う権限がありません", "AUTH_AUTHORIZATION_FAILED")
        );
    }

    /** ファイルサイズ超過 → 413 */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleFileSize(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(
            ApiResponse.error("ファイルサイズは 10 MB 以内にしてください", "FILE_TOO_LARGE")
        );
    }

    /** 引数不正 → 400 */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(
            ApiResponse.error(ex.getMessage(), "VALIDATION_ERROR")
        );
    }

    /** 不正なステータス遷移 → 422 */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalState(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(
            ApiResponse.error(ex.getMessage(), "BUSINESS_RULE_VIOLATION")
        );
    }

    /** 予期せぬ例外 → 500 */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneral(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
            ApiResponse.error("サーバーエラーが発生しました", "SYSTEM_INTERNAL_ERROR")
        );
    }

    /** バリデーションエラー詳細 */
    public record FieldError(String field, String message) {}
}