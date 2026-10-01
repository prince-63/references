package com.dentalstack.patient.feature.appointment.exception;

import com.fasterxml.jackson.core.JsonProcessingException;

public class FailedToParseCreateAppointment extends RuntimeException {
    public FailedToParseCreateAppointment(String reqStr, JsonProcessingException e) {
        super(String.format(
                "Failed to parse create appointment request, details %s, error: %s", reqStr, e.getLocalizedMessage()));
    }
}
