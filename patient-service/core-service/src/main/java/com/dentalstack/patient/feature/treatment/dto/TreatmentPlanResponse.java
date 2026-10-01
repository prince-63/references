package com.dentalstack.patient.feature.treatment.dto;

import com.dentalstack.patient.feature.aligner.dto.AlignerInfo;
import com.dentalstack.patient.feature.aligner.dto.aligner.STLFileMetadata;
import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.order.dto.ShippingDetailsResponse;
import com.dentalstack.patient.feature.order.enums.OrderTreatmentPlanStatus;
import com.dentalstack.patient.feature.order.enums.OrderType;
import com.dentalstack.patient.feature.storage.files.dto.FileDetails;
import com.dentalstack.patient.feature.treatment.entity.AlignerDetailsMetadata;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import lombok.*;
import org.jetbrains.annotations.NotNull;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TreatmentPlanResponse {
    private String orderId;
    private Long planId;
    private Long doctorId;
    private String treatmentPlanName;
    private String treatmentPlanTagName;
    private String version;
    private String description;
    private Integer totalStages;
    private Integer stages;
    private String upperAlignerSeries;
    private String lowerAlignerSeries;
    private String planningLink;
    private String instructions;
    private List<FileDetails> planFiles;
    private ZonedDateTime uploadDate;
    private LocalDate approvedDate;
    private Integer wearDays;
    private String duration;
    private STLFileMetadata stlFiles;
    private ZonedDateTime createdDate;
    private OrderTreatmentPlanStatus initiatorStatus;
    private OrderTreatmentPlanStatus approverStatus;
    private AlignerTreatmentStatus status;
    private AlignerDetailsMetadata alignerDetailsMetaData;
    private Boolean isApprovedByPatient;
    private LocalDate approvedByPatientAt;
    private ShippingDetailsResponse shippingDetailsResponse;
    private JsonNode manufacturingServiceProduct;
    private ZonedDateTime orderStatusChangedAt;
    private TreatmentPlanMetadata treatmentPlanMetadata;
    private Boolean isTreatmentPlanCreatedOnClonedOrder;
    private String parentOrderId;
    private OrderType orderType;
    private Long totalFileCount;
    private TreatmentType treatmentType;

    private enum TreatmentType {
        VIDEO,
        LINK,
        NO_ATTACHMENT,
        PDF
    }

    public static TreatmentPlanResponse from(TreatmentPlan treatmentPlan) {
        if (treatmentPlan == null) {
            return null;
        }

        AlignerInfo alignerInfo = TreatmentPlan.getTotalAlignersFromMetadata(treatmentPlan);

        String upperSeries =
                (alignerInfo != null) ? alignerInfo.getUpperRangeStart() + "-" + alignerInfo.getUpperRangeEnd() : null;
        String lowerSeries =
                (alignerInfo != null) ? alignerInfo.getLowerRangeStart() + "-" + alignerInfo.getLowerRangeEnd() : null;

        String duration = null;
        if (treatmentPlan.getStartDate() != null && treatmentPlan.getEndDate() != null) {
            long days = java.time.temporal.ChronoUnit.DAYS.between(
                    treatmentPlan.getStartDate(), treatmentPlan.getEndDate());
            duration = days + " days";
        }

        List<FileDetails> uniqueFiles =
                Optional.ofNullable(treatmentPlan.getFiles()).orElseGet(Collections::emptyList).stream()
                        .map(FileDetails::from)
                        .collect(java.util.stream.Collectors.collectingAndThen(
                                java.util.stream.Collectors.toMap(
                                        FileDetails::getFileId,
                                        f -> f,
                                        (existing, duplicate) -> existing,
                                        java.util.LinkedHashMap::new),
                                map -> List.copyOf(map.values())));

        List<FileDetails> uniquePdfFiles =
                Optional.ofNullable(treatmentPlan.getPdfFiles()).orElseGet(Collections::emptyList).stream()
                        .map(FileDetails::from)
                        .collect(java.util.stream.Collectors.collectingAndThen(
                                java.util.stream.Collectors.toMap(
                                        FileDetails::getFileId,
                                        f -> f,
                                        (existing, duplicate) -> existing,
                                        java.util.LinkedHashMap::new),
                                map -> List.copyOf(map.values())));

        List<FileDetails> uniqueOtherFiles =
                Optional.ofNullable(treatmentPlan.getOtherFiles()).orElseGet(Collections::emptyList).stream()
                        .map(FileDetails::from)
                        .collect(java.util.stream.Collectors.collectingAndThen(
                                java.util.stream.Collectors.toMap(
                                        FileDetails::getFileId,
                                        f -> f,
                                        (existing, duplicate) -> existing,
                                        java.util.LinkedHashMap::new),
                                map -> List.copyOf(map.values())));

        List<com.dentalstack.patient.feature.treatment.dto.TreatmentPlanVideoResponse> videoResponses =
                Optional.ofNullable(treatmentPlan.getTreatmentPlanVideoFiles())
                        .orElseGet(Collections::emptyList)
                        .stream()
                        .map(TreatmentPlanVideoResponse::from)
                        .toList();

        int stlFileCount = Optional.ofNullable(treatmentPlan.getStlFileMetadata())
                .map(STLFileMetadata::getFileId)
                .map(ids -> ids.length)
                .orElse(0);

        long totalFileCount = (long) uniqueFiles.size()
                + uniquePdfFiles.size()
                + uniqueOtherFiles.size()
                + videoResponses.size()
                + stlFileCount;

        TreatmentType treatmentType = getTreatmentType(treatmentPlan, videoResponses, uniquePdfFiles);

        return TreatmentPlanResponse.builder()
                .orderId(treatmentPlan.getOrderId() != null ? treatmentPlan.getOrderId() : null)
                .planId(treatmentPlan.getId() != null ? treatmentPlan.getId() : null)
                .doctorId(treatmentPlan.getDoctorId() != null ? treatmentPlan.getDoctorId() : null)
                .treatmentPlanName(
                        treatmentPlan.getTreatmentPlanName() != null ? treatmentPlan.getTreatmentPlanName() : null)
                .treatmentPlanTagName(
                        treatmentPlan.getTreatmentPlanTagName() != null
                                ? treatmentPlan.getTreatmentPlanTagName()
                                : null)
                .version(treatmentPlan.getTreatmentPlanVersion())
                .description(treatmentPlan.getRemarks() != null ? treatmentPlan.getRemarks() : null)
                .totalStages(alignerInfo != null ? alignerInfo.getCount() : 0)
                .stages(alignerInfo != null ? alignerInfo.getStages() : 0)
                .upperAlignerSeries(upperSeries)
                .lowerAlignerSeries(lowerSeries)
                .planningLink(
                        treatmentPlan.getTreatmentPlanningLink() != null
                                ? treatmentPlan.getTreatmentPlanningLink()
                                : null)
                .instructions(treatmentPlan.getOtherRemarks() != null ? treatmentPlan.getOtherRemarks() : null)
                .planFiles(uniqueFiles)
                .uploadDate(treatmentPlan.getCreatedAt() != null ? treatmentPlan.getCreatedAt() : null)
                .approvedDate(
                        treatmentPlan.getApprovedByPatientAt() != null ? treatmentPlan.getApprovedByPatientAt() : null)
                .wearDays(
                        treatmentPlan.getDaysToWearEachAligner() != null
                                ? treatmentPlan.getDaysToWearEachAligner()
                                : null)
                .duration(duration)
                .stlFiles(treatmentPlan.getStlFileMetadata() != null ? treatmentPlan.getStlFileMetadata() : null)
                .createdDate(treatmentPlan.getCreatedAt() != null ? treatmentPlan.getCreatedAt() : null)
                .initiatorStatus(treatmentPlan.getInitiatorStatus() != null ? treatmentPlan.getInitiatorStatus() : null)
                .approverStatus(treatmentPlan.getApproverStatus() != null ? treatmentPlan.getApproverStatus() : null)
                .status(treatmentPlan.getStatus() != null ? treatmentPlan.getStatus() : null)
                .alignerDetailsMetaData(
                        treatmentPlan.getAlignerDetailsMetadata() != null
                                ? treatmentPlan.getAlignerDetailsMetadata()
                                : null)
                .isApprovedByPatient(
                        treatmentPlan.getIsApprovedByPatient() != null ? treatmentPlan.getIsApprovedByPatient() : false)
                .approvedByPatientAt(
                        treatmentPlan.getApprovedByPatientAt() != null ? treatmentPlan.getApprovedByPatientAt() : null)
                .shippingDetailsResponse(
                        treatmentPlan.getShippingDetails() != null
                                ? ShippingDetailsResponse.from(treatmentPlan.getShippingDetails())
                                : null)
                .manufacturingServiceProduct(
                        treatmentPlan.getManufacturingBatches() != null
                                        && !treatmentPlan
                                                .getManufacturingBatches()
                                                .isEmpty()
                                ? treatmentPlan.getManufacturingBatches().get(0).getServiceProducts()
                                : null)
                .orderStatusChangedAt(treatmentPlan.getOrderStatusChangedAt())
                .treatmentPlanMetadata(
                        treatmentPlan.getTreatmentPlanMetadata() != null
                                ? treatmentPlan.getTreatmentPlanMetadata()
                                : null)
                .isTreatmentPlanCreatedOnClonedOrder(treatmentPlan.getOrder() != null
                        && treatmentPlan.getOrder().getParentOrder() != null)
                .parentOrderId(
                        treatmentPlan.getOrder() != null
                                        && treatmentPlan.getOrder().getParentOrder() != null
                                ? treatmentPlan.getOrder().getParentOrder().getId()
                                : null)
                .orderType(
                        treatmentPlan.getOrder() != null
                                ? treatmentPlan.getOrder().getOrderType()
                                : null)
                .totalFileCount(totalFileCount)
                .treatmentType(treatmentType)
                .build();
    }

    @NotNull
    private static TreatmentType getTreatmentType(
            TreatmentPlan treatmentPlan,
            List<TreatmentPlanVideoResponse> videoResponses,
            List<FileDetails> uniquePdfFiles) {
        TreatmentType treatmentType;

        boolean hasVideo = !videoResponses.isEmpty();
        boolean hasLink = treatmentPlan.getTreatmentPlanningLink() != null
                && !treatmentPlan.getTreatmentPlanningLink().isBlank();
        boolean hasPdf = !uniquePdfFiles.isEmpty();

        if (hasVideo) {
            treatmentType = TreatmentType.VIDEO;
        } else if (hasLink) {
            treatmentType = TreatmentType.LINK;
        } else if (hasPdf) {
            treatmentType = TreatmentType.PDF;
        } else {
            treatmentType = TreatmentType.NO_ATTACHMENT;
        }
        return treatmentType;
    }
}
