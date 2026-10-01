package com.dentalstack.patient.feature.order.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class ShippingDetailsNotFoundException extends BusinessException {
    public ShippingDetailsNotFoundException(Long shippingId) {
        super(
                BusinessErrorCode.SHIPPING_DETAILS_NOT_FOUND,
                String.format("Shipping details not found for shipping ID or profile ID %d", shippingId));
    }
}
