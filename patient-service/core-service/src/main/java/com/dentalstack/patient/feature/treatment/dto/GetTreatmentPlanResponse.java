package com.dentalstack.patient.feature.treatment.dto;

import com.dentalstack.patient.feature.aligner.dto.aligner.STLFileMetadata;
import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.order.enums.OrderTreatmentPlanStatus;
import com.dentalstack.patient.global.enums.ProductTypeName;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import javax.annotation.Nullable;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GetTreatmentPlanResponse {
    private String planName;
    private AlignerTreatmentStatus status;
    private int totalNumberOfAligners;
    private String planningLink;
    private ProductTypeName treatmentSubType;
    private long treatmentPlanId;

    @Nullable
    private Long alignerJourneyId;

    @Nullable
    private LocalDate latestDeactivatedDate;

    private OrderTreatmentPlanStatus initiatorStatus;
    private OrderTreatmentPlanStatus approverStatus;
    private ZonedDateTime orderStatusChangedAt;
    private String orderId;
    private STLFileMetadata stlFileMetadata;
}
