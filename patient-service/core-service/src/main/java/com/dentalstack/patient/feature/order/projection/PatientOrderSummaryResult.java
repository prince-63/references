package com.dentalstack.patient.feature.order.projection;

public interface PatientOrderSummaryResult {
    Long getPatientId();

    Long getOrderCount();

    String getCustomerName();
}
