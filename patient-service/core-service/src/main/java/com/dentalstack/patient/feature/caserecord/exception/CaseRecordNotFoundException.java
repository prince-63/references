package com.dentalstack.patient.feature.caserecord.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class CaseRecordNotFoundException extends BusinessException {
    public CaseRecordNotFoundException(long caseRecordId) {
        super(BusinessErrorCode.CASE_RECORD_NOT_FOUND, String.format("Case record not found for id %s", caseRecordId));
    }
}
