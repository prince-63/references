package com.dentalstack.patient.feature.workflow.core.task_tracker.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class NoActivePlanForRevisionException extends BusinessException {
    public NoActivePlanForRevisionException() {
        super(BusinessErrorCode.NO_ACTIVE_PLAN_REVISION, "At least one active plan is required to move to IN REVISION");
    }

    public NoActivePlanForRevisionException(BusinessErrorCode errorCode) {
        super(errorCode, "At least one active plan is required to move to PLANNING DONE");
    }
}
