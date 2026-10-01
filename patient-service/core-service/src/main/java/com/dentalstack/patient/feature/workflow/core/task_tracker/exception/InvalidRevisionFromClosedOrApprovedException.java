package com.dentalstack.patient.feature.workflow.core.task_tracker.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class InvalidRevisionFromClosedOrApprovedException extends BusinessException {
    public InvalidRevisionFromClosedOrApprovedException() {
        super(
                BusinessErrorCode.INVALID_REVISION_FROM_CLOSED_OR_APPROVED,
                "Cannot move to IN REVISION from CLOSED or APPROVED status");
    }
}
