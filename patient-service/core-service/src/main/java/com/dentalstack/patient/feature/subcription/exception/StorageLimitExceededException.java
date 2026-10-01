package com.dentalstack.patient.feature.subcription.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class StorageLimitExceededException extends BusinessException {
    public StorageLimitExceededException(Long doctorId) {
        super(BusinessErrorCode.STORAGE_LIMIT_EXCEEDED, "Storage limit exceeded for doctorId: " + doctorId);
    }
}
