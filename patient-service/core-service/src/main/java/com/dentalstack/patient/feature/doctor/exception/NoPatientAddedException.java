package com.dentalstack.patient.feature.doctor.exception;

import static com.dentalstack.patient.global.exception.BusinessErrorCode.APPOINTMENT_NOT_FOUND;

import com.dentalstack.patient.feature.braces.enums.BracesTreatmentStage;
import com.dentalstack.patient.global.exception.BusinessException;

public class NoPatientAddedException extends BusinessException {

    public NoPatientAddedException(long doctorId, BracesTreatmentStage bracesTreatmentStage) {
        super(
                APPOINTMENT_NOT_FOUND,
                String.format("Braces not found with this status %s for doctorId %d", bracesTreatmentStage, doctorId));
    }

    public NoPatientAddedException(long doctorId) {
        super(APPOINTMENT_NOT_FOUND, String.format("patient not found for this Id %d", doctorId));
    }
}
