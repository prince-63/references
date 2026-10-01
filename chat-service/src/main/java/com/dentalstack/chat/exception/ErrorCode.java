package com.dentalstack.chat.exception;

public enum ErrorCode {

    // 400--> BAD_REQUEST FAMILY CODE
    BAD_REQUEST("400"),
    INVALID_PARAMETER("4001"),
    CHAT_NOT_FOUND("CH0001"),

    // 401--> UNAUTHORIZED FAMILY CODE
    UNAUTHORIZED("401"),

    LIMIT_EXCEEDED("CH1001"),
    CLIENT_NOT_ACCESSIBLE("4011"),

    // 404--> NOT_FOUND FAMILTY CODE
    RESOURCE_NOT_FOUND("404"),

    GOOGLE_LOGIN_EXCEPTION("AD010"),

    // 500--> INTERNAL SERVER ERROR FAMILTY CODE
    INTERNAL_SERVER_ERROR("500"),

    OTP_EXPIRED("402"),

    OK("200"),

    SERVICE_UNAVAILABLE("503");

    private String code;

    private ErrorCode(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
