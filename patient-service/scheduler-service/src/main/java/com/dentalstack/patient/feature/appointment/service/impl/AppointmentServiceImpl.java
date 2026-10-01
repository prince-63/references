package com.dentalstack.patient.feature.appointment.service.impl;

import com.dentalstack.patient.feature.appointment.entity.Appointment;
import com.dentalstack.patient.feature.appointment.enums.AppointmentStatus;
import com.dentalstack.patient.feature.appointment.repository.AppointmentRepository;
import com.dentalstack.patient.feature.appointment.service.AppointmentService;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.events.enums.EventType;
import com.dentalstack.patient.feature.events.metadata.event.AppointmentReminderEventMetadata;
import com.dentalstack.patient.feature.events.service.TimelineService;
import com.dentalstack.patient.feature.notification.dto.SendNotificationRequest;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.global.enums.UserType;
import java.time.ZonedDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final TimelineService timelineService;
    private final DoctorService doctorService;
    private final ChatService chatService;

    @Override
    public void todayAppointmentReminder() {

        ZonedDateTime currentDateTime = ZonedDateTime.now();
        String appointmentStatus = String.valueOf(AppointmentStatus.ACTIVE);
        appointmentRepository
                .findByStartDateDateAndStatus(currentDateTime.toLocalDate(), appointmentStatus)
                .forEach(this::todayAppointmentReminder);
    }

    public void todayAppointmentReminder(Appointment appointment) {
        ZonedDateTime currentDateTime = ZonedDateTime.now();

        ZonedDateTime currentAppointmentDate = appointment.getStartDate();
        if (currentAppointmentDate != null
                && currentAppointmentDate.toLocalDate().isEqual(currentDateTime.toLocalDate())) {

            var doctorDetails = doctorService.getDoctor(appointment.getDoctorId());

            chatService.sendNotification(SendNotificationRequest.builder()
                    .title("Review Tomorrow's appointments")
                    .message("Tap to view the list of appointments scheduled for tomorrow")
                    .notificationIndex(60)
                    .mobile(doctorDetails.getMobile())
                    .isDoctorApp(true)
                    .email(doctorDetails.getEmail())
                    .build());

            timelineService.addEvent(
                    appointment.getPatient().getId(),
                    UserType.PATIENT,
                    appointment.getDoctorId(),
                    UserType.DOCTOR,
                    EventType.APPOINTMENT_REMINDER,
                    new AppointmentReminderEventMetadata(
                            appointment.getPatient().getId()));

            log.info("Sent today's appointment reminders: {}", appointment.getId());
        }
    }
}
