package com.dentalstack.patient.feature.workflow.manufacturing_checklist.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManufacturingBatchCheckListRequestDTO {
    private Long patientId;
    private Long profileId;
    private Long manufacturingBatchId;
    private String title;

    @Builder.Default
    private Boolean checked = false;
}
