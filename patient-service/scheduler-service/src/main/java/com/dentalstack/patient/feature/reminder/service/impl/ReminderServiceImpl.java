package com.dentalstack.patient.feature.reminder.service.impl;

import com.dentalstack.patient.feature.billing.service.PaymentService;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.events.service.SchedulingService;
import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.reminder.dto.SetCustomReminderRequest;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.feature.reminder.enums.ReminderCategory;
import com.dentalstack.patient.feature.reminder.repository.ReminderRepository;
import com.dentalstack.patient.feature.reminder.service.ReminderService;
import com.dentalstack.patient.feature.treatment.cache.AlignerCacheEvict;
import com.dentalstack.patient.feature.treatment.entity.AlignerJourney;
import com.dentalstack.patient.feature.treatment.entity.Treatment;
import com.dentalstack.patient.feature.treatment.enums.OrderStatus;
import com.dentalstack.patient.feature.treatment.enums.ProgressStatus;
import com.dentalstack.patient.feature.treatment.enums.production.ProductionStatus;
import com.dentalstack.patient.feature.treatment.exception.AlignerJourneyNotFoundException;
import com.dentalstack.patient.feature.treatment.exception.TreatmentNotFoundException;
import com.dentalstack.patient.feature.treatment.exception.production.NoActiveAlignerProductionOrderFoundException;
import com.dentalstack.patient.feature.treatment.repository.AlignerJourneyRepository;
import com.dentalstack.patient.feature.treatment.repository.TreatmentRepository;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.exception.BusinessException;
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
    private final AlignerCacheEvict cacheEvict;
    private final UserProfileRepository userProfileRepository;

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public void setReminder(SetCustomReminderRequest request) {

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
    }

    private void evictCaches(Long doctorId) {
        cacheEvict.evictProductionCache(doctorId);
        EnumSet.allOf(ProductionStatus.class)
                .forEach(status -> cacheEvict.evictSpecificCache(doctorId, status.toString()));
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
                userProfile);

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
                userProfile);
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
                userProfile);
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
            var date = request.getDate();
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
                    userProfile);
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
