package com.dentalstack.patient.feature.workflow.manufacturing_checklist.dto;

import com.dentalstack.patient.feature.workflow.manufacturing_checklist.entity.ManufacturingBatchCheckList;
import java.time.ZonedDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManufacturingBatchCheckListResponseDTO {
    private Long id;
    private Long patientId;
    private Long profileId;
    private Long manufacturingBatchId;
    private String title;
    private Boolean checked;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    public static ManufacturingBatchCheckListResponseDTO mapToResponse(ManufacturingBatchCheckList entity) {
        return ManufacturingBatchCheckListResponseDTO.builder()
                .id(entity.getId())
                .patientId(entity.getPatient() != null ? entity.getPatient().getId() : null)
                .profileId(entity.getAddedBy() != null ? entity.getAddedBy().getId() : null)
                .manufacturingBatchId(entity.getManufacturingBatch().getId())
                .title(entity.getTitle())
                .checked(entity.getChecked())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
