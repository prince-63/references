package com.dentalstack.doctor.exception.organization;

import com.dentalstack.doctor.exception.BusinessErrorCode;
import com.dentalstack.doctor.exception.BusinessException;

public class DifferentOrgException extends BusinessException {
    public DifferentOrgException() {
        super(BusinessErrorCode.DIFFERENT_ORG, "The user belongs to a different organization");
    }
}
