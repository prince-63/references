package com.dentalstack.patient.feature.order.exception;

import com.dentalstack.patient.global.enums.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class OrderException extends BusinessException {
    public OrderException(String id) {
        super(BusinessErrorCode.ORDER_NOT_FOUND, String.format("Order with id %s Not Found", id));
    }

    public OrderException() {
        super(BusinessErrorCode.ORDER_NOT_FOUND, "Order Not Found");
    }
}
