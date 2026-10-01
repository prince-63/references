package com.dentalstack.patient.feature.aligner.controller.v1;

import com.dentalstack.patient.feature.aligner.dto.aligner.action.*;
import com.dentalstack.patient.feature.aligner.dto.aligner.feedback.ReportAlignerIssueRequest;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerActionType;
import com.dentalstack.patient.feature.aligner.service.AlignerActionService;
import com.dentalstack.patient.feature.aligner.service.AlignerService;
import com.dentalstack.patient.global.exception.BadRequestException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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
@RequestMapping("/patient/aligner/action/v1")
public class AlignerActionController {

    private final AlignerService alignerService;
    private final AlignerActionService alignerActionService;

    private final ObjectMapper mapper = new ObjectMapper();

    @GetMapping("/all/{aligner_journey_id}")
    @Operation(summary = "Get all the actions performed on aligners of aligner journey")
    public ResponseEntity<AllAlignerActions> getAlignerActions(
            @PathVariable("aligner_journey_id") long alignerJourneyId) {
        return ResponseEntity.ok(alignerService.getAlignerActions(alignerJourneyId));
    }

    @GetMapping("/{aligner_action_id}")
    @Operation(summary = "Get details of the aligner action")
    public ResponseEntity<AlignerActionDetails> getAlignerActionDetails(
            @PathVariable("aligner_action_id") long alignerActionId) {
        return ResponseEntity.ok(alignerService.getAlignerActionDetails(alignerActionId));
    }

    @PostMapping("/issue")
    @Operation(summary = "Report the aligner issue")
    public void reportAlignerIssue(@RequestBody ReportAlignerIssueRequest request) {
        alignerActionService.reportIssue(request);
    }

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
        alignerActionService.checkIn(request, photos);
    }

    @PostMapping("/change")
    @Operation(summary = "Change aligner")
    public void changeAligner(@RequestBody ChangeAlignerRequest request) {
        alignerActionService.changeAligner(request);
    }

    @PostMapping("/validate")
    @Operation(summary = "Validate the aligner change by patient")
    public void validateAlignerChange(@RequestBody ValidateAlignerChangeRequest request) {
        alignerService.validateAlignerChange(request);
    }

    @PostMapping("/comment")
    @Operation(summary = "Comment on aligner action")
    public void commentOnAction(@RequestBody CommentOnAlignerActionRequest request) {
        alignerActionService.commentOnAction(request);
    }

    @GetMapping("/details/{aligner_journey_id}")
    @Operation(summary = "Get all the actions performed on aligners of aligner journey by patient")
    public ResponseEntity<PatientActionDetails> getPatientActionDetails(
            @PathVariable("aligner_journey_id") long alignerJourneyId) {
        return ResponseEntity.ok(alignerService.getPatientActionDetails(alignerJourneyId));
    }

    @PostMapping("/details")
    @Operation(summary = "Get details of aligner actions based on provided filters")
    public ResponseEntity<ActionDetailCategorizedResponse> getAlignerActionDetails(
            @RequestParam(value = "action_type", required = false) AlignerActionType actionType,
            @RequestParam(value = "is_active", required = false) Boolean isActive,
            @RequestParam(value = "doctor_id") Long doctorId,
            @RequestParam(value = "organization_id") Long organizationId) {

        AlignerActionType enumActionType = null;
        if (actionType != null) {
            try {
                enumActionType = actionType;
            } catch (IllegalArgumentException e) {
                log.warn("Invalid action_type provided: {}", actionType);
                return ResponseEntity.badRequest().build();
            }
        }
        return ResponseEntity.ok(
                alignerActionService.getAlignerActionDetails(enumActionType, isActive, doctorId, organizationId));
    }

    @PostMapping("/actions/inactivate")
    @Operation(summary = "Inactivate multiple actions.")
    public ResponseEntity<Void> inactivateActions(@Valid @RequestBody InactivateActionRequest request) {
        alignerActionService.inactivateActions(request.getActionsIds(), request.getDoctorId());
        return ResponseEntity.ok().build();
    }
}
