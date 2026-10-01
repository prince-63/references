package com.dentalstack.patient.feature.patient.service;

import com.dentalstack.patient.feature.patient.entity.Patient;
import java.util.Optional;

public interface PatientProfileService {
    Optional<Patient> getPatientForTimeline(long id);
}
