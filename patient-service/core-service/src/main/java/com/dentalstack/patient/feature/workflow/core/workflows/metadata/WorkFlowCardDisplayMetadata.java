package com.dentalstack.patient.feature.workflow.core.workflows.metadata;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class WorkFlowCardDisplayMetadata extends WorkFlowManagementMetadata implements Serializable {

    private Long profileId;
    private UUID orgId;
    private String serviceId;
    private String name;
    private Boolean active;
    private Long createdBy;
    private Long updatedBy;

    @JsonCreator
    public WorkFlowCardDisplayMetadata(
            @JsonProperty("profileId") Long profileId,
            @JsonProperty("orgId") UUID orgId,
            @JsonProperty("serviceId") String serviceId,
            @JsonProperty("name") String name,
            @JsonProperty("active") Boolean active,
            @JsonProperty("createdBy") Long createdBy,
            @JsonProperty("updatedBy") Long updatedBy) {
        super(WorkFlowManagementMetadataType.WORKFLOW_CARD_DISPLAY);
        this.profileId = profileId;
        this.orgId = orgId;
        this.serviceId = serviceId;
        this.name = name;
        this.active = active;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
    }
}
