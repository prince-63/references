package com.dentalstack.patient.feature.aligner.dto.alignertreatment;

import com.dentalstack.patient.feature.aligner.dto.aligner.STLFileMetadata;
import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerAction;
import com.dentalstack.patient.feature.aligner.enums.aligner.TreatmentPlanUploadType;
import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.order.dto.ManufacturingDetails;
import com.dentalstack.patient.feature.order.dto.ShippingDetailsResponse;
import com.dentalstack.patient.feature.order.enums.OrderTreatmentPlanStatus;
import com.dentalstack.patient.feature.storage.files.dto.FileDetails;
import com.dentalstack.patient.feature.tracking.dto.CurrentAlignerDetails;
import com.dentalstack.patient.feature.tracking.entity.Tracking;
import com.dentalstack.patient.feature.treatment.dto.TreatmentPlanMetadata;
import com.dentalstack.patient.feature.treatment.dto.TreatmentPlanVideoResponse;
import com.dentalstack.patient.feature.treatment.entity.AlignerDetailsMetadata;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.dentalstack.patient.global.enums.ProductTypeName;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serial;
import java.io.Serializable;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class AlignerTreatmentResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private static final Logger log = LoggerFactory.getLogger(AlignerTreatmentResponse.class);

    private Long patientId;

    private ProductTypeName treatmentSubType;

    private String brandName;

    private AlignerTreatmentDetails alignerDetailsMetaData;

    private String treatmentPlanningSoftware;

    private String treatmentPlanningLink;

    private String remarks;

    private Integer daysToWearEachAligner;

    private Integer recommendedHoursToWearAligners;

    private Integer currentAlignerNo;
    private UpperJawDetails upperJawDetails;
    private LowerJawDetails lowerJawDetails;

    private AlignerTreatmentStatus status;

    private List<FileDetails> files;

    private List<FileDetails> pdfFiles;

    private List<FileDetails> otherFiles;

    private Long doctorId;

    private long treatmentPlanId;

    private Long alignerJourneyId;

    private Integer totalAligners;

    private Integer stages;

    private Long productionLabId;

    private ProductionLabDetails productionLabDetails;

    private CurrentAlignerDetails currentAlignerDetails;

    private String timeRemainingToStartTreatment;

    private String treatmentType;

    private Long daysRemainingToStartTreatment;

    private String reasonForDeactivation;

    private LocalDate deactivatedAt;

    private String treatmentPlanName;

    private String deactivatedRemarks;
    private List<TreatmentPlanVideoResponse> treatmentPlanVideos;
    private Boolean isLinkDisplayPatient;
    private String treatmentPlanTagName;
    private Boolean isApprovedByPatient;
    private LocalDate approvedByPatientAt;
    private String orderId;
    private ZonedDateTime orderStatusChangedAt;
    private OrderTreatmentPlanStatus initiatorStatus;
    private OrderTreatmentPlanStatus approverStatus;
    private TreatmentPlanMetadata treatmentPlanMetadata;
    private ZonedDateTime updatedAt;
    private ZonedDateTime createdAt;
    private STLFileMetadata stlFileMetadata;
    private TreatmentPlanUploadType treatmentPlanUploadType;
    private LinkedTreatmentPlanMetadata linkedTreatmentPlanMetadata;
    private List<ManufacturingDetails> manufacturingDetails;
    private ZonedDateTime treatmentFinalizedOn;
    private Boolean isVideoDisplayPatient;
    private Integer pendingActionCount;
    private ShippingDetailsResponse shippingDetailsResponse;
    private Integer totalFilesAddedCount;

    public static AlignerTreatmentResponse from(TreatmentPlan treatmentPlan) {
        LocalDate startDate = treatmentPlan.getStartDate();
        LocalDate today = LocalDate.now();
        long daysRemainingToStartTreatment = 0;
        String timeRemainingToStartTreatment = "00:00:00";

        if (startDate != null) {
            if (startDate.isBefore(today) || startDate.isEqual(today)) {
                timeRemainingToStartTreatment = "00:00:00";
            } else {
                LocalDateTime nextDay = startDate.atStartOfDay();
                LocalDateTime now = LocalDateTime.now();
                Duration duration = Duration.between(now, nextDay);

                daysRemainingToStartTreatment = ChronoUnit.DAYS.between(today, startDate) - 1;
                if (daysRemainingToStartTreatment == 0) {
                    timeRemainingToStartTreatment = formatDuration(duration);
                } else {
                    LocalDateTime nextDayStart = today.plusDays(1).atStartOfDay();
                    Duration nextDayDuration = Duration.between(now, nextDayStart);
                    timeRemainingToStartTreatment = formatDuration(nextDayDuration);
                }
            }
        }

        LowerJawDetails lowerJawDetails = treatmentPlan.getAlignerDetailsMetadata() != null
                ? treatmentPlan.getAlignerDetailsMetadata().getLowerJawDetails()
                : null;
        UpperJawDetails upperJawDetails = treatmentPlan.getAlignerDetailsMetadata() != null
                ? treatmentPlan.getAlignerDetailsMetadata().getUpperJawDetails()
                : null;

        AlignerTreatmentDetails alignerTreatmentDetails = new AlignerTreatmentDetails();
        alignerTreatmentDetails.setLowerJaw(lowerJawDetails);
        alignerTreatmentDetails.setUpperJaw(upperJawDetails);

        List<Integer> lowerJawRange = lowerJawDetails != null ? lowerJawDetails.getRange() : Collections.emptyList();
        List<Integer> upperJawRange = upperJawDetails != null ? upperJawDetails.getRange() : Collections.emptyList();

        int lowerCount = lowerJawRange.size();
        int upperCount = upperJawRange.size();
        int totalAligners, stages = 0;
        totalAligners = lowerCount + upperCount;

        int upperEnd =
                upperJawDetails != null && upperJawDetails.getEndsWith() != null ? upperJawDetails.getEndsWith() : 0;
        int lowerEnd =
                lowerJawDetails != null && lowerJawDetails.getEndsWith() != null ? lowerJawDetails.getEndsWith() : 0;

        if (upperEnd > 0 || lowerEnd > 0) {
            stages = Math.max(upperEnd, lowerEnd);
        }

        Long alignerJourneyId = null;

        Tracking tracking = treatmentPlan.getTracking();
        if (tracking != null) {
            AlignerJourney alignerJourney = tracking.getAlignerJourney();
            if (alignerJourney != null) {
                alignerJourneyId = alignerJourney.getId();
            }
        }

        List<FileDetails> uniqueFiles = treatmentPlan.getFiles().stream()
                .map(FileDetails::from)
                .collect(Collectors.groupingBy(
                        FileDetails::getFileId, Collectors.collectingAndThen(Collectors.toList(), list -> list.get(0))))
                .values()
                .stream()
                .toList();

        List<FileDetails> uniquePdfFiles = treatmentPlan.getPdfFiles().stream()
                .map(FileDetails::from)
                .collect(Collectors.groupingBy(
                        FileDetails::getFileId, Collectors.collectingAndThen(Collectors.toList(), list -> list.get(0))))
                .values()
                .stream()
                .toList();

        List<FileDetails> uniqueOtherFiles = treatmentPlan.getOtherFiles().stream()
                .map(FileDetails::from)
                .collect(Collectors.groupingBy(
                        FileDetails::getFileId, Collectors.collectingAndThen(Collectors.toList(), list -> list.get(0))))
                .values()
                .stream()
                .toList();

        List<TreatmentPlanVideoResponse> videoResponses =
                Optional.ofNullable(treatmentPlan.getTreatmentPlanVideoFiles())
                        .orElseGet(Collections::emptyList)
                        .stream()
                        .map(TreatmentPlanVideoResponse::from)
                        .toList();

        int totalFilesCount =
                uniqueFiles.size() + uniquePdfFiles.size() + uniqueOtherFiles.size() + videoResponses.size();

        return AlignerTreatmentResponse.builder()
                .doctorId(treatmentPlan.getDoctorId())
                .patientId(treatmentPlan.getPatient().getId())
                .treatmentSubType(treatmentPlan.getTreatmentSubType())
                .brandName(treatmentPlan.getBrandName())
                .treatmentPlanningSoftware(treatmentPlan.getTreatmentPlanningSoftware())
                .treatmentPlanningLink(treatmentPlan.getTreatmentPlanningLink())
                .remarks(treatmentPlan.getRemarks())
                .daysToWearEachAligner(treatmentPlan.getDaysToWearEachAligner())
                .recommendedHoursToWearAligners(treatmentPlan.getRecommendedHoursToWearAligners())
                .status(treatmentPlan.getStatus())
                .alignerDetailsMetaData(alignerTreatmentDetails)
                .files(uniqueFiles)
                .pdfFiles(uniquePdfFiles)
                .otherFiles(uniqueOtherFiles)
                .treatmentPlanId(treatmentPlan.getId())
                .totalAligners(totalAligners)
                .stages(stages)
                .alignerJourneyId(alignerJourneyId)
                .productionLabId(treatmentPlan.getProductionLabId())
                .productionLabDetails(ProductionLabDetails.from(treatmentPlan))
                .currentAlignerDetails(CurrentAlignerDetails.from(
                        treatmentPlan.getCurrentAlignerNumber(),
                        treatmentPlan.getStartDate(),
                        treatmentPlan.getEndDate()))
                .treatmentType(treatmentPlan.getTreatmentType())
                .daysRemainingToStartTreatment(daysRemainingToStartTreatment)
                .timeRemainingToStartTreatment(timeRemainingToStartTreatment)
                .reasonForDeactivation(treatmentPlan.getReasonForDeactivation())
                .deactivatedAt(treatmentPlan.getDeactivatedAt() != null ? treatmentPlan.getDeactivatedAt() : null)
                .treatmentPlanName(treatmentPlan.getTreatmentPlanName())
                .deactivatedRemarks(treatmentPlan.getOtherRemarks())
                .treatmentPlanVideos(videoResponses)
                .isLinkDisplayPatient(treatmentPlan.getIsLinkDisplayPatient())
                .treatmentPlanTagName(treatmentPlan.getTreatmentPlanTagName())
                .isApprovedByPatient(treatmentPlan.getIsApprovedByPatient())
                .approvedByPatientAt(treatmentPlan.getApprovedByPatientAt())
                .orderId(treatmentPlan.getOrderId())
                .initiatorStatus(treatmentPlan.getInitiatorStatus())
                .approverStatus(treatmentPlan.getApproverStatus())
                .orderStatusChangedAt(treatmentPlan.getOrderStatusChangedAt())
                .treatmentPlanMetadata(treatmentPlan.getTreatmentPlanMetadata())
                .stlFileMetadata(treatmentPlan.getStlFileMetadata())
                .treatmentPlanUploadType(treatmentPlan.getTreatmentPlanUploadType())
                .linkedTreatmentPlanMetadata(
                        treatmentPlan.getLinkedTreatmentPlan() != null
                                ? LinkedTreatmentPlanMetadata.from(treatmentPlan.getLinkedTreatmentPlan())
                                : null)
                .manufacturingDetails(
                        treatmentPlan.getManufacturingBatches() != null
                                ? treatmentPlan.getManufacturingBatches().stream()
                                        .map(ManufacturingDetails::from)
                                        .toList()
                                : Collections.emptyList())
                .treatmentFinalizedOn(
                        treatmentPlan.getTreatmentFinalisedAt() != null
                                ? treatmentPlan.getTreatmentFinalisedAt()
                                : treatmentPlan.getUpdatedAt())
                .isVideoDisplayPatient(treatmentPlan.getIsVideDisplayToPatient())
                .totalFilesAddedCount(totalFilesCount)
                .build();
    }

    private static String formatDuration(Duration duration) {
        long seconds = Math.abs(duration.getSeconds());
        long hours = seconds / 3600;
        long minutes = (seconds % 3600) / 60;
        long secs = seconds % 60;
        return String.format("%02d:%02d:%02d", hours, minutes, secs);
    }

    public static AlignerTreatmentResponse from(TreatmentPlan treatmentPlan, TreatmentPlan treatmentPlanWithTracking) {
        AlignerDetailsMetadata metadata = treatmentPlan.getAlignerDetailsMetadata();
        LowerJawDetails lowerJawDetails = (metadata != null && metadata.getLowerJawDetails() != null)
                ? metadata.getLowerJawDetails()
                : new LowerJawDetails();

        UpperJawDetails upperJawDetails = (metadata != null && metadata.getUpperJawDetails() != null)
                ? metadata.getUpperJawDetails()
                : new UpperJawDetails();

        AlignerTreatmentDetails alignerTreatmentDetails = new AlignerTreatmentDetails();
        alignerTreatmentDetails.setLowerJaw(lowerJawDetails);
        alignerTreatmentDetails.setUpperJaw(upperJawDetails);

        List<Integer> lowerJawRange =
                lowerJawDetails.getRange() != null ? lowerJawDetails.getRange() : Collections.emptyList();
        List<Integer> upperJawRange =
                upperJawDetails.getRange() != null ? upperJawDetails.getRange() : Collections.emptyList();

        int lowerCount = lowerJawRange.size();
        int upperCount = upperJawRange.size();
        int totalAligners = lowerCount + upperCount;

        int lowerEnd = lowerJawDetails.getEndsWith() != null ? lowerJawDetails.getEndsWith() : 0;
        int upperEnd = upperJawDetails.getEndsWith() != null ? upperJawDetails.getEndsWith() : 0;

        int stages = 0;
        if (upperEnd > 0 || lowerEnd > 0) {
            stages = Math.max(upperEnd, lowerEnd);
        }

        Tracking tracking = treatmentPlanWithTracking != null ? treatmentPlanWithTracking.getTracking() : null;
        Long alignerJourneyId = null;
        LocalDate endDate = treatmentPlan.getEndDate();
        int pendingActionsCount = 0;

        if (tracking != null && tracking.getAlignerJourney() != null) {

            AlignerJourney journey = tracking.getAlignerJourney();
            alignerJourneyId = journey.getId();

            if (journey.getCurrentAligner() != null
                    && journey.getCurrentAligner().getEndDate() != null) {
                endDate = journey.getCurrentAligner().getEndDate();
            }

            if (journey.getAligners() != null) {
                for (Aligner aligner : journey.getAligners()) {
                    if (aligner != null && aligner.getActions() != null) {
                        for (AlignerAction action : aligner.getActions()) {
                            if (action != null && !action.isValidated()) {
                                pendingActionsCount++;
                            }
                        }
                    }
                }
            }
        }

        LocalDate startDate = treatmentPlan.getStartDate();
        LocalDate today = LocalDate.now();
        long daysRemainingToStartTreatment = 0;
        String timeRemainingToStartTreatment = "00:00:00";

        if (startDate != null) {
            if (startDate.isBefore(today) || startDate.isEqual(today)) {
                timeRemainingToStartTreatment = "00:00:00";
            } else {
                LocalDateTime nextDay = startDate.atStartOfDay();
                LocalDateTime now = LocalDateTime.now();
                Duration duration = Duration.between(now, nextDay);

                daysRemainingToStartTreatment = ChronoUnit.DAYS.between(today, startDate) - 1;
                if (daysRemainingToStartTreatment == 0) {
                    timeRemainingToStartTreatment = formatDuration(duration);
                } else {
                    LocalDateTime nextDayStart = today.plusDays(1).atStartOfDay();
                    Duration nextDayDuration = Duration.between(now, nextDayStart);
                    timeRemainingToStartTreatment = formatDuration(nextDayDuration);
                }
            }
        }

        List<TreatmentPlanVideoResponse> videoResponses = treatmentPlan.getTreatmentPlanVideoFiles().stream()
                .map(TreatmentPlanVideoResponse::from)
                .toList();

        List<FileDetails> uniqueFiles = treatmentPlan.getFiles().stream()
                .map(FileDetails::from)
                .collect(Collectors.groupingBy(
                        FileDetails::getFileId, Collectors.collectingAndThen(Collectors.toList(), list -> list.get(0))))
                .values()
                .stream()
                .toList();

        List<FileDetails> uniquePdfFiles = treatmentPlan.getPdfFiles().stream()
                .map(FileDetails::from)
                .collect(Collectors.groupingBy(
                        FileDetails::getFileId, Collectors.collectingAndThen(Collectors.toList(), list -> list.get(0))))
                .values()
                .stream()
                .toList();

        List<FileDetails> uniqueOtherFiles = treatmentPlan.getOtherFiles().stream()
                .map(FileDetails::from)
                .collect(Collectors.groupingBy(
                        FileDetails::getFileId, Collectors.collectingAndThen(Collectors.toList(), list -> list.get(0))))
                .values()
                .stream()
                .toList();

        return AlignerTreatmentResponse.builder()
                .doctorId(treatmentPlan.getDoctorId())
                .patientId(treatmentPlan.getPatient().getId())
                .treatmentSubType(treatmentPlan.getTreatmentSubType())
                .brandName(treatmentPlan.getBrandName())
                .treatmentPlanningSoftware(treatmentPlan.getTreatmentPlanningSoftware())
                .treatmentPlanningLink(treatmentPlan.getTreatmentPlanningLink())
                .remarks(treatmentPlan.getRemarks())
                .daysToWearEachAligner(treatmentPlan.getDaysToWearEachAligner())
                .recommendedHoursToWearAligners(treatmentPlan.getRecommendedHoursToWearAligners())
                .status(treatmentPlan.getStatus())
                .alignerDetailsMetaData(alignerTreatmentDetails)
                .files(uniqueFiles)
                .pdfFiles(uniquePdfFiles)
                .otherFiles(uniqueOtherFiles)
                .treatmentPlanId(treatmentPlan.getId())
                .totalAligners(totalAligners)
                .stages(stages)
                .alignerJourneyId(alignerJourneyId)
                .productionLabId(treatmentPlan.getProductionLabId())
                .productionLabDetails(ProductionLabDetails.from(treatmentPlan))
                .currentAlignerDetails(CurrentAlignerDetails.from(
                        treatmentPlan.getCurrentAlignerNumber(), treatmentPlan.getStartDate(), endDate))
                .treatmentType(treatmentPlan.getTreatmentType())
                .timeRemainingToStartTreatment(timeRemainingToStartTreatment)
                .daysRemainingToStartTreatment(daysRemainingToStartTreatment)
                .reasonForDeactivation(treatmentPlan.getReasonForDeactivation())
                .deactivatedAt(treatmentPlan.getDeactivatedAt() != null ? treatmentPlan.getDeactivatedAt() : null)
                .treatmentPlanName(treatmentPlan.getTreatmentPlanName())
                .treatmentPlanVideos(videoResponses)
                .isLinkDisplayPatient(treatmentPlan.getIsLinkDisplayPatient())
                .treatmentPlanTagName(treatmentPlan.getTreatmentPlanTagName())
                .isApprovedByPatient(treatmentPlan.getIsApprovedByPatient())
                .approvedByPatientAt(treatmentPlan.getApprovedByPatientAt())
                .initiatorStatus(treatmentPlan.getInitiatorStatus())
                .approverStatus(treatmentPlan.getApproverStatus())
                .orderStatusChangedAt(treatmentPlan.getOrderStatusChangedAt())
                .orderId(treatmentPlan.getOrderId())
                .treatmentPlanMetadata(treatmentPlan.getTreatmentPlanMetadata())
                .updatedAt(treatmentPlan.getUpdatedAt())
                .stlFileMetadata(treatmentPlan.getStlFileMetadata())
                .treatmentPlanUploadType(treatmentPlan.getTreatmentPlanUploadType())
                .createdAt(treatmentPlan.getCreatedAt())
                .linkedTreatmentPlanMetadata(
                        treatmentPlan.getLinkedTreatmentPlan() != null
                                ? LinkedTreatmentPlanMetadata.from(treatmentPlan.getLinkedTreatmentPlan())
                                : null)
                .manufacturingDetails(
                        treatmentPlan.getManufacturingBatches() != null
                                ? treatmentPlan.getManufacturingBatches().stream()
                                        .map(ManufacturingDetails::from)
                                        .toList()
                                : Collections.emptyList())
                .treatmentFinalizedOn(treatmentPlan.getTreatmentFinalisedAt())
                .isVideoDisplayPatient(treatmentPlan.getIsVideDisplayToPatient())
                .pendingActionCount(pendingActionsCount)
                .shippingDetailsResponse(
                        treatmentPlan.getShippingDetails() != null
                                ? ShippingDetailsResponse.from(treatmentPlan.getShippingDetails())
                                : null)
                .build();
    }
}
