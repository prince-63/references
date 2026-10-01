package com.dentalstack.patient.feature.patient.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class AlreadyExistingPatientOverviewNotAvailableException extends BusinessException {
    public AlreadyExistingPatientOverviewNotAvailableException() {
        super(
                BusinessErrorCode.ALREADY_EXISTING_PATIENT_OVERVIEW_NOT_AVAILABLE,
                "No overview available for existing type patient");
    }
}
