package com.dentalstack.patient.feature.treatment.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class ActiveTreatmentPlanFoundException extends BusinessException {

    public ActiveTreatmentPlanFoundException(long treatmentPlanId) {
        super(
                BusinessErrorCode.ACTIVE_TREATMENT_PLAN_FOUND,
                String.format(
                        "Patient already has an active treatment plan with id : %s."
                                + " Complete or deactivate the existing plan before creating a new one. ",
                        treatmentPlanId));
    }

    public ActiveTreatmentPlanFoundException(String treatmentPlanName) {
        super(
                BusinessErrorCode.DUPLICATE_NAME_FOUND,
                String.format("Patient already has an treatment plan with name : %s.", treatmentPlanName));
    }
}
