package com.dentalstack.patient.feature.order.projection;

import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.order.enums.OrderTreatmentPlanStatus;

public interface TreatmentPlanDetailsProjection {
    Long getId();

    OrderTreatmentPlanStatus getApproverStatus();

    OrderTreatmentPlanStatus getInitiatorStatus();

    AlignerTreatmentStatus getStatus();

    String getOrderId();
}
