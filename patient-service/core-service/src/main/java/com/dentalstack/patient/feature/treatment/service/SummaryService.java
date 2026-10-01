package com.dentalstack.patient.feature.treatment.service;

import com.dentalstack.patient.feature.patient.dto.PatientTreatmentSummary;

public interface SummaryService {
    PatientTreatmentSummary getPatientSummaryDetails(Long patientId);
}
