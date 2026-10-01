package com.dentalstack.patient.feature.braces.repository;

import com.dentalstack.patient.feature.aligner.projection.BracesJourneySummary;
import com.dentalstack.patient.feature.braces.entity.BracesJourney;
import com.dentalstack.patient.feature.braces.enums.BracesTreatmentStage;
import feign.Param;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface BracesJourneyRepository extends JpaRepository<BracesJourney, Long> {

    List<BracesJourney> findByPatientId(Long id);

    Optional<BracesJourney> findByPatientIdAndBracesTreatmentStage(Long id, BracesTreatmentStage bracesTreatmentStage);

    Optional<BracesJourney> findByPatientIdAndBracesTreatmentStageIn(
            Long patient_id, Collection<BracesTreatmentStage> bracesTreatmentStage);

    List<BracesJourney> findByBracesTreatmentStageInAndPatientId(
            Collection<BracesTreatmentStage> bracesTreatmentStage, Long patient_id);

    List<BracesJourney> findByBracesTreatmentStageInAndPatientIdIn(
            Collection<BracesTreatmentStage> bracesTreatmentStage, Collection<Long> patientIds);

    List<BracesJourney> findByDoctorIdAndBracesTreatmentStage(Long doctorId, BracesTreatmentStage bracesTreatmentStage);

    List<BracesJourney> findByDoctorIdAndBracesTreatmentStageIn(Long doctorId, List<BracesTreatmentStage> statusList);

    @Query(
            "SELECT bj FROM BracesJourney bj JOIN FETCH bj.patient WHERE bj.doctorId = :doctorId AND bj.patient.id = :patientId")
    List<BracesJourney> findByDoctorIdAndPatientId(
            @Param("doctorId") Long doctorId, @Param("patientId") Long patientId);

    @Query(
            value = "SELECT * FROM braces_journey b WHERE b.patient_id = :patientId ORDER BY b.created_at DESC LIMIT 1",
            nativeQuery = true)
    Optional<BracesJourney> findLatestByPatientId(Long patientId);

    @Query(
            "SELECT DISTINCT bj.patient.id FROM BracesJourney bj JOIN bj.appointments a WHERE bj.patient.id IN :patientIds AND bj.bracesTreatmentStage IN :stages AND SIZE(bj.appointments) > 0")
    Set<Long> findPatientIdsWithAppointmentsByPatientIdInAndBracesTreatmentStageIn(
            Collection<Long> patientIds, Collection<BracesTreatmentStage> stages);

    @Query("SELECT bj.patient.id AS patientId, bj.bracesTreatmentStage AS bracesTreatmentStage, "
            + "COUNT(a.id) AS appointmentCount "
            + "FROM BracesJourney bj "
            + "LEFT JOIN bj.appointments a "
            + "WHERE bj.patient.id IN :patientIds AND bj.bracesTreatmentStage IN :stages "
            + "GROUP BY bj.patient.id, bj.bracesTreatmentStage")
    List<BracesJourneySummary> findBracesJourneySummariesByCriteria(
            @Param("patientIds") Set<Long> patientIds, @Param("stages") Collection<BracesTreatmentStage> stages);

    @Query(
            """
            SELECT
                bj.patient.id as patientId,
                bj.doctorId as doctorId,
                bj.bracesTreatmentStage as bracesTreatmentStage,
                bj.createdAt as createdAt,
                CASE WHEN COUNT(a.id) > 0 THEN true ELSE false END as hasAppointments
            FROM BracesJourney bj
            LEFT JOIN bj.appointments a
            WHERE bj.patient.id = :patientId
                AND bj.doctorId = :doctorId
            GROUP BY
                bj.patient.id,
                bj.doctorId,
                bj.bracesTreatmentStage,
                bj.createdAt
            ORDER BY bj.createdAt DESC
            LIMIT 1
        """)
    Optional<BracesJourneySummary> findLatestBracesJourneySummaryByPatientAndDoctor(
            @Param("patientId") Long patientId, @Param("doctorId") Long doctorId);

    @Query("SELECT bj FROM BracesJourney bj WHERE bj.patient.id IN :patientIds AND bj.bracesTreatmentStage = :status")
    List<BracesJourney> findByPatientIdsAndBracesTreatmentStage(
            @Param("patientIds") List<Long> patientIds, @Param("status") BracesTreatmentStage status);

    @Query(
            """
        SELECT COUNT(j)
        FROM BracesJourney bj
        JOIN bj.appointments a
        JOIN a.jaws j
        WHERE bj.patient.id IN :patientIds
          AND j.note IS NOT NULL
          AND TRIM(j.note) <> ''
    """)
    Long countNotesForPatientIds(@Param("patientIds") List<Long> patientIds);
}
