package com.dentalstack.auth.service;

import com.dentalstack.auth.dto.chargebee.ChargebeeCreateCustomerRequest;
import com.dentalstack.auth.dto.patient.PatientDetails;
import com.dentalstack.auth.dto.patient.RegisterPatientRequest;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

public interface PatientService {

    PatientDetails registerPatientFromAuth(@RequestBody RegisterPatientRequest request);

    PatientDetails getPatient(@PathVariable Long id);

    PatientDetails getPatient(@RequestParam(value = "UUID") String UUID);

    void createCustomerAndAddBasicPlan(ChargebeeCreateCustomerRequest request);
}
