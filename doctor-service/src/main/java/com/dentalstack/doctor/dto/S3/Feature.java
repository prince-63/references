package com.dentalstack.doctor.dto.S3;

import lombok.Getter;

@Getter
public enum Feature {
    DOCTOR_PROFILE("doctor/profile"),
    BILLING_PROFILE("billing/profile"),
    DOCTOR_ACCOUNT_PROFILE("doctor/profile"),
    DOCTOR_ACCOUNT_DISPLAY_PROFILE("doctor/display/profile"),
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
