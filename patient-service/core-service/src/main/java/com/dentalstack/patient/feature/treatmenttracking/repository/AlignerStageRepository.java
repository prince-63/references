package com.dentalstack.patient.feature.treatmenttracking.repository;

import com.dentalstack.patient.feature.treatmenttracking.entity.AlignerStage;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AlignerStageRepository extends JpaRepository<AlignerStage, Long> {

    List<AlignerStage> findByTreatmentPlanIdOrderByAlignerNumberAsc(Long treatmentPlanId);

    Optional<AlignerStage> findByTreatmentPlanIdAndAlignerNumber(Long treatmentPlanId, int alignerNumber);

    Optional<AlignerStage> findByTreatmentPlanIdAndIsCurrentAlignerTrue(Long treatmentPlanId);

    @Query(
            "SELECT a FROM AlignerStage a WHERE a.treatmentPlan.id = :planId AND a.alignerNumber >= :fromNumber ORDER BY a.alignerNumber ASC")
    List<AlignerStage> findFromAligner(@Param("planId") Long planId, @Param("fromNumber") int fromNumber);

    @Modifying
    @Query("UPDATE AlignerStage a SET a.isCurrentAligner = false WHERE a.treatmentPlan.id = :planId")
    void clearCurrentAligner(@Param("planId") Long planId);
}
