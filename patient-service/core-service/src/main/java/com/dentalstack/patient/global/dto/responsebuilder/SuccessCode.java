package com.dentalstack.patient.global.dto.responsebuilder;

public enum SuccessCode {
    OK("200"),

    NO_CONTENT("204"),

    CREATED("201");

    private final String code;

    SuccessCode(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
