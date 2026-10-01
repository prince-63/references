package com.dentalstack.patient.feature.treatment.dto;

import com.dentalstack.patient.global.enums.ProductTypeName;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TreatmentPlanForWorkflowRequest {

    private Long patientId;

    private Long doctorId;

    private Long organizationId;

    private ProductTypeName treatmentSubtype;

    private String orderId;

    private Boolean isOnlyApproved;
    private Boolean isLatestOrderPlanRequired;
    private Long profileId;

    @Builder.Default
    private Integer page = 0;

    @Builder.Default
    private Integer size = 10;
}
