package com.dentalstack.patient.feature.tracking.repository;

import com.dentalstack.patient.feature.tracking.entity.Tracking;
import com.dentalstack.patient.feature.tracking.enums.Status;
import com.dentalstack.patient.feature.tracking.enums.TrackingType;
import com.dentalstack.patient.feature.tracking.projection.TrackingSummary;
import feign.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface TrackingRepository extends JpaRepository<Tracking, Long> {

    List<Tracking> findByStatusAndTrackingTypeAndAskPatientToFillAndAlignerJourneyIsNotNull(
            Status status, TrackingType trackingType, boolean askForPatient);

    List<Tracking> findByPatientIdAndStatus(Long id, Status status);

    List<Tracking> findByPatientIdAndStatusIn(Long id, List<Status> statuses);

    List<Tracking> findByPatientId(Long id);

    Optional<Tracking> findByAlignerJourneyId(int alignerJourneyId);

    Optional<Tracking> findByTreatmentPlanId(Long id);

    Optional<Tracking> findFirstByStatusAndPatientIdOrderByCreatedAtDesc(Status status, Long patientId);

    @Query(
            "SELECT t FROM Tracking t WHERE t.status = :status AND t.askPatientToFill = true AND t.patientId IN :patientIds ORDER BY t.createdAt DESC")
    List<Tracking> findAllDraftTrackingWithAskPatientToFill(
            @Param("status") Status status, @Param("patientIds") List<Long> patientIds);

    @Query("SELECT DISTINCT t.patientId FROM Tracking t " + "WHERE t.status IN :statuses "
            + "AND t.patientId IN :patientIds "
            + "AND t.createdAt = (SELECT MAX(t2.createdAt) FROM Tracking t2 WHERE t2.patientId = t.patientId)")
    List<Long> findPatientIdsWithActiveTrackingByStatuses(
            @Param("statuses") List<Status> statuses, @Param("patientIds") List<Long> patientIds);

    @Query("SELECT DISTINCT t.patientId FROM Tracking t " + "WHERE t.trackingType = :trackingType "
            + "AND t.patientId IN :patientIds "
            + "AND t.createdAt = (SELECT MAX(t2.createdAt) FROM Tracking t2 WHERE t2.patientId = t.patientId)")
    List<Long> findPatientIdsWithTrackingType(
            @Param("trackingType") TrackingType trackingType, @Param("patientIds") List<Long> patientIds);

    void deleteAllByPatientId(Long patientId);

    @Query("SELECT COUNT(DISTINCT t.patientId) FROM Tracking t WHERE t.patientId IN :patientIds")
    long countByPatientIdIn(@Param("patientIds") List<Long> patientIds);

    @Query(
            "SELECT COUNT(DISTINCT t.patientId) FROM Tracking t WHERE t.patientId IN :patientIds AND t.status IN ('ACTIVE', 'PAUSED', 'COMPLETE', 'DEACTIVATED')")
    long countActivePatientsByPatientIdIn(@Param("patientIds") List<Long> patientIds);

    @Query("SELECT t FROM Tracking t WHERE t.status = 'PAUSED'")
    List<Tracking> findAllPausedTreatments();

    @Query("SELECT t FROM Tracking t WHERE t.status = 'ACTIVE'")
    List<Tracking> findAllActiveTreatments();

    @Query(
            """
    SELECT t.reasonForPausing AS reasonForPausing,
           t.pauseDate AS pauseDate,
           t.patientId AS patientId,
           aj.doctorId AS doctorId,
           aj.id AS alignerJourneyId,
           t.status AS status,
           t.resumeDate AS resumeDate
    FROM Tracking t
    JOIN t.alignerJourney aj
    WHERE t.status = 'PAUSED'
    AND t.resumeDate BETWEEN :startDate AND :endDate
    AND t.patientId IN :patientIds
""")
    List<TrackingSummary> findTrackingDetailsForCalendarByPatients(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("patientIds") List<Long> patientIds);

    @Query(
            value =
                    """
   SELECT
               t.patient_id as patientId,
               t.tracking_type as trackingType,
               t.ask_patient_to_fill as askPatientToFill,
               t.patient_data_fill_status as patientDataFillStatus,
               t.aligner_journey_id as alignerJourneyId,
               t.send_to_patient as sendToPatient,
               t.status as status
           FROM tracking t
           INNER JOIN treatment_plan tp ON t.treatment_plan_id = tp.id
           WHERE t.patient_id = :patientId
           ORDER BY t.created_at DESC
           LIMIT 1
""",
            nativeQuery = true)
    Optional<TrackingSummary> findLatestTrackingStatusNative(@Param("patientId") Long patientId);
}
