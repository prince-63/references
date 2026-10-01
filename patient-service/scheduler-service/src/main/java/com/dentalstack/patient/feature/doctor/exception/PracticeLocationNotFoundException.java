package com.dentalstack.patient.feature.doctor.exception;

import com.dentalstack.patient.global.enums.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class PracticeLocationNotFoundException extends BusinessException {

    public PracticeLocationNotFoundException(long practiceLocationId) {
        super(
                BusinessErrorCode.PRACTICE_LOCATION_NOT_FOUND,
                String.format("Practice location not found with id : %s.", practiceLocationId));
    }
}
