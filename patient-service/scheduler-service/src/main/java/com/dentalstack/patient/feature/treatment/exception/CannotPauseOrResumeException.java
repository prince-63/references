package com.dentalstack.patient.feature.treatment.exception;

import com.dentalstack.patient.feature.tracking.enums.Status;
import com.dentalstack.patient.global.enums.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class CannotPauseOrResumeException extends BusinessException {

    public CannotPauseOrResumeException() {
        super(BusinessErrorCode.CAN_NOT_PAUSE_RESUME, "Draft status treatment can't be paused");
    }

    public CannotPauseOrResumeException(Status status) {
        super(BusinessErrorCode.CAN_NOT_PAUSE_RESUME, String.format("The treatment is already in %s status", status));
    }
}
