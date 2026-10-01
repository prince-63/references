package com.dentalstack.doctor.exception;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;

@AllArgsConstructor
public enum BusinessErrorCode {
    ORG_CONNECTED_ALREADY("OR0001"),
    INVITATION_ALREADY_PRESENT("IN0001"),
    INVITATION_EXPIRED("IN0002"),

    BILLING_NOT_FOUND("BL0001"),
    BILLING_ALREADY_PRESENT("BL0002"),
    BAD_INVITATION_REQUEST("IN0002"),
    INVITATION_EMAIL_USED_BY_PATIENT("IN0005"),
    INVITATION_MOBILE_USED_BY_PATIENT("IN0006"),

    INVITATION_ALREADY_PRESENT_EMAIL("IN0003"),

    INVITATION_ALREADY_PRESENT_MOBILE("IN0004"),
    FILE_LIMIT_EXCEEDED("FL0001"),
    DIFFERENT_ORG("ORG0002"),
    GENERIC_EXCEPTION("GE0001"),
    PASSWORD_IS_WRONG("AL002"),
    USER_NOT_FOUND_WITH_EMAIL("AS004");
    ;

    private final String code;

    @JsonValue
    public String getCode() {
        return code;
    }
}
