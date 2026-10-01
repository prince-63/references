package com.dentalstack.patient.feature.order.projection;

import com.dentalstack.patient.feature.order.enums.BatchType;
import com.dentalstack.patient.feature.order.enums.ManufacturingStatus;
import java.time.LocalDate;

public interface ManufacturingBatchSummary {
    Long getId();

    Long getOrderId();

    Long getTreatmentPlanId();

    Long getPatientId();

    BatchType getBatchType();

    ManufacturingStatus getStatus();

    Integer getUpperAlignerStart();

    Integer getUpperAlignerEnd();

    Integer getLowerAlignerStart();

    Integer getLowerAlignerEnd();

    Integer getTotalAligners();

    LocalDate getStartDate();

    LocalDate getCompletionDate();

    Integer getBatchNumber();
}
