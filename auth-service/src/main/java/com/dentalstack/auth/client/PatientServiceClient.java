package com.dentalstack.auth.client;

import com.dentalstack.auth.dto.chargebee.ChargebeeCreateCustomerRequest;
import com.dentalstack.auth.dto.patient.PatientDetails;
import com.dentalstack.auth.dto.patient.RegisterPatientRequest;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "patient-service")
public interface PatientServiceClient {

    @GetMapping("/patient/profile/v1/{id}")
    PatientDetails getPatient(@PathVariable Long id);

    @PostMapping("/patient/unassigned/v1/auth/register")
    @Operation(summary = "Register a new patient from auth")
    PatientDetails registerPatientFromAuth(@RequestBody RegisterPatientRequest request);

    @GetMapping("/patient/profile/v1/uuid/{UUID}")
    PatientDetails getPatientByUuid(@PathVariable(value = "UUID") String UUID);

    @PostMapping("/patient/chargebee/v1/create/customer/subscription")
    void createCustomerAndAddBasicPlan(@RequestBody ChargebeeCreateCustomerRequest request);
}
