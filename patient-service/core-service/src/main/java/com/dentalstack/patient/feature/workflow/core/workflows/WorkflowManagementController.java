package com.dentalstack.patient.feature.workflow.core.workflows;

import com.dentalstack.patient.feature.workflow.core.workflows.dto.*;
import com.dentalstack.patient.feature.workflow.core.workflows.dto.CreateServiceRequestDto;
import com.dentalstack.patient.feature.workflow.core.workflows.dto.KanBanGetBoardRequest;
import com.dentalstack.patient.feature.workflow.core.workflows.dto.ServiceResponseDto;
import com.dentalstack.patient.feature.workflow.core.workflows.dto.UpdateServiceRequestDto;
import com.dentalstack.patient.feature.workflow.core.workflows.service.WorkflowManagementService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Workflow Management", description = "Workflow Management api's")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/workflow-management/v1")
public class WorkflowManagementController {

    private final WorkflowManagementService workflowManagementService;

    @PostMapping("/workflows")
    public ResponseEntity<WorkflowResponseDto> createWorkflow(@Valid @RequestBody CreateWorkflowRequestDto request) {
        WorkflowResponseDto response = workflowManagementService.createWorkflow(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/workflows/{workflowId}")
    public ResponseEntity<WorkflowResponseDto> updateWorkflow(
            @PathVariable Long workflowId, @Valid @RequestBody UpdateWorkflowRequestDto request) {
        WorkflowResponseDto response = workflowManagementService.updateWorkflow(workflowId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/workflows")
    public ResponseEntity<List<WorkflowResponseDto>> getWorkflows(
            @RequestParam(required = false) Long profileId,
            @RequestParam(required = false) Long orgId,
            @RequestParam(required = false) String orderType,
            @RequestParam(required = false) Boolean archived,
            @RequestParam(required = false) String workflowConfig) {

        List<WorkflowResponseDto> response =
                workflowManagementService.getWorkflows(profileId, orgId, orderType, archived, workflowConfig);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/kanban-board")
    public ResponseEntity<List<WorkflowResponseDto>> getKanbanBoard(@Valid @RequestBody KanBanGetBoardRequest request) {
        List<WorkflowResponseDto> response = workflowManagementService.getKanbanBoard(request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/workflows/{workflowId}")
    public ResponseEntity<Void> deleteWorkflow(@PathVariable Long workflowId) {
        workflowManagementService.deleteWorkflow(workflowId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/workflows/{workflowId}/archive")
    public ResponseEntity<WorkflowResponseDto> archiveWorkflow(@PathVariable Long workflowId) {
        WorkflowResponseDto response = workflowManagementService.archiveWorkflow(workflowId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/workflows/{workflowId}/statuses")
    public ResponseEntity<StatusResponseDto> createStatus(
            @PathVariable Long workflowId, @Valid @RequestBody CreateStatusRequestDto request) {
        StatusResponseDto response = workflowManagementService.createStatus(workflowId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/statuses/{statusId}")
    public ResponseEntity<StatusResponseDto> updateStatus(
            @PathVariable Long statusId, @Valid @RequestBody UpdateStatusRequestDto request) {
        StatusResponseDto response = workflowManagementService.updateStatus(statusId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/statuses")
    public ResponseEntity<Void> deleteStatus(@RequestParam Long statusId, @RequestParam Long profileId) {
        workflowManagementService.deleteStatus(statusId, profileId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/statuses/{statusId}/position")
    public ResponseEntity<StatusResponseDto> updateStatusPosition(
            @PathVariable Long statusId, @Valid @RequestBody UpdateStatusPositionRequestDto request) {
        StatusResponseDto response = workflowManagementService.updateStatusPosition(statusId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/services")
    public ResponseEntity<ServiceResponseDto> createService(@Valid @RequestBody CreateServiceRequestDto request) {
        ServiceResponseDto response = workflowManagementService.createService(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/services/{serviceId}")
    public ResponseEntity<ServiceResponseDto> updateService(
            @PathVariable Long serviceId, @Valid @RequestBody UpdateServiceRequestDto request) {
        ServiceResponseDto response = workflowManagementService.updateService(serviceId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/services/{serviceId}")
    public ResponseEntity<ServiceResponseDto> getServiceById(@PathVariable Long serviceId) {
        ServiceResponseDto response = workflowManagementService.getServiceById(serviceId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/services")
    public ResponseEntity<Page<ServiceResponseDto>> getServices(
            @RequestParam(required = false) Long profileId,
            @RequestParam(required = false) Long orgId,
            @RequestParam(required = false) String subscriptionType,
            Pageable pageable) {
        Page<ServiceResponseDto> response =
                workflowManagementService.getServices(profileId, orgId, subscriptionType, pageable);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/services/{serviceId}")
    public ResponseEntity<Void> deleteService(@PathVariable Long serviceId) {
        workflowManagementService.deleteService(serviceId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/assign/{profileId}")
    public ResponseEntity<Void> assignWorkflowToUserProfile(@PathVariable Long profileId) {
        workflowManagementService.assignWorkflowToUserProfile(profileId);
        return ResponseEntity.noContent().build();
    }
}
