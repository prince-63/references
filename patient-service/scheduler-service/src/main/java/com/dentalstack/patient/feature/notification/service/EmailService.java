package com.dentalstack.patient.feature.notification.service;

public interface EmailService {
    void patientConsolidatedDetailsMail(Long doctorId);

    void patientConsolidatedDetailsMail();
}
