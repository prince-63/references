package com.dentalstack.patient.feature.treatment.projections;

import com.dentalstack.patient.feature.order.enums.OrderTreatmentPlanStatus;
import com.dentalstack.patient.feature.treatment.entity.AlignerDetailsMetadata;
import com.dentalstack.patient.feature.treatment.enums.AlignerTreatmentStatus;
import java.time.LocalDate;
import java.time.ZonedDateTime;

public interface TreatmentPlanSummary {
    Long getPatientId();

    Long getDoctorId();

    AlignerTreatmentStatus getStatus();

    ZonedDateTime getCreatedAt();

    Long getId(); // for treatmentPlanId

    String getTreatmentPlanName();

    AlignerDetailsMetadata getAlignerDetailsMetadata();

    String getTreatmentPlanningLink();

    String getTreatmentType();

    String getTreatmentPlanTagName();

    Boolean getIsApprovedByPatient();

    LocalDate getApprovedByPatientAt();

    // Add these new fields
    String getTreatmentDeactivatedReason();

    String getTreatmentDeactivatedRemark();

    LocalDate getDeactivatedAt();

    String getOrderId();

    OrderTreatmentPlanStatus getInitiatorStatus();

    OrderTreatmentPlanStatus getApproverStatus();

    ZonedDateTime getOrderStatusChangedAt();

    ZonedDateTime createdAt();

    String getOrgName();

    String getPatientFullName();

    String getCustomerName();

    String getUserEmail();
}
