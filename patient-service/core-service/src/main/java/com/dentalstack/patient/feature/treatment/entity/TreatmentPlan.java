package com.dentalstack.patient.feature.treatment.entity;

import com.dentalstack.patient.feature.aligner.dto.AlignerInfo;
import com.dentalstack.patient.feature.aligner.dto.aligner.STLFileMetadata;
import com.dentalstack.patient.feature.aligner.dto.aligner.v2.CreateAlignerJourneyRequest;
import com.dentalstack.patient.feature.aligner.dto.alignertreatment.LowerJawDetails;
import com.dentalstack.patient.feature.aligner.dto.alignertreatment.UpperJawDetails;
import com.dentalstack.patient.feature.aligner.enums.aligner.TreatmentPlanUploadType;
import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.order.dto.ShippingDetails;
import com.dentalstack.patient.feature.order.entity.ManufacturingBatch;
import com.dentalstack.patient.feature.order.entity.Order;
import com.dentalstack.patient.feature.order.enums.OrderTreatmentPlanStatus;
import com.dentalstack.patient.feature.patient.dto.TreatmentPlanRequest;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.tracking.entity.Tracking;
import com.dentalstack.patient.feature.treatment.dto.TreatmentPlanMetadata;
import com.dentalstack.patient.feature.treatment.projection.TreatmentPlanProfileSummary;
import com.dentalstack.patient.feature.treatment.projection.TreatmentPlanSummary;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.enums.ProductTypeName;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import lombok.*;
import org.springframework.beans.BeanUtils;
import org.springframework.lang.Nullable;

