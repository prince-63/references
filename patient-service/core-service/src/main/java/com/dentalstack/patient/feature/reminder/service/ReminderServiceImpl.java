package com.dentalstack.patient.feature.reminder.service;

import com.dentalstack.patient.feature.aligner.cache.AlignerCacheEvict;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.enums.OrderStatus;
import com.dentalstack.patient.feature.aligner.enums.aligner.ProgressStatus;
import com.dentalstack.patient.feature.aligner.enums.aligner.production.ProductionStatus;
import com.dentalstack.patient.feature.aligner.exception.aligner.AlignerJourneyNotFoundException;
import com.dentalstack.patient.feature.aligner.exception.aligner.production.NoActiveAlignerProductionOrderFoundException;
import com.dentalstack.patient.feature.aligner.repository.AlignerJourneyRepository;
import com.dentalstack.patient.feature.dashboardlabel.cache.DashboardCacheEvictService;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.payment.dto.reminder.DeletePaymentReminderRequest;
import com.dentalstack.patient.feature.payment.service.PaymentService;
import com.dentalstack.patient.feature.payment.service.reminder.PaymentReminderService;
import com.dentalstack.patient.feature.reminder.dto.DeleteReminderRequest;
import com.dentalstack.patient.feature.reminder.dto.SetCustomReminderRequest;
import com.dentalstack.patient.feature.reminder.dto.UpdateReminderRequest;
import com.dentalstack.patient.feature.reminder.entity.ProdutionReminderMetadata;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.feature.reminder.entity.ReminderStatus;
import com.dentalstack.patient.feature.reminder.enums.Frequency;
import com.dentalstack.patient.feature.reminder.enums.ReminderCategory;
import com.dentalstack.patient.feature.reminder.exception.ReminderAlreadyTriggeredException;
import com.dentalstack.patient.feature.reminder.exception.ReminderNotFoundException;
import com.dentalstack.patient.feature.reminder.repository.ReminderRepository;
import com.dentalstack.patient.feature.treatment.entity.Treatment;
import com.dentalstack.patient.feature.treatment.exception.TreatmentNotFoundException;
import com.dentalstack.patient.feature.treatment.repository.TreatmentPlanRepository;
import com.dentalstack.patient.feature.treatment.repository.TreatmentRepository;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.config.TimezoneConfig;
import com.dentalstack.patient.global.exception.BadRequestException;
import com.dentalstack.patient.global.exception.BusinessException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Slf4j
@Service
public class ReminderServiceImpl implements ReminderService {

    private final AlignerJourneyRepository alignerJourneyRepository;
    private final DoctorService doctorService;
    private final ReminderRepository reminderRepository;
    private final SchedulingService schedulingService;
    private final PatientRepository patientRepository;
    private final PaymentService paymentService;
    private final TreatmentRepository treatmentRepository;
    private final PaymentReminderService paymentReminderService;
    private final AlignerCacheEvict cacheEvict;
    private final UserProfileRepository userProfileRepository;
    private final DashboardCacheEvictService dashboardCacheEvictService;
    private final TreatmentPlanRepository treatmentPlanRepository;

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public void setReminder(SetCustomReminderRequest request) {

        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        if (request.getReminderCategory().equals(ReminderCategory.PRODUCTION_REMINDER)) {
            productionReminder(request);
        }
        if (request.getReminderCategory().equals(ReminderCategory.PAYMENT_REMINDER)) {
            paymentReminder(request);
        }
        if (request.getReminderCategory().equals(ReminderCategory.GENERAL_REMINDER)) {
            generalReminder(request);
        }
        if (request.getReminderCategory().equals(ReminderCategory.APPOINTMENT_REMINDER)) {
            appointmentReminder(request);
        }
        if (request.getReminderCategory().equals(ReminderCategory.TREATMENT_START_REMINDER)) {
            startTreatmentReminder(request);
        }
        if (request.getReminderCategory().equals(ReminderCategory.UNPROCESSED_ALIGNER_REMINDER)) {
            unprocessedAlignerReminder(request);
        }
    }

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public void updateReminder(UpdateReminderRequest request) {
        var reminderId = request.getReminderId();
        var fixedZone = TimezoneConfig.DEFAULT_ZONE_ID;

        if (request.getReminderCategory() == ReminderCategory.PRODUCTION_REMINDER) {
            updateProductionReminder(request, fixedZone);
        } else {
            updateNonProductionReminder(request, fixedZone);
        }
        evictCaches(request.getDoctorId());

        log.info("Updated the reminder with id {}", reminderId);
    }

