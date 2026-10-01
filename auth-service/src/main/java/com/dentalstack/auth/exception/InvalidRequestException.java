package com.dentalstack.auth.exception;

public class InvalidRequestException extends BusinessException {
    private static final long serialVersionUID = 1L;

    public InvalidRequestException(BusinessErrorCode businessErrorCode, String description) {
        super(businessErrorCode, description);
    }
}
