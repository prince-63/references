package com.dentalstack.patient.feature.treatment.projection;

import com.dentalstack.patient.feature.aligner.dto.AlignerInfo;
import com.dentalstack.patient.feature.aligner.dto.aligner.STLFileMetadata;
import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.order.enums.OrderTreatmentPlanStatus;
import com.dentalstack.patient.feature.treatment.dto.TreatmentPlanMetadata;
import com.dentalstack.patient.feature.treatment.dto.TreatmentPlanResponse;
import com.dentalstack.patient.feature.treatment.entity.AlignerDetailsMetadata;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.Collections;

public interface TreatmentPlanProfileSummary {

    Long getId();

    String getOrderId();

    String getTreatmentPlanName();

    String getTreatmentPlanTagName();

    AlignerTreatmentStatus getStatus();

    String getTreatmentType();

    String getTreatmentPlanningLink();

    Long getDoctorId();

    Boolean getIsApprovedByPatient();

    LocalDate getApprovedByPatientAt();

    ZonedDateTime getOrderStatusChangedAt();

    OrderTreatmentPlanStatus getInitiatorStatus();

    OrderTreatmentPlanStatus getApproverStatus();

    ZonedDateTime getCreatedAt();

    AlignerDetailsMetadata getAlignerDetailsMetadata();

    TreatmentPlanMetadata getTreatmentPlanMetadata();

    STLFileMetadata getStlFileMetadata();

    Long getLinkedTreatmentPlanId();

    OrderTreatmentPlanStatus getLinkedInitiatorStatus();

    OrderTreatmentPlanStatus getLinkedApproverStatus();

    String getParentOrderId();

    LocalDate getStartDate();

    LocalDate getEndDate();

    String getTreatmentPlanVersion();

    String getRemarks();

    String getOtherRemarks();

    Integer getDaysToWearEachAligner();

    ZonedDateTime getUpdatedAt();

    Long getTotalFileCount();

    default TreatmentPlanResponse toTreatmentPlanResponse() {

        AlignerInfo alignerInfo = TreatmentPlan.getTotalAlignersFromMetadata(this);

        String upperSeries =
                (alignerInfo != null) ? alignerInfo.getUpperRangeStart() + "-" + alignerInfo.getUpperRangeEnd() : null;
        String lowerSeries =
                (alignerInfo != null) ? alignerInfo.getLowerRangeStart() + "-" + alignerInfo.getLowerRangeEnd() : null;

        String duration = null;
        if (this.getStartDate() != null && this.getEndDate() != null) {
            long days = java.time.temporal.ChronoUnit.DAYS.between(this.getStartDate(), this.getEndDate());
            duration = days + " days";
        }

        return TreatmentPlanResponse.builder()
                .orderId(this.getOrderId() != null ? this.getOrderId() : null)
                .planId(this.getId() != null ? this.getId() : null)
                .doctorId(this.getDoctorId() != null ? this.getDoctorId() : null)
                .treatmentPlanName(this.getTreatmentPlanName() != null ? this.getTreatmentPlanName() : null)
                .treatmentPlanTagName(this.getTreatmentPlanTagName() != null ? this.getTreatmentPlanTagName() : null)
                .version(this.getTreatmentPlanVersion())
                .description(this.getRemarks() != null ? this.getRemarks() : null)
                .totalStages(alignerInfo != null ? alignerInfo.getCount() : 0)
                .stages(alignerInfo != null ? alignerInfo.getStages() : 0)
                .upperAlignerSeries(upperSeries)
                .lowerAlignerSeries(lowerSeries)
                .planningLink(this.getTreatmentPlanningLink() != null ? this.getTreatmentPlanningLink() : null)
                .instructions(this.getOtherRemarks() != null ? this.getOtherRemarks() : null)
                .planFiles(Collections.emptyList())
                .uploadDate(this.getCreatedAt() != null ? this.getCreatedAt() : null)
                .approvedDate(this.getApprovedByPatientAt() != null ? this.getApprovedByPatientAt() : null)
                .wearDays(this.getDaysToWearEachAligner() != null ? this.getDaysToWearEachAligner() : null)
                .duration(duration)
                .stlFiles(this.getStlFileMetadata() != null ? this.getStlFileMetadata() : null)
                .createdDate(this.getCreatedAt() != null ? this.getCreatedAt() : null)
                .initiatorStatus(this.getInitiatorStatus() != null ? this.getInitiatorStatus() : null)
                .approverStatus(this.getApproverStatus() != null ? this.getApproverStatus() : null)
                .status(this.getStatus() != null ? this.getStatus() : null)
                .alignerDetailsMetaData(
                        this.getAlignerDetailsMetadata() != null ? this.getAlignerDetailsMetadata() : null)
                .isApprovedByPatient(this.getIsApprovedByPatient() != null ? this.getIsApprovedByPatient() : false)
                .approvedByPatientAt(this.getApprovedByPatientAt() != null ? this.getApprovedByPatientAt() : null)
                .shippingDetailsResponse(null)
                .manufacturingServiceProduct(null)
                .orderStatusChangedAt(this.getOrderStatusChangedAt())
                .treatmentPlanMetadata(this.getTreatmentPlanMetadata() != null ? this.getTreatmentPlanMetadata() : null)
                .isTreatmentPlanCreatedOnClonedOrder(this.getParentOrderId() != null)
                .parentOrderId(this.getParentOrderId() != null ? this.getParentOrderId() : null)
                .totalFileCount(this.getTotalFileCount() != null ? this.getTotalFileCount() : 0L)
                .build();
    }
}
