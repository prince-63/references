package com.dentalstack.patient.feature.workflow.core.task_tracker.dto;

import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.workflow.core.workflows.metadata.WorkFlowManagementMetadata;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManufacturingMetadataResponse {
    private Long treatmentPlanId;
    private Integer batchNumber;
    private ManufacturingMetadata.Category category;
    private JawType jawType;
    private Integer alignerNumber;
    private Long manufacturingId;
    private String treatmentVersion;

    public static ManufacturingMetadataResponse from(WorkFlowManagementMetadata workFlowManagementMetadata) {
        if (!(workFlowManagementMetadata instanceof ManufacturingMetadata metadata)) {
            return null;
        }

        return ManufacturingMetadataResponse.builder()
                .treatmentPlanId(metadata.getTreatmentPlanId())
                .batchNumber(metadata.getBatchNumber())
                .category(metadata.getCategory())
                .jawType(metadata.getJawType())
                .alignerNumber(metadata.getAlignerNumber())
                .manufacturingId(metadata.getManufacturingId())
                .treatmentVersion(metadata.getTreatmentVersion())
                .build();
    }
}
