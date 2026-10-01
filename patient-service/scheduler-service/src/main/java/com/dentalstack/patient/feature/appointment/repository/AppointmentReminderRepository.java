package com.dentalstack.patient.feature.appointment.repository;

import com.dentalstack.patient.feature.appointment.entity.AppointmentReminder;
import com.dentalstack.patient.feature.reminder.entity.ReminderStatus;
import feign.Param;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AppointmentReminderRepository extends JpaRepository<AppointmentReminder, Long> {
    @Query("SELECT ar FROM AppointmentReminder ar WHERE ar.date = :date AND ar.reminderStatus = :status")
    List<AppointmentReminder> findByDateAndStatus(
            @Param("date") LocalDate date, @Param("status") ReminderStatus status);
}
