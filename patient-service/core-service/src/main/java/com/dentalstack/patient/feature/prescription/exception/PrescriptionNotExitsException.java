package com.dentalstack.patient.feature.prescription.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class PrescriptionNotExitsException extends RuntimeException {
    public PrescriptionNotExitsException(Long prescriptionId) {
        super("Prescription with ID " + prescriptionId + " does not exist.");
    }
}
