package com.dentalstack.patient.feature.aligner.exception.aligner.logs;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class ActiveSessionExistsException extends BusinessException {
    public ActiveSessionExistsException(String message) {
        super(BusinessErrorCode.ALIGNER_WEAR_TIME_SESSION_EXCEPTION, message);
    }
}
