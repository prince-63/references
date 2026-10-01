package com.dentalstack.patient.feature.vsp.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class VspBillingDetailsNotFoundException extends BusinessException {
    public VspBillingDetailsNotFoundException(String id) {
        super(
                BusinessErrorCode.GENERIC_EXCEPTION,
                String.format("VSP billing details not found for ID or profile ID %s", id));
    }
}
