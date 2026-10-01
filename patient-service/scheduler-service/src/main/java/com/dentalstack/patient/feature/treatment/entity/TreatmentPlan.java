package com.dentalstack.patient.feature.treatment.entity;

import com.dentalstack.patient.feature.manufacturing.AlignerInfo;
import com.dentalstack.patient.feature.manufacturing.ManufacturingBatch;
import com.dentalstack.patient.feature.order.entity.Order;
import com.dentalstack.patient.feature.order.enums.OrderTreatmentPlanStatus;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.product.enums.ProductTypeName;
import com.dentalstack.patient.feature.storage.entity.File;
import com.dentalstack.patient.feature.tracking.entity.Tracking;
import com.dentalstack.patient.feature.treatment.dto.LowerJawDetails;
import com.dentalstack.patient.feature.treatment.dto.TreatmentPlanMetadata;
import com.dentalstack.patient.feature.treatment.dto.UpperJawDetails;
import com.dentalstack.patient.feature.treatment.enums.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.treatment.projections.TreatmentPlanSummary;
import com.dentalstack.patient.global.entity.BaseEntity;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.*;
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

    @OneToMany(targetEntity = File.class, cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @Builder.Default
    @JoinTable(name = "treatment_plan_file")
    private List<File> files = new ArrayList<>();

    @OneToOne(mappedBy = "treatmentPlan", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "treatment_plan_id")
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

    @OneToMany(mappedBy = "treatmentPlan", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<TreatmentPlanVideoFile> treatmentPlanVideoFiles;

    @Nullable
    private Boolean isLinkDisplayPatient;

    private String treatmentPlanTagName;
    private Boolean isApprovedByPatient;
    private LocalDate approvedByPatientAt;

    // order related columns
    private String orderId;
    private ZonedDateTime orderStatusChangedAt;

    @Enumerated(EnumType.STRING)
    private OrderTreatmentPlanStatus initiatorStatus;

    @Enumerated(EnumType.STRING)
    private OrderTreatmentPlanStatus approverStatus;

    @org.hibernate.annotations.Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private TreatmentPlanMetadata treatmentPlanMetadata;

    @OneToMany(targetEntity = File.class, cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @Builder.Default
    @JoinTable(name = "treatment_plan_pdf_file")
    private List<File> pdfFiles = new ArrayList<>();

    @OneToMany(targetEntity = File.class, cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @Builder.Default
    @JoinTable(name = "treatment_plan_other_file")
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

    private String treatmentPlanVersion;

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
