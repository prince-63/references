package com.dentalstack.patient.feature.manufacturing;

import feign.Param;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ManufacturingRepository extends JpaRepository<ManufacturingBatch, Long> {

    @Query(
            """
        SELECT
            mb.id as id,
            mb.order.id as orderId,
            mb.treatmentPlan.id as treatmentPlanId,
            mb.patient.id as patientId,
            mb.status as status,
            mb.upperAlignerStart as upperAlignerStart,
            mb.upperAlignerEnd as upperAlignerEnd,
            mb.lowerAlignerStart as lowerAlignerStart,
            mb.lowerAlignerEnd as lowerAlignerEnd,
            mb.totalAligners as totalAligners,
            mb.startDate as startDate,
            mb.completionDate as completionDate,
            mb.shippingDate as shippingDate,
            mb.deliveryDate as deliveryDate,
            mb.isCurrent as isCurrent
        FROM ManufacturingBatch mb
        WHERE mb.treatmentPlan.id = :treatmentPlanId
        ORDER BY mb.startDate DESC
        """)
    List<ManufacturingBatchSummary> findSummariesByTreatmentPlanId(@Param("treatmentPlanId") Long treatmentPlanId);
}
