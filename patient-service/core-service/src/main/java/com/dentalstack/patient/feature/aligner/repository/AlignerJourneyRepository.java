package com.dentalstack.patient.feature.aligner.repository;

import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.enums.TrackingType;
import com.dentalstack.patient.feature.aligner.enums.aligner.CreationStatus;
import com.dentalstack.patient.feature.aligner.enums.aligner.ProgressStatus;
import com.dentalstack.patient.feature.aligner.projection.*;
import com.dentalstack.patient.feature.notification.dto.AlignerJourneyCounts;
import com.dentalstack.patient.feature.tracking.enums.Status;
import feign.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AlignerJourneyRepository extends JpaRepository<AlignerJourney, Long> {

    @Query("SELECT aj FROM AlignerJourney aj LEFT JOIN FETCH aj.patient WHERE aj.id = :id")
    Optional<AlignerJourney> findByIdWithPatient(@Param("id") Long id);

    List<AlignerJourney> findByPatientIdAndProgressStatus(long patientId, ProgressStatus progressStatus);

    List<AlignerJourney> findByPatientIdAndProgressStatusIn(long patientId, List<ProgressStatus> progressStatus);

    List<AlignerJourney> findByDoctorIdAndProgressStatus(Long doctorId, ProgressStatus progressStatus);

    List<AlignerJourney> findByDoctorIdAndProgressStatusAndPatientIdIn(
            Long doctorId, ProgressStatus progressStatus, List<Long> patientIds);

    List<AlignerJourney> findByPatientIdInAndProgressStatusIn(
            List<Long> patientIds, List<ProgressStatus> progressStatuses);

    List<AlignerJourney> findByPatientIdInAndProgressStatus(List<Long> patientIds, ProgressStatus progressStatuses);

    List<AlignerJourney> findByDoctorId(Long doctorId);

    List<AlignerJourney> findByPatientIdAndCreationStatus(long patientId, CreationStatus creationStatus);

    List<AlignerJourney> findByPatientIdAndCreationStatusInAndProgressStatusIn(
            long patientId, List<CreationStatus> creationStatuses, List<ProgressStatus> progressStatuses);

    List<AlignerJourney> findByPatientIdIn(List<Long> patientIds);

    @Query("SELECT aj FROM AlignerJourney aj WHERE aj.patient.id IN :patientIds")
    List<AlignerJourney> findByPatientIds(@Param("patientIds") Set<Long> patientIds);

    @Query("SELECT DISTINCT aj.patient.id FROM AlignerJourney aj WHERE aj.patient.id IN :patientIds")
    Set<Long> findPatientIdsWithAlignerJourneys(@Param("patientIds") Set<Long> patientIds);

    List<AlignerJourney> findByCreationStatusAndProgressStatus(
            CreationStatus creationStatus, ProgressStatus progressStatus);

    List<AlignerJourney> findByPatientId(Long id);

    @Query(
            """
    SELECT aj FROM AlignerJourney aj
    LEFT JOIN FETCH aj.aligners
    WHERE aj.patient.id = :patientId
      AND aj.progressStatus = 'IN_PROGRESS'
    """)
    List<AlignerJourney> findInProgressAlignerJourney(@Param("patientId") Long patientId);

    @Query("SELECT aj FROM AlignerJourney aj " + "JOIN aj.tracking t "
            + "WHERE t.trackingType = :trackingType "
            + "AND t.status = :status")
    List<AlignerJourney> findAlignerJourneysWithTrackingTypeAndStatus(
            @Param("trackingType") TrackingType trackingType, @Param("status") Status status);

    @Query(
            nativeQuery = true,
            value =
                    """
            SELECT
                SUM(CASE
                    WHEN a.end_date + INTERVAL '1 day' < CURRENT_DATE
                    AND a.sr_no < (
                        SELECT COUNT(*) FROM aligner WHERE aligner_journey_id = aj.id -- Calculate total aligners
                    )
                    AND NOT EXISTS (
                        SELECT 1
                        FROM aligner next_a
                        WHERE next_a.aligner_journey_id = aj.id
                        AND next_a.sr_no = a.sr_no + 1
                    )
                    THEN 1
                    ELSE 0
                END) AS missedAlignerChanges,
                SUM(CASE WHEN aj.doctor_treatment_start_date = CURRENT_DATE THEN 1 ELSE 0 END) AS treatmentStartingToday,
                SUM(CASE WHEN aj.doctor_treatment_start_date = CURRENT_DATE + INTERVAL '1 day' THEN 1 ELSE 0 END) AS treatmentStartingTomorrow
            FROM aligner_journey aj
            LEFT JOIN aligner a ON aj.id = a.aligner_journey_id
            AND a.sr_no = aj.current_aligner_no  -- Join based on the current aligner number
            WHERE aj.creation_status = 'DONE'
            AND (aj.progress_status = 'IN_PROGRESS' OR aj.progress_status = 'NOT_STARTED')
            AND aj.doctor_id = :doctorId
        """)
    AlignerJourneyCounts getAlignerJourneyCounts(@Param("doctorId") Long doctorId);

    @Query("SELECT aj.id FROM AlignerJourney aj " + "WHERE aj.patient.id = :patientId "
            + "AND aj.progressStatus IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETE') "
            + "ORDER BY aj.createdAt DESC "
            + "LIMIT 1")
    Optional<Long> findLatestAlignerJourneyIdByPatientId(@Param("patientId") Long patientId);

    @Query("SELECT aj FROM AlignerJourney aj " + "WHERE aj.patient.id = :patientId "
            + "AND aj.progressStatus IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETE','DEACTIVATED') "
            + "ORDER BY aj.createdAt DESC")
    List<AlignerJourney> findAlignerJourneysByPatientIdOrderedByCreatedAtDesc(@Param("patientId") Long patientId);

    default Optional<AlignerJourney> findLatestAlignerJourneyByPatientId(Long patientId) {
        List<AlignerJourney> journeys = findAlignerJourneysByPatientIdOrderedByCreatedAtDesc(patientId);
        return journeys.isEmpty() ? Optional.empty() : Optional.of(journeys.get(0));
    }

    default List<AlignerJourney> findAllAlignerJourneyByPatientId(Long patientId) {
        return findAlignerJourneysByPatientIdOrderedByCreatedAtDesc(patientId);
    }

    @Query(
            """
    SELECT
        aj.id AS alignerJourneyId,
        aj.patient.id AS patientId,
        aj.doctorTreatmentStartDate AS doctorTreatmentStartDate,
        aj.tracking.treatmentPlan.status AS trackingStatus
    FROM AlignerJourney aj
    WHERE aj.patient.id IN :patientIds
        AND aj.creationStatus = 'DONE'
        AND (aj.progressStatus = 'IN_PROGRESS'
            OR aj.progressStatus = 'NOT_STARTED'
            OR aj.progressStatus = 'DEACTIVATED')
        AND aj.id = (
            SELECT MAX(aj2.id)
            FROM AlignerJourney aj2
            WHERE aj2.patient.id = aj.patient.id
                AND aj2.creationStatus = 'DONE'
                AND (aj2.progressStatus = 'IN_PROGRESS'
                    OR aj2.progressStatus = 'NOT_STARTED'
                    OR aj2.progressStatus = 'DEACTIVATED')
        )
    ORDER BY aj.id DESC
""")
    List<AlignerJourneySummary> findAlignerJourneySummariesByPatientIds(@Param("patientIds") Set<Long> patientIds);

    @Query(
            """
    SELECT a.endDate
    FROM AlignerJourney aj
    JOIN aj.aligners a
    WHERE aj.patient.id = :patientId
    AND aj.creationStatus = 'DONE'
    AND a.srNo = :srNo
    AND aj.id = (
        SELECT MAX(aj2.id)
        FROM AlignerJourney aj2
        WHERE aj2.patient.id = :patientId
        AND aj2.creationStatus = 'DONE'
        AND (aj2.progressStatus = 'IN_PROGRESS'
            OR aj2.progressStatus = 'NOT_STARTED'
            OR aj2.progressStatus = 'COMPLETE')
    )
""")
    Optional<LocalDate> findAlignerEndDateByPatientIdAndSrNo(
            @Param("patientId") Long patientId, @Param("srNo") int srNo);

    @Query(
            """
    SELECT aj.currentAlignerNo
    FROM AlignerJourney aj
    WHERE aj.patient.id = :patientId
    AND aj.creationStatus = 'DONE'
    AND aj.id = (
        SELECT MAX(aj2.id)
        FROM AlignerJourney aj2
        WHERE aj2.patient.id = :patientId
        AND aj2.creationStatus = 'DONE'
        AND (aj2.progressStatus = 'IN_PROGRESS'
            OR aj2.progressStatus = 'NOT_STARTED'
            OR aj2.progressStatus = 'COMPLETE')
    )
""")
    Optional<Integer> getCurrentAlignerNo(@Param("patientId") Long patientId);

    @Query(
            """
    SELECT
        aj.id AS alignerJourneyId,
        aj.patient.id AS patientId,
        aj.doctorTreatmentStartDate AS doctorTreatmentStartDate,
        aj.tracking.treatmentPlan.status AS trackingStatus,
        (SELECT COUNT(DISTINCT tp.patient.id)
         FROM TreatmentPlan tp
         WHERE tp.patient.id IN :patientIds
         AND tp.status = 'DEACTIVATED'
         AND NOT EXISTS (
             SELECT 1
             FROM TreatmentPlan tp2
             WHERE tp2.patient.id = tp.patient.id
             AND tp2.status = 'ACTIVE'
         )
         AND tp.id = (
             SELECT MAX(tp3.id)
             FROM TreatmentPlan tp3
             WHERE tp3.patient.id = tp.patient.id
         )
        ) AS refinementCount
    FROM AlignerJourney aj
    WHERE aj.patient.id IN :patientIds
        AND aj.creationStatus = 'DONE'
        AND (aj.progressStatus = 'IN_PROGRESS'
            OR aj.progressStatus = 'NOT_STARTED'
            OR aj.progressStatus = 'DEACTIVATED')
        AND aj.id = (
            SELECT MAX(aj2.id)
            FROM AlignerJourney aj2
            WHERE aj2.patient.id = aj.patient.id
                AND aj2.creationStatus = 'DONE'
                AND (aj2.progressStatus = 'IN_PROGRESS'
                    OR aj2.progressStatus = 'NOT_STARTED'
                    OR aj2.progressStatus = 'DEACTIVATED')
        )
    ORDER BY aj.id DESC
""")
    List<AlignerJourneySummary> findAlignerJourneySummariesWithRefinementCount(
            @Param("patientIds") Set<Long> patientIds);

    @Query(
            """
        SELECT DISTINCT tp.patient.id
        FROM TreatmentPlan tp
        WHERE tp.patient.id IN :patientIds
        AND tp.status = 'DEACTIVATED'
        AND tp.id = (
            SELECT MAX(tp2.id)
            FROM TreatmentPlan tp2
            WHERE tp2.patient.id = tp.patient.id
        )
        AND NOT EXISTS (
            SELECT 1 FROM TreatmentPlan active
            WHERE active.patient.id = tp.patient.id
            AND active.status = 'ACTIVE'
        )
    """)
    Set<Long> findPatientsWithDeactivatedPlans(@Param("patientIds") Set<Long> patientIds);

    @Query("SELECT a FROM AlignerJourney aj " + "JOIN aj.aligners a "
            + "WHERE aj.patient.id = :patientId "
            + "AND aj.progressStatus IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETE') "
            + "AND a.srNo = aj.currentAlignerNo "
            + "ORDER BY aj.createdAt DESC "
            + "LIMIT 1")
    Optional<Aligner> findCurrentAlignerByLatestJourney(@Param("patientId") Long patientId);
}