    private void updateNonProductionReminder(UpdateReminderRequest request, ZoneId fixedZone) {
        var reminderId = request.getReminderId();
        var reminder = getReminderById(reminderId);

        validateDailyReminderUpdate(reminder, request.getDate());

        var currentTriggerTime =
                reminder.nextTriggerTime().orElseThrow(() -> new ReminderAlreadyTriggeredException(reminderId));
        var newTriggerTime = getNewTriggerTime(request.getDate(), request.getTime(), fixedZone);

        var patientDetails = getPatientDetails(request.getPatientId());

        updateReminderAndSchedule(reminder, request, patientDetails, currentTriggerTime, newTriggerTime);
    }

    private void updateProductionReminder(UpdateReminderRequest request, ZoneId fixedZone) {
        var alignerJourneyId = request.getAlignerJourneyId();
        var reminderId = request.getReminderId();

        var alignerJourney = getAlignerJourneyById(alignerJourneyId);
        evictCaches(alignerJourney.getDoctorId());

        var reminder = getReminderById(reminderId);
        var metadata = (ProdutionReminderMetadata) reminder.getMetadata();

        validateDailyReminderUpdate(reminder, request.getDate());

        var currentTriggerTime =
                reminder.nextTriggerTime().orElseThrow(() -> new ReminderAlreadyTriggeredException(reminderId));
        var newTriggerTime = getNewTriggerTime(request.getDate(), request.getTime(), fixedZone);

        var patientDetails = getPatientDetails(request.getPatientId());

        updateReminderAndSchedule(reminder, request, patientDetails, currentTriggerTime, newTriggerTime);

        alignerJourneyRepository.save(alignerJourney);
        log.info("Updated the reminder with id {} from aligner journey id {}", reminderId, alignerJourneyId);
    }

    private Reminder getReminderById(long reminderId) {
        return reminderRepository.findById(reminderId).orElseThrow(() -> new ReminderNotFoundException(reminderId));
    }

    private void validateDailyReminderUpdate(Reminder reminder, LocalDate date) {
        if (reminder.getFrequency() == Frequency.DAILY && date != null) {
            throw new BadRequestException("Cannot set date for daily reminder");
        }
    }

    private ZonedDateTime getNewTriggerTime(LocalDate date, LocalTime time, ZoneId fixedZone) {
        return Reminder.nextTriggerTime(date, time, fixedZone)
                .orElseThrow(() -> new BadRequestException("New time of the reminder cannot be in past"));
    }

    private PatientDetails getPatientDetails(Long patientId) {
        if (patientId == null) {
            return null;
        }
        return patientRepository
                .findById(patientId)
                .map(PatientDetails::from)
                .orElseThrow(() -> new PatientNotFoundException(patientId));
    }

    private void updateReminderAndSchedule(
            Reminder reminder,
            UpdateReminderRequest request,
            PatientDetails patientDetails,
            ZonedDateTime currentTriggerTime,
            ZonedDateTime newTriggerTime) {
        boolean triggerTimeChanged = !currentTriggerTime.equals(newTriggerTime);
        if (triggerTimeChanged) {
            schedulingService.deleteReminder(reminder);
        }

        reminder.updateReminder(request, patientDetails);

        if (triggerTimeChanged) {
            schedulingService.scheduleReminder(reminder);
        }

        reminderRepository.save(reminder);
    }

