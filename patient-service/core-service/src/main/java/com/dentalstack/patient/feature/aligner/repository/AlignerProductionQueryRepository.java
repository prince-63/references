package com.dentalstack.patient.feature.aligner.repository;

import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import feign.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AlignerProductionQueryRepository extends JpaRepository<AlignerJourney, Long> {

    @Query(
            value =
                    """
                SELECT aj.* FROM aligner_journey aj
                INNER JOIN tracking t ON aj.id = t.aligner_journey_id
                INNER JOIN treatment_plan tp ON t.treatment_plan_id = tp.id
                WHERE aj.progress_status = :progressStatus
                AND aj.current_aligner_no > 0
                AND NOT EXISTS (
                    SELECT 1 FROM manufacturing_batches mb
                    WHERE mb.treatment_plan_id = tp.id
                )
                ORDER BY aj.id
                """,
            nativeQuery = true)
    Page<AlignerJourney> findEligibleJourneysWithoutManufacturingBatches(
            @Param("progressStatus") String progressStatus, Pageable pageable);
}
