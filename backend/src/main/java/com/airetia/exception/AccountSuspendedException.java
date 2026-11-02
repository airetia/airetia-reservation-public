// backend/src/main/java/com/airetia/exception/AccountSuspendedException.java
package com.airetia.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * アカウント停止中例外
 * → 02_business_rules.md §4.3（利用停止の範囲）
 * → 03_common_specification.md §6 AUTH_ACCOUNT_SUSPENDED (403)
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class AccountSuspendedException extends BusinessException {

    public AccountSuspendedException(String message) {
        super(message, "AUTH_ACCOUNT_SUSPENDED");
    }
}