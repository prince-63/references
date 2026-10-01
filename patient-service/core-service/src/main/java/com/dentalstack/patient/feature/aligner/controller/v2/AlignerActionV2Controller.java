package com.dentalstack.patient.feature.aligner.controller.v2;

import com.dentalstack.patient.feature.aligner.dto.aligner.action.AlignerPhotosByAlignerResponse;
import com.dentalstack.patient.feature.aligner.dto.aligner.action.CheckInAlignerRequest;
import com.dentalstack.patient.feature.aligner.service.AlignerActionV2Service;
import com.dentalstack.patient.global.exception.BadRequestException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Aligner Actions", description = "APIs to perform actions on aligners")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/aligner/action/v2")
public class AlignerActionV2Controller {

    private final AlignerActionV2Service alignerActionV2Service;
    private final ObjectMapper mapper = new ObjectMapper();

    @PostMapping(
            value = "/check-in",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Check in the aligner")
    public void checkIn(
            @Parameter(
                            name = "details",
                            example =
                                    """
                            {
                              "user_id": 384,
                              "user_type": "PATIENT",
                              "aligner_journey_id": 236,
                              "aligner_no": 7,
                              "feedback": {
                                "feedbacks": {
                                  "UPPER": {
                                    "fitting_feedback": {
                                      "fittings": [
                                        "NOT_FITTING"
                                      ]
                                    },
                                    "changing_feedback": {
                                      "aligner_changing_issues": [
                                        "SHARP_EDGES"
                                      ]
                                    }
                                  }
                                },
                                "other_issues": "test"
                              },
                              "with_aligner_photo_files": [
                                {
                                  "original_filename": "image.png",
                                  "save_as_filename": "WArOlEEIW6.png"
                                }
                              ],
                              "without_aligner_photo_files": [
                                {
                                  "original_filename": "image (1).png",
                                  "save_as_filename": "kuzX6xwhMr.png"
                                }
                              ]
                            }
                    """)
                    @RequestParam("details")
                    String reqStr,
            @RequestPart(value = "photo", required = false) MultipartFile[] photos) {
        CheckInAlignerRequest request = new CheckInAlignerRequest();
        try {
            mapper.registerModule(new JavaTimeModule());
            request = mapper.readValue(reqStr, CheckInAlignerRequest.class);
        } catch (JsonProcessingException e) {
            log.warn("Failed parse to check in aligner request, {}", reqStr, e);
            throw new BadRequestException(
                    String.format("Failed to parse check in aligner request %s with error %s", reqStr, e));
        }
        alignerActionV2Service.checkIn(request, photos);
    }

    @GetMapping("/check-in-photos/{patientId}")
    @Operation(summary = "Get aligner photos grouped by aligner serial number")
    public ResponseEntity<List<AlignerPhotosByAlignerResponse>> getPhotosByPatient(@PathVariable Long patientId) {
        List<AlignerPhotosByAlignerResponse> response =
                alignerActionV2Service.getPhotosByPatientIdGroupedByAligner(patientId);
        return ResponseEntity.ok(response);
    }
}
