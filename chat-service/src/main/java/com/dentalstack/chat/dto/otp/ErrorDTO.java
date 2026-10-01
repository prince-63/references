package com.dentalstack.chat.dto.otp;

import com.dentalstack.chat.exception.ErrorCode;

public class ErrorDTO implements DTO {

    private ErrorCode code;
    private String message;

    public ErrorDTO() {
        super();
    }

    public ErrorDTO(ErrorCode code, String message) {
        super();
        this.code = code;
        this.message = message;
    }

    public ErrorCode getCode() {
        return code;
    }

    public void setCode(ErrorCode code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
