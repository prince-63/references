package com.dentalstack.patient.feature.aligner.dto.alignertreatment;

import com.dentalstack.patient.feature.order.enums.OrderTreatmentPlanStatus;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import java.io.Serial;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class LinkedTreatmentPlanMetadata implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long linkedTreatmentPlanId;
    private OrderTreatmentPlanStatus initiatorStatus;
    private OrderTreatmentPlanStatus approverStatus;

    public static LinkedTreatmentPlanMetadata from(TreatmentPlan linkedTreatmentPlan) {
        return LinkedTreatmentPlanMetadata.builder()
                .linkedTreatmentPlanId(linkedTreatmentPlan.getId())
                .initiatorStatus(linkedTreatmentPlan.getInitiatorStatus())
                .approverStatus(linkedTreatmentPlan.getApproverStatus())
                .build();
    }
}
