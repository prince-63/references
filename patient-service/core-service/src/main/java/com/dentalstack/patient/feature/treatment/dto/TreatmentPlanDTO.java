package com.dentalstack.patient.feature.treatment.dto;

import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.storage.files.dto.FileDetails;
import com.dentalstack.patient.feature.treatment.entity.AlignerDetailsMetadata;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.dentalstack.patient.global.enums.ProductTypeName;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TreatmentPlanDTO {
    private Long id;
    private String name;
    private ProductTypeName treatmentSubType;
    private String brandName;
    private Long doctorId;
    private String treatmentPlanningSoftware;
    private String treatmentPlanningLink;
    private String remarks;
    private Integer daysToWearEachAligner;
    private Integer recommendedHoursToWearAligners;
    private AlignerTreatmentStatus status;
    private String treatmentType;
    private AlignerDetailsMetadata alignerDetailsMetadata;
    private Long productionLabId;
    private Integer currentAlignerNumber;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isTreatmentFinalised;
    private String reasonForDeactivation;
    private LocalDate deactivatedAt;
    private String treatmentPlanName;
    private String otherRemarks;
    private Boolean isLinkDisplayPatient;
    private String treatmentPlanTagName;
    private Boolean isApprovedByPatient;
    private LocalDate approvedByPatientAt;
    private TrackingDTO tracking;
    private List<TreatmentPlanVideoResponse> treatmentPlanVideoFiles;
    private List<FileDetails> files;
    private List<FileDetails> pdfFiles;
    private Integer totalAligners;
    private ZonedDateTime treatmentFinalisationDate;
    private Boolean isVideoDisplayPatient;

    public static TreatmentPlanDTO from(
            TreatmentPlan treatmentPlan,
            Integer totalAligners,
            List<TreatmentPlanVideoResponse> treatmentPlanVideoResponse,
            List<FileDetails> fileDetails,
            TrackingDTO tracking,
            List<FileDetails> pdfFileDetails) {
        return TreatmentPlanDTO.builder()
                .id(treatmentPlan.getId())
                .name(treatmentPlan.getTreatmentPlanName())
                .treatmentSubType(treatmentPlan.getTreatmentSubType())
                .brandName(treatmentPlan.getBrandName())
                .doctorId(treatmentPlan.getDoctorId())
                .treatmentPlanningSoftware(treatmentPlan.getTreatmentPlanningSoftware())
                .treatmentPlanningLink(treatmentPlan.getTreatmentPlanningLink())
                .remarks(treatmentPlan.getRemarks())
                .daysToWearEachAligner(treatmentPlan.getDaysToWearEachAligner())
                .recommendedHoursToWearAligners(treatmentPlan.getRecommendedHoursToWearAligners())
                .status(treatmentPlan.getStatus())
                .treatmentType(treatmentPlan.getTreatmentType())
                .alignerDetailsMetadata(treatmentPlan.getAlignerDetailsMetadata())
                .productionLabId(treatmentPlan.getProductionLabId())
                .currentAlignerNumber(treatmentPlan.getCurrentAlignerNumber())
                .startDate(treatmentPlan.getStartDate())
                .endDate(treatmentPlan.getEndDate())
                .isTreatmentFinalised(treatmentPlan.getIsTreatmentFinalised())
                .reasonForDeactivation(treatmentPlan.getReasonForDeactivation())
                .deactivatedAt(treatmentPlan.getDeactivatedAt())
                .treatmentPlanName(treatmentPlan.getTreatmentPlanName())
                .otherRemarks(treatmentPlan.getOtherRemarks())
                .isLinkDisplayPatient(treatmentPlan.getIsLinkDisplayPatient())
                .treatmentPlanTagName(treatmentPlan.getTreatmentPlanTagName())
                .isApprovedByPatient(treatmentPlan.getIsApprovedByPatient())
                .approvedByPatientAt(treatmentPlan.getApprovedByPatientAt())
                .tracking(tracking)
                .treatmentPlanVideoFiles(treatmentPlanVideoResponse)
                .files(fileDetails)
                .totalAligners(totalAligners)
                .treatmentFinalisationDate(treatmentPlan.getCreatedAt())
                .pdfFiles(pdfFileDetails)
                .isVideoDisplayPatient(treatmentPlan.getIsVideDisplayToPatient())
                .build();
    }
}
