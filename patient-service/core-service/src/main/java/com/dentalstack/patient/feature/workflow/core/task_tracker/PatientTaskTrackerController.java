package com.dentalstack.patient.feature.workflow.core.task_tracker;

import com.dentalstack.patient.feature.mcp.PatientTaskTrackerResponseForMcp;
import com.dentalstack.patient.feature.workflow.core.task_tracker.dto.*;
import com.dentalstack.patient.feature.workflow.core.task_tracker.service.PatientTaskTrackerService;
import com.dentalstack.patient.feature.workflow.core.workflows.dto.WorkflowCountResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Patient task tracker", description = "Patient task tracker API")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/task-tracker")
public class PatientTaskTrackerController {

    private final PatientTaskTrackerService patientTaskTrackerService;

    @PostMapping
    @Operation(
            summary = "Create a new patient task tracker",
            description = "Creates a new patient task tracker for workflow management")
    public ResponseEntity<PatientTaskTrackerResponse> createPatientTaskTracker(
            @Valid @RequestBody CreatePatientTaskTrackerRequestDto request) {

        PatientTaskTrackerResponse response = patientTaskTrackerService.createPatientTaskTracker(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/")
    @Operation(summary = "Update patient task tracker", description = "Updates an existing patient task tracker")
    public ResponseEntity<PatientTaskTrackerResponse> updatePatientTaskTracker(
            @Valid @RequestBody UpdatePatientTaskTrackerRequestDto request) {

        PatientTaskTrackerResponse response = patientTaskTrackerService.updatePatientTaskTracker(request);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/move")
    @Operation(summary = "Move patient task", description = "Move an existing patient task")
    public ResponseEntity<PatientTaskTrackerResponse> movePatientTaskTracker(
            @Valid @RequestBody MoveTaskTrackerRequest request) {
        return ResponseEntity.ok(patientTaskTrackerService.movePatientTaskTracker(request));
    }

    @PutMapping("/move/multi-task")
    @Operation(summary = "Move multiple patient task", description = "")
    public ResponseEntity<List<PatientTaskTrackerResponse>> moveMultiplePatientTaskTracker(
            @Valid @RequestBody MoveMultiTaskTrackerRequest request) {
        return ResponseEntity.ok(patientTaskTrackerService.moveMultiplePatientTaskTracker(request));
    }

    @PostMapping("/change-workflow")
    @Operation(summary = "Change workflow", description = "Change workflow for a patient task")
    public ResponseEntity<PatientTaskTrackerResponse> changeWorkFlow(
            @Valid @RequestBody SelectCaseForPatientTaskRequest request) {
        return ResponseEntity.ok(patientTaskTrackerService.changeWorkflow(request));
    }

    @PostMapping("/get/patient-task-tracker/filter")
    public ResponseEntity<PatientTaskTrackerFilterResponseWithPagination> getAllPatientTaskTrackers(
            @RequestBody PatientTaskTrackerFilterRequestDTO request) {
        PatientTaskTrackerFilterResponseWithPagination patientTrackerList =
                patientTaskTrackerService.getAllPatientTaskTrackersByFilter(request);
        return ResponseEntity.ok(patientTrackerList);
    }

    @PostMapping("/get/patient-task-tracker/filter-by-cancelled")
    public ResponseEntity<Page<CancelledTaskTrackerDetailsResponseDTO>> getAllCancelledPatientWithFilter(
            @RequestBody CancelledPatientTaskTrackerDetailsWithFilterRequestDTO request) {
        Page<CancelledTaskTrackerDetailsResponseDTO> cancelledPatientList =
                patientTaskTrackerService.getAllCancelledPatientWithFilter(request);
        return ResponseEntity.ok(cancelledPatientList);
    }

    @PostMapping("/")
    @Operation(summary = "Get all patient task trackers according to workflow")
    public ResponseEntity<List<PatientTaskTrackerResponse>> getDoctorDashboardData(
            @Valid @RequestBody PatientTaskTrackerRequest request) {
        return ResponseEntity.ok(patientTaskTrackerService.getAllPatientTaskTrackers(request));
    }

    @PostMapping("/individual-patient")
    @Operation(summary = "Get individual patient tasks")
    public ResponseEntity<List<PatientTaskTrackerResponse>> getIndividualPatientTasks(
            @Valid @RequestBody IndividualPatientTaskRequest request) {
        return ResponseEntity.ok(patientTaskTrackerService.getIndividualPatientTasks(request));
    }

    @PostMapping("/task-by-patient-details")
    @Operation(summary = "Get individual patient tasks")
    public ResponseEntity<List<PatientTaskTrackerResponseForMcp>> getTasksByPatientDetails(
            @Valid @RequestBody IndividualPatientTaskRequest request) {
        return ResponseEntity.ok(patientTaskTrackerService.getPatientTasksBySearch(request));
    }

    @PostMapping("/ongoing-production-list")
    @Operation(summary = "Ongoing production list", description = "Get ongoing production list")
    public ResponseEntity<PatientTaskTrackerResponseWithPagination> getOngoingProductionList(
            @Valid @RequestBody PatientTaskTrackerRequest request) {
        return ResponseEntity.ok(patientTaskTrackerService.getOngoingProductionList(request));
    }

    @Operation(summary = "Get kanban count by user profile", description = "Get kanban count by user profile")
    @GetMapping("/kanban-counts/{profileId}")
    public ResponseEntity<List<WorkflowCountResponse>> getWorkflowCountsByProfile(@PathVariable Long profileId) {
        List<WorkflowCountResponse> response = patientTaskTrackerService.getWorkflowCountsByProfile(profileId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "create refinement kanban task for patient.")
    @PostMapping("/create-refinement-task")
    public void createRefinementTask(@RequestBody RefinementRequestDto requestDto) {
        patientTaskTrackerService.createRefinementTask(requestDto);
    }

    @Operation(summary = "mark patient existing kanban details as archive")
    @PatchMapping("/mark-as-archive/{patientId}")
    public void markPatientTaskAsArchive(@PathVariable Long patientId) {
        patientTaskTrackerService.markPatientTaskAsArchive(patientId);
    }

    @Operation(summary = "delete patient existing kanban details")
    @DeleteMapping
    public void deletePatientTaskTracker(@RequestParam String patientId) {
        patientTaskTrackerService.deletePatientTaskTracker(patientId);
    }
}
