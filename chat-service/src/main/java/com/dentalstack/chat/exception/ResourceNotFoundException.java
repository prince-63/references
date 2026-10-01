package com.dentalstack.chat.exception;

public class ResourceNotFoundException extends BusinessException {
    private static final long serialVersionUID = 1L;

    public ResourceNotFoundException(ErrorCode errorCode, String description) {
        super(errorCode, description);
    }
}
