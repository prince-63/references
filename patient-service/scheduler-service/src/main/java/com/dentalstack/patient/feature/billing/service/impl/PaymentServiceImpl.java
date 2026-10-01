package com.dentalstack.patient.feature.billing.service.impl;

import com.dentalstack.patient.feature.billing.service.PaymentService;
import com.dentalstack.patient.feature.doctor.entity.organization.PatientDoctorOrganization;
import com.dentalstack.patient.feature.events.enums.EventType;
import com.dentalstack.patient.feature.events.metadata.event.PaymentReminderEventMetadata;
import com.dentalstack.patient.feature.events.service.TimelineService;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.reminder.entity.PushNotificationReminderChannelMetadata;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.feature.reminder.entity.ReminderPurpose;
import com.dentalstack.patient.feature.reminder.repository.ReminderRepository;
import com.dentalstack.patient.feature.treatment.entity.Treatment;
import com.dentalstack.patient.feature.treatment.exception.TreatmentNotFoundException;
import com.dentalstack.patient.global.enums.UserType;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PatientRepository patientRepository;
    private final ReminderRepository reminderRepository;
    private final TimelineService timelineService;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;

    @Override
    public Treatment getTreatment(long patientId, long doctorId) {
        PatientDoctorOrganization patientDoctorOrganization =
                patientDoctorOrganizationRepository.findByPatientIdAndDoctorId(patientId, doctorId);
        if (patientDoctorOrganization == null) {
            throw new PatientNotFoundException("Patient with ID " + patientId + " not found.");
        }
        var patient = patientRepository.findById(patientId).orElseThrow(() -> new PatientNotFoundException(patientId));

        return patient.getTreatments().stream()
                .filter(t -> t.getDoctorId() == doctorId)
                .findAny()
                .orElseThrow(() -> new TreatmentNotFoundException(patientId, doctorId));
    }

    @Override
    public void paymentReminder() {
        LocalDate today = LocalDate.now();
        var reminders = reminderRepository.findByDateAndPurpose(today, ReminderPurpose.PAYMENTS_PENDING);
        for (Reminder reminder : reminders) {
            var metadata = (PushNotificationReminderChannelMetadata) reminder.getChannelMetadata();

            var patient = patientRepository.findById(metadata.getPatientId());

            patient.ifPresent(value -> timelineService.addEvent(
                    value.getId(),
                    UserType.PATIENT,
                    value.getAddedByUserId(),
                    UserType.DOCTOR,
                    EventType.PAYMENT_REMINDER,
                    new PaymentReminderEventMetadata(value.getId())));
        }
    }
}
