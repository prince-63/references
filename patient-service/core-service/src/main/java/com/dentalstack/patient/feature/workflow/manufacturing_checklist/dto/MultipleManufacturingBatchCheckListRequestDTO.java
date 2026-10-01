package com.dentalstack.patient.feature.workflow.manufacturing_checklist.dto;

import java.util.List;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MultipleManufacturingBatchCheckListRequestDTO {
    private Long profileId;
    private Long organizationId;
    private Long doctorId;
    private List<ManufacturingBatchCheckListRequestDTO> data;
}