    private AlignerJourney getAlignerJourneyById(Long alignerJourneyId) {
        return alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));
    }

    private void evictCaches(Long doctorId) {
        cacheEvict.evictProductionCache(doctorId);
        EnumSet.allOf(ProductionStatus.class)
                .forEach(status -> cacheEvict.evictSpecificCache(doctorId, status.toString()));
    }

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public void deleteReminder(DeleteReminderRequest request) {
        var reminderId = request.getReminderId();
        if (request.getPatientId() != null) {
            var patient = patientRepository
                    .findById(request.getPatientId())
                    .orElseThrow(() -> new PatientNotFoundException(request.getPatientId()));
            evictCaches(patient.getAddedByUserId());
        }
        switch (request.getReminderCategory()) {
            case PRODUCTION_REMINDER -> deleteProductionReminder(request);
            case GENERAL_REMINDER, APPOINTMENT_REMINDER -> deleteGeneralOrAppointmentReminder(reminderId);
            case PAYMENT_REMINDER -> deletePaymentReminder(request);
            default -> throw new IllegalArgumentException(
                    "Unsupported reminder category: " + request.getReminderCategory());
        }

        log.info("Deleted the reminder with id {}", reminderId);
    }

    private void deleteProductionReminder(DeleteReminderRequest request) {
        reminderRepository
                .findById(request.getReminderId())
                .ifPresentOrElse(
                        r -> {
                            r.setStatus(ReminderStatus.INACTIVE);
                            reminderRepository.save(r);
                        },
                        () -> {
                            throw new ReminderNotFoundException(request.getReminderId());
                        });
    }

    private void deleteGeneralOrAppointmentReminder(long reminderId) {
        reminderRepository
                .findById(reminderId)
                .ifPresentOrElse(
                        reminder -> {
                            reminder.setStatus(ReminderStatus.INACTIVE);
                            reminderRepository.save(reminder);
                        },
                        () -> {
                            throw new ReminderNotFoundException(reminderId);
                        });
    }

    private void deletePaymentReminder(DeleteReminderRequest request) {
        patientRepository
                .findById(request.getPatientId())
                .ifPresentOrElse(
                        patient -> {
                            if (patient.getTreatments().isEmpty()) {
                                deleteGeneralOrAppointmentReminder(request.getReminderId());
                            } else {
                                paymentReminderService.deleteReminder(DeletePaymentReminderRequest.builder()
                                        .doctorId(patient.getAddedByUserId())
                                        .patientId(patient.getId())
                                        .reminderId(request.getReminderId())
                                        .build());
                            }
                        },
                        () -> {
                            throw new PatientNotFoundException(request.getPatientId());
                        });
    }

    private void generalReminder(SetCustomReminderRequest request) {
        var patientId = request.getPatientId();
        var doctorId = request.getDoctorId();
        var doctor = doctorService.getDoctor(doctorId);

        PatientDetails patientDetails = null;
        if (patientId != null) {
            Long finalPatientId = patientId;
            var patient = patientRepository
                    .findById(patientId)
                    .orElseThrow(() -> new PatientNotFoundException(finalPatientId));
            patientDetails = PatientDetails.from(patient);
        }
        String title;

        if (patientDetails != null) {
            title = "Reminder: " + patientDetails.getFirstName();
        } else {
            title = "Reminder";
        }
        var message = "You have a reminder for the patient. Tap to view the note and take action";
        UserProfile userProfile = null;
        if (request.getProfileId() != null) {
            userProfile = userProfileRepository
                    .findById(request.getProfileId())
                    .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));
        }
        if (patientId == null) {
            patientId = 0L;
        }
        var reminder = Reminder.createReminder(
                request,
                doctor.getMobile(),
                message,
                title,
                null,
                patientId,
                doctor.getEmail(),
                patientDetails,
                userProfile,
                null);

        reminder = reminderRepository.save(reminder);
        evictCaches(request.getDoctorId());
        schedulingService.scheduleReminder(reminder);
    }

    private void appointmentReminder(SetCustomReminderRequest request) {
        var patientId = request.getPatientId();
        var doctorId = request.getDoctorId();
        var doctor = doctorService.getDoctor(doctorId);
        var patient = patientRepository.findById(patientId).orElseThrow(() -> new PatientNotFoundException(patientId));

        var title = "Appointment reminder for " + patient.getFirstName();
        var message = "Your appointment is scheduled. Tap to view details and create appointment.";
        UserProfile userProfile = null;
        if (request.getProfileId() != null) {
            userProfile = userProfileRepository
                    .findById(request.getProfileId())
                    .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));
        }
        var reminder = Reminder.createReminder(
                request,
                doctor.getMobile(),
                message,
                title,
                null,
                patientId,
                doctor.getEmail(),
                PatientDetails.from(patient),
                userProfile,
                null);
        reminder = reminderRepository.save(reminder);
        evictCaches(request.getDoctorId());

        schedulingService.scheduleReminder(reminder);
    }

    private void startTreatmentReminder(SetCustomReminderRequest request) {
        var patientId = request.getPatientId();
        var doctorId = request.getDoctorId();
        var doctor = doctorService.getDoctor(doctorId);
        var patient = patientRepository.findById(patientId).orElseThrow(() -> new PatientNotFoundException(patientId));

        var title = "Reminder to start treatment for " + patient.getFirstName();
        var message = "Your patient is ready to start treatment. Tap to view details and start treatment.";
        UserProfile userProfile = null;
        if (request.getProfileId() != null) {
            userProfile = userProfileRepository
                    .findById(request.getProfileId())
                    .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));
        }
        var reminder = Reminder.createReminder(
                request,
                doctor.getMobile(),
                message,
                title,
                null,
                patientId,
                doctor.getEmail(),
                PatientDetails.from(patient),
                userProfile,
                null);
        reminder = reminderRepository.save(reminder);
        evictCaches(request.getDoctorId());

        schedulingService.scheduleReminder(reminder);
    }

    private void unprocessedAlignerReminder(SetCustomReminderRequest request) {
        var patientId = request.getPatientId();
        var doctorId = request.getDoctorId();
        var doctor = doctorService.getDoctor(doctorId);
        var patient = patientRepository.findById(patientId).orElseThrow(() -> new PatientNotFoundException(patientId));

        var title = "Reminder – Start Next Batch";
        var message = "Reminder: Start manufacturing the next batch for " + patient.getFirstName();
        UserProfile userProfile = null;
        if (request.getProfileId() != null) {
            userProfile = userProfileRepository
                    .findById(request.getProfileId())
                    .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));
        }
        var treatment =
                treatmentPlanRepository.findById(request.getTreatmentPlanId()).orElseThrow();

        var reminder = Reminder.createReminder(
                request,
                doctor.getMobile(),
                message,
                title,
                request.getTreatmentPlanId(),
                patientId,
                doctor.getEmail(),
                PatientDetails.from(patient),
                userProfile,
                treatment.getOrder() != null ? treatment.getOrder().getId() : null);
        reminder = reminderRepository.save(reminder);
        evictCaches(request.getDoctorId());

        schedulingService.scheduleReminder(reminder);
    }

    private void paymentReminder(SetCustomReminderRequest request) {
        var patientId = request.getPatientId();
        var doctorId = request.getDoctorId();
        var doctor = doctorService.getDoctor(doctorId);
        var patient = patientRepository.findById(patientId).orElseThrow(() -> new PatientNotFoundException(patientId));

        var title = "Payment Due for: " + patient.getFirstName();
        var message = "Your patient has a pending payment. Tap to add payment.";
        var patientDetails = PatientDetails.from(patient);
        UserProfile userProfile = null;
        if (request.getProfileId() != null) {
            userProfile = userProfileRepository
                    .findById(request.getProfileId())
                    .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));
        }
        var reminder = Reminder.createReminder(
                request,
                doctor.getMobile(),
                message,
                title,
                null,
                patientId,
                doctor.getEmail(),
                patientDetails,
                userProfile,
                null);
        reminder = reminderRepository.save(reminder);

        Treatment treatment = null;
        try {
            treatment = paymentService.getTreatment(patientId, doctorId);
        } catch (TreatmentNotFoundException e) {
            log.info(
                    "Treatment not found for patient {} and doctor {}. Reminder will be created without associating to a treatment.",
                    patientId,
                    doctorId);
        }

        if (treatment != null) {
            treatment.getReminders().add(reminder);
            treatmentRepository.save(treatment);
            log.info("Added a payment reminder to treatment for patient {} and doctor {}", patientId, doctorId);
        }

        schedulingService.scheduleReminder(reminder);
        evictCaches(request.getDoctorId());

        log.info("Scheduled a payment reminder for doctor {}", doctorId);
    }

    private void productionReminder(SetCustomReminderRequest request) {
        var progressStatuses = List.of(ProgressStatus.NOT_STARTED, ProgressStatus.IN_PROGRESS);
        var patientId = request.getPatientId();
        var alignerJourneys = alignerJourneyRepository.findByPatientIdAndProgressStatusIn(patientId, progressStatuses);
        if (!alignerJourneys.isEmpty()) {
            Optional<AlignerJourney> latestAlignerJourney =
                    alignerJourneys.stream().max(Comparator.comparing(AlignerJourney::getCreatedAt));
            var alignerJourneyId = latestAlignerJourney.get().getId();
            var alignerJourney = alignerJourneyRepository
                    .findById(alignerJourneyId)
                    .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));

            var order = alignerJourney.getAlignerProductionOrders().stream()
                    .filter(alignerProductionOrder ->
                            alignerProductionOrder.getStatus().equals(OrderStatus.ACTIVE))
                    .findFirst()
                    .orElseThrow(() -> new NoActiveAlignerProductionOrderFoundException(alignerJourneyId));

            var doctor = doctorService.getDoctor(alignerJourney.getDoctorId());

            var patient = alignerJourney.getPatient();
            var title = "Production Update: " + patient.getFirstName();
            var message = "Production workflow for the patient is due for review. Tap to manage the production.";
            alignerJourneyRepository.save(alignerJourney);
            UserProfile userProfile = null;
            if (request.getProfileId() != null) {
                userProfile = userProfileRepository
                        .findById(request.getProfileId())
                        .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));
            }
            var reminders = Reminder.createReminder(
                    request,
                    doctor.getMobile(),
                    message,
                    title,
                    alignerJourney.getId(),
                    alignerJourney.getPatient().getId(),
                    doctor.getEmail(),
                    PatientDetails.from(patient),
                    userProfile,
                    null);
            reminderRepository.save(reminders);

            order = alignerJourney.getAlignerProductionOrders().stream()
                    .filter(alignerProductionOrder ->
                            alignerProductionOrder.getStatus().equals(OrderStatus.ACTIVE))
                    .findFirst()
                    .orElseThrow(() -> new NoActiveAlignerProductionOrderFoundException(alignerJourneyId));

            order.getReminders().add(reminders);
            alignerJourneyRepository.save(alignerJourney);

            schedulingService.scheduleReminder(reminders);

            cacheEvict.evictProductionCache(alignerJourney.getDoctorId());
        }
    }
}
