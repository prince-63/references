package com.dentalstack.auth.exception;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;

@AllArgsConstructor
public enum BusinessErrorCode {
    OTP_EXPIRED("AP001"),
    FAILED_TO_SEND_OTP("AP001"),

    FAILED_TO_RESET_PASSWORD("AD004"),
    OTP_NOT_SENT_TO_DOCTOR("AD007"),

    INVALID_LOGIN_METHOD("AD010"),

    // Google related
    INVALID_GOOGLE_TOKEN("AG001"),
    GOOGLE_TOKEN_VALIDATION_FAILED("AG002"),
    GOOGLE_TOKEN_EXPIRED("AG003"),

    // Apple related

    APPLE_TOKEN_EXPIRED("AA001"),
    INVALID_APPLE_TOKEN("AA002"),

    // Sign-up related
    SIGN_UP_NOT_STARTED("AS001"),
    AUTH_STAGES_NOT_COMPLETE("AS002"),
    USER_ALREADY_SIGNED_UP("AS003"),
    USER_NOT_SIGNED_UP("AS004"),
    CREDENTIAL_NOT_SET("AS005"),
    USER_SIGNED_DIFFERENT_CREDENTIALS("AS006"),

    // Login related
    LOGIN_BLOCKED("AL001"),
    LOGIN_ATTEMPTS_EXCEEDED("AL002"),
    INVALID_LOGIN_CREDENTIALS("AL003"),
    LOGGED_IN_ANOTHER_DEVICE("AL004"),
    THREE_FAILED_ATTEMPT_EXCEPTION("AL005"),
    INVALID_ORG_NAME("AL006"),

    // OTP related
    OTP_NOT_SENT("AO001"),
    INVALID_OTP("AO002"),

    // Token related
    USER_NOT_FOUND("AT001"),
    INVALID_AUTH_TYPE("AT002"),
    INVALID_TOKEN("AT003"),
    TOKEN_EXPIRED("AT004"),

    // Auth reset related
    RESET_INCOMPLETE("AR001"),
    RESET_NOT_STARTED("AR002"),
    RESET_STAGES_INCOMPLETE("AR003"),
    RESET_PASSWORD_NOT_AVAILABLE("AR004"),
    DEVICE_NOT_FOUND("DV001");

    private final String code;

    @JsonValue
    public String getCode() {
        return code;
    }
}
