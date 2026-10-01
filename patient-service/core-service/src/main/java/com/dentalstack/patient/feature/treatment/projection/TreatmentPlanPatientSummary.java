package com.dentalstack.patient.feature.treatment.projection;

import com.dentalstack.patient.feature.order.enums.ManufacturingStatus;
import com.dentalstack.patient.feature.order.enums.OrderTreatmentPlanStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public interface TreatmentPlanPatientSummary {
    Long getPatientId();

    String getBrandName();

    OrderTreatmentPlanStatus getApproverStatus();

    LocalDateTime getCreatedAt();

    LocalDateTime getUpdatedAt();

    String getOrderStatus();

    ManufacturingStatus getManufacturingStatus();

    Boolean getTrackingAdded();

    Long getAlignerJourneyId();

    LocalDate getStartDate();

    LocalDate getEndDate();
}
