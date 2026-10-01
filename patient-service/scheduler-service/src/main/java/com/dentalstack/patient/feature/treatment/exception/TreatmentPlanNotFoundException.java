package com.dentalstack.patient.feature.treatment.exception;

import com.dentalstack.patient.global.enums.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class TreatmentPlanNotFoundException extends BusinessException {
    public TreatmentPlanNotFoundException(long treatmentPlanId) {
        super(
                BusinessErrorCode.TREATMENT_PLAN_NOT_FOUND,
                String.format("Treatment plan not found with id %d", treatmentPlanId));
    }

    public TreatmentPlanNotFoundException() {
        super(BusinessErrorCode.TREATMENT_PLAN_NOT_FOUND, "Treatment plan not found because id is null");
    }
}
