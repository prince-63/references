package com.dentalstack.patient.feature.payment.service.reminder.impl;

import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.payment.dto.UpdatePaymentReminderRequest;
import com.dentalstack.patient.feature.payment.dto.reminder.DeletePaymentReminderRequest;
import com.dentalstack.patient.feature.payment.dto.reminder.SetPaymentReminderRequest;
import com.dentalstack.patient.feature.payment.service.PaymentService;
import com.dentalstack.patient.feature.payment.service.reminder.PaymentReminderService;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.feature.reminder.entity.ReminderStatus;
import com.dentalstack.patient.feature.reminder.enums.Frequency;
import com.dentalstack.patient.feature.reminder.exception.ReminderAlreadyTriggeredException;
import com.dentalstack.patient.feature.reminder.exception.ReminderNotFoundException;
import com.dentalstack.patient.feature.reminder.repository.ReminderRepository;
import com.dentalstack.patient.feature.reminder.service.SchedulingService;
import com.dentalstack.patient.feature.treatment.entity.Treatment;
import com.dentalstack.patient.feature.treatment.repository.TreatmentRepository;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.exception.BadRequestException;
import com.dentalstack.patient.global.exception.BusinessException;
import java.time.ZoneId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentReminderServiceImpl implements PaymentReminderService {

    private final PaymentService paymentService;
    private final SchedulingService schedulingService;
    private final DoctorService doctorService;

    private final ReminderRepository reminderRepository;
    private final PatientRepository patientRepository;
    private final TreatmentRepository treatmentRepository;
    private final UserProfileRepository userProfileRepository;

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public Treatment setReminder(SetPaymentReminderRequest request) {
        var patientId = request.getPatientId();
        var doctorId = request.getDoctorId();
        var doctor = doctorService.getDoctor(doctorId);
        var patient = patientRepository.findById(patientId).orElseThrow(() -> new PatientNotFoundException(patientId));
        var treatment = paymentService.getTreatment(patientId, doctorId);

        var title = "Payment reminder";
        String message = String.format("You had set a reminder to collect  %s's payment", patient.getFirstName());
        var patientDetails = PatientDetails.from(patient);
        UserProfile userProfile = null;
        if (request.getProfileId() != null) {
            userProfile = userProfileRepository
                    .findById(request.getProfileId())
                    .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));
        }
        var reminder = Reminder.from(
                request, doctor.getMobile(), message, title, patientId, doctor.getEmail(), patientDetails, userProfile);
        reminder = reminderRepository.save(reminder);

        schedulingService.scheduleReminder(reminder);
        treatment.getReminders().add(reminder);

        log.info("Added a payment reminder for doctor {}", doctorId);
        return treatmentRepository.save(treatment);
    }

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public Treatment deleteReminder(DeletePaymentReminderRequest request) {
        var patientId = request.getPatientId();
        var doctorId = request.getDoctorId();
        var reminderId = request.getReminderId();

        var treatment = paymentService.getTreatment(patientId, doctorId);
        var reminder = treatment.getReminders().stream()
                .filter(r -> r.getId().equals(reminderId))
                .findAny()
                .orElseThrow(() -> new ReminderNotFoundException(reminderId));

        reminder.setStatus(ReminderStatus.INACTIVE);
        reminderRepository.save(reminder);
        treatment.getReminders().removeIf(r -> r.getId().equals(reminderId));

        log.info("Deleted the payment reminder with id {}", reminderId);
        return treatmentRepository.save(treatment);
    }

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public Treatment updateReminder(UpdatePaymentReminderRequest request) {
        var patientId = request.getPatientId();
        var doctorId = request.getDoctorId();
        var reminderId = request.getReminderId();

        var treatment = paymentService.getTreatment(patientId, doctorId);
        var reminder = treatment.getReminders().stream()
                .filter(r -> r.getId().equals(reminderId))
                .findAny()
                .orElseThrow(() -> new ReminderNotFoundException(reminderId));
        var triggerTime =
                reminder.nextTriggerTime().orElseThrow(() -> new ReminderAlreadyTriggeredException(reminderId));
        if (reminder.getFrequency().equals(Frequency.DAILY) && request.getDate() != null) {
            throw new BadRequestException("Cannot set date for daily reminder");
        }

        var newDate = request.getDate();
        var newTime = request.getTime();
        var newZone = ZoneId.of(request.getTimezone());
        var newTriggerTime = Reminder.nextTriggerTime(newDate, newTime, newZone)
                .orElseThrow(() -> new BadRequestException("New time of the reminder cannot be in past"));

        var patientDetails = PatientDetails.from(treatment.getPatient());
        if (!triggerTime.equals(newTriggerTime)) {
            schedulingService.deleteReminder(reminder);
            reminder.update(request, patientDetails);
            schedulingService.scheduleReminder(reminder);
        } else {
            reminder.update(request, patientDetails);
        }

        log.info("Updated the reminder with id {}", reminderId);
        reminderRepository.save(reminder);
        return treatment;
    }
}
