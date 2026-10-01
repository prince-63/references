package com.dentalstack.patient.feature.workflow.core.workflows.service;

import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.flag.util.FlagSeedData;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.workflow.card_display.repository.CardDisplayConfigRepository;
import com.dentalstack.patient.feature.workflow.card_display.repository.CardDisplayFieldRepository;
import com.dentalstack.patient.feature.workflow.core.task_tracker.entity.PatientTaskTracker;
import com.dentalstack.patient.feature.workflow.core.task_tracker.repository.PatientTaskTrackerRepository;
import com.dentalstack.patient.feature.workflow.core.workflows.dto.*;
import com.dentalstack.patient.feature.workflow.core.workflows.dto.CreateServiceRequestDto;
import com.dentalstack.patient.feature.workflow.core.workflows.dto.KanBanGetBoardRequest;
import com.dentalstack.patient.feature.workflow.core.workflows.dto.ServiceResponseDto;
import com.dentalstack.patient.feature.workflow.core.workflows.dto.UpdateServiceRequestDto;
import com.dentalstack.patient.feature.workflow.core.workflows.entity.Workflow;
import com.dentalstack.patient.feature.workflow.core.workflows.entity.WorkflowHistory;
import com.dentalstack.patient.feature.workflow.core.workflows.entity.WorkflowService;
import com.dentalstack.patient.feature.workflow.core.workflows.entity.WorkflowStatus;
import com.dentalstack.patient.feature.workflow.core.workflows.enums.WorkflowConfig;
import com.dentalstack.patient.feature.workflow.core.workflows.mapper.WorkflowManagementMapper;
import com.dentalstack.patient.feature.workflow.core.workflows.metadata.WorkFlowHistoryMetadata;
import com.dentalstack.patient.feature.workflow.core.workflows.metadata.WorkFlowMetadata;
import com.dentalstack.patient.feature.workflow.core.workflows.metadata.WorkFlowStatusMetadata;
import com.dentalstack.patient.feature.workflow.core.workflows.repository.ServiceRepository;
import com.dentalstack.patient.feature.workflow.core.workflows.repository.WorkflowHistoryRepository;
import com.dentalstack.patient.feature.workflow.core.workflows.repository.WorkflowRepository;
import com.dentalstack.patient.feature.workflow.core.workflows.repository.WorkflowStatusRepository;
import com.dentalstack.patient.feature.workflow.product.repository.ProductCategoryRepository;
import com.dentalstack.patient.feature.workflow.product.repository.ServiceProductRepository;
import com.dentalstack.patient.global.exception.GenericException;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkflowManagementServiceImpl implements WorkflowManagementService {

    private final WorkflowRepository workflowRepository;
    private final WorkflowStatusRepository statusRepository;
    private final ServiceRepository serviceRepository;
    private final ServiceProductRepository serviceProductRepository;
    private final CardDisplayConfigRepository cardDisplayConfigRepository;
    private final CardDisplayFieldRepository cardDisplayFieldRepository;
    private final WorkflowHistoryRepository workflowHistoryRepository;
    private final UserProfileRepository userProfileRepository;
    private final WorkflowManagementMapper mapper;
    private final ProductCategoryRepository productCategoryRepository;
    private final DefaultWorkflowService defaultWorkflowService;
    private final PatientTaskTrackerRepository patientTaskTrackerRepository;
    private final FlagSeedData flagSeedData;

    @Override
    @Transactional
    public WorkflowResponseDto createWorkflow(CreateWorkflowRequestDto request) {

        var userProfile = userProfileRepository
                .findById(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        WorkFlowMetadata metadata = new WorkFlowMetadata(request.getProfileId());
        Workflow workflow = workflowRepository.save(Workflow.from(request, userProfile, request.getOrgId(), metadata));

        createHistoryEntry(workflow.getId(), request.getProfileId(), "CREATED", "Workflow created");

        return mapper.toWorkflowResponseDto(workflow);
    }

    @Override
    public WorkflowResponseDto updateWorkflow(Long workflowId, UpdateWorkflowRequestDto request) {

        Workflow workflow = workflowRepository
                .findById(workflowId)
                .orElseThrow(() -> new GenericException("Workflow not found with id: " + workflowId));

        workflow.setName(request.getName());
        workflow.setLabel(request.getLabel());
        workflow.setUpdatedAt(ZonedDateTime.now());

        workflow = workflowRepository.save(workflow);

        createHistoryEntry(workflowId, workflow.getUserProfile().getId(), "UPDATED", "Workflow updated");

        return mapper.toWorkflowResponseDto(workflow);
    }

    private Map<String, Integer> getShortOrder() {
        Map<String, Integer> orderMap = new HashMap<>();
        orderMap.put("New Case", 0);
        orderMap.put("Planning In House", 1);
        orderMap.put("Plan Outsourced", 2);
        orderMap.put("Production In House", 3);
        orderMap.put("Production Outsource", 4);
        orderMap.put("ONGOING PRODUCT LIST", 5);
        return orderMap;
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkflowResponseDto> getWorkflows(
            Long profileId, Long orgId, String orderType, Boolean archived, String workflowConfig) {
        Map<String, Integer> orderMap = getShortOrder();

        List<Workflow> workflows = workflowRepository.findByFilters(profileId, orgId, orderType, archived);

        if (workflowConfig != null && !workflowConfig.isEmpty()) {
            try {
                WorkflowConfig config = WorkflowConfig.valueOf(workflowConfig);
                if (config.shouldFilterByName()) {
                    workflows = workflows.stream()
                            .filter(w -> config.getAllowedWorkflowNames().contains(w.getName()))
                            .toList();
                }
            } catch (IllegalArgumentException e) {
                log.warn("Invalid workflow config provided: {}", workflowConfig);
            }
        }

        return workflows.stream()
                .map(mapper::toWorkflowResponseDto)
                .sorted(Comparator.comparingInt(w -> orderMap.getOrDefault(w.getName(), Integer.MAX_VALUE)))
                .collect(Collectors.toList());
    }

    @Override
    public void deleteWorkflow(Long workflowId) {

        Workflow workflow = workflowRepository
                .findById(workflowId)
                .orElseThrow(() -> new GenericException("Workflow not found with id: " + workflowId));

        createHistoryEntry(workflowId, workflow.getUserProfile().getId(), "DELETED", "Workflow deleted");

        workflowRepository.deleteById(workflowId);
    }

    @Override
    public WorkflowResponseDto archiveWorkflow(Long workflowId) {

        Workflow workflow = workflowRepository
                .findById(workflowId)
                .orElseThrow(() -> new GenericException("Workflow not found with id: " + workflowId));

        workflow.setArchived(true);
        workflow.setUpdatedAt(ZonedDateTime.now());

        workflow = workflowRepository.save(workflow);

        createHistoryEntry(workflowId, workflow.getUserProfile().getId(), "ARCHIVED", "Workflow archived");

        return mapper.toWorkflowResponseDto(workflow);
    }

    @Override
    public StatusResponseDto createStatus(Long workflowId, CreateStatusRequestDto request) {

        Workflow workflow = workflowRepository
                .findById(workflowId)
                .orElseThrow(() -> new GenericException("Workflow not found with id: " + workflowId));

        WorkflowStatus status = new WorkflowStatus();
        status.setName(request.getName());
        status.setLabelName(request.getLabelName());
        status.setDescription(request.getDescription());
        status.setInternalName(request.getInternalName());
        status.setMapsTo(request.getMapsTo());
        status.setColor(request.getColor());
        status.setWorkflow(workflow);
        status.setCustom(request.getCustom() != null ? request.getCustom() : true);
        status.setNonDeletable(request.getNonDeletable() != null ? request.getNonDeletable() : false);
        status.setPosition(request.getPosition() != null ? request.getPosition() : 0);

        WorkFlowStatusMetadata metadata = new WorkFlowStatusMetadata(
                workflow.getUserProfile().getId(),
                null,
                request.getName(),
                request.getLabelName(),
                request.getColor(),
                request.getPosition(),
                request.getCustom(),
                request.getNonDeletable());
        status.setMetadata(metadata);

        status = statusRepository.save(status);
        return mapper.toStatusResponseDto(status);
    }

    @Override
    public StatusResponseDto updateStatus(Long statusId, UpdateStatusRequestDto request) {

        WorkflowStatus status = statusRepository
                .findById(statusId)
                .orElseThrow(() -> new GenericException("Status not found with id: " + statusId));

        status.setLabelName(request.getLabelName());
        status.setDescription(request.getDescription());
        status.setColor(request.getColor());
        status.setUpdatedAt(ZonedDateTime.now());

        status = statusRepository.save(status);
        return mapper.toStatusResponseDto(status);
    }

    @Transactional
    @Override
    public void deleteStatus(Long statusId, Long profileId) {
        WorkflowStatus status = statusRepository
                .findById(statusId)
                .orElseThrow(() -> new GenericException("Status not found with id: " + statusId));

        if (Boolean.TRUE.equals(status.getNonDeletable())) {
            throw new GenericException("Cannot delete non-deletable status");
        }

        List<PatientTaskTracker> patientTaskTrackers =
                patientTaskTrackerRepository.findByWorkflowStatusId(status.getId(), profileId);

        if (!patientTaskTrackers.isEmpty()) {
            patientTaskTrackers.forEach((ptt) -> {
                Long prevId = ptt.getPreviousWorkflowStatusId();
                if (prevId == null) {
                    throw new GenericException("Cannot delete status as it is the first status in workflow");
                }
                WorkflowStatus previous = statusRepository
                        .findById(prevId)
                        .orElseThrow(() -> new GenericException("Previous not found with id: " + prevId));
                ptt.setCurrentWorkflowStatus(previous);
                ptt.setCurrentStatusName(previous.getName());
                patientTaskTrackerRepository.save(ptt);
            });
            patientTaskTrackerRepository.flush();
        }

        Long workflowId = status.getWorkflow().getId();
        Integer deletedPosition = status.getPosition();

        statusRepository.deleteWorkflowStatusById(status.getId());
        statusRepository.updatePositionsAfterDelete(workflowId, deletedPosition);
    }

    @Override
    public StatusResponseDto updateStatusPosition(Long statusId, UpdateStatusPositionRequestDto request) {

        WorkflowStatus status = statusRepository
                .findById(statusId)
                .orElseThrow(() -> new GenericException("Status not found with id: " + statusId));

        Integer oldPosition = status.getPosition();
        Integer newPosition = request.getPosition();

        if (oldPosition.equals(newPosition)) {
            return mapper.toStatusResponseDto(status);
        }

        List<WorkflowStatus> allStatuses = statusRepository.findByWorkflow_IdOrderByPositionAsc(
                status.getWorkflow().getId());

        if (newPosition < oldPosition) {
            for (WorkflowStatus otherStatus : allStatuses) {
                if (!otherStatus.getId().equals(statusId)
                        && otherStatus.getPosition() >= newPosition
                        && otherStatus.getPosition() < oldPosition) {
                    otherStatus.setPosition(otherStatus.getPosition() + 1);
                    otherStatus.setUpdatedAt(ZonedDateTime.now());
                }
            }
        } else {
            for (WorkflowStatus otherStatus : allStatuses) {
                if (!otherStatus.getId().equals(statusId)
                        && otherStatus.getPosition() > oldPosition
                        && otherStatus.getPosition() <= newPosition) {
                    otherStatus.setPosition(otherStatus.getPosition() - 1);
                    otherStatus.setUpdatedAt(ZonedDateTime.now());
                }
            }
        }

        status.setPosition(newPosition);
        status.setUpdatedAt(ZonedDateTime.now());

        statusRepository.saveAll(allStatuses);
        status = statusRepository.save(status);

        return mapper.toStatusResponseDto(status);
    }

    @Override
    public ServiceResponseDto createService(CreateServiceRequestDto request) {

        var userProfile = userProfileRepository.findById(request.getProfileId()).orElseThrow();
        WorkflowService service = new WorkflowService();
        service.setUserProfile(userProfile);
        service.setOrgId(request.getOrgId());
        service.setSubscriptionType(request.getSubscriptionType());
        service.setServiceProducts(request.getServiceProducts());
        service.setServiceProductLabel(request.getServiceProductLabel());

        service = serviceRepository.save(service);
        return mapper.toServiceResponseDto(service);
    }

    @Override
    public ServiceResponseDto updateService(Long serviceId, UpdateServiceRequestDto request) {

        WorkflowService service = serviceRepository
                .findById(serviceId)
                .orElseThrow(() -> new GenericException("Service not found with id: " + serviceId));

        service.setSubscriptionType(request.getSubscriptionType());
        service.setServiceProducts(request.getServiceProducts());
        service.setServiceProductLabel(request.getServiceProductLabel());
        service.setUpdatedAt(ZonedDateTime.now());

        service = serviceRepository.save(service);
        return mapper.toServiceResponseDto(service);
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceResponseDto getServiceById(Long serviceId) {

        WorkflowService service = serviceRepository
                .findById(serviceId)
                .orElseThrow(() -> new GenericException("Service not found with id: " + serviceId));

        return mapper.toServiceResponseDto(service);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ServiceResponseDto> getServices(
            Long profileId, Long orgId, String subscriptionType, Pageable pageable) {

        Page<WorkflowService> services = serviceRepository.findByFilters(profileId, orgId, subscriptionType, pageable);
        return services.map(mapper::toServiceResponseDto);
    }

    @Override
    public void deleteService(Long serviceId) {
        serviceRepository.deleteById(serviceId);
    }

    @Override
    public List<WorkflowResponseDto> getKanbanBoard(KanBanGetBoardRequest request) {
        var kanbanName = request.getKanbanName();
        var kanbanHeaderName = request.getKanbanHeaderName();
        var profileId = request.getProfileId();
        var orgId = request.getOrganizationId();

        var isInternalUser =
                userProfileRepository.isInternalUser(request.getProfileId(), DoctorRole.INTERNAL_USER.name());

        if (isInternalUser) {
            UserProfile userProfile = userProfileRepository
                    .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                    .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
            if (userProfile.getInviterProfile() != null) {
                profileId = userProfile.getInviterProfile().getId();
                orgId = userProfile.getInviterProfile().getOrganization().getId();
            }
        }

        List<Workflow> workflows =
                workflowRepository.getKanbanBoardByFilters(profileId, orgId, kanbanHeaderName, kanbanName);
        return workflows.stream().map(mapper::toWorkflowResponseDto).collect(Collectors.toList());
    }

    @Override
    public void assignWorkflowToUserProfile(Long profileId) {
        defaultWorkflowService.createDefaultWorkflows(profileId);
    }

    private void createHistoryEntry(Long workflowId, Long profileId, String action, String description) {
        try {

            var workflow = workflowRepository
                    .findById(workflowId)
                    .orElseThrow(() -> new GenericException("Workflow not found with id: " + workflowId));

            var userProfile = userProfileRepository.findById(profileId).orElseThrow();
            WorkflowHistory history = new WorkflowHistory();
            history.setWorkflow(workflow);
            history.setUserProfile(userProfile);
            history.setChangeType(action);

            WorkFlowHistoryMetadata metadata =
                    new WorkFlowHistoryMetadata(profileId, workflowId, action, profileId, System.currentTimeMillis());
            history.setDiff(metadata);

            workflowHistoryRepository.save(history);
        } catch (Exception ignored) {
        }
    }
}
