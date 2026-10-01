package com.dentalstack.patient.feature.aligner.controller.v2;

import com.dentalstack.patient.feature.aligner.dto.aligner.*;
import com.dentalstack.patient.feature.aligner.dto.aligner.production.UpdateAlignerProductionRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.v2.CreateAlignerJourneyRequest;
import com.dentalstack.patient.feature.aligner.dto.alignertreatment.TreatmentDetails;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerActionType;
import com.dentalstack.patient.feature.aligner.exception.aligner.FailedToParseChangeAlignerDetails;
import com.dentalstack.patient.feature.aligner.service.AlignerService;
import com.dentalstack.patient.feature.tracking.dto.UpdatePatientTrackingStatus;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Aligner v2 api", description = "Aligner v2 APIs")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/aligner/v2")
public class AlignerControllerV2 {

    private final AlignerService alignerService;

    private final ObjectMapper mapper = new ObjectMapper();

    @Operation(summary = "Create or update aligner journey for the patient")
    @PostMapping
    public ResponseEntity<Void> createOrUpdateAlignerJourney(@Valid @RequestBody CreateAlignerJourneyRequest request) {
        alignerService.createAlignerJourney(request);
        HttpStatus status = request.isTreatmentUpdating() ? HttpStatus.OK : HttpStatus.CREATED;
        return ResponseEntity.status(status).build();
    }

    @Operation(summary = "Patient fill missing aligner details")
    @PostMapping("/update/aligner/details")
    public ResponseEntity<Void> patientFillMissingAlignerDetails(
            @Valid @RequestBody PatientFillMissingAlignerDetails request) {
        alignerService.patientFillMissingAlignerDetails(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping(
            value = "/change/aligner",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Set current aligner")
    @Transactional
    public ResponseEntity<AlignerJourneyDetails> changeAligner(
            @Parameter(
                            name = "details",
                            example =
                                    """
                                    {
                                      "patient_id": 1,
                                      "aligner_journey_id": 1,
                                      "new_aligner_no": 2,
                                      "previous_aligner_change_date": "2023-09-29",

                                      "with_previous_aligner_photo_files": [
                                        {
                                          "original_filename":"previous_aligner_photo.jpg",
                                          "save_as_filename": "previous_aligner_photo_new.jpg"
                                        }
                                      ],
                                      "with_new_aligner_photo_files": [
                                        {
                                          "original_filename":"new_aligner_photo.jpg",
                                          "save_as_filename": "new_aligner_photo_new.jpg"
                                        }
                                      ],
                                      "without_new_aligner_photo_files": [
                                        {
                                          "original_filename":"new_without_aligner_photo.jpg",
                                          "save_as_filename": "new_without_aligner_photo_new.jpg"
                                        }
                                      ]
                                    }
                                    """)
                    @RequestParam("details")
                    String reqStr,
            @RequestPart(value = "photo", required = false) MultipartFile[] photos) {

        AlignerChangeRequest request = new AlignerChangeRequest();
        try {
            mapper.registerModule(new JavaTimeModule());
            request = mapper.readValue(reqStr, AlignerChangeRequest.class);
        } catch (JsonProcessingException e) {
            throw new FailedToParseChangeAlignerDetails(reqStr, e);
        }
        request.setAlignerActionType(AlignerActionType.FORCE_ALIGNER_CHANGE);

        AlignerJourney alignerJourney = alignerService.forceAlignerChange(request, photos);
        return ResponseEntity.ok(AlignerJourneyDetails.from(alignerJourney));
    }

    @PostMapping("/update/wear-days/production-lab")
    @Operation(summary = "Update the aligner production details")
    @Transactional
    public ResponseEntity<AlignerJourneyDetails> updateAlignerProduction(
            @Valid @RequestBody UpdateAlignerProductionRequest request) {
        return ResponseEntity.ok(
                AlignerJourneyDetails.from(alignerService.updateAlignerProductionAndWearDays(request)));
    }

    @PostMapping("/pause-or-resume")
    @Operation(summary = "Pause or resume the journey")
    @Transactional
    public ResponseEntity<AlignerJourneyDetails> pauseOrResumeTreatment(
            @Valid @RequestBody TreatmentPauseAndResumeRequest request) {
        return ResponseEntity.ok(AlignerJourneyDetails.from(alignerService.pauseOrResumeTreatment(request)));
    }

    @Operation(summary = "Get aligner treatment details")
    @GetMapping("/treatment/details/{aligner_journey_id}")
    public ResponseEntity<TreatmentDetails> getAlignerTreatmentDetails(
            @PathVariable("aligner_journey_id") long alignerJourneyId) {
        TreatmentDetails response = alignerService.getAlignerTreatmentDetails(alignerJourneyId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get force aligner change details for patient")
    @GetMapping("/force/aligner/change/details/{aligner_journey_id}")
    public ResponseEntity<ForceAlignerChangeResponse> getForceAlignerChangeDetails(
            @PathVariable("aligner_journey_id") long alignerJourneyId) {
        ForceAlignerChangeResponse response = alignerService.getForceAlignerChangeDetails(alignerJourneyId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Deactivate aligner journey")
    @PostMapping("/deactivate")
    public ResponseEntity<Void> deactivateAlignerJourney(@Valid @RequestBody DeactivateAlignerJourney request) {
        alignerService.deactivateAlignerJourney(
                request.getTreatmentPlanId(), request.getReasonForDeactivation(), request.getOtherRemarks());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get resumed treatment details")
    @GetMapping("/resume/details/{patient_id}")
    public ResponseEntity<ResumeTreatmentResponse> getResumeTreatmentDetails(
            @PathVariable("patient_id") long patientId) {
        ResumeTreatmentResponse response = alignerService.getResumeTreatmentDetails(patientId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Update patient tracking status")
    @PostMapping("/patient/tracking/status")
    public ResponseEntity<Void> patientTrackingStatusChange(@Valid @RequestBody UpdatePatientTrackingStatus request) {
        alignerService.patientTrackingStatusChange(request.getPatientTrackingStatus(), request.getAlignerJourneyId());
        return ResponseEntity.ok().build();
    }
}
