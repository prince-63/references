package com.dentalstack.patient.feature.workflow.core.task_tracker.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class NoTreatmentPlanApprovedException extends BusinessException {
    public NoTreatmentPlanApprovedException() {
        super(BusinessErrorCode.NO_TREATMENT_PLAN_APPROVED, "No treatment plan approved for the patient");
    }
}
