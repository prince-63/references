package com.dentalstack.patient.feature.workflow.core.workflows.metadata;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class WorkFlowMetadata extends WorkFlowManagementMetadata implements Serializable {

    private Long profileId;

    @JsonCreator
    public WorkFlowMetadata(Long profileId) {
        super(WorkFlowManagementMetadataType.WORKFLOW);
        this.profileId = profileId;
    }
}
