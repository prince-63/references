package com.dentalstack.patient.feature.treatment.dto;

import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class ProductionLabDetails {

    private Long productionLabId;

    private String brandName;

    public static ProductionLabDetails from(TreatmentPlan treatmentPlan) {
        return ProductionLabDetails.builder()
                .productionLabId(treatmentPlan.getProductionLabId())
                .brandName(treatmentPlan.getBrandName())
                .build();
    }
}
