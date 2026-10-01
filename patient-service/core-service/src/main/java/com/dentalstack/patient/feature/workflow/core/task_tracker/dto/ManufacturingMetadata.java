package com.dentalstack.patient.feature.workflow.core.task_tracker.dto;

import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.workflow.core.workflows.metadata.WorkFlowManagementMetadata;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class ManufacturingMetadata extends WorkFlowManagementMetadata implements Serializable {

    private Long treatmentPlanId;
    private Integer batchNumber;
    private Category category;
    private JawType jawType;
    private Integer alignerNumber;
    private Long manufacturingId;
    private String treatmentVersion;

    public enum Category {
        ALIGNER,
        RETAINER,
        TEMPLATE,
    }

    @JsonCreator
    public ManufacturingMetadata(
            Long treatmentPlanId,
            Integer batchNumber,
            Category category,
            JawType jawType,
            Integer alignerNumber,
            Long manufacturingId,
            String treatmentVersion) {
        super(WorkFlowManagementMetadataType.MANUFACTURING);
        this.treatmentPlanId = treatmentPlanId;
        this.batchNumber = batchNumber;
        this.category = category;
        this.jawType = jawType;
        this.alignerNumber = alignerNumber;
        this.manufacturingId = manufacturingId;
        this.treatmentVersion = treatmentVersion;
    }
}
