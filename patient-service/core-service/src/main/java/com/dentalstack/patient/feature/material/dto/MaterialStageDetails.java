package com.dentalstack.patient.feature.material.dto;

import com.dentalstack.patient.feature.material.entity.MaterialTreatmentStage;
import com.dentalstack.patient.feature.material.enums.MaterialStageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MaterialStageDetails {

    private MaterialStageType materialStageType;
    private Long materialStageId;

    public static MaterialStageDetails from(MaterialTreatmentStage treatmentStage) {
        return MaterialStageDetails.builder()
                .materialStageType(treatmentStage.getMaterialStageType())
                .materialStageId(treatmentStage.getId())
                .build();
    }
}
