package com.dentalstack.chat.dto.s3;

import lombok.Getter;

@Getter
public enum Feature {
    DOCTOR_PROFILE("doctor/profile"),
    PATIENT_PROFILE("patient/profile"),
    HealthCareRecord("healthCareRecord"),
    ReportBug("reportBug"),
    Faq("faq"),
    Chat("chat"),
    Blog("blog"),
    AlignerJourney("alignerJourney");

    private final String feature;

    private Feature(String feature) {
        this.feature = feature;
    }
}
