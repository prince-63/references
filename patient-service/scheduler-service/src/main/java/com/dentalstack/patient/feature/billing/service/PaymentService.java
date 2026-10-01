package com.dentalstack.patient.feature.billing.service;

import com.dentalstack.patient.feature.treatment.entity.Treatment;

public interface PaymentService {
    Treatment getTreatment(long patientId, long doctorId);

    void paymentReminder();
}
