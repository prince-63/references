package com.dentalstack.patient.feature.patient.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.ZonedDateTime;
import lombok.*;

@EqualsAndHashCode(callSuper = false)
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PlanningStepperResponse {
    @JsonProperty("next_action")
    private String nextAction;

    private String orderStatus;
    private String actualOrderStatus;
    private String orderId;
    private Long pendingReviewTreatmentCount;
    private String notes;
    private String remark;
    private ZonedDateTime commentAddedAt;
}
