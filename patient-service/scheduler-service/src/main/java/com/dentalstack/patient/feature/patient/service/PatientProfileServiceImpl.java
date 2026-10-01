package com.dentalstack.patient.feature.patient.service;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class PatientProfileServiceImpl implements PatientProfileService {

    private final PatientRepository patientRepository;

    @Override
    public Optional<Patient> getPatientForTimeline(long id) {
        return patientRepository.findById(id);
    }
}
