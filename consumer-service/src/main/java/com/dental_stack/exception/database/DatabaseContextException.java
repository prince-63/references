package com.dental_stack.exception.database;

import com.dental_stack.exception.BaseException;

/** Exception thrown when database context or tenant is not properly set. */
public class DatabaseContextException extends BaseException {

    private static final String ERROR_CODE = "DATABASE_CONTEXT_ERROR";

    public DatabaseContextException(String message) {
        super(ERROR_CODE, message);
    }

    public DatabaseContextException(String message, Throwable cause) {
        super(ERROR_CODE, message, cause);
    }

    public static DatabaseContextException tenantNotSet() {
        return new DatabaseContextException("Tenant not set in DatabaseContextHolder");
    }
}
