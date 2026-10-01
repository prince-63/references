package com.dentalstack.patient.feature.workflow.pre_treatment.service;

import com.dentalstack.patient.feature.workflow.pre_treatment.dto.PatientPreTreatmentRequest;
import com.dentalstack.patient.feature.workflow.pre_treatment.dto.PatientPreTreatmentResponse;
import jakarta.validation.Valid;

public interface PatientPreTreatmentService {
    PatientPreTreatmentResponse createPreTreatmentDetails(@Valid PatientPreTreatmentRequest request);

    PatientPreTreatmentResponse updatePreTreatmentDetails(Long id, @Valid PatientPreTreatmentRequest request);

    PatientPreTreatmentResponse getPreTreatmentDetails(Long id);
}
