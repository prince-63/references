package com.dentalstack.patient.feature.gettingstarted.dto;

import com.dentalstack.patient.feature.aligner.dto.AlignerInfo;
import com.dentalstack.patient.feature.aligner.dto.alignertreatment.LowerJawDetails;
import com.dentalstack.patient.feature.aligner.dto.alignertreatment.UpperJawDetails;
import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.gettingstarted.enums.GettingStartedFilter;
import com.dentalstack.patient.feature.order.dto.ManufacturingDetails;
import com.dentalstack.patient.feature.order.enums.OrderDeliveryPreference;
import com.dentalstack.patient.feature.order.enums.OrderStatus;
import com.dentalstack.patient.feature.storage.files.dto.FileDetails;
import com.dentalstack.patient.feature.treatment.dto.TreatmentPlanVideoResponse;
import com.dentalstack.patient.feature.treatment.entity.AlignerDetailsMetadata;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GettingStartedResponse {
    private GettingStartedFilter currentStep;
    private String orderId;
    private Long treatmentPlanId;
    private OrderStatus orderStatus;
    private Boolean invitedPatient;
    private ZonedDateTime caseSubmittedAt;

    private AssessmentDetails assessment;
    private InPlanningDetails inPlanning;
    private InManufacturingDetails inManufacturing;
    private InTransitDetails inTransit;
    private StartingSoonDetails startingSoon;
    private InPlanningDetails.TreatmentPlanStatus latestOrderTreatmentPlanStatus;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class AssessmentDetails {
        private Long caseRecordsId;
        private Boolean preTreatmentPhotos;
        private Boolean scanFiles;
        private Boolean xRaysOpg;
        private AlignerTreatmentStatus treatmentPlanStatus;
        private LocalDate deactivatedAt;
        private String deactivationReason;
        private String deactivationRemark;
        private Integer scanFilesCount;
        private Integer preTreatmentPhotosCount;
        private Integer xRaysOpgCount;
        private OrderStatus purchaseOrderStatus;
        private String purchaseOrderId;
        private Long purchaseOrderTreatmentPlanCount;
        private ZonedDateTime cancelledOn;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class InPlanningDetails {
        private TreatmentPlanStatus treatmentPlanStatus;
        private ActiveTreatmentPlan activeTreatmentPlan;
        private OrderStatus purchaseOrderStatus;
        private String purchaseOrderId;
        private Long purchaseOrderTreatmentPlanCount;
        private ZonedDateTime cancelledOn;

        public enum TreatmentPlanStatus {
            AWAITING_APPROVAL,
            AWAITING_TREATMENT_PLAN,
            APPROVED,
            SENT_TO_PATIENT,
            ACTIVE,
            APPROVED_BY_PATIENT,
            FINALIZED,
            DEACTIVATED,
            RE_PLAN
        }

        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        @Builder
        public static class ActiveTreatmentPlan {
            private Long treatmentPlanId;
            private String treatmentPlanName;
            private String treatmentPlanTagName;
            private String treatmentPlanningLink;
            private ZonedDateTime createdAt;
            private Integer totalAligners;
            private Integer startUpperJaw;
            private Integer endUpperJaw;
            private Integer startLowerJaw;
            private Integer endLowerJaw;
            private String brandName;
            private String recommendedHoursToWearAligners;
            private String status;
            private String daysToWearEachAligner;
            private Integer upperJawTotal;
            private Integer lowerJawTotal;
            private TreatmentPlanVideoResponse treatmentPlanVideos;
            private List<FileDetails> files;
            private List<FileDetails> pdfFiles;
            private List<FileDetails> otherFiles;
            private String remarks;
            private ZonedDateTime treatmentPlanFinalizedAt;

            public static ActiveTreatmentPlan fromActiveTreatmentPlan(TreatmentPlan treatmentPlan) {
                ActiveTreatmentPlanBuilder builder = ActiveTreatmentPlan.builder()
                        .treatmentPlanId(treatmentPlan.getId())
                        .treatmentPlanName(treatmentPlan.getTreatmentPlanName())
                        .treatmentPlanTagName(treatmentPlan.getTreatmentPlanTagName())
                        .treatmentPlanningLink(treatmentPlan.getTreatmentPlanningLink())
                        .createdAt(treatmentPlan.getCreatedAt())
                        .brandName(treatmentPlan.getBrandName())
                        .recommendedHoursToWearAligners(
                                treatmentPlan.getRecommendedHoursToWearAligners() != null
                                        ? treatmentPlan
                                                .getRecommendedHoursToWearAligners()
                                                .toString()
                                        : null)
                        .status(
                                treatmentPlan.getStatus() != null
                                        ? treatmentPlan.getStatus().toString()
                                        : null)
                        .daysToWearEachAligner(
                                treatmentPlan.getDaysToWearEachAligner() != null
                                        ? treatmentPlan
                                                .getDaysToWearEachAligner()
                                                .toString()
                                        : null)
                        .treatmentPlanFinalizedAt(
                                treatmentPlan.getTreatmentFinalisedAt() != null
                                        ? treatmentPlan.getTreatmentFinalisedAt()
                                        : treatmentPlan.getUpdatedAt())
                        .remarks(treatmentPlan.getRemarks());

                if (treatmentPlan.getAlignerDetailsMetadata() != null) {
                    AlignerDetailsMetadata metadata = treatmentPlan.getAlignerDetailsMetadata();

                    if (metadata.getUpperJawDetails() != null) {
                        UpperJawDetails upperJaw = metadata.getUpperJawDetails();
                        builder.startUpperJaw(upperJaw.getStartsWith()).endUpperJaw(upperJaw.getEndsWith());

                        if (upperJaw.getRange() != null && !upperJaw.getRange().isEmpty()) {
                            builder.upperJawTotal(upperJaw.getRange().size());
                        }
                    }

                    if (metadata.getLowerJawDetails() != null) {
                        LowerJawDetails lowerJaw = metadata.getLowerJawDetails();
                        builder.startLowerJaw(lowerJaw.getStartsWith()).endLowerJaw(lowerJaw.getEndsWith());

                        if (lowerJaw.getRange() != null && !lowerJaw.getRange().isEmpty()) {
                            builder.lowerJawTotal(lowerJaw.getRange().size());
                        }
                    }

                    Integer upperTotal = builder.build().getUpperJawTotal();
                    Integer lowerTotal = builder.build().getLowerJawTotal();
                    if (upperTotal != null && lowerTotal != null) {
                        builder.totalAligners(upperTotal + lowerTotal);
                    } else if (upperTotal != null) {
                        builder.totalAligners(upperTotal);
                    } else if (lowerTotal != null) {
                        builder.totalAligners(lowerTotal);
                    }
                }

                return builder.build();
            }
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class InManufacturingDetails {
        private OrderDeliveryPreference deliveryPreference;
        private List<ManufacturingDetails> manufacturingDetailsList;
        private ActiveTreatmentPlan activeTreatmentPlan;
        private ShippingDetailsInfo shippingDetails;
        private AlignerInfo unprocessedAlignerDetails;
        private AlignerInfo deliveredAlignerDetails;

        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        @Builder
        public static class ActiveTreatmentPlan {
            private Long treatmentPlanId;
            private Integer upperJawTotal;
            private Integer lowerJawTotal;
            private Integer startUpperJaw;
            private Integer endUpperJaw;
            private Integer startLowerJaw;
            private Integer endLowerJaw;
            private String totalAligners;

            public static ActiveTreatmentPlan fromActiveTreatmentPlan(TreatmentPlan treatmentPlan) {
                ActiveTreatmentPlanBuilder builder =
                        ActiveTreatmentPlan.builder().treatmentPlanId(treatmentPlan.getId());

                if (treatmentPlan.getAlignerDetailsMetadata() != null) {
                    AlignerDetailsMetadata metadata = treatmentPlan.getAlignerDetailsMetadata();

                    if (metadata.getUpperJawDetails() != null) {
                        UpperJawDetails upperJaw = metadata.getUpperJawDetails();
                        builder.startUpperJaw(upperJaw.getStartsWith()).endUpperJaw(upperJaw.getEndsWith());

                        if (upperJaw.getRange() != null && !upperJaw.getRange().isEmpty()) {
                            builder.upperJawTotal(upperJaw.getRange().size());
                        }
                    }

                    if (metadata.getLowerJawDetails() != null) {
                        LowerJawDetails lowerJaw = metadata.getLowerJawDetails();
                        builder.startLowerJaw(lowerJaw.getStartsWith()).endLowerJaw(lowerJaw.getEndsWith());

                        if (lowerJaw.getRange() != null && !lowerJaw.getRange().isEmpty()) {
                            builder.lowerJawTotal(lowerJaw.getRange().size());
                        }
                    }

                    Integer upperTotal = null;
                    Integer lowerTotal = null;

                    if (metadata.getUpperJawDetails() != null
                            && metadata.getUpperJawDetails().getRange() != null) {
                        upperTotal = metadata.getUpperJawDetails().getRange().size();
                    }
                    if (metadata.getLowerJawDetails() != null
                            && metadata.getLowerJawDetails().getRange() != null) {
                        lowerTotal = metadata.getLowerJawDetails().getRange().size();
                    }

                    if (upperTotal != null && lowerTotal != null) {
                        builder.totalAligners(String.valueOf(upperTotal + lowerTotal));
                    } else if (upperTotal != null) {
                        builder.totalAligners(String.valueOf(upperTotal));
                    } else if (lowerTotal != null) {
                        builder.totalAligners(String.valueOf(lowerTotal));
                    }
                }

                return builder.build();
            }
        }

        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        @Builder
        public static class ShippingDetailsInfo {
            private String addressedTo;
            private String name;
            private String addressLine;
            private String city;
            private String state;
            private String country;
            private String pincode;
            private Boolean isDefault;
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class InTransitDetails {
        private Long manufacturingId;
        private String manufacturingStatus;
        private LocalDate deliveryDate;
        private ShippingInfo shippingDetails;

        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        @Builder
        public static class ShippingInfo {
            private String trackingLink;
            private String trackingNumber;
            private String shippingDate;
            private String tentativeDate;
            private List<FileDetails> documents;
        }
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class StartingSoonDetails {
        private LocalDate reminderDate;
        private Long treatmentPlanId;
        private Boolean isTreatmentStarted;
    }
}
