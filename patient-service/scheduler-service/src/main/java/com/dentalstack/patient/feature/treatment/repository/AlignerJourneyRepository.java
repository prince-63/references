package com.dentalstack.patient.feature.treatment.repository;

import com.dentalstack.patient.feature.tracking.enums.Status;
import com.dentalstack.patient.feature.tracking.enums.TrackingType;
import com.dentalstack.patient.feature.treatment.entity.AlignerJourney;
import com.dentalstack.patient.feature.treatment.enums.CreationStatus;
import com.dentalstack.patient.feature.treatment.enums.ProgressStatus;
import com.dentalstack.patient.feature.treatment.projections.AlignerJourneyCounts;
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

    List<AlignerJourney> findByPatientIdAndProgressStatusIn(long patientId, List<ProgressStatus> progressStatus);

    List<AlignerJourney> findByPatientIdAndCreationStatus(long patientId, CreationStatus creationStatus);

    List<AlignerJourney> findByPatientIdAndCreationStatusInAndProgressStatusIn(
            long patientId, List<CreationStatus> creationStatuses, List<ProgressStatus> progressStatuses);

    @Query("SELECT DISTINCT aj.patient.id FROM AlignerJourney aj WHERE aj.patient.id IN :patientIds")
    Set<Long> findPatientIdsWithAlignerJourneys(@Param("patientIds") Set<Long> patientIds);

    List<AlignerJourney> findByCreationStatusAndProgressStatus(
            CreationStatus creationStatus, ProgressStatus progressStatus);

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

    List<AlignerJourney> findByDoctorTreatmentStartDateAndCreationStatus(
            LocalDate doctorTreatmentStartDate, CreationStatus creationStatus);

    @Query("SELECT aj FROM AlignerJourney aj " + "JOIN aj.tracking t "
            + "WHERE t.trackingType = :trackingType "
            + "AND t.status = :status")
    List<AlignerJourney> findAlignerJourneysWithTrackingTypeAndStatus(
            @Param("trackingType") TrackingType trackingType, @Param("status") Status status);

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
}
