package com.dentalstack.patient.feature.appointment.service.reminder.impl;

import com.dentalstack.patient.feature.appointment.dto.AddAppointmentReminderRequest;
import com.dentalstack.patient.feature.appointment.dto.AppointmentReminderDetails;
import com.dentalstack.patient.feature.appointment.dto.UpdateAppointmentReminderRequest;
import com.dentalstack.patient.feature.appointment.entity.AppointmentReminder;
import com.dentalstack.patient.feature.appointment.exception.AppointmentReminderAlreadyExistException;
import com.dentalstack.patient.feature.appointment.exception.AppointmentReminderNotFoundException;
import com.dentalstack.patient.feature.appointment.repository.AppointmentReminderRepository;
import com.dentalstack.patient.feature.appointment.service.reminder.AppointmentReminderService;
import com.dentalstack.patient.feature.braces.repository.BracesJourneyRepository;
import com.dentalstack.patient.feature.reminder.entity.ReminderPurpose;
import com.dentalstack.patient.feature.reminder.entity.ReminderStatus;
import com.dentalstack.patient.feature.reminder.repository.ReminderRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentReminderServiceImpl implements AppointmentReminderService {

    private final AppointmentReminderRepository appointmentReminderRepository;
    private final BracesJourneyRepository bracesJourneyRepository;
    private final ReminderRepository reminderRepository;

    @Override
    public void addReminder(AddAppointmentReminderRequest request) {
        appointmentReminderRepository
                .findByDateAndDoctorIdAndBracesJourneyIdAndReminderStatus(
                        request.getLocalDate(),
                        request.getDoctorId(),
                        request.getBracesJourneyId(),
                        ReminderStatus.ACTIVE)
                .ifPresent(appointmentReminder -> {
                    throw new AppointmentReminderAlreadyExistException();
                });
        appointmentReminderRepository.save(AppointmentReminder.from(request));
    }

    @Override
    public void updateReminder(UpdateAppointmentReminderRequest request) {
        var appointmentReminder = appointmentReminderRepository
                .findById(request.getReminderId())
                .orElseThrow(() -> new AppointmentReminderNotFoundException(request.getReminderId()));
        appointmentReminder.setDate(request.getDate());
        appointmentReminderRepository.save(appointmentReminder);
    }

    @Override
    public void deleteReminder(long reminderId) {
        var appointmentReminder = appointmentReminderRepository
                .findById(reminderId)
                .orElseThrow(() -> new AppointmentReminderNotFoundException(reminderId));
        appointmentReminder.setReminderStatus(ReminderStatus.INACTIVE);
        appointmentReminderRepository.save(appointmentReminder);
    }

    public List<AppointmentReminderDetails> getReminders(Long patientId, Long doctorId) {
        var reminders = reminderRepository.findByAddedByUserIdAndAddedForUserIdAndPurposeAndStatus(
                doctorId, patientId, ReminderPurpose.APPOINTMENT_REMINDER, ReminderStatus.ACTIVE);

        LocalDateTime now = LocalDateTime.now();

        return reminders.stream()
                .map(reminder -> {
                    assert reminder.getDate() != null;
                    assert reminder.getTime() != null;
                    return AppointmentReminderDetails.builder()
                            .date(reminder.getDate())
                            .time(reminder.getTime())
                            .reminderId(reminder.getId())
                            .status(calculateReminderStatus(reminder.getDate(), reminder.getTime(), now))
                            .build();
                })
                .sorted(Comparator.comparing(reminder -> LocalDateTime.of(reminder.getDate(), reminder.getTime())))
                .collect(Collectors.toList());
    }

    private AppointmentReminderDetails.Status calculateReminderStatus(
            LocalDate reminderDate, LocalTime reminderTime, LocalDateTime now) {
        LocalDateTime reminderDateTime = LocalDateTime.of(reminderDate, reminderTime);

        if (reminderDateTime.isBefore(now)) {
            return AppointmentReminderDetails.Status.OVERDUE;
        } else {
            return AppointmentReminderDetails.Status.UPCOMING;
        }
    }
}