@Entity
@Table(
        name = "treatment_plan",
        indexes = {
            @Index(name = "IX_treatment_plan_patient_id", columnList = "patient_id"),
            @Index(name = "IX_treatment_plan_doctor_id", columnList = "doctorId"),
            @Index(name = "IX_treatment_plan_treatment_sub_type", columnList = "treatmentSubType"),
            @Index(name = "IX_treatment_plan_doctor_id_treatment_sub_type", columnList = "doctorId, treatmentSubType"),
            @Index(name = "IX_treatment_plan_status", columnList = "status"),
            @Index(name = "IX_treatment_plan_patient_id_doctor_id_status", columnList = "patient_id, doctorId, status"),
            @Index(
                    name = "IX_treatment_plan_patient_id_doctor_id_treatment_sub_type",
                    columnList = "patient_id, doctorId, treatmentSubType"),
            @Index(name = "IX_treatment_plan_patient_id_doctor_id", columnList = "patient_id, doctorId")
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreatmentPlan extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    @ToString.Exclude
    private Patient patient;

    private String name;

    @Enumerated(EnumType.STRING)
    private ProductTypeName treatmentSubType;

    private String brandName;

    private Long doctorId;

    @org.hibernate.annotations.Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private AlignerDetailsMetadata alignerDetailsMetadata;

    private String treatmentPlanningSoftware;

    private String treatmentPlanningLink;

    private String remarks;

    private Integer daysToWearEachAligner;

    private Integer recommendedHoursToWearAligners;

    @Enumerated(EnumType.STRING)
    private AlignerTreatmentStatus status;

    @OneToMany(targetEntity = File.class, cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @JoinTable(name = "treatment_plan_file")
    @ToString.Exclude
    private List<File> files = new ArrayList<>();

    @OneToOne(mappedBy = "treatmentPlan", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "treatment_plan_id")
    @ToString.Exclude
    private Tracking tracking;

    private String treatmentType;

    private Long productionLabId;

    @Nullable
    private Integer currentAlignerNumber;

    @Nullable
    private LocalDate startDate;

    @Nullable
    private LocalDate endDate;

    @Builder.Default
    private Boolean isTreatmentFinalised = false;

    @Nullable
    private String reasonForDeactivation;

    @Nullable
    private LocalDate deactivatedAt;

    private String treatmentPlanName;

    @Nullable
    private String otherRemarks;

    @OneToMany(mappedBy = "treatmentPlan", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<TreatmentPlanVideoFile> treatmentPlanVideoFiles;

    @Nullable
    private Boolean isLinkDisplayPatient;

    private String treatmentPlanTagName;
    private Boolean isApprovedByPatient;
    private LocalDate approvedByPatientAt;

    private String orderId;
    private ZonedDateTime orderStatusChangedAt;

    @Enumerated(EnumType.STRING)
    private OrderTreatmentPlanStatus initiatorStatus;

    @Enumerated(EnumType.STRING)
    private OrderTreatmentPlanStatus approverStatus;

    @org.hibernate.annotations.Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private TreatmentPlanMetadata treatmentPlanMetadata;

    @org.hibernate.annotations.Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private STLFileMetadata stlFileMetadata;

    @Enumerated(EnumType.STRING)
    private TreatmentPlanUploadType treatmentPlanUploadType;

    @OneToMany(targetEntity = File.class, cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @JoinTable(name = "treatment_plan_pdf_file")
    @ToString.Exclude
    private List<File> pdfFiles = new ArrayList<>();

    @OneToMany(targetEntity = File.class, cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @JoinTable(name = "treatment_plan_other_file")
    @ToString.Exclude
    private List<File> otherFiles = new ArrayList<>();

    @Nullable
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_treatment_plan_id")
    private TreatmentPlan linkedTreatmentPlan;

    @Nullable
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_order_id")
    private Order order;

    @OneToMany(mappedBy = "treatmentPlan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ManufacturingBatch> manufacturingBatches;

    private ZonedDateTime treatmentFinalisedAt;
    private Boolean isVideDisplayToPatient;

    @Column(length = 500)
    private String treatmentPlanCompletedRemarks;

    private ZonedDateTime treatmentPlanCompletedDate;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "shipping_details_id")
    private ShippingDetails shippingDetails;

    private String treatmentPlanVersion;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "outsourced_to_user_id")
    private UserProfile outsourcedTo;

    private Boolean isStlFileRequested;
    private ZonedDateTime stlFileRequestedAt;

    public static TreatmentPlan from(TreatmentPlanRequest request, Patient patient, Integer treatmentPlantCount) {
        LowerJawDetails lowerJawDetails = null;
        UpperJawDetails upperJawDetails = null;

        if (request.getAlignerTreatmentDetails() != null) {
            lowerJawDetails = request.getAlignerTreatmentDetails().getLowerJaw();
            upperJawDetails = request.getAlignerTreatmentDetails().getUpperJaw();
        }
        String treatmentPanName = "Treatment " + treatmentPlantCount;
        String version = "V" + treatmentPlantCount;

        return TreatmentPlan.builder()
                .patient(patient)
                .name(request.getName())
                .treatmentSubType(request.getTreatmentSubType())
                .brandName(
                        request.getProductionLabDetails() != null
                                ? request.getProductionLabDetails().getBrandName()
                                : null)
                .doctorId(request.getDoctorId())
                .treatmentPlanningSoftware(request.getTreatmentPlanningSoftware())
                .treatmentPlanningLink(request.getTreatmentPlanningLink())
                .remarks(request.getRemarks())
                .daysToWearEachAligner(request.getDaysToWearEachAligner())
                .recommendedHoursToWearAligners(request.getRecommendedHoursToWearAligners())
                .status(request.getStatus())
                .treatmentType(String.valueOf(request.getTreatmentSubType()))
                .alignerDetailsMetadata(new AlignerDetailsMetadataSet(upperJawDetails, lowerJawDetails))
                .productionLabId(
                        request.getProductionLabDetails() != null
                                ? request.getProductionLabDetails().getProductionLabId()
                                : null)
                .isTreatmentFinalised(false)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .currentAlignerNumber(request.getCurrentAlignerNo())
                .treatmentPlanName(treatmentPanName)
                .isLinkDisplayPatient(request.isLinkDisplayPatient())
                .treatmentPlanTagName(request.getTreatmentPlanTagName())
                .isApprovedByPatient(request.getIsApprovedByPatient())
                .approvedByPatientAt(request.getApprovedByPatientAt())
                .orderId(request.getOrderId())
                .initiatorStatus(request.getInitiatorStatus())
                .approverStatus(request.getApproverStatus())
                .orderStatusChangedAt(request.getOrderStatusChangedAt())
                .treatmentPlanMetadata(request.getTreatmentPlanMetadata())
                .treatmentPlanUploadType(request.getTreatmentPlanUploadType())
                .isVideDisplayToPatient(request.isVideoDisplayToPatient())
                .treatmentPlanVersion(version)
                .build();
    }

    public void updateFromRequest(TreatmentPlanRequest request) {
        BeanUtils.copyProperties(request, this, getNullPropertyNames(request));

        if (request.getAlignerTreatmentDetails() != null) {
            this.alignerDetailsMetadata = new AlignerDetailsMetadataSet(
                    request.getAlignerTreatmentDetails().getUpperJaw(),
                    request.getAlignerTreatmentDetails().getLowerJaw());
        }

        if (request.getProductionLabDetails() != null) {
            this.productionLabId = request.getProductionLabDetails().getProductionLabId();
        }
    }

    private String[] getNullPropertyNames(Object source) {
        return Arrays.stream(BeanUtils.getPropertyDescriptors(source.getClass()))
                .map(pd -> {
                    try {
                        return pd.getReadMethod().invoke(source) == null ? pd.getName() : null;
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .toArray(String[]::new);
    }

    public TreatmentPlan updateTreatmentPlanDetails(Tracking tracking, CreateAlignerJourneyRequest request) {
        this.setTracking(tracking);
        tracking.setTreatmentPlan(this);
        this.setStartDate(request.getCurrentAlignerDetails().getStartDate());
        this.setEndDate(request.getCurrentAlignerDetails().getEndDate());
        this.setCurrentAlignerNumber(request.getCurrentAlignerDetails().getNumber());
        return this;
    }

    public TreatmentPlan finaliseTreatment(Tracking tracking, CreateAlignerJourneyRequest request) {
        this.setTracking(tracking);
        tracking.setTreatmentPlan(this);
        this.setStartDate(request.getCurrentAlignerDetails().getStartDate());
        this.setEndDate(request.getCurrentAlignerDetails().getEndDate());
        this.setCurrentAlignerNumber(request.getCurrentAlignerDetails().getNumber());
        this.setIsTreatmentFinalised(true);
        this.setInitiatorStatus(OrderTreatmentPlanStatus.APPROVED);
        this.setApproverStatus(OrderTreatmentPlanStatus.APPROVED);
        this.setOrderStatusChangedAt(ZonedDateTime.now());
        return this;
    }

    public static AlignerInfo getTotalAlignersFromMetadata(TreatmentPlan treatmentPlan) {
        if (treatmentPlan.getAlignerDetailsMetadata() == null) {
            return AlignerInfo.builder()
                    .count(0)
                    .upperRangeStart(0)
                    .upperRangeEnd(0)
                    .lowerRangeStart(0)
                    .lowerRangeEnd(0)
                    .build();
        }

        AlignerDetailsMetadata metadata = treatmentPlan.getAlignerDetailsMetadata();
        UpperJawDetails upperJaw = metadata.getUpperJawDetails();
        LowerJawDetails lowerJaw = metadata.getLowerJawDetails();

        int upperStart = upperJaw != null && upperJaw.getStartsWith() != null ? upperJaw.getStartsWith() : 0;
        int upperEnd = upperJaw != null && upperJaw.getEndsWith() != null ? upperJaw.getEndsWith() : 0;
        int lowerStart = lowerJaw != null && lowerJaw.getStartsWith() != null ? lowerJaw.getStartsWith() : 0;
        int lowerEnd = lowerJaw != null && lowerJaw.getEndsWith() != null ? lowerJaw.getEndsWith() : 0;

        int upperCount = upperEnd > upperStart ? (upperEnd - upperStart + 1) : 0;
        int lowerCount = lowerEnd > lowerStart ? (lowerEnd - lowerStart + 1) : 0;
        int totalCount = upperCount + lowerCount;

        int stages = 0;

        if (upperEnd > 0 || lowerEnd > 0) {
            stages = Math.max(upperEnd, lowerEnd);
        }

        return AlignerInfo.builder()
                .count(totalCount)
                .upperRangeStart(upperStart)
                .upperRangeEnd(upperEnd)
                .lowerRangeStart(lowerStart)
                .lowerRangeEnd(lowerEnd)
                .stages(stages)
                .build();
    }

    public static AlignerInfo getTotalAlignersFromMetadata(TreatmentPlanProfileSummary treatmentPlan) {
        if (treatmentPlan.getAlignerDetailsMetadata() == null) {
            return AlignerInfo.builder()
                    .count(0)
                    .upperRangeStart(0)
                    .upperRangeEnd(0)
                    .lowerRangeStart(0)
                    .lowerRangeEnd(0)
                    .build();
        }

        AlignerDetailsMetadata metadata = treatmentPlan.getAlignerDetailsMetadata();
        UpperJawDetails upperJaw = metadata.getUpperJawDetails();
        LowerJawDetails lowerJaw = metadata.getLowerJawDetails();

        int upperStart = upperJaw != null && upperJaw.getStartsWith() != null ? upperJaw.getStartsWith() : 0;
        int upperEnd = upperJaw != null && upperJaw.getEndsWith() != null ? upperJaw.getEndsWith() : 0;
        int lowerStart = lowerJaw != null && lowerJaw.getStartsWith() != null ? lowerJaw.getStartsWith() : 0;
        int lowerEnd = lowerJaw != null && lowerJaw.getEndsWith() != null ? lowerJaw.getEndsWith() : 0;

        int upperCount = upperEnd > upperStart ? (upperEnd - upperStart + 1) : 0;
        int lowerCount = lowerEnd > lowerStart ? (lowerEnd - lowerStart + 1) : 0;
        int totalCount = upperCount + lowerCount;

        int stages = 0;

        if (upperEnd > 0 || lowerEnd > 0) {
            stages = Math.max(upperEnd, lowerEnd);
        }

        return AlignerInfo.builder()
                .count(totalCount)
                .upperRangeStart(upperStart)
                .upperRangeEnd(upperEnd)
                .lowerRangeStart(lowerStart)
                .lowerRangeEnd(lowerEnd)
                .stages(stages)
                .build();
    }

    public static AlignerInfo getTotalAlignersFromMetadata(TreatmentPlanSummary treatmentPlan) {
        if (treatmentPlan.getAlignerDetailsMetadata() == null) {
            return AlignerInfo.builder()
                    .count(0)
                    .upperRangeStart(0)
                    .upperRangeEnd(0)
                    .lowerRangeStart(0)
                    .lowerRangeEnd(0)
                    .build();
        }

        AlignerDetailsMetadata metadata = treatmentPlan.getAlignerDetailsMetadata();
        UpperJawDetails upperJaw = metadata.getUpperJawDetails();
        LowerJawDetails lowerJaw = metadata.getLowerJawDetails();

        int upperStart = upperJaw != null && upperJaw.getStartsWith() != null ? upperJaw.getStartsWith() : 0;
        int upperEnd = upperJaw != null && upperJaw.getEndsWith() != null ? upperJaw.getEndsWith() : 0;
        int lowerStart = lowerJaw != null && lowerJaw.getStartsWith() != null ? lowerJaw.getStartsWith() : 0;
        int lowerEnd = lowerJaw != null && lowerJaw.getEndsWith() != null ? lowerJaw.getEndsWith() : 0;

        int upperCount = upperEnd > upperStart ? (upperEnd - upperStart + 1) : 0;
        int lowerCount = lowerEnd > lowerStart ? (lowerEnd - lowerStart + 1) : 0;
        int totalCount = upperCount + lowerCount;

        return AlignerInfo.builder()
                .count(totalCount)
                .upperRangeStart(upperStart)
                .upperRangeEnd(upperEnd)
                .lowerRangeStart(lowerStart)
                .lowerRangeEnd(lowerEnd)
                .build();
    }
}
