package com.dentalstack.patient.global.exception;

import com.fasterxml.jackson.core.JsonProcessingException;

public class FailedToParse extends RuntimeException {
    public FailedToParse(String reqStr, JsonProcessingException e) {
        super(String.format("Failed to parse request, details %s, error: %s", reqStr, e.getLocalizedMessage()));
    }
}
