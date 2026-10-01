package com.dentalstack.patient.feature.vsp.dto.response;

import com.dentalstack.patient.feature.vsp.entity.VspTreatmentSubPlan;
import com.dentalstack.patient.feature.vsp.enums.VspTreatmentPlanStatus;
import java.time.ZonedDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VspTreatmentSubPlanResponse {

    private Long id;
    private String subPlanName;
    private Integer subPlanIndex;

    private VspTreatmentPlanStatus status;

    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    public static VspTreatmentSubPlanResponse from(VspTreatmentSubPlan sp) {
        return VspTreatmentSubPlanResponse.builder()
                .id(sp.getId())
                .subPlanName(sp.getSubPlanName())
                .subPlanIndex(sp.getSubPlanIndex())
                .status(sp.getStatus())
                .createdAt(sp.getCreatedAt())
                .updatedAt(sp.getUpdatedAt())
                .build();
    }
}
