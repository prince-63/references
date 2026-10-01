package com.dentalstack.patient.feature.reminder.repository;

import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.feature.reminder.entity.ReminderPurpose;
import com.dentalstack.patient.feature.reminder.entity.ReminderStatus;
import feign.Param;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    List<Reminder> findByDateAndPurpose(LocalDate date, ReminderPurpose purpose);

    List<Reminder> findByAddedByUserIdAndAddedForUserIdAndPurposeAndStatus(
            long doctorId, long patientId, ReminderPurpose reminderPurpose, ReminderStatus reminderStatus);

    @Query("SELECT r FROM Reminder r WHERE r.userProfile.id = :profileId "
            + "AND r.date BETWEEN :startDate AND :endDate "
            + "AND r.status IN :statuses")
    List<Reminder> findByDoctorAndDateRangeAndStatuses(
            @Param("profileId") Long profileId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("statuses") List<ReminderStatus> statuses);

    @Query("SELECT COUNT(r) FROM Reminder r WHERE " + "r.userProfile.id = :profileId AND "
            + "r.date = :date AND "
            + "r.status IN :statuses AND "
            + "r.purpose = :purpose")
    Integer countByDoctorAndDateAndStatusesAndPurpose(
            @Param("profileId") Long profileId,
            @Param("date") LocalDate date,
            @Param("statuses") List<ReminderStatus> statuses,
            @Param("purpose") ReminderPurpose purpose);

    @Query("SELECT r FROM Reminder r WHERE r.addedByUserId = :userId " + "AND r.purpose = 'APPOINTMENT' "
            + "AND r.date = :startDate "
            + "AND r.time = :startTime "
            + "AND r.status = :status")
    Optional<Reminder> findAppointmentsByDoctorAndExactDateTimeAndStatus(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("startTime") LocalTime startTime,
            @Param("status") ReminderStatus status);

    @Query(
            """
            SELECT r FROM Reminder r
            WHERE (:doctorId IS NULL OR r.addedByUserId = :doctorId)
            AND (:patientId IS NULL OR r.addedForUserId = :patientId)
            AND r.purpose = :purpose
            AND (:filter = 'ALL' OR (:filter = 'UPCOMING' AND r.date >= :currentDate)
            OR (:filter = 'PAST' AND r.date < :currentDate))
            AND r.status IN :statuses
            ORDER BY
                CASE
                    WHEN :filter = 'PAST' THEN r.date
                    WHEN :filter = 'ALL' THEN r.date
                END DESC,
                CASE
                    WHEN :filter = 'UPCOMING' THEN r.date
                END ASC
            """)
    List<Reminder> findAppointmentReminders(
            @Param("doctorId") Long doctorId,
            @Param("patientId") Long patientId,
            @Param("purpose") ReminderPurpose purpose,
            @Param("filter") String filter,
            @Param("currentDate") LocalDate currentDate,
            @Param("statuses") List<ReminderStatus> statuses);

    @Query(
            """
    SELECT r FROM Reminder r
    WHERE (:doctorId IS NULL OR r.addedByUserId = :doctorId)
    AND (:patientId IS NULL OR r.addedForUserId = :patientId)
    AND r.purpose = :purpose
    AND r.date < :currentDate
    AND r.status IN :statuses
    ORDER BY r.date DESC
    LIMIT 1
    """)
    Reminder findLatestPastAppointmentReminder(
            @Param("doctorId") Long doctorId,
            @Param("patientId") Long patientId,
            @Param("purpose") ReminderPurpose purpose,
            @Param("currentDate") LocalDate currentDate,
            @Param("statuses") List<ReminderStatus> statuses);

    @Query(
            """
    SELECT r FROM Reminder r
    WHERE (:doctorId IS NULL OR r.addedByUserId = :doctorId)
    AND (:patientId IS NULL OR r.addedForUserId = :patientId)
    AND r.purpose = :purpose
    AND r.date >= :currentDate
    AND r.status IN :statuses
    ORDER BY r.date ASC
    LIMIT 1
    """)
    Reminder findNextUpcomingAppointmentReminder(
            @Param("doctorId") Long doctorId,
            @Param("patientId") Long patientId,
            @Param("purpose") ReminderPurpose purpose,
            @Param("currentDate") LocalDate currentDate,
            @Param("statuses") List<ReminderStatus> statuses);

    @Query(
            """
            SELECT r FROM Reminder r
            WHERE r.addedForUserId = :patientId
            AND r.purpose = :purpose
            AND r.date >= :currentDate
            AND r.status IN :statuses
            ORDER BY r.date ASC, r.time ASC
            LIMIT 1
            """)
    Reminder findNextUpcomingAppointment(
            @Param("patientId") Long patientId,
            @Param("purpose") ReminderPurpose purpose,
            @Param("currentDate") LocalDate currentDate,
            @Param("statuses") List<ReminderStatus> statuses);

    @Query(
            """
    SELECT r FROM Reminder r
    WHERE r.userProfile.id = :profileId
    AND r.purpose = :purpose
    AND r.addedForUserId = :addedForUserId
""")
    List<Reminder> findByUserProfileIdAndPurposeAndAddedForUserId(
            @Param("profileId") Long profileId,
            @Param("purpose") ReminderPurpose purpose,
            @Param("addedForUserId") Long addedForUserId);

    @Query(
            value =
                    """
    SELECT r.* FROM reminder r
    WHERE r.purpose = 'APPOINTMENT'
    AND CAST(r.metadata->>'appointmentId' AS bigint) = :appointmentId
    AND r.status = 'ACTIVE'
    """,
            nativeQuery = true)
    Optional<Reminder> findActiveReminderByAppointmentId(@Param("appointmentId") Long appointmentId);

    @Query(
            value =
                    """
    SELECT r.* FROM reminder r
    WHERE r.purpose = 'UNPROCESSED_ALIGNER_REMINDER'
    AND CAST(r.metadata->>'treatmentPlanId' AS bigint) = :treatmentPlanId
    ORDER BY
        r.date DESC NULLS LAST,
        r.time DESC NULLS LAST,
        r.last_triggered_at DESC NULLS LAST
    LIMIT 1
""",
            nativeQuery = true)
    Optional<Reminder> findLatestUnprocessedAlignerReminderByTreatmentPlanId(
            @Param("treatmentPlanId") Long treatmentPlanId);
}
