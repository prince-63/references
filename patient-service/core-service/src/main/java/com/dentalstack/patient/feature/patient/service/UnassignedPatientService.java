package com.dentalstack.patient.feature.patient.service;

import com.dentalstack.patient.feature.patient.dto.RegisterPatientRequest;
import com.dentalstack.patient.feature.patient.entity.PatientLead;

public interface UnassignedPatientService {
    PatientLead registerPatient(RegisterPatientRequest request);
}
