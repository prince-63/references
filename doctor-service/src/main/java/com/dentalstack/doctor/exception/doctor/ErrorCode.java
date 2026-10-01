package com.dentalstack.doctor.exception.doctor;

public enum ErrorCode {

    // 400--> BAD_REQUEST FAMILY CODE
    BAD_REQUEST("400"),
    INVALID_PARAMETER("4001"),

    // 401--> UNAUTHORIZED FAMILY CODE
    UNAUTHORIZED("401"),
    CLIENT_NOT_ACCESSIBLE("4011"),

    // 404--> NOT_FOUND FAMILTY CODE
    RESOURCE_NOT_FOUND("404"),

    // 500--> INTERNAL SERVER ERROR FAMILTY CODE
    INTERNAL_SERVER_ERROR("500"),

    GOOGLE_LOGIN_EXCEPTION("AD010"),

    OK("200"),

    INVALID_IMAGE_FORMAT("IM0001"),

    REQUEST_BODY_MISMATCH("R0001"),

    SERVICE_UNAVAILABLE("503"),
    // practice location related
    DUPLICATE_PRACTICE_LOCATION("PL0001"),
    DUPLICATE_ADDRESS("PL0002"),
    PRACTICE_LOCATION_NOT_FOUND("PL0003"),
    GIVEN_PASSWORD_IS_WRONG("AL002"),
    USER_NOT_FOUND_WITH_EMAIL("AS004");

    private String code;

    private ErrorCode(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
