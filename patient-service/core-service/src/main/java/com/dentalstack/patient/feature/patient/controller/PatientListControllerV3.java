package com.dentalstack.patient.feature.patient.controller;

import com.dentalstack.patient.feature.order.service.impl.PatientListServiceV2;
import com.dentalstack.patient.feature.patient.dto.ActivePatientRequestV2;
import com.dentalstack.patient.feature.patient.dto.CustomerPatientList;
import com.dentalstack.patient.feature.patient.dto.CustomerPatientListRequest;
import com.dentalstack.patient.feature.patient.dto.PatientDetailsList;
import com.dentalstack.patient.feature.patient.dto.v2.PatientListRequestV2;
import com.dentalstack.patient.feature.patient.dto.v2.PatientListResponseV2;
import com.dentalstack.patient.feature.patient.service.PatientListService;
import com.dentalstack.patient.feature.vsp.dto.request.VspPatientListRequest;
import com.dentalstack.patient.feature.vsp.dto.response.VspPatientListResponse;
import com.dentalstack.patient.feature.vsp.service.VspPatientListService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Patient all list v3", description = "Patient list v3 APIs")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/list/v3")
public class PatientListControllerV3 {

    private final PatientListService patientListService;
    private final PatientListServiceV2 patientListServiceV2;
    private final VspPatientListService vspPatientListService;

    @PostMapping("/")
    @Operation(summary = "Get the patient list by stages")
    public ResponseEntity<PatientDetailsList> getAllPatientList(@Valid @RequestBody ActivePatientRequestV2 request) {
        return ResponseEntity.ok(patientListService.getAllPatientsByStages(request));
    }

    @PostMapping("/customer-patients")
    @Operation(summary = "Get customer patient list")
    public ResponseEntity<CustomerPatientList> getCustomerPatientList(
            @Valid @RequestBody CustomerPatientListRequest request) {
        return ResponseEntity.ok(patientListService.getCustomerPatientList(request));
    }

    @PostMapping("/cases")
    @Operation(summary = "Get patient list with filters")
    public ResponseEntity<PatientListResponseV2> getPatientList(@Valid @RequestBody PatientListRequestV2 request) {
        return ResponseEntity.ok(patientListServiceV2.getPatientListV2(request));
    }

    @PostMapping("/vsp-cases")
    @Operation(summary = "Get VSP patient list with filters")
    public ResponseEntity<VspPatientListResponse> getVspPatientList(@Valid @RequestBody VspPatientListRequest request) {
        return ResponseEntity.ok(vspPatientListService.getVspPatientList(request));
    }
}
