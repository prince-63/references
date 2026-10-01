package com.dentalstack.patient.feature.vsp.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class VspShippingDetailsNotFoundException extends BusinessException {
    public VspShippingDetailsNotFoundException(String id) {
        super(
                BusinessErrorCode.SHIPPING_DETAILS_NOT_FOUND,
                String.format("VSP shipping details not found for ID or profile ID %s", id));
    }
}
