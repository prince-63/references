package com.dentalstack.patient.feature.billing.exception;

import com.dentalstack.patient.global.enums.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class IncorrectTreatmentCostException extends BusinessException {
    public IncorrectTreatmentCostException(long treatmentId) {
        super(
                BusinessErrorCode.INCORRECT_TREATMENT_COST,
                String.format("New cost for treatment %s cannot be less than the amount paid till now", treatmentId));
    }
}
