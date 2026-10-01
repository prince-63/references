package com.dentalstack.patient.feature.treatment.exception;

import com.fasterxml.jackson.core.JsonProcessingException;

public class FailedToParseCreateTreatmentPlan extends RuntimeException {
    public FailedToParseCreateTreatmentPlan(String reqStr, JsonProcessingException e) {
        super(String.format(
                "Failed to parse create treatment request, details %s, error: %s", reqStr, e.getLocalizedMessage()));
    }
}
