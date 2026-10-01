package com.dentalstack.patient.feature.treatment.dto;

import com.dentalstack.patient.feature.aligner.dto.aligner.STLFileMetadata;
import com.dentalstack.patient.feature.aligner.dto.alignertreatment.LinkedTreatmentPlanMetadata;
import com.dentalstack.patient.feature.aligner.dto.alignertreatment.LowerJawDetails;
import com.dentalstack.patient.feature.aligner.dto.alignertreatment.UpperJawDetails;
import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.braces.entity.BracesJourney;
import com.dentalstack.patient.feature.order.dto.ManufacturingDetails;
import com.dentalstack.patient.feature.order.enums.OrderTreatmentPlanStatus;
import com.dentalstack.patient.feature.order.projection.ManufacturingBatchProjection;
import com.dentalstack.patient.feature.treatment.projection.TreatmentPlanSummary;
import com.dentalstack.patient.global.enums.ProductTypeName;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BracesAlignerTreatmentResponse {
    private String treatmentName;
    private String treatmentType;
    private String bracesTreatmentCreatedOn;
    private AlignerTreatmentStatus treatmentStatus;
    private int totalAligner;
    private Long bracesTreatmentId;
    private Long alignerTreatmentId;
    private String treatmentPlanningLink;
    private boolean isBracesNotesAttached;
    private String doctorAddedTreatmentName;
    private String treatmentPlanTagName;
    private boolean isApprovedByPatient;
    private LocalDate approvedByPatientAt;
    private UpperJawDetails upperJawDetails;
    private LowerJawDetails lowerJawDetails;
    private ZonedDateTime createdAt;
    private String orderId;
    private OrderTreatmentPlanStatus initiatorStatus;
    private OrderTreatmentPlanStatus approverStatus;
    private ZonedDateTime orderStatusChangedAt;
    private TreatmentPlanMetadata treatmentPlanMetadata;
    private STLFileMetadata stlFileMetadata;
    private LinkedTreatmentPlanMetadata linkedTreatmentPlanMetadata;
    private Boolean createdByMe;
    private Boolean customerOrder;
    private Boolean purchaseOrder;
    private List<ManufacturingDetails> manufacturingDetailsList;
    private String treatmentPlanCompletedRemarks;

    public static BracesAlignerTreatmentResponse from(
            TreatmentPlanSummary summary,
            int totalAligners,
            UpperJawDetails upperJawDetails,
            LowerJawDetails lowerJawDetails,
            Boolean createdByMe,
            Boolean customerOrder,
            Boolean purchaseOrder,
            List<ManufacturingBatchProjection> manufacturingBatches) {

        List<ManufacturingDetails> manufacturingDetailsList = new ArrayList<>();

        for (ManufacturingBatchProjection batch : manufacturingBatches) {
            ManufacturingDetails manufacturingDetails = ManufacturingDetails.builder()
                    .id(batch.getId())
                    .status(batch.getStatus())
                    .startedOn(batch.getStartDate() != null ? batch.getStartDate() : null)
                    .completedOn(batch.getCompletionDate() != null ? batch.getCompletionDate() : null)
                    .shippedOn(batch.getShippingDate() != null ? batch.getShippingDate() : null)
                    .deliveredOn(batch.getDeliveryDate() != null ? batch.getDeliveryDate() : null)
                    .batchType(batch.getBatchType())
                    .totalAligners(batch.getTotalAligners())
                    .upperAlignerStart(batch.getUpperAlignerStart())
                    .upperAlignerEnd(batch.getUpperAlignerEnd())
                    .lowerAlignerStart(batch.getLowerAlignerStart())
                    .lowerAlignerEnd(batch.getLowerAlignerEnd())
                    .trackingNumber(batch.getTrackingNumber())
                    .trackingLink(batch.getTrackingLink())
                    .build();

            manufacturingDetailsList.add(manufacturingDetails);
        }

        return BracesAlignerTreatmentResponse.builder()
                .treatmentName(summary.getTreatmentPlanName())
                .treatmentType(ProductTypeName.ALIGNERS.name())
                .treatmentStatus(summary.getStatus())
                .totalAligner(totalAligners)
                .alignerTreatmentId(summary.getId())
                .bracesTreatmentId(null)
                .treatmentPlanningLink(summary.getTreatmentPlanningLink())
                .bracesTreatmentCreatedOn(null)
                .isBracesNotesAttached(false)
                .doctorAddedTreatmentName(summary.getTreatmentType())
                .treatmentPlanTagName(summary.getTreatmentPlanTagName())
                .isApprovedByPatient(summary.getIsApprovedByPatient() != null && summary.getIsApprovedByPatient())
                .approvedByPatientAt(summary.getApprovedByPatientAt())
                .lowerJawDetails(lowerJawDetails)
                .upperJawDetails(upperJawDetails)
                .createdAt(summary.getCreatedAt())
                .orderId(summary.getOrderId())
                .initiatorStatus(summary.getInitiatorStatus())
                .approverStatus(summary.getApproverStatus())
                .orderStatusChangedAt(summary.getOrderStatusChangedAt())
                .treatmentPlanMetadata(summary.getTreatmentPlanMetadata())
                .stlFileMetadata(summary.getStlFileMetadata())
                .createdByMe(createdByMe)
                .linkedTreatmentPlanMetadata(
                        summary.getLinkedTreatmentPlanId() != null
                                ? LinkedTreatmentPlanMetadata.builder()
                                        .linkedTreatmentPlanId(summary.getLinkedTreatmentPlanId())
                                        .approverStatus(summary.getLinkedApproverStatus())
                                        .initiatorStatus(summary.getLinkedInitiatorStatus())
                                        .build()
                                : summary.getParentLinkedTreatmentPlanId() != null
                                        ? LinkedTreatmentPlanMetadata.builder()
                                                .linkedTreatmentPlanId(summary.getParentLinkedTreatmentPlanId())
                                                .approverStatus(summary.getParentLinkedApproverStatus())
                                                .initiatorStatus(summary.getParentLinkedInitiatorStatus())
                                                .build()
                                        : null)
                .customerOrder(customerOrder)
                .purchaseOrder(purchaseOrder)
                .manufacturingDetailsList(manufacturingDetailsList)
                .treatmentPlanCompletedRemarks(summary.getTreatmentPlanCompletedRemarks())
                .build();
    }

    public static BracesAlignerTreatmentResponse from(
            TreatmentPlanSummary summary,
            int totalAligners,
            UpperJawDetails upperJawDetails,
            LowerJawDetails lowerJawDetails,
            Boolean createdByMe,
            Boolean customerOrder,
            Boolean purchaseOrder) {

        return from(
                summary,
                totalAligners,
                upperJawDetails,
                lowerJawDetails,
                createdByMe,
                customerOrder,
                purchaseOrder,
                new ArrayList<>());
    }

    public static BracesAlignerTreatmentResponse from(
            BracesJourney bracesJourney, AlignerTreatmentStatus treatmentStatus) {
        return BracesAlignerTreatmentResponse.builder()
                .treatmentName(bracesJourney.getTreatmentName())
                .treatmentType("BRACES")
                .treatmentStatus(treatmentStatus)
                .totalAligner(0)
                .alignerTreatmentId(null)
                .bracesTreatmentId(bracesJourney.getId())
                .bracesTreatmentCreatedOn(bracesJourney.getCreatedAt().toString())
                .isBracesNotesAttached(!bracesJourney.getAppointments().isEmpty())
                .build();
    }
}
