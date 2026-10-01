package com.dentalstack.patient.feature.workflow.core.task_tracker.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class NoTreatmentPlanAvailableException extends BusinessException {
    public NoTreatmentPlanAvailableException() {
        super(
                BusinessErrorCode.NO_TREATMENT_PLAN_AVAILABLE,
                "No treatment plan available. Please create a new plan to proceed");
    }
}
