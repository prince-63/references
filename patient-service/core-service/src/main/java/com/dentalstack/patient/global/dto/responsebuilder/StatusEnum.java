package com.dentalstack.patient.global.dto.responsebuilder;

public enum StatusEnum {
    SUCCESS("Success"),
    FAILURE("Failure"),
    ERROR("Error");

    private String value;

    StatusEnum(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
