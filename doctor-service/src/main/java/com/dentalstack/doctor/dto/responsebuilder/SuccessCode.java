package com.dentalstack.doctor.dto.responsebuilder;

public enum SuccessCode {

    // 400--> OK FAMILY CODE
    OK("200"),

    // 400--> NO CONTENT FAMILY CODE
    NO_CONTENT("204"),

    // 400--> NO FAMILY CODE
    CREATED("201");

    private String code;

    private SuccessCode(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
