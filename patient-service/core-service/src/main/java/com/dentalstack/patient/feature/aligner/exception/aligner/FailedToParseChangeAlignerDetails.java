package com.dentalstack.patient.feature.aligner.exception.aligner;

import com.fasterxml.jackson.core.JsonProcessingException;

public class FailedToParseChangeAlignerDetails extends RuntimeException {
    public FailedToParseChangeAlignerDetails(String reqStr, JsonProcessingException e) {
        super(String.format(
                "Failed to parse change aligner request, details %s, error: %s", reqStr, e.getLocalizedMessage()));
    }
}
