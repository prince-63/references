package com.dentalstack.patient.feature.treatment.exception;

import com.dentalstack.patient.global.enums.UserType;

public class BracesNotFoundException extends RuntimeException {
    public BracesNotFoundException(Long bracesJourneyId) {
        super(String.format("Braces not found for journey %d ", bracesJourneyId));
    }

    public BracesNotFoundException(Long patientId, UserType userType) {
        super(String.format("Braces not found for %s with patientId %d ", userType, patientId));
    }
}
