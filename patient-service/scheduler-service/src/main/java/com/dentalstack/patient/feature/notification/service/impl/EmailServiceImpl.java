package com.dentalstack.patient.feature.notification.service.impl;

import com.dentalstack.patient.feature.appointment.repository.AppointmentRepository;
import com.dentalstack.patient.feature.doctor.repository.DoctorRepository;
import com.dentalstack.patient.feature.doctor.service.DoctorDashboardService;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.notification.service.EmailService;
import com.dentalstack.patient.feature.patient.enums.PendingActionEnum;
import com.dentalstack.patient.feature.reminder.entity.ReminderStatus;
import com.dentalstack.patient.feature.reminder.entity.ReminderTriggeredLog;
import com.dentalstack.patient.feature.reminder.enums.ReminderTriggeredLogEnum;
import com.dentalstack.patient.feature.reminder.repository.ReminderLogRepository;
import com.dentalstack.patient.feature.subscription.dto.SubscriptionPlanDTO;
import com.dentalstack.patient.feature.subscription.repository.SubscriptionUserMappingRepository;
import com.dentalstack.patient.feature.treatment.repository.AlignerActionRepository;
import com.dentalstack.patient.feature.treatment.repository.AlignerJourneyRepository;
import java.time.LocalDate;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final ChatService chatService;

    private final DoctorDashboardService doctorDashboardService;
    private final AlignerJourneyRepository alignerJourneyRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorService doctorService;
    private final AlignerActionRepository alignerActionRepository;
    private final ReminderLogRepository reminderLogRepository;
    private final DoctorRepository doctorRepository;
    private final SubscriptionUserMappingRepository subscriptionRepository;

    @Override
    public void patientConsolidatedDetailsMail(Long doctorId) {
        Map<PendingActionEnum, Integer> pendingActionCounts = doctorDashboardService.getPendingActionCounts(doctorId);

        var exists = reminderLogRepository.existsByReminderTriggeredLogEnumAndTriggeredAtAndAlignerJourneyId(
                ReminderTriggeredLogEnum.SUMMERY_EMAIL, LocalDate.now(), doctorId);

        if (!exists) {

            var doctor = doctorService.getDoctor(doctorId);
            if (doctor.getEmail() != null && doctor.getEmail().toLowerCase().contains("maildrop")) {
                return;
            }
            var subscriptionUserMappings = subscriptionRepository.findByDoctorId(doctorId);

            if (subscriptionUserMappings != null) {
                var subscriptionUserMapping = subscriptionUserMappings.get(0);
                if (subscriptionUserMapping
                        .getSubscriptionPlan()
                        .getPlanMetadata()
                        .getStatus()
                        .equals(SubscriptionPlanDTO.PlanStatus.ACTIVE)) {

                    var reminderLog = ReminderTriggeredLog.from(
                            doctor.getDoctorId(), ReminderStatus.ACTIVE, ReminderTriggeredLogEnum.SUMMERY_EMAIL);

                    reminderLogRepository.save(reminderLog);
                }
            }
        }
    }

    @Override
    public void patientConsolidatedDetailsMail() {
        doctorRepository.findAllDoctorIds().forEach(doctorId -> {
            try {
                patientConsolidatedDetailsMail(doctorId);
            } catch (Exception e) {
                log.error("Failed to send consolidated mail for doctorId: " + doctorId, e);
            }
        });
    }
}
