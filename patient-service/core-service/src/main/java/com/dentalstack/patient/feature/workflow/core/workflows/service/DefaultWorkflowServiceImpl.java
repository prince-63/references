package com.dentalstack.patient.feature.workflow.core.workflows.service;

import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.workflow.core.workflows.entity.Workflow;
import com.dentalstack.patient.feature.workflow.core.workflows.entity.WorkflowStatus;
import com.dentalstack.patient.feature.workflow.core.workflows.metadata.WorkFlowMetadata;
import com.dentalstack.patient.feature.workflow.core.workflows.metadata.WorkFlowStatusMetadata;
import com.dentalstack.patient.feature.workflow.core.workflows.repository.WorkflowRepository;
import com.dentalstack.patient.feature.workflow.core.workflows.repository.WorkflowStatusRepository;
import com.dentalstack.patient.feature.workflow.service_configuration.dto.AssignServiceItemsRequestDTO;
import com.dentalstack.patient.feature.workflow.service_configuration.entity.ServiceItem;
import com.dentalstack.patient.feature.workflow.service_configuration.repository.ServiceConfigurationRepository;
import com.dentalstack.patient.feature.workflow.service_configuration.repository.ServiceItemRepository;
import com.dentalstack.patient.feature.workflow.service_configuration.service.ServiceConfigurationService;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DefaultWorkflowServiceImpl implements DefaultWorkflowService {

    private final WorkflowRepository workflowRepository;
    private final WorkflowStatusRepository workflowStatusRepository;
    private final UserProfileRepository userProfileRepository;
    private final ServiceConfigurationService serviceConfigurationService;
    private final ServiceItemRepository serviceItemRepository;
    private final ServiceConfigurationRepository serviceConfigurationRepository;

    @Transactional
    @Override
    public void createDefaultWorkflows(Long profileId) {

        UserProfile userProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(profileId)
                .orElseThrow(() -> new RuntimeException("UserProfile not found with id: " + profileId));

        if (userProfile.isEnterpriseOrDesignLab() || userProfile.isInHouseManufacturingLab()) {

            var serviceItem = serviceItemRepository.findByItemName("ALIGNERS(PLANNING + MANUFACTURING)");
            serviceItem.ifPresent(
                    item -> serviceConfigurationService.assignServiceItemsToUser(AssignServiceItemsRequestDTO.builder()
                            .profileId(profileId)
                            .serviceItemIds(Set.of(item.getId()))
                            .build()));
        } else {
            var inviterProfile = userProfile.getInviterProfile();
            Long sourceProfileId = inviterProfile != null ? inviterProfile.getId() : userProfile.getId();
            List<String> enabledItems = serviceConfigurationRepository.findEnabledItemNames(sourceProfileId);

            String itemNameToAssign;
            if (enabledItems.stream().anyMatch("MANUFACTURING"::equals)) {
                itemNameToAssign = "MANUFACTURING";
            } else if (enabledItems.stream().anyMatch("PLANNING"::equals)) {
                itemNameToAssign = "PLANNING";
            } else if (enabledItems.stream().anyMatch("VSP PLANNING"::equals)) {
                itemNameToAssign = "VSP PLANNING";
            } else {
                itemNameToAssign = "ALIGNERS(PLANNING + MANUFACTURING)";
            }

            serviceItemRepository
                    .findByItemName(itemNameToAssign)
                    .ifPresent(item ->
                            serviceConfigurationService.assignServiceItemsToUser(AssignServiceItemsRequestDTO.builder()
                                    .profileId(profileId)
                                    .serviceItemIds(Set.of(item.getId()))
                                    .build()));
        }
        if ((userProfile.getPlan() != null
                && ("STARTER_PLAN".equals(userProfile.getPlan().getName())
                        || "LITE_PLAN".equals(userProfile.getPlan().getName())))) {

            List<ServiceItem> serviceItems =
                    serviceItemRepository.findByItemNames(List.of("BRACES ADD-ON", "PAYMENT AND BILLING"));

            Set<Long> itemsIds = new HashSet<>();
            if (serviceItems != null && !serviceItems.isEmpty()) {
                serviceItems.forEach(item -> itemsIds.add(item.getId()));
            }
            serviceConfigurationService.assignServiceItemsToUser(AssignServiceItemsRequestDTO.builder()
                    .profileId(profileId)
                    .serviceItemIds(itemsIds)
                    .build());
        }
        var defaultWorkflowsExist = defaultWorkflowsExist(
                userProfile.getId(), userProfile.getOrganization().getId());
        if (defaultWorkflowsExist) {
            log.warn("Already workflow exists for this user");
            return;
        }
        List<Workflow> templateWorkflows = workflowRepository.findByIsDentalStackDefinedWorkflowTrue();

        if (templateWorkflows.isEmpty()) {
            log.warn("No template workflows found");
            return;
        }

        for (Workflow templateWorkflow : templateWorkflows) {
            log.debug("Processing template workflow: {}", templateWorkflow.getName());

            Workflow newWorkflow = createWorkflowFromTemplate(templateWorkflow, userProfile);

            newWorkflow = workflowRepository.save(newWorkflow);
            log.debug("Created new workflow with ID: {}", newWorkflow.getId());

            createWorkflowStatusesFromTemplate(templateWorkflow, newWorkflow);
        }
    }

    private Workflow createWorkflowFromTemplate(Workflow templateWorkflow, UserProfile userProfile) {
        WorkFlowMetadata workFlowMetadata = new WorkFlowMetadata(userProfile.getId());

        return Workflow.builder()
                .orgId(userProfile.getOrganization().getId())
                .orderType(templateWorkflow.getOrderType())
                .name(templateWorkflow.getName())
                .label(templateWorkflow.getLabel())
                .userProfile(userProfile)
                .systemDefined(true)
                .archived(false)
                .metadata(workFlowMetadata)
                .build();
    }

    private void createWorkflowStatusesFromTemplate(Workflow templateWorkflow, Workflow newWorkflow) {
        List<WorkflowStatus> templateStatuses = templateWorkflow.getStatuses();

        if (templateStatuses == null || templateStatuses.isEmpty()) {
            log.warn("No statuses found for template workflow: {}", templateWorkflow.getName());
            return;
        }

        for (WorkflowStatus templateStatus : templateStatuses) {
            log.debug("Creating status: {} for workflow: {}", templateStatus.getName(), newWorkflow.getName());

            if (templateStatus.getCustom()) {
                log.debug("Skipping custom status: {} from template", templateStatus.getName());
                continue;
            }
            WorkflowStatus newStatus = createStatusFromTemplate(templateStatus, newWorkflow);
            workflowStatusRepository.save(newStatus);
        }
    }

    private WorkflowStatus createStatusFromTemplate(WorkflowStatus templateStatus, Workflow newWorkflow) {
        WorkflowStatus newStatus = new WorkflowStatus();

        newStatus.setName(templateStatus.getName());
        newStatus.setLabelName(templateStatus.getName());
        newStatus.setDescription(templateStatus.getDescription());
        newStatus.setInternalName(templateStatus.getInternalName());
        newStatus.setMapsTo(templateStatus.getMapsTo());
        newStatus.setColor(templateStatus.getColor());
        newStatus.setWorkflow(newWorkflow);
        newStatus.setCustom(false);
        newStatus.setNonDeletable(templateStatus.getNonDeletable() != null ? templateStatus.getNonDeletable() : true);
        newStatus.setPosition(templateStatus.getPosition());

        if (templateStatus.getInitialPosition() != null) {
            newStatus.setInitialPosition(templateStatus.getInitialPosition());
        } else {
            newStatus.setInitialPosition(templateStatus.getPosition() != null ? templateStatus.getPosition() : 0);
        }

        WorkFlowStatusMetadata metadata = new WorkFlowStatusMetadata(
                newWorkflow.getUserProfile().getId(),
                null,
                newStatus.getName(),
                newStatus.getLabelName(),
                newStatus.getColor(),
                newStatus.getPosition(),
                newStatus.getCustom(),
                newStatus.getNonDeletable());
        newStatus.setMetadata(metadata);

        return newStatus;
    }

    public boolean defaultWorkflowsExist(Long profileId, Long orgId) {
        List<Workflow> existingWorkflows = workflowRepository.findByFilters(profileId, orgId, null, null);
        return !existingWorkflows.isEmpty();
    }
}
