package com.dentalstack.patient.feature.order.service;

import com.dentalstack.patient.feature.patient.entity.Patient;

public interface ManufacturingNotificationService {

    void notificationForManufacturingInTransit(Patient patient, String email, String orderId);

    void notificationForManufacturingAlignerDelivered(Patient patient, String email, String orderId);
}
