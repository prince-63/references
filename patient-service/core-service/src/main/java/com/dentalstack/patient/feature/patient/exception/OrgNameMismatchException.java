package com.dentalstack.patient.feature.patient.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class OrgNameMismatchException extends BusinessException {
    public OrgNameMismatchException(String orgName) {
        super(BusinessErrorCode.ORG_NAME_MISMATCH, "Organization name mismatch. Expected: " + orgName);
    }
}
