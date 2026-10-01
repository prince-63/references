package com.dentalstack.patient.feature.workflow.core.task_tracker.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class PatientTaskAlreadyPresentFoundException extends BusinessException {
    public PatientTaskAlreadyPresentFoundException(Long id) {
        super(BusinessErrorCode.PATIENT_TASK_NOT_FOUND, String.format("Patient task not found with id %d", id));
    }
}
