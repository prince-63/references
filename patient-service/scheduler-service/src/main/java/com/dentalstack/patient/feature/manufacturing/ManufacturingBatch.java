package com.dentalstack.patient.feature.manufacturing;

import com.dentalstack.patient.feature.order.entity.Order;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.fasterxml.jackson.databind.JsonNode;
import io.hypersistence.utils.hibernate.type.json.JsonType;
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

    @org.hibernate.annotations.Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private JsonNode serviceProducts;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    private Integer batchNumber;

    public static AlignerInfo calculateDeliveredAlignersSummery(List<ManufacturingBatchSummary> manufacturingBatches) {
        List<ManufacturingBatchSummary> deliveredBatches = manufacturingBatches.stream()
                .filter(batch -> batch.getStatus() == ManufacturingStatus.DELIVERED)
                .collect(Collectors.toList());

        return aggregateAlignerInfoSummery(deliveredBatches);
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
