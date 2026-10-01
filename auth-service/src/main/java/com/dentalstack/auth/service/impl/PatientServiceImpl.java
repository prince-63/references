package com.dentalstack.auth.service.impl;

import com.dentalstack.auth.client.PatientServiceClient;
import com.dentalstack.auth.dto.chargebee.ChargebeeCreateCustomerRequest;
import com.dentalstack.auth.dto.patient.PatientDetails;
import com.dentalstack.auth.dto.patient.RegisterPatientRequest;
import com.dentalstack.auth.service.PatientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@Service
@Slf4j
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientServiceClient patientServiceClient;

    @Override
    public PatientDetails registerPatientFromAuth(@RequestBody RegisterPatientRequest request) {
        return patientServiceClient.registerPatientFromAuth(request);
    }

    @Override
    public PatientDetails getPatient(@PathVariable Long id) {
        return patientServiceClient.getPatient(id);
    }

    @Override
    public PatientDetails getPatient(String UUID) {
        return patientServiceClient.getPatientByUuid(UUID);
    }

    @Override
    public void createCustomerAndAddBasicPlan(ChargebeeCreateCustomerRequest request) {
        patientServiceClient.createCustomerAndAddBasicPlan(request);
    }
}
