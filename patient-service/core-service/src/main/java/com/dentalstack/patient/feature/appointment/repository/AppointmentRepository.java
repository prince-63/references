package com.dentalstack.patient.feature.appointment.repository;

import com.dentalstack.patient.feature.appointment.entity.Appointment;
import com.dentalstack.patient.feature.appointment.enums.AppointmentStatus;
import com.dentalstack.patient.feature.appointment.projection.AppointmentCounts;
import com.dentalstack.patient.feature.storage.files.entity.File;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByDoctorId(Long doctorId);

    @Query("SELECT DISTINCT a FROM Appointment a "
            + "LEFT JOIN FETCH a.patient p "
            + "LEFT JOIN FETCH a.files f "
            + "LEFT JOIN FETCH a.bracesJourney bj "
            + "LEFT JOIN FETCH a.reminder r "
            + "LEFT JOIN FETCH a.draftFiles df "
            + "WHERE a.doctorId = :doctorId "
            + "AND (:patientId IS NULL OR a.patient.id = :patientId) "
            + "AND a.status IN :statusList")
    List<Appointment> findByDoctorIdAndPatientIdAndStatusIn(
            @Param("doctorId") Long doctorId,
            @Param("patientId") Long patientId,
            @Param("statusList") List<AppointmentStatus> statusList);

    @Query("SELECT DISTINCT a FROM Appointment a "
            + "LEFT JOIN FETCH a.patient p "
            + "LEFT JOIN FETCH a.files f "
            + "LEFT JOIN FETCH a.bracesJourney bj "
            + "LEFT JOIN FETCH a.reminder r "
            + "LEFT JOIN FETCH a.draftFiles df "
            + "WHERE a.doctorId = :doctorId "
            + "AND a.status IN :statusList")
    List<Appointment> findByDoctorIdAndStatusIn(
            @Param("doctorId") Long doctorId, @Param("statusList") List<AppointmentStatus> statusList);

    @Query("SELECT a FROM Appointment a "
            + "LEFT JOIN FETCH a.patient p "
            + "LEFT JOIN FETCH a.files f "
            + "LEFT JOIN FETCH a.bracesJourney bj "
            + "LEFT JOIN FETCH a.reminder r "
            + "LEFT JOIN FETCH a.draftFiles df "
            + "WHERE a.id = :appointmentId AND a.status IN :statuses")
    Optional<Appointment> findByIdAndStatusIn(
            @Param("appointmentId") Long appointmentId, @Param("statuses") List<AppointmentStatus> statuses);

    @Query(
            value = "SELECT * FROM appointment WHERE CAST(start_date AS DATE) = :date " + "AND status = :status",
            nativeQuery = true)
    List<Appointment> findByStartDateDateAndStatus(@Param("date") LocalDate date, @Param("status") String status);

    @Query("SELECT a FROM Appointment a WHERE :file MEMBER OF a.files")
    List<Appointment> findByFilesContaining(@Param("file") File file);

    @Query(
            nativeQuery = true,
            value = "SELECT "
                    + "   SUM(CASE WHEN CAST(start_date AS DATE) = CURRENT_DATE THEN 1 ELSE 0 END) AS todayAppointments, "
                    + "   SUM(CASE WHEN CAST(start_date AS DATE) = CURRENT_DATE + INTERVAL '1 day' THEN 1 ELSE 0 END) AS tomorrowAppointments, "
                    + "   SUM(CASE WHEN CAST(start_date AS DATE) = CURRENT_DATE + INTERVAL '2 days' THEN 1 ELSE 0 END) AS dayAfterTomorrowAppointments "
                    + "FROM appointment "
                    + "WHERE CAST(start_date AS DATE) BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '2 days' "
                    + "   AND status = :status "
                    + "   AND doctor_id = :doctorId")
    AppointmentCounts getAppointmentCounts(@Param("status") String status, @Param("doctorId") Long doctorId);

    @Query("""
SELECT a
FROM Appointment a
JOIN a.files f
WHERE f.id = :fileId
""")
    List<Appointment> findAppointmentsByFileId(@Param("fileId") Long fileId);

    @Query("SELECT a FROM Appointment a "
            + "LEFT JOIN FETCH a.patient p "
            + "LEFT JOIN FETCH a.files f "
            + "LEFT JOIN FETCH a.bracesJourney bj "
            + "LEFT JOIN FETCH a.reminder r "
            + "LEFT JOIN FETCH a.draftFiles df "
            + "WHERE a.id = :appointmentId")
    Optional<Appointment> findByIdWithEagerLoading(@Param("appointmentId") Long appointmentId);
}
