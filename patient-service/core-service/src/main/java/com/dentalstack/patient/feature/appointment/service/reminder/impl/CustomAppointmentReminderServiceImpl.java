package com.dentalstack.patient.feature.appointment.service.reminder.impl;

import com.dentalstack.patient.feature.appointment.dto.reminder.*;
import com.dentalstack.patient.feature.appointment.enums.AppointmentReminderFilter;
import com.dentalstack.patient.feature.appointment.exception.AppointmentReminderAlreadyExistException;
import com.dentalstack.patient.feature.appointment.repository.AppointmentRepository;
import com.dentalstack.patient.feature.appointment.service.reminder.CustomAppointmentReminderService;
import com.dentalstack.patient.feature.braces.enums.BracesTreatmentStage;
import com.dentalstack.patient.feature.braces.repository.BracesJourneyRepository;
import com.dentalstack.patient.feature.doctor.entity.PracticeLocation;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.doctor.exception.PracticeLocationNotFoundException;
import com.dentalstack.patient.feature.doctor.repository.PracticeLocationRepository;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.notification.service.NotificationService;
import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.payment.enums.Status;
import com.dentalstack.patient.feature.reminder.entity.CustomAppointmentReminderMetadata;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.feature.reminder.entity.ReminderPurpose;
import com.dentalstack.patient.feature.reminder.entity.ReminderStatus;
import com.dentalstack.patient.feature.reminder.enums.Frequency;
import com.dentalstack.patient.feature.reminder.exception.ReminderAlreadyTriggeredException;
import com.dentalstack.patient.feature.reminder.exception.ReminderNotFoundException;
import com.dentalstack.patient.feature.reminder.repository.ReminderRepository;
import com.dentalstack.patient.feature.reminder.service.SchedulingService;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.CustomAppointmentReminderAddedEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.CustomAppointmentReminderDeletedEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.CustomAppointmentReminderUpdatedEventMetadata;
import com.dentalstack.patient.feature.timeline.service.TimelineService;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.config.TimezoneConfig;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.exception.BadRequestException;
import com.dentalstack.patient.global.exception.BusinessException;
import java.text.MessageFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomAppointmentReminderServiceImpl implements CustomAppointmentReminderService {

    private final SchedulingService schedulingService;
    private final DoctorService doctorService;
    private final TimelineService timelineService;
    private final NotificationService notificationService;

    private final ReminderRepository reminderRepository;
    private final PatientRepository patientRepository;
    private final PracticeLocationRepository practiceLocationRepository;

    private final BracesJourneyRepository bracesJourneyRepository;
    private final UserProfileRepository userProfileRepository;
    private final AppointmentRepository appointmentRepository;

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public CustomAppointmentReminderDetails setReminder(SetAppointmentReminderRequest request) {
        var patientId = request.getPatientId();
        var doctorId = request.getDoctorId();
        var doctor = doctorService.getDoctor(doctorId);
        var patient = patientRepository
                .findByIdWithDoctorProfileDetails(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        PracticeLocation practiceLocation = null;
        String practiceLocationName = null;
        String practiceLocationAddress = null;
        if (request.getPracticeLocationId() != null) {
            practiceLocation = practiceLocationRepository
                    .findById(request.getPracticeLocationId())
                    .orElseThrow(() -> new PracticeLocationNotFoundException(request.getPracticeLocationId()));
            practiceLocationName = practiceLocation.getPracticeLocationName();
            practiceLocationAddress = practiceLocation.getAddress();
        }
        var startDate = request.getStartDate().toLocalDate();
        var startTime = request.getStartDate().toLocalTime();

        var bracesJourney =
                bracesJourneyRepository.findByPatientIdAndBracesTreatmentStage(patientId, BracesTreatmentStage.ACTIVE);
        Long bracesJourneyId = null;
        if (bracesJourney.isPresent()) {
            bracesJourneyId = bracesJourney.get().getId();
        }
        var patientSummary = patientRepository.findPatientSummariesByPatientId(patientId, Status.ACTIVE);

        var title = "Appointment reminder for " + patient.getFirstName();
        var message = "Your appointment is scheduled. Tap to view details and create appointment.";

        UserProfile userProfile = null;
        if (request.getProfileId() != null) {
            userProfile = userProfileRepository
                    .findById(request.getProfileId())
                    .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));
        }
        var reminder = Reminder.customAppointmentReminder(
                request,
                doctor.getMobile(),
                message,
                title,
                patientId,
                doctor.getEmail(),
                PatientDetails.from(patient),
                practiceLocation,
                userProfile);
        reminder = reminderRepository.save(reminder);

        timelineService.addEvent(
                doctorId,
                UserType.DOCTOR,
                patientId,
                UserType.PATIENT,
                EventType.PATIENT_APPOINTMENT_REMINDER_ADDED,
                new CustomAppointmentReminderAddedEventMetadata(
                        PatientDetails.from(patient),
                        reminder.getId(),
                        request.getStartDate(),
                        request.getEndDate(),
                        request.getAmount(),
                        practiceLocationName,
                        practiceLocationAddress));
        Map<String, Object> params = new HashMap<>();
        params.put("startDate", startDate);
        params.put("startTime", startTime.format(DateTimeFormatter.ofPattern("hh:mm a")));

        sendLocalizedAppointmentNotification(
                patient,
                "CREATED",
                params,
                reminder.getId(),
                startDate,
                startTime.format(DateTimeFormatter.ofPattern("hh:mm a")));

        log.info("Added a appointment reminder for patient {}", request.getPatientId());
        return CustomAppointmentReminderDetails.from(
                reminder, bracesJourneyId, patientSummary, false, practiceLocationName, practiceLocationAddress);
    }

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public void deleteReminder(DeleteAppointmentReminderRequest request) {

        var reminderId = request.getReminderId();
        var reminder =
                reminderRepository.findById(reminderId).orElseThrow(() -> new ReminderNotFoundException(reminderId));
        reminder.setStatus(ReminderStatus.INACTIVE);
        reminderRepository.save(reminder);

        CustomAppointmentReminderMetadata metadata = (CustomAppointmentReminderMetadata) reminder.getMetadata();

        Long appointmentId = metadata.getAppointmentId();
        if (appointmentId != null) {
            appointmentRepository.deleteById(appointmentId);
        }

        SetAppointmentReminderRequest reminderRequest = new SetAppointmentReminderRequest();
        reminderRequest.setStartDate(metadata.getStartDate());
        reminderRequest.setEndDate(metadata.getEndDate());
        reminderRequest.setAmount(metadata.getAmount());
        var patientId = reminder.getAddedForUserId();
        if (reminder.getAddedForUserId() == 0) {
            patientId = null;
        }
        timelineService.addEvent(
                reminder.getAddedByUserId(),
                UserType.DOCTOR,
                patientId,
                UserType.PATIENT,
                EventType.PATIENT_APPOINTMENT_REMINDER_DELETED,
                new CustomAppointmentReminderDeletedEventMetadata(
                        metadata.getPatientDetails(),
                        reminder.getId(),
                        reminderRequest.getStartDate(),
                        reminderRequest.getEndDate(),
                        reminderRequest.getAmount(),
                        metadata.getPracticeLocationName(),
                        metadata.getPracticeLocationAddress()));

        var patientDetails = ((CustomAppointmentReminderMetadata) reminder.getMetadata()).getPatientDetails();

        var patient = patientRepository
                .findById(patientDetails.getId())
                .orElseThrow(() -> new PatientNotFoundException(patientDetails.getId()));
        Map<String, Object> params = new HashMap<>();
        params.put("startDate", metadata.getStartDate().toLocalDate());
        params.put("startTime", metadata.getStartDate().toLocalTime().format(DateTimeFormatter.ofPattern("hh:mm a")));

        sendLocalizedAppointmentNotification(
                patient,
                "CANCELLED",
                params,
                reminder.getId(),
                metadata.getStartDate().toLocalDate(),
                metadata.getStartDate().toLocalTime().format(DateTimeFormatter.ofPattern("hh:mm a")));

        log.info("Deleted the appointment reminder with id {}", reminderId);
    }

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public CustomAppointmentReminderDetails updateReminder(UpdateCustomAppointmentReminderRequest request) {
        var reminderId = request.getReminderId();

        var reminder =
                reminderRepository.findById(reminderId).orElseThrow(() -> new ReminderNotFoundException(reminderId));
        var triggerTime =
                reminder.nextTriggerTime().orElseThrow(() -> new ReminderAlreadyTriggeredException(reminderId));
        if (reminder.getFrequency().equals(Frequency.DAILY) && request.getStartDate() != null) {
            throw new BadRequestException("Cannot set date for daily reminder");
        }
        assert request.getStartDate() != null;
        var startDate = request.getStartDate().toLocalDate();
        var startTime = request.getStartDate().toLocalTime();
        var fixedZone = TimezoneConfig.DEFAULT_ZONE_ID;

        var reminders = reminderRepository.findAppointmentsByDoctorAndExactDateTimeAndStatus(
                request.getDoctorId(), startDate, startTime, ReminderStatus.ACTIVE);
        if (reminders.isPresent() && reminders.get().getId() != request.getReminderId()) {
            throw new AppointmentReminderAlreadyExistException(startTime, startDate);
        }
        var newTriggerTime = Reminder.nextTriggerTime(startDate, startTime, fixedZone)
                .orElseThrow(() -> new BadRequestException("New time of the reminder cannot be in past"));
        var practiceLocationId = request.getPracticeLocationId();
        PracticeLocation practiceLocation = null;
        String practiceLocationName = null;
        String practiceLocationAddress = null;
        if (request.getPracticeLocationId() != null) {
            practiceLocation = practiceLocationRepository
                    .findById(practiceLocationId)
                    .orElseThrow(() -> new PracticeLocationNotFoundException(practiceLocationId));
            practiceLocationName = practiceLocation.getPracticeLocationName();
            practiceLocationAddress = practiceLocation.getAddress();
        }
        var patientId = reminder.getAddedForUserId();
        Patient patient = null;
        if (patientId != null && patientId != 0) {
            patient = patientRepository.findById(patientId).orElseThrow(() -> new PatientNotFoundException(patientId));
        }
        var bracesJourney =
                bracesJourneyRepository.findByPatientIdAndBracesTreatmentStage(patientId, BracesTreatmentStage.ACTIVE);
        Long bracesJourneyId = null;
        if (bracesJourney.isPresent()) {
            bracesJourneyId = bracesJourney.get().getId();
        }
        var customAppointmentReminderMetadata = (CustomAppointmentReminderMetadata) reminder.getMetadata();
        var bracesNotesAdded = customAppointmentReminderMetadata.getIsBracesNotesAdded();
        var patientSummary = patientRepository.findPatientSummariesByPatientId(patientId, Status.ACTIVE);
        if (patient != null) {
            var patientDetails = PatientDetails.from(patient);

            if (!triggerTime.equals(newTriggerTime)) {
                schedulingService.deleteReminder(reminder);
                reminder.updateAppointmentReminder(request, practiceLocation, patientDetails, bracesNotesAdded);
                schedulingService.scheduleReminder(reminder);
            } else {
                reminder.updateAppointmentReminder(request, practiceLocation, patientDetails, bracesNotesAdded);
            }

            log.info("Updated the reminder with id {}", reminderId);
            reminderRepository.save(reminder);
        } else {
            throw new PatientNotFoundException();
        }

        SetAppointmentReminderRequest reminderRequest = new SetAppointmentReminderRequest();
        reminderRequest.setStartDate(customAppointmentReminderMetadata.getStartDate());
        reminderRequest.setEndDate(customAppointmentReminderMetadata.getEndDate());
        reminderRequest.setAmount(customAppointmentReminderMetadata.getAmount());
        var addedForUserId = reminder.getAddedForUserId();
        if (reminder.getAddedForUserId() == 0) {
            addedForUserId = null;
        }
        timelineService.addEvent(
                reminder.getAddedByUserId(),
                UserType.DOCTOR,
                addedForUserId,
                UserType.PATIENT,
                EventType.PATIENT_APPOINTMENT_REMINDER_UPDATED,
                new CustomAppointmentReminderUpdatedEventMetadata(
                        PatientDetails.from(patient),
                        reminder.getId(),
                        request.getStartDate(),
                        request.getEndDate(),
                        request.getAmount(),
                        practiceLocationName,
                        practiceLocationAddress));

        sendLocalizedAppointmentNotification(patient, "UPDATED", new HashMap<>(), reminder.getId(), null, null);

        return CustomAppointmentReminderDetails.from(
                reminder,
                bracesJourneyId,
                patientSummary,
                bracesNotesAdded,
                practiceLocationName,
                practiceLocationAddress);
    }

    private void sendLocalizedAppointmentNotification(
            Patient patient,
            String notificationType,
            Map<String, Object> params,
            Long appointmentId,
            LocalDate startDate,
            String startTime) {
        Locale locale = patient.getLanguage() != null ? patient.getLanguage().getLocale() : Locale.ENGLISH;

        ResourceBundle resourceBundle = ResourceBundle.getBundle("notifications", locale);

        String pnTitle;
        String pnMessage;
        int notificationCode;

        switch (notificationType) {
            case "CREATED":
                notificationCode = 101;
                pnTitle = resourceBundle.getString("notification.appointment.created.title");
                pnMessage = MessageFormat.format(
                        resourceBundle.getString("notification.appointment.created.message"),
                        params.get("startDate"),
                        params.get("startTime"));
                break;

            case "CANCELLED":
                notificationCode = 103;
                pnTitle = resourceBundle.getString("notification.appointment.cancelled.title");
                pnMessage = MessageFormat.format(
                        resourceBundle.getString("notification.appointment.cancelled.message"),
                        params.get("startDate"),
                        params.get("startTime"));
                break;

            case "UPDATED":
                notificationCode = 102;
                pnTitle = resourceBundle.getString("notification.appointment.updated.title");
                pnMessage = resourceBundle.getString("notification.appointment.updated.message");
                break;

            default:
                throw new IllegalArgumentException("Unknown notification type: " + notificationType);
        }

        notificationService.sendPatientAppointmentReminder(
                patient.getMobileNo(),
                pnMessage,
                pnTitle,
                notificationCode,
                patient,
                appointmentId,
                startDate,
                startTime);
    }

    @Override
    public List<CustomAppointmentReminderResponse> getReminders(
            Long patientId, Long doctorId, AppointmentReminderFilter filter) {
        var reminderStatuses = List.of(ReminderStatus.ACTIVE, ReminderStatus.TRIGGERED);

        if (patientId == null) {
            throw new PatientNotFoundException();
        }

        List<Reminder> reminders = reminderRepository.findAppointmentReminders(
                doctorId, patientId, ReminderPurpose.APPOINTMENT, filter.name(), LocalDate.now(), reminderStatuses);

        var bracesJourney =
                bracesJourneyRepository.findByPatientIdAndBracesTreatmentStage(patientId, BracesTreatmentStage.ACTIVE);
        Long bracesJourneyId;
        bracesJourneyId = bracesJourney.map(BaseEntity::getId).orElse(null);
        return reminders.stream()
                .map(reminder -> CustomAppointmentReminderResponse.from(reminder, bracesJourneyId))
                .collect(Collectors.toList());
    }

    @Override
    public List<CustomAppointmentReminderResponse> getRemindersForPatients(
            Long patientId, Long doctorId, AppointmentReminderFilter filter) {

        var reminderStatuses = List.of(ReminderStatus.ACTIVE, ReminderStatus.TRIGGERED);

        if (patientId == null) {
            throw new PatientNotFoundException();
        }

        List<Reminder> reminders = reminderRepository.findAppointmentReminders(
                doctorId, patientId, ReminderPurpose.APPOINTMENT, filter.name(), LocalDate.now(), reminderStatuses);

        var bracesJourney =
                bracesJourneyRepository.findByPatientIdAndBracesTreatmentStage(patientId, BracesTreatmentStage.ACTIVE);
        Long bracesJourneyId = bracesJourney.map(BaseEntity::getId).orElse(null);

        return reminders.stream()
                .map(reminder -> {
                    PracticeLocation practiceLocation = null;
                    String practiceLocationName = null;
                    String practiceLocationAddress = null;
                    var metadata = (CustomAppointmentReminderMetadata) reminder.getMetadata();

                    if (metadata.getPracticeLocationId() != null) {
                        practiceLocation = practiceLocationRepository
                                .findById(metadata.getPracticeLocationId())
                                .orElseThrow(
                                        () -> new PracticeLocationNotFoundException(metadata.getPracticeLocationId()));

                        practiceLocationName = practiceLocation.getPracticeLocationName();
                        practiceLocationAddress = practiceLocation.getAddress();
                    }

                    return CustomAppointmentReminderResponse.from(
                            reminder, bracesJourneyId, practiceLocationName, practiceLocationAddress);
                })
                .collect(Collectors.toList());
    }

    @Override
    public CustomAppointmentReminderResponse getLatestPastAppointment(Long patientId, Long doctorId) {
        var reminderStatuses = List.of(ReminderStatus.ACTIVE, ReminderStatus.TRIGGERED);

        Reminder reminder = reminderRepository.findLatestPastAppointmentReminder(
                doctorId, patientId, ReminderPurpose.APPOINTMENT, LocalDate.now(), reminderStatuses);

        if (reminder == null) {
            return null;
        }

        var bracesJourney =
                bracesJourneyRepository.findByPatientIdAndBracesTreatmentStage(patientId, BracesTreatmentStage.ACTIVE);
        Long bracesJourneyId = bracesJourney.map(BaseEntity::getId).orElse(null);

        return CustomAppointmentReminderResponse.from(reminder, bracesJourneyId);
    }

    @Override
    public CustomAppointmentReminderResponse getNextUpcomingAppointment(Long patientId, Long doctorId) {
        var reminderStatuses = List.of(ReminderStatus.ACTIVE, ReminderStatus.TRIGGERED);

        Reminder reminder = reminderRepository.findNextUpcomingAppointmentReminder(
                doctorId, patientId, ReminderPurpose.APPOINTMENT, LocalDate.now(), reminderStatuses);

        if (reminder == null) {
            return null;
        }

        var bracesJourney =
                bracesJourneyRepository.findByPatientIdAndBracesTreatmentStage(patientId, BracesTreatmentStage.ACTIVE);
        Long bracesJourneyId = bracesJourney.map(BaseEntity::getId).orElse(null);

        return CustomAppointmentReminderResponse.from(reminder, bracesJourneyId);
    }
}
