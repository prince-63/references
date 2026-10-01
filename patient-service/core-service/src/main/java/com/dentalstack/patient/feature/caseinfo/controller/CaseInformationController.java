package com.dentalstack.patient.feature.caseinfo.controller;

import com.dentalstack.patient.feature.caseinfo.dto.CaseInformationRequest;
import com.dentalstack.patient.feature.caseinfo.dto.GetCaseInformationRequest;
import com.dentalstack.patient.feature.caseinfo.service.CaseInformationService;
import com.dentalstack.patient.global.exception.BadRequestException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Case Information", description = "Case Information APIs")
@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/patient/case/info/v1")
public class CaseInformationController {

    private final CaseInformationService caseInformationService;

    private final ObjectMapper mapper = new ObjectMapper();

    @PostMapping(
            value = "/",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Add case info")
    public void addCaseInfo(
            @Parameter(
                            name = "details",
                            example =
                                    """
                    {
                      "patient_id": 12345,
                      "doctor_id": 67890,
                      "product_type": "Aligners",
                      "metadata": {
                        "missing_teeth": [
                          18,
                          28,
                          38,
                          48
                        ],
                        "allergy": [
                          "Penicillin",
                          "Latex"
                        ],
                        "medical_condition": [
                          "Diabetes",
                          "Hypertension"
                        ],
                        "dental_history": [
                          "Diabetes",
                          "Hypertension"
                        ],
                        "relations": {
                          "molar": 1,
                          "canine": 2,
                          "incisor": 1,
                          "skeletal": 2
                        },
                        "overjet": 3.5,
                        "deep_bite": 2,
                        "deep_bite_in_percentage": 30,
                        "open_bite": 0,
                        "midline": "Centered",
                        "remarks": "Patient has good oral hygiene",
                        "diagnosis": "Class II malocclusion with crowding",
                        "extra_oral_remarks": "Facial asymmetry noted",
                        "cephalometric_analysis": "ANB angle: 4°, SNA: 82°, SNB: 78°",
                        "treatment_objective": "Correct crowding and achieve Class I occlusion"
                      }
                    }
                    """)
                    @RequestParam("details")
                    String reqStr,
            @RequestPart(value = "photo", required = false) MultipartFile[] photos) {
        CaseInformationRequest request = new CaseInformationRequest();
        try {
            mapper.registerModule(new JavaTimeModule());
            request = mapper.readValue(reqStr, CaseInformationRequest.class);
        } catch (JsonProcessingException e) {
            log.warn("Failed parse to case info add request, {}", reqStr, e);
            throw new BadRequestException(
                    String.format("Failed parse to case info add request %s with error %s", reqStr, e));
        }
        caseInformationService.addCaseInformation(request, photos);
    }

    @GetMapping("/")
    public ResponseEntity<?> getCaseInformation(
            @RequestParam(name = "patient_id") Long patientId,
            @RequestParam(name = "doctor_id") Long doctorId,
            @RequestParam(name = "product_type", required = false) String productType) {
        GetCaseInformationRequest caseInformation =
                caseInformationService.getCaseInformation(patientId, doctorId, productType);

        if (caseInformation.getMetadata() == null) {
            return ResponseEntity.status(HttpStatus.OK).body(new GetCaseInformationRequest(null, null, null));
        }
        return ResponseEntity.ok(caseInformation);
    }
}
