// backend/src/main/java/com/airetia/exception/ResourceNotFoundException.java
package com.airetia.exception;

/**
 * リソース不存在例外（HTTP 404）
 * → GlobalExceptionHandler で ResponseEntity 404 に変換
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
