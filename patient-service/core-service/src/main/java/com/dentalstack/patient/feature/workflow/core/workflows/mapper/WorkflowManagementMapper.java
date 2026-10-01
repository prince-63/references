package com.dentalstack.patient.feature.workflow.core.workflows.mapper;

import com.dentalstack.patient.feature.workflow.card_display.dto.CardDisplayConfigResponseDto;
import com.dentalstack.patient.feature.workflow.card_display.dto.CardDisplayFieldResponseDto;
import com.dentalstack.patient.feature.workflow.card_display.entity.CardDisplayConfig;
import com.dentalstack.patient.feature.workflow.card_display.entity.CardDisplayField;
import com.dentalstack.patient.feature.workflow.core.workflows.dto.ServiceResponseDto;
import com.dentalstack.patient.feature.workflow.core.workflows.dto.StatusResponseDto;
import com.dentalstack.patient.feature.workflow.core.workflows.dto.WorkflowResponseDto;
import com.dentalstack.patient.feature.workflow.core.workflows.entity.Workflow;
import com.dentalstack.patient.feature.workflow.core.workflows.entity.WorkflowService;
import com.dentalstack.patient.feature.workflow.core.workflows.entity.WorkflowStatus;
import com.dentalstack.patient.feature.workflow.core.workflows.metadata.WorkFlowMetadata;
import com.dentalstack.patient.feature.workflow.product.dto.ServiceProductResponseDto;
import com.dentalstack.patient.feature.workflow.product.entity.ServiceProduct;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class WorkflowManagementMapper {

    public WorkflowResponseDto toWorkflowResponseDto(Workflow workflow) {
        if (workflow == null) return null;
        WorkflowResponseDto dto = new WorkflowResponseDto();
        dto.setId(workflow.getId());

        Long profileId = null;
        if (workflow.getUserProfile() != null)
            profileId = workflow.getUserProfile().getId();
        else if (workflow.getMetadata() instanceof WorkFlowMetadata) {
            profileId = ((WorkFlowMetadata) workflow.getMetadata()).getProfileId();
        }
        dto.setProfileId(profileId);

        dto.setOrgId(workflow.getOrgId());
        dto.setOrderType(workflow.getOrderType());
        dto.setName(workflow.getName());
        dto.setLabel(workflow.getLabel());
        dto.setSystemDefined(workflow.getSystemDefined());
        dto.setArchived(workflow.getArchived());
        dto.setMetadata(workflow.getMetadata());

        List<WorkflowStatus> statuses = workflow.getStatuses();
        if (statuses != null) {
            for (WorkflowStatus status : statuses) {
                toStatusResponseDto(status);
            }
            dto.setStatuses(statuses.stream()
                    .filter(java.util.Objects::nonNull)
                    .filter(s -> !"Cancelled".equals(s.getLabelName()))
                    .map(this::toStatusResponseDto)
                    .collect(Collectors.toList()));
        }

        dto.setCreatedAt(zoneToLocal(workflow.getCreatedAt()));
        dto.setUpdatedAt(zoneToLocal(workflow.getUpdatedAt()));
        dto.setPosition(workflow.getPosition());
        return dto;
    }

    public StatusResponseDto toStatusResponseDto(WorkflowStatus status) {
        if (status == null) return null;
        StatusResponseDto dto = new StatusResponseDto();
        dto.setId(status.getId());
        dto.setName(status.getName());
        dto.setLabelName(status.getLabelName());
        dto.setDescription(status.getDescription());
        dto.setInternalName(status.getInternalName());
        dto.setMapsTo(status.getMapsTo());
        dto.setCustom(status.getCustom());
        dto.setColor(status.getColor());
        dto.setNonDeletable(status.getNonDeletable());
        dto.setPosition(status.getPosition());
        return dto;
    }

    public ServiceResponseDto toServiceResponseDto(WorkflowService service) {
        if (service == null) return null;
        ServiceResponseDto dto = new ServiceResponseDto();
        dto.setId(service.getId());
        dto.setProfileId(
                service.getUserProfile() != null ? service.getUserProfile().getId() : null);
        dto.setOrgId(service.getOrgId());
        dto.setSubscriptionType(service.getSubscriptionType());
        dto.setServiceProducts(service.getServiceProducts());
        dto.setServiceProductLabel(service.getServiceProductLabel());
        dto.setCreatedAt(zoneToLocal(service.getCreatedAt()));
        dto.setUpdatedAt(zoneToLocal(service.getUpdatedAt()));
        return dto;
    }

    public ServiceProductResponseDto toServiceProductResponseDto(ServiceProduct product) {
        if (product == null) return null;
        ServiceProductResponseDto dto = new ServiceProductResponseDto();
        dto.setId(product.getId());
        dto.setProductType(product.getProductType());
        dto.setProductName(product.getProductName());
        dto.setCategory(product.getProductCategory().getName());
        dto.setProductDescription(product.getProductDescription());
        dto.setProductImage(product.getProductImage());
        dto.setProductMetadata(product.getProductMetadata());
        dto.setCreatedAt(zoneToLocal(product.getCreatedAt()));
        dto.setUpdatedAt(zoneToLocal(product.getUpdatedAt()));
        return dto;
    }

    public CardDisplayConfigResponseDto toCardDisplayConfigResponseDto(CardDisplayConfig config) {
        if (config == null) return null;
        CardDisplayConfigResponseDto dto = new CardDisplayConfigResponseDto();
        dto.setId(config.getId());
        dto.setProfileId(config.getUserProfile().getId());
        dto.setActive(config.getActive());
        dto.setOrgId(config.getOrgId());
        dto.setCardDisplayFields(config.getCardDisplayFields().stream()
                .map(CardDisplayFieldResponseDto::from)
                .collect(Collectors.toList()));
        return dto;
    }

    public CardDisplayFieldResponseDto toCardDisplayFieldResponseDto(CardDisplayField field) {
        if (field == null) return null;
        CardDisplayFieldResponseDto dto = new CardDisplayFieldResponseDto();
        dto.setId(field.getId());
        dto.setConfigId(field.getConfig() != null ? field.getConfig().getId() : null);
        dto.setFieldKey(field.getFieldKey());
        dto.setLabel(field.getLabel());
        dto.setEnabled(field.getEnabled());
        dto.setPosition(field.getPosition());
        dto.setDisplayType(field.getDisplayType());
        dto.setSampleValue(field.getSampleValue());
        dto.setShowInPreview(field.getShowInPreview());
        return dto;
    }

    private LocalDateTime zoneToLocal(java.time.ZonedDateTime zdt) {
        return zdt != null ? zdt.toLocalDateTime() : null;
    }
}
