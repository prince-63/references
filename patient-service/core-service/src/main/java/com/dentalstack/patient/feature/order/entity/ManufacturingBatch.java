package com.dentalstack.patient.feature.order.entity;

import com.dentalstack.patient.feature.aligner.dto.AlignerInfo;
import com.dentalstack.patient.feature.order.dto.CreateManufacturingRequest;
import com.dentalstack.patient.feature.order.enums.BatchType;
import com.dentalstack.patient.feature.order.enums.ManufacturingStatus;
import com.dentalstack.patient.feature.order.projection.ManufacturingBatchSummary;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.workflow.core.task_tracker.entity.PatientTaskTracker;
import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.TaskType;
import com.dentalstack.patient.feature.workflow.product.entity.ServiceProduct;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.fasterxml.jackson.databind.JsonNode;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import lombok.*;

@Entity
@Table(name = "manufacturing_batches")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManufacturingBatch extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "treatment_plan_id")
    private TreatmentPlan treatmentPlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Enumerated(EnumType.STRING)
    private BatchType batchType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manufacturing_owner_profile_id")
    private UserProfile manufacturingOwnerProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manufacturing_target_profile_id")
    private UserProfile manufacturingTargetProfile;

    @Enumerated(EnumType.STRING)
    private ManufacturingStatus status;

    private Integer upperAlignerStart;

    private Integer upperAlignerEnd;

    private Integer lowerAlignerStart;

    private Integer lowerAlignerEnd;

    private Integer totalAligners;

    private LocalDate startDate;

    private LocalDate completionDate;

    private LocalDate shippingDate;

    private LocalDate tentativeDeliveryDate;

    private LocalDate deliveryDate;

    private String trackingNumber;

    private String trackingLink;

    private Boolean isCurrent;
    private Boolean alreadyDelivered;
    private Boolean isShowMarkAsReceived;
    private LocalDate shippingAddedOn;

    @OneToMany(targetEntity = File.class, cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    @JoinTable(name = "manufacturing_batch_file")
    @ToString.Exclude
    private List<File> files = new ArrayList<>();

    @org.hibernate.annotations.Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private JsonNode serviceProducts;

    @Nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_product_id", referencedColumnName = "id")
    private ServiceProduct serviceProduct;

    @Enumerated(EnumType.STRING)
    private TaskType taskType;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_task_tracker_id")
    private PatientTaskTracker patientTaskTracker;

    private Integer batchNumber;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "outsourced_to_user_id")
    private UserProfile outsourcedTo;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "is_archived")
    @Builder.Default
    private Boolean isArchived = false;

    public boolean isDelivered() {
        return status == ManufacturingStatus.DELIVERED;
    }

    public static ManufacturingBatch createManufacturingBatch(
            TreatmentPlan treatmentPlan,
            CreateManufacturingRequest request,
            UserProfile userProfile,
            Integer batchNumber,
            ServiceProduct serviceProduct) {

        var isAlreadyDelivered = request.getStatus().equals(ManufacturingStatus.DELIVERED);
        return ManufacturingBatch.builder()
                .order(treatmentPlan.getOrder())
                .treatmentPlan(treatmentPlan)
                .patient(treatmentPlan.getPatient())
                .batchType(request.getBatchType())
                .manufacturingOwnerProfile(userProfile)
                .manufacturingTargetProfile(
                        treatmentPlan.getOrder() != null
                                ? treatmentPlan.getOrder().getOwnerProfile()
                                : userProfile)
                .status(request.getStatus() != null ? request.getStatus() : ManufacturingStatus.MANUFACTURING_STARTED)
                .upperAlignerStart(request.getUpperAlignerStart())
                .upperAlignerEnd(request.getUpperAlignerEnd())
                .lowerAlignerStart(request.getLowerAlignerStart())
                .lowerAlignerEnd(request.getLowerAlignerEnd())
                .totalAligners(request.getTotalAligners())
                .startDate(LocalDate.now())
                .deliveryDate(request.getDeliveryDate())
                .isCurrent(true)
                .serviceProducts(request.getServiceProducts())
                .taskType(request.getTaskType())
                .alreadyDelivered(isAlreadyDelivered)
                .instructions(request.getInstructions())
                .batchNumber(batchNumber)
                .serviceProduct(serviceProduct)
                .build();
    }

    public static AlignerInfo calculateDeliveredAlignersSummery(List<ManufacturingBatchSummary> manufacturingBatches) {
        List<ManufacturingBatchSummary> deliveredBatches = manufacturingBatches.stream()
                .filter(batch -> batch.getStatus() == ManufacturingStatus.DELIVERED)
                .collect(Collectors.toList());

        return aggregateAlignerInfoSummery(deliveredBatches);
    }

    public static AlignerInfo calculateDeliveredAligners(List<ManufacturingBatch> manufacturingBatches) {
        List<ManufacturingBatch> deliveredBatches = manufacturingBatches.stream()
                .filter(batch -> batch.getStatus() == ManufacturingStatus.DELIVERED)
                .collect(Collectors.toList());
        return aggregateAlignerInfo(deliveredBatches);
    }

    public static AlignerInfo calculateInInventoryAlignersSummery(
            List<ManufacturingBatchSummary> manufacturingBatches) {
        List<ManufacturingBatchSummary> relevantBatches = manufacturingBatches.stream()
                .filter(batch -> batch.getStatus() == ManufacturingStatus.COMPLETED
                        || batch.getStatus() == ManufacturingStatus.MANUFACTURING_STARTED
                        || batch.getStatus() == ManufacturingStatus.SHIPPED)
                .collect(Collectors.toList());

        return aggregateAlignerInfoSummery(relevantBatches);
    }

    public static AlignerInfo calculateTransitAlignersSummery(List<ManufacturingBatchSummary> manufacturingBatches) {
        List<ManufacturingBatchSummary> shippedBatches = manufacturingBatches.stream()
                .filter(batch -> batch.getStatus() == ManufacturingStatus.SHIPPED)
                .collect(Collectors.toList());

        return aggregateAlignerInfoSummery(shippedBatches);
    }

    private static AlignerInfo aggregateAlignerInfo(List<ManufacturingBatch> batches) {
        if (batches.isEmpty()) {
            return AlignerInfo.builder()
                    .count(0)
                    .upperRangeStart(0)
                    .upperRangeEnd(0)
                    .lowerRangeStart(0)
                    .lowerRangeEnd(0)
                    .build();
        }

        int totalCount = batches.stream()
                .mapToInt(batch -> batch.getTotalAligners() != null ? batch.getTotalAligners() : 0)
                .sum();

        OptionalInt minUpperStart = batches.stream()
                .filter(batch -> batch.getUpperAlignerStart() != null)
                .mapToInt(ManufacturingBatch::getUpperAlignerStart)
                .min();

        OptionalInt maxUpperEnd = batches.stream()
                .filter(batch -> batch.getUpperAlignerEnd() != null)
                .mapToInt(ManufacturingBatch::getUpperAlignerEnd)
                .max();

        OptionalInt minLowerStart = batches.stream()
                .filter(batch -> batch.getLowerAlignerStart() != null)
                .mapToInt(ManufacturingBatch::getLowerAlignerStart)
                .min();

        OptionalInt maxLowerEnd = batches.stream()
                .filter(batch -> batch.getLowerAlignerEnd() != null)
                .mapToInt(ManufacturingBatch::getLowerAlignerEnd)
                .max();

        return AlignerInfo.builder()
                .count(totalCount)
                .upperRangeStart(minUpperStart.orElse(0))
                .upperRangeEnd(maxUpperEnd.orElse(0))
                .lowerRangeStart(minLowerStart.orElse(0))
                .lowerRangeEnd(maxLowerEnd.orElse(0))
                .build();
    }

    private static AlignerInfo aggregateAlignerInfoSummery(List<ManufacturingBatchSummary> batches) {
        if (batches.isEmpty()) {
            return AlignerInfo.builder()
                    .count(0)
                    .upperRangeStart(0)
                    .upperRangeEnd(0)
                    .lowerRangeStart(0)
                    .lowerRangeEnd(0)
                    .build();
        }

        int totalCount = batches.stream()
                .mapToInt(batch -> batch.getTotalAligners() != null ? batch.getTotalAligners() : 0)
                .sum();

        OptionalInt minUpperStart = batches.stream()
                .filter(batch -> batch.getUpperAlignerStart() != null)
                .mapToInt(ManufacturingBatchSummary::getUpperAlignerStart)
                .min();

        OptionalInt maxUpperEnd = batches.stream()
                .filter(batch -> batch.getUpperAlignerEnd() != null)
                .mapToInt(ManufacturingBatchSummary::getUpperAlignerEnd)
                .max();

        OptionalInt minLowerStart = batches.stream()
                .filter(batch -> batch.getLowerAlignerStart() != null)
                .mapToInt(ManufacturingBatchSummary::getLowerAlignerStart)
                .min();

        OptionalInt maxLowerEnd = batches.stream()
                .filter(batch -> batch.getLowerAlignerEnd() != null)
                .mapToInt(ManufacturingBatchSummary::getLowerAlignerEnd)
                .max();

        return AlignerInfo.builder()
                .count(totalCount)
                .upperRangeStart(minUpperStart.orElse(0))
                .upperRangeEnd(maxUpperEnd.orElse(0))
                .lowerRangeStart(minLowerStart.orElse(0))
                .lowerRangeEnd(maxLowerEnd.orElse(0))
                .build();
    }

    public static AlignerInfo calculatePendingAligners(
            AlignerInfo total, List<ManufacturingBatch> manufacturingBatches) {

        Set<ManufacturingStatus> processedStatuses = Set.of(
                ManufacturingStatus.DELIVERED,
                ManufacturingStatus.COMPLETED,
                ManufacturingStatus.SHIPPED,
                ManufacturingStatus.MANUFACTURING_STARTED);

        List<ManufacturingBatch> processedBatches = manufacturingBatches.stream()
                .filter(batch -> processedStatuses.contains(batch.getStatus()))
                .collect(Collectors.toList());

        AlignerInfo processedAligners = aggregateAlignerInfo(processedBatches);

        Set<Integer> processedUpperNumbers =
                getRangeNumbers(processedAligners.getUpperRangeStart(), processedAligners.getUpperRangeEnd());
        Set<Integer> processedLowerNumbers =
                getRangeNumbers(processedAligners.getLowerRangeStart(), processedAligners.getLowerRangeEnd());

        List<Integer> pendingUpperNumbers =
                getPendingNumbers(total.getUpperRangeStart(), total.getUpperRangeEnd(), processedUpperNumbers);
        List<Integer> pendingLowerNumbers =
                getPendingNumbers(total.getLowerRangeStart(), total.getLowerRangeEnd(), processedLowerNumbers);

        return buildPendingAlignerInfo(pendingUpperNumbers, pendingLowerNumbers);
    }

    public static AlignerInfo calculatePendingAlignersWithCurrentAligner(
            AlignerInfo totalAligners, List<ManufacturingBatch> manufacturingBatches, Integer currentAlignerNumber) {

        if (!manufacturingBatches.isEmpty()) {
            return calculatePendingAligners(totalAligners, manufacturingBatches);
        }

        if (currentAlignerNumber == null || currentAlignerNumber == 1 || currentAlignerNumber <= 0) {
            return totalAligners;
        }

        int pendingUpperStart = 0;
        int pendingUpperEnd = 0;
        int pendingLowerStart = 0;
        int pendingLowerEnd = 0;

        if (currentAlignerNumber < totalAligners.getUpperRangeStart()) {
            pendingUpperStart = totalAligners.getUpperRangeStart();
            pendingUpperEnd = totalAligners.getUpperRangeEnd();
        } else if (currentAlignerNumber <= totalAligners.getUpperRangeEnd()) {
            pendingUpperStart = currentAlignerNumber + 1;
            pendingUpperEnd = totalAligners.getUpperRangeEnd();
            if (pendingUpperStart > pendingUpperEnd) {
                pendingUpperStart = 0;
                pendingUpperEnd = 0;
            }
        }

        if (currentAlignerNumber < totalAligners.getLowerRangeStart()) {
            pendingLowerStart = totalAligners.getLowerRangeStart();
            pendingLowerEnd = totalAligners.getLowerRangeEnd();
        } else if (currentAlignerNumber <= totalAligners.getLowerRangeEnd()) {
            pendingLowerStart = currentAlignerNumber + 1;
            pendingLowerEnd = totalAligners.getLowerRangeEnd();
            if (pendingLowerStart > pendingLowerEnd) {
                pendingLowerStart = 0;
                pendingLowerEnd = 0;
            }
        }

        int pendingCount = 0;
        if (pendingUpperStart > 0 && pendingUpperEnd >= pendingUpperStart) {
            pendingCount += pendingUpperEnd - pendingUpperStart + 1;
        }
        if (pendingLowerStart > 0 && pendingLowerEnd >= pendingLowerStart) {
            pendingCount += pendingLowerEnd - pendingLowerStart + 1;
        }

        return AlignerInfo.builder()
                .count(pendingCount)
                .upperRangeStart(pendingUpperStart)
                .upperRangeEnd(pendingUpperEnd)
                .lowerRangeStart(pendingLowerStart)
                .lowerRangeEnd(pendingLowerEnd)
                .build();
    }

    public static AlignerInfo calculatePendingAlignersSummery(
            AlignerInfo total, List<ManufacturingBatchSummary> manufacturingBatches) {

        Set<ManufacturingStatus> processedStatuses = Set.of(
                ManufacturingStatus.DELIVERED,
                ManufacturingStatus.COMPLETED,
                ManufacturingStatus.SHIPPED,
                ManufacturingStatus.MANUFACTURING_STARTED);

        List<ManufacturingBatchSummary> processedBatches = manufacturingBatches.stream()
                .filter(batch -> processedStatuses.contains(batch.getStatus()))
                .collect(Collectors.toList());

        AlignerInfo processedAligners = aggregateAlignerInfoSummery(processedBatches);

        Set<Integer> processedUpperNumbers =
                getRangeNumbers(processedAligners.getUpperRangeStart(), processedAligners.getUpperRangeEnd());
        Set<Integer> processedLowerNumbers =
                getRangeNumbers(processedAligners.getLowerRangeStart(), processedAligners.getLowerRangeEnd());

        List<Integer> pendingUpperNumbers =
                getPendingNumbers(total.getUpperRangeStart(), total.getUpperRangeEnd(), processedUpperNumbers);
        List<Integer> pendingLowerNumbers =
                getPendingNumbers(total.getLowerRangeStart(), total.getLowerRangeEnd(), processedLowerNumbers);

        return buildPendingAlignerInfo(pendingUpperNumbers, pendingLowerNumbers);
    }

    private static Set<Integer> getRangeNumbers(int start, int end) {
        Set<Integer> numbers = new HashSet<>();
        if (start > 0 && end > 0) {
            for (int i = start; i <= end; i++) {
                numbers.add(i);
            }
        }
        return numbers;
    }

    private static List<Integer> getPendingNumbers(int totalStart, int totalEnd, Set<Integer> processedNumbers) {
        List<Integer> pendingNumbers = new ArrayList<>();
        if (totalStart > 0 && totalEnd > 0) {
            for (int i = totalStart; i <= totalEnd; i++) {
                if (!processedNumbers.contains(i)) {
                    pendingNumbers.add(i);
                }
            }
        }
        return pendingNumbers;
    }

    private static AlignerInfo buildPendingAlignerInfo(
            List<Integer> pendingUpperNumbers, List<Integer> pendingLowerNumbers) {
        int pendingUpperStart = pendingUpperNumbers.isEmpty() ? 0 : Collections.min(pendingUpperNumbers);
        int pendingUpperEnd = pendingUpperNumbers.isEmpty() ? 0 : Collections.max(pendingUpperNumbers);
        int pendingLowerStart = pendingLowerNumbers.isEmpty() ? 0 : Collections.min(pendingLowerNumbers);
        int pendingLowerEnd = pendingLowerNumbers.isEmpty() ? 0 : Collections.max(pendingLowerNumbers);

        int totalPendingCount = pendingUpperNumbers.size() + pendingLowerNumbers.size();

        return AlignerInfo.builder()
                .count(totalPendingCount)
                .upperRangeStart(pendingUpperStart)
                .upperRangeEnd(pendingUpperEnd)
                .lowerRangeStart(pendingLowerStart)
                .lowerRangeEnd(pendingLowerEnd)
                .build();
    }

    public static int getRemainingAlignerStartNumber(ManufacturingBatch latestBatch) {
        int highestAlignerNumber = 0;

        if (latestBatch.getUpperAlignerEnd() != null && latestBatch.getUpperAlignerEnd() > 0) {
            highestAlignerNumber = latestBatch.getUpperAlignerEnd();
        }

        if (latestBatch.getLowerAlignerEnd() != null && latestBatch.getLowerAlignerEnd() > 0) {
            highestAlignerNumber = Math.max(highestAlignerNumber, latestBatch.getLowerAlignerEnd());
        }

        return highestAlignerNumber;
    }

    public static int getRemainingAlignerStartNumberSummery(ManufacturingBatchSummary latestBatch) {
        int highestAlignerNumber = 0;

        if (latestBatch.getUpperAlignerEnd() != null && latestBatch.getUpperAlignerEnd() > 0) {
            highestAlignerNumber = latestBatch.getUpperAlignerEnd();
        }

        if (latestBatch.getLowerAlignerEnd() != null && latestBatch.getLowerAlignerEnd() > 0) {
            highestAlignerNumber = Math.max(highestAlignerNumber, latestBatch.getLowerAlignerEnd());
        }

        return highestAlignerNumber;
    }
}
