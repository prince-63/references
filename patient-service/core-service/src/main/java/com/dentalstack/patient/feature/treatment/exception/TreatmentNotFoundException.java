package com.dentalstack.patient.feature.treatment.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class TreatmentNotFoundException extends BusinessException {
    public TreatmentNotFoundException(long patientId, long doctorId) {
        super(
                BusinessErrorCode.TREATMENT_NOT_FOUND,
                String.format("Treatment not found created by doctor %s for patient %s", doctorId, patientId));
    }

    public TreatmentNotFoundException() {
        super(BusinessErrorCode.TREATMENT_NOT_FOUND, "Treatment not found created by doctor");
    }

    public TreatmentNotFoundException(Long patientId) {
        super(BusinessErrorCode.TREATMENT_NOT_FOUND, "Treatment plan does not contain orders for patient " + patientId);
    }
}
