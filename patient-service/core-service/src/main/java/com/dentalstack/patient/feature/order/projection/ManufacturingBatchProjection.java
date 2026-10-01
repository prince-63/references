package com.dentalstack.patient.feature.order.projection;

import com.dentalstack.patient.feature.order.enums.BatchType;
import com.dentalstack.patient.feature.order.enums.ManufacturingStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public interface ManufacturingBatchProjection {
    Long getTreatmentPlanId();

    Long getId();

    ManufacturingStatus getStatus();

    LocalDate getStartDate();

    LocalDate getCompletionDate();

    LocalDate getShippingDate();

    LocalDate getDeliveryDate();

    BatchType getBatchType();

    Integer getTotalAligners();

    Integer getUpperAlignerStart();

    Integer getUpperAlignerEnd();

    Integer getLowerAlignerStart();

    Integer getLowerAlignerEnd();

    String getTrackingNumber();

    String getTrackingLink();

    LocalDateTime getCreatedAt();
}
