package com.dentalstack.patient.feature.aligner.dto;

import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.order.entity.ManufacturingBatch;
import com.dentalstack.patient.feature.order.enums.ManufacturingStatus;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UnprocessedAlignerResponse implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long patientId;
    private Long treatmentPlanId;

    private String patientFullName;
    private String patientProfileUrl;

    private CaseType caseType;

    private String customer;

    private AlignerInfo totalAligners;

    private AlignerInfo delivered;

    private AlignerInfo inInventory;

    private AlignerInfo pending;
    private AlignerInfo transit;

    private LocalDate dueBy;

    private LocalDate reminderDate;

    private Long reminderId;
    private String orderId;
    private ManufacturingStatus latestBatchManufacturingStatus;
    private DueStatus dueByStatus;
    private boolean treatmentPlanStatusCompleted;
    private AlignerTreatmentStatus treatmentPlanStatus;
    private Integer batchNumber;
    private Integer ongoingTaskPackagedCount;
    private Integer currentBatchTotalAligners;
    private LocalDate archivedOn;

    public enum CaseType {
        ARCHIVED,
        REFINEMENT,
        NEW,
        ARCHIVE_PLUS_ACTIVE,
        ACTIVE_PLUS_REFINEMENT,
        ALL
    }

    public enum DueStatus {
        DUE_TODAY,
        DUE_THIS_WEEK,
        DUE_LATER,
        OVERDUE,
        NOT_ADDED
    }

    public static UnprocessedAlignerResponse from(ManufacturingBatch manufacturingBatch) {
        return UnprocessedAlignerResponse.builder()
                .patientId(manufacturingBatch.getPatient().getId())
                .patientFullName(manufacturingBatch.getPatient().fullName())
                .patientProfileUrl(manufacturingBatch.getPatient().getProfilePictureUrl())
                .customer(manufacturingBatch.getManufacturingTargetProfile().getOrgName())
                .totalAligners(AlignerInfo.from(manufacturingBatch))
                .delivered(AlignerInfo.from(manufacturingBatch))
                .inInventory(AlignerInfo.from(manufacturingBatch))
                .pending(AlignerInfo.from(manufacturingBatch))
                .dueBy(manufacturingBatch.getDeliveryDate())
                .build();
    }
}
