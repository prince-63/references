package com.dentalstack.patient.feature.treatment.projection;

import com.dentalstack.patient.feature.aligner.dto.aligner.STLFileMetadata;
import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.order.enums.OrderTreatmentPlanStatus;
import com.dentalstack.patient.feature.treatment.dto.TreatmentPlanMetadata;
import com.dentalstack.patient.feature.treatment.entity.AlignerDetailsMetadata;
import java.time.LocalDate;
import java.time.ZonedDateTime;

public interface TreatmentPlanSummary {
    Long getPatientId();

    Long getDoctorId();

    AlignerTreatmentStatus getStatus();

    ZonedDateTime getCreatedAt();

    Long getId();

    String getTreatmentPlanName();

    AlignerDetailsMetadata getAlignerDetailsMetadata();

    String getTreatmentPlanningLink();

    String getTreatmentType();

    String getTreatmentPlanTagName();

    Boolean getIsApprovedByPatient();

    LocalDate getApprovedByPatientAt();

    String getTreatmentDeactivatedReason();

    String getTreatmentDeactivatedRemark();

    LocalDate getDeactivatedAt();

    String getOrderId();

    OrderTreatmentPlanStatus getInitiatorStatus();

    OrderTreatmentPlanStatus getApproverStatus();

    ZonedDateTime getOrderStatusChangedAt();

    ZonedDateTime createdAt();

    TreatmentPlanMetadata getTreatmentPlanMetadata();

    STLFileMetadata getStlFileMetadata();

    Long getLinkedTreatmentPlanId();

    OrderTreatmentPlanStatus getLinkedInitiatorStatus();

    OrderTreatmentPlanStatus getLinkedApproverStatus();

    Integer getLinkedTreatmentPlanCount();

    Long getParentLinkedTreatmentPlanId();

    OrderTreatmentPlanStatus getParentLinkedInitiatorStatus();

    OrderTreatmentPlanStatus getParentLinkedApproverStatus();

    Integer getUpperStart();

    Integer getUpperEnd();

    Integer getLowerStart();

    Integer getLowerEnd();

    String getPatientFullName();

    String getPatientProfileUrl();

    LocalDate getDueBy();

    String getCustomerName();

    String getTreatmentPlanCompletedRemarks();
}
