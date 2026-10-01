package com.dentalstack.patient.feature.treatment.repository;

import com.dentalstack.patient.feature.treatment.entity.action.AlignerAction;
import com.dentalstack.patient.feature.treatment.projections.AlignerActionCounts;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AlignerActionRepository extends JpaRepository<AlignerAction, Long> {

    @Query(
            nativeQuery = true,
            value =
                    """
    SELECT
        COUNT(DISTINCT CASE
            WHEN aa.type = 'ALIGNER_CHANGE' AND aa.validated = false
            AND aa.is_active = :isActive
            THEN CONCAT(p.id, '-', aa.type)
        END) AS alignerChangesCompleted,

        COUNT(DISTINCT CASE
            WHEN aa.type = 'CHECK_IN' AND aa.validated = false
            AND aa.is_active = :isActive
            THEN CONCAT(p.id, '-', aa.type)
        END) AS alignerCheckInMade,

        COUNT(DISTINCT CASE
            WHEN aa.type = 'ISSUE_REPORT' AND aa.validated = false
            AND aa.is_active = :isActive
            THEN CONCAT(p.id, '-', aa.type)
        END) AS reportedIssues

    FROM aligner_journey aj
    JOIN tracking t ON t.aligner_journey_id = aj.id
    JOIN patient p ON p.id = aj.patient_id
    LEFT JOIN aligner a ON a.aligner_journey_id = aj.id
    LEFT JOIN aligner_action aa ON aa.aligner_id = a.id
    WHERE aj.doctor_id = :doctorId
        AND aj.progress_status = 'IN_PROGRESS'
        AND t.tracking_type = 1
        AND (aa.type IS NULL OR aa.type NOT IN ('FORCE_ALIGNER_CHANGE', 'MOVE_TO_PREVIOUS_ALIGNER'))
""")
    AlignerActionCounts getAlignerActionCounts(@Param("doctorId") Long doctorId, @Param("isActive") Boolean isActive);
}
