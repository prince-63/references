package com.dentalstack.patient.feature.blog.exception;

import com.fasterxml.jackson.core.JsonProcessingException;

public class FailedToParseBlogDetails extends RuntimeException {
    public FailedToParseBlogDetails(String reqStr, JsonProcessingException e) {
        super(String.format("Failed to parse blog details, details %s, error: %s", reqStr, e.getLocalizedMessage()));
    }
}
