package com.dentalstack.patient.feature.order.projection;

import com.dentalstack.patient.feature.order.enums.OrderStatus;

public interface OrderSummary {
    String getId();

    String getStatus();

    Long getPatientId();

    String getOrderId();

    OrderStatus getOrderStatus();

    Long getTreatmentPlanCount();
}
