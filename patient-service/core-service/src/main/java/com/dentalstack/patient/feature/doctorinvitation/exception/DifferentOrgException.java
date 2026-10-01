package com.dentalstack.patient.feature.doctorinvitation.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class DifferentOrgException extends BusinessException {
    public DifferentOrgException() {
        super(BusinessErrorCode.DIFFERENT_ORG, "The user belongs to a different organization");
    }
}
