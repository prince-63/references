package com.dentalstack.patient.feature.invitation.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class BracesPatientFoundException extends BusinessException {
    public BracesPatientFoundException(String name) {
        super(BusinessErrorCode.BRACE_PATIENT_FOUND, String.format("Patient %s already added in braces app", name));
    }
}
