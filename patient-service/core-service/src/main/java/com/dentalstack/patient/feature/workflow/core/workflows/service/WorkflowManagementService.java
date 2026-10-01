package com.dentalstack.patient.feature.workflow.core.workflows.service;

import com.dentalstack.patient.feature.workflow.core.workflows.dto.*;
import com.dentalstack.patient.feature.workflow.core.workflows.dto.CreateServiceRequestDto;
import com.dentalstack.patient.feature.workflow.core.workflows.dto.KanBanGetBoardRequest;
import com.dentalstack.patient.feature.workflow.core.workflows.dto.ServiceResponseDto;
import com.dentalstack.patient.feature.workflow.core.workflows.dto.UpdateServiceRequestDto;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface WorkflowManagementService {

    WorkflowResponseDto createWorkflow(CreateWorkflowRequestDto request);

    WorkflowResponseDto updateWorkflow(Long workflowId, UpdateWorkflowRequestDto request);

    List<WorkflowResponseDto> getWorkflows(
            Long profileId, Long orgId, String orderType, Boolean archived, String workflowConfig);

    void deleteWorkflow(Long workflowId);

    WorkflowResponseDto archiveWorkflow(Long workflowId);

    StatusResponseDto createStatus(Long workflowId, CreateStatusRequestDto request);

    StatusResponseDto updateStatus(Long statusId, UpdateStatusRequestDto request);

    void deleteStatus(Long statusId, Long profileId);

    StatusResponseDto updateStatusPosition(Long statusId, UpdateStatusPositionRequestDto request);

    ServiceResponseDto createService(CreateServiceRequestDto request);

    ServiceResponseDto updateService(Long serviceId, UpdateServiceRequestDto request);

    ServiceResponseDto getServiceById(Long serviceId);

    Page<ServiceResponseDto> getServices(Long profileId, Long orgId, String subscriptionType, Pageable pageable);

    void deleteService(Long serviceId);

    List<WorkflowResponseDto> getKanbanBoard(KanBanGetBoardRequest request);

    void assignWorkflowToUserProfile(Long profileId);
}
