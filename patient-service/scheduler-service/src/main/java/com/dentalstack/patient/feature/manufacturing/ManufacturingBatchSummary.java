package com.dentalstack.patient.feature.manufacturing;

import java.time.LocalDate;

public interface ManufacturingBatchSummary {
    Long getId();

    Long getOrderId();

    Long getTreatmentPlanId();

    Long getPatientId();

    ManufacturingStatus getStatus();

    Integer getUpperAlignerStart();

    Integer getUpperAlignerEnd();

    Integer getLowerAlignerStart();

    Integer getLowerAlignerEnd();

    Integer getTotalAligners();

    LocalDate getStartDate();

    LocalDate getCompletionDate();

    Integer getBatchNumber();

    LocalDate getShippingDate();

    LocalDate getDeliveryDate();

    Boolean getIsCurrent();
}
