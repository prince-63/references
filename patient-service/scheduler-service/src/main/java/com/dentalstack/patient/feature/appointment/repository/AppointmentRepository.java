package com.dentalstack.patient.feature.appointment.repository;

import com.dentalstack.patient.feature.appointment.entity.Appointment;
import com.dentalstack.patient.feature.appointment.projection.AppointmentCounts;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    @Query(
            value = "SELECT * FROM appointment WHERE CAST(start_date AS DATE) = :date " + "AND status = :status",
            nativeQuery = true)
    List<Appointment> findByStartDateDateAndStatus(@Param("date") LocalDate date, @Param("status") String status);

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
}
