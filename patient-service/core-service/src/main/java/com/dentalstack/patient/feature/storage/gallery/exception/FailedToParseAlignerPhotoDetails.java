package com.dentalstack.patient.feature.storage.gallery.exception;

import com.fasterxml.jackson.core.JsonProcessingException;

public class FailedToParseAlignerPhotoDetails extends RuntimeException {
    public FailedToParseAlignerPhotoDetails(String reqStr, JsonProcessingException e) {
        super(String.format(
                "Failed to parse aligner photo details, details %s, error: %s", reqStr, e.getLocalizedMessage()));
    }
}
