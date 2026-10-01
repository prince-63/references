package com.dentalstack.patient.feature.caserecord.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class CaseRecordAlreadyExistsException extends BusinessException {
    public CaseRecordAlreadyExistsException(long patientId) {
        super(
                BusinessErrorCode.CASE_RECORD_ALREADY_EXISTS,
                String.format("Case record already exists for patient %s", patientId));
    }
}
