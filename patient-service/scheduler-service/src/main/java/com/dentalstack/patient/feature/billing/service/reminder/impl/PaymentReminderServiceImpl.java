package com.dentalstack.patient.feature.billing.service.reminder.impl;

import com.dentalstack.patient.feature.billing.service.PaymentService;
import com.dentalstack.patient.feature.billing.service.reminder.PaymentReminderService;
import com.dentalstack.patient.feature.reminder.dto.DeletePaymentReminderRequest;
import com.dentalstack.patient.feature.reminder.entity.ReminderStatus;
import com.dentalstack.patient.feature.reminder.exception.ReminderNotFoundException;
import com.dentalstack.patient.feature.reminder.repository.ReminderRepository;
import com.dentalstack.patient.feature.treatment.entity.Treatment;
import com.dentalstack.patient.feature.treatment.repository.TreatmentRepository;
import com.dentalstack.patient.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentReminderServiceImpl implements PaymentReminderService {

    private final PaymentService paymentService;
    private final ReminderRepository reminderRepository;
    private final TreatmentRepository treatmentRepository;

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
}
