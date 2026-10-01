package com.dentalstack.doctor.exception.billing;

import com.fasterxml.jackson.core.JsonProcessingException;

public class FailedToParseCreateBillingException extends RuntimeException {
    public FailedToParseCreateBillingException(String reqStr, JsonProcessingException e) {
        super(String.format(
                "Failed to parse create billing request, details %s, error: %s", reqStr, e.getLocalizedMessage()));
    }
}
