package com.dentalstack.chat.exception;

public class InvalidRequestException extends BusinessException {
    private static final long serialVersionUID = 1L;

    public InvalidRequestException(ErrorCode errorCode, String description) {
        super(errorCode, description);
    }
}
