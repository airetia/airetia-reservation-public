// backend/src/main/java/com/airetia/exception/BusinessException.java
package com.airetia.exception;

/**
 * ビジネスルール違反例外（HTTP 422）
 * → 03_common_specification.md §6 エラーコード定義
 *
 * エラーコード付きコンストラクタを追加。
 * GlobalExceptionHandler で errorCode を ErrorResponse に含めて返す。
 */
public class BusinessException extends RuntimeException {

    private final String errorCode;

    /** メッセージのみ（エラーコード = "BUSINESS_RULE_VIOLATION） */
    public BusinessException(String message) {
        super(message);
        this.errorCode = "BUSINESS_RULE_VIOLATION";
    }

    /** メッセージ + エラーコード */
    public BusinessException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
