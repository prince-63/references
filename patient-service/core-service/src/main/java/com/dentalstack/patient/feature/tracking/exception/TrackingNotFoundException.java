package com.dentalstack.patient.feature.tracking.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class TrackingNotFoundException extends BusinessException {
    public TrackingNotFoundException(long treatmentPlanId) {
        super(
                BusinessErrorCode.TRACKING_NOT_FOUND,
                String.format("Tracking not found with treatment plan id %d", treatmentPlanId));
    }

    public TrackingNotFoundException() {
        super(BusinessErrorCode.TRACKING_NOT_FOUND, "No treatment found for this patient");
    }
}
