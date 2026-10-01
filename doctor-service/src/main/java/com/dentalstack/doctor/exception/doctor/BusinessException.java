package com.dentalstack.doctor.exception.doctor;

public class BusinessException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    protected String description;
    protected ErrorCode errorcode;

    public BusinessException(ErrorCode errorCode, String description) {
        super(errorCode.name());
        this.description = description;
        this.errorcode = errorCode;
    }

    public ErrorCode getErrorCode() {
        return errorcode;
    }

    public String getDescription() {
        return description;
    }
}
