package com.dentalstack.doctor.exception.organization;

import com.dentalstack.doctor.exception.BusinessErrorCode;
import com.dentalstack.doctor.exception.BusinessException;

public class OrganizationAlreadyPresentException extends BusinessException {
    public OrganizationAlreadyPresentException() {
        super(BusinessErrorCode.ORG_CONNECTED_ALREADY, "Doctor is already connected with this organization.");
    }
}
