package com.dentalstack.patient.feature.aligner.service.production.impl;

import com.dentalstack.patient.feature.aligner.cache.AlignerCacheEvict;
import com.dentalstack.patient.feature.aligner.dto.aligner.production.UpdateAlignerProductionRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.production.reminder.AddAlignerProductionReminderRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.production.reminder.DeleteAlignerProductionReminderRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.production.reminder.UpdateAlignerProductionReminderRequest;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.entity.production.*;
import com.dentalstack.patient.feature.aligner.enums.OrderStatus;
import com.dentalstack.patient.feature.aligner.enums.ProductionSubStatus;
import com.dentalstack.patient.feature.aligner.enums.aligner.production.ProductionStatus;
import com.dentalstack.patient.feature.aligner.exception.aligner.AlignerJourneyNotFoundException;
import com.dentalstack.patient.feature.aligner.exception.aligner.production.NoActiveAlignerProductionOrderFoundException;
import com.dentalstack.patient.feature.aligner.exception.aligner.production.lab.AlignerProductionLabNotFoundException;
import com.dentalstack.patient.feature.aligner.exception.aligner.production.reminder.AlignerProductionOrderReminderNotFound;
import com.dentalstack.patient.feature.aligner.repository.AlignerJourneyRepository;
import com.dentalstack.patient.feature.aligner.repository.AlignerProductionLabRepository;
import com.dentalstack.patient.feature.aligner.service.production.AlignerProductionService;
import com.dentalstack.patient.feature.dashboardlabel.cache.DashboardCacheEvictService;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.feature.reminder.entity.ReminderStatus;
import com.dentalstack.patient.feature.reminder.repository.ReminderRepository;
import com.dentalstack.patient.feature.reminder.service.SchedulingService;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.exception.BadRequestException;
import com.dentalstack.patient.global.exception.BusinessException;
import jakarta.annotation.Nullable;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class AlignerProductionServiceImpl implements AlignerProductionService {

    private final AlignerJourneyRepository alignerJourneyRepository;
    private final AlignerProductionLabRepository alignerProductionLabRepository;
    private final SchedulingService schedulingService;
    private final ReminderRepository reminderRepository;
    private final DoctorService doctorService;
    private final AlignerCacheEvict cacheEvict;
    private final UserProfileRepository userProfileRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final PatientRepository patientRepository;
    private final DashboardCacheEvictService dashboardCacheEvictService;

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public AlignerJourney updateAlignerProduction(UpdateAlignerProductionRequest request) {
        var alignerJourneyId = request.getAlignerJourneyId();
        var alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));
        updateAlignerProduction(
                alignerJourney, request.getAlignerNos(), request.getSubStatus(), request.getProductionLabId());

        if (request.getWearDays() != null && request.getAlignerNos().size() > 1) {
            alignerJourney.setDaysToWearEachAligner(request.getWearDays());
        }
        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(alignerJourney.getPatient().getId())
                .orElseThrow(() ->
                        new PatientNotFoundException(alignerJourney.getPatient().getId()));

        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);

        log.info("Updated production details of the aligner journey {}", alignerJourneyId);
        return alignerJourneyRepository.save(alignerJourney);
    }

    @Override
    public void updateAlignerProduction(
            AlignerJourney alignerJourney,
            Set<Integer> alignerNos,
            @Nullable ProductionSubStatus subStatus,
            @Nullable Long productionLabId) {
        var alignerJourneyId = alignerJourney.getId();
        AlignerProductionLab productionLab;

        cacheEvict.evictProductionCache(alignerJourney.getDoctorId());
        var statuses = EnumSet.allOf(ProductionStatus.class);
        if (!statuses.isEmpty()) {
            statuses.forEach(status -> {
                String statusKey = status.toString();
                cacheEvict.evictSpecificCache(alignerJourney.getDoctorId(), statusKey);
            });
        }

        if (productionLabId != null) {
            productionLab = alignerProductionLabRepository
                    .findById(productionLabId)
                    .orElseThrow(() -> new AlignerProductionLabNotFoundException(productionLabId));
        } else {
            productionLab = null;
        }

        if (subStatus != null
                && List.of(ProductionSubStatus.COMPLETED, ProductionSubStatus.UNTRACKED)
                        .contains(subStatus)) {
            throw new BadRequestException(String.format(
                    "Production sub status cannot be %s and %s",
                    ProductionSubStatus.COMPLETED, ProductionSubStatus.UNTRACKED));
        }
        if (alignerNos.stream().anyMatch(no -> no < 1 || no > alignerJourney.totalAligners())) {
            throw new BadRequestException("Aligner no should be from 1 and total no. of aligners");
        }

        var order = alignerJourney.getAlignerProductionOrders().stream()
                .filter(alignerProductionOrder ->
                        alignerProductionOrder.getStatus().equals(OrderStatus.ACTIVE))
                .findFirst()
                .orElseThrow(() -> new NoActiveAlignerProductionOrderFoundException(alignerJourneyId));

        var orderLog = AlignerProductionOrderLog.newLog(order.getLogs().size() + 1, order);
        order.getAlignerProductions().stream()
                .filter(production ->
                        alignerNos.contains(production.getAligner().getSrNo()))
                .forEach(production -> {
                    var productionLog = AlignerProductionLog.newLog(production, orderLog);
                    var updated = false;
                    if (production.canChangeStatus(subStatus)) {
                        productionLog.recordSubStatusChange(production.getSubStatus(), subStatus);
                        updated |= production.changeStatus(subStatus);
                    }

                    if (production.canChangeProductionLab(productionLab)) {
                        productionLog.recordAlignerProductionLabChange(
                                production.getAlignerProductionLab(), productionLab);
                        updated |= production.changeProductionLab(productionLab);
                    }

                    if (updated) {
                        orderLog.getAlignerProductionLogs().add(productionLog);
                    }
                });
        order.getLogs().add(orderLog);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlignerProductionOrderLog> getAlignerProductionOrderUpdateLogs(Long alignerJourneyId) {
        var alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));

        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(alignerJourney.getPatient().getId())
                .orElseThrow(() ->
                        new PatientNotFoundException(alignerJourney.getPatient().getId()));

        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        return alignerJourney.getAlignerProductionOrders().stream()
                .filter(order -> order.getStatus().equals(OrderStatus.ACTIVE))
                .findFirst()
                .orElseThrow(() -> new NoActiveAlignerProductionOrderFoundException(alignerJourneyId))
                .getLogs();
    }

    @Override
    @Transactional(noRollbackFor = {BusinessException.class})
    public AlignerJourney addAlignerProductionOrderReminder(AddAlignerProductionReminderRequest request) {
        var alignerJourneyId = request.getAlignerJourneyId();
        var alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));

        cacheEvict.evictProductionCache(alignerJourney.getDoctorId());
        var statuses = EnumSet.allOf(ProductionStatus.class);
        if (!statuses.isEmpty()) {
            statuses.forEach(status -> {
                String statusKey = status.toString();
                cacheEvict.evictSpecificCache(alignerJourney.getDoctorId(), statusKey);
            });
        }

        var doctor = doctorService.getDoctor(alignerJourney.getDoctorId());
        var patient = alignerJourney.getPatient();
        var title = "Review aligner status";
        String message = String.format("%s's aligner status is pending for review.", patient.getFirstName());

        var saveAlignerJourney = alignerJourneyRepository.save(alignerJourney);

        UserProfile userProfile = null;
        if (request.getProfileId() != null) {
            userProfile = userProfileRepository
                    .findById(request.getProfileId())
                    .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        }
        var reminders = Reminder.from(
                request,
                doctor.getMobile(),
                message,
                title,
                alignerJourney.getId(),
                alignerJourney.getPatient().getId(),
                doctor.getEmail(),
                doctor.getDoctorId(),
                PatientDetails.from(patient),
                userProfile);
        reminderRepository.save(reminders);

        schedulingService.scheduleReminder(reminders);

        log.info("Added a new reminder for order of aligner journey with id: {}", alignerJourneyId);
        return saveAlignerJourney;
    }

    @Override
    @Transactional(noRollbackFor = {BusinessException.class})
    public AlignerJourney deleteAlignerProductionOrderReminder(DeleteAlignerProductionReminderRequest request) {
        var alignerJourneyId = request.getAlignerJourneyId();
        var reminderId = request.getReminderId();

        var alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));
        cacheEvict.evictProductionCache(alignerJourney.getDoctorId());
        var statuses = EnumSet.allOf(ProductionStatus.class);
        if (!statuses.isEmpty()) {
            statuses.forEach(status -> {
                String statusKey = status.toString();
                cacheEvict.evictSpecificCache(alignerJourney.getDoctorId(), statusKey);
            });
        }

        var order = alignerJourney.getAlignerProductionOrders().stream()
                .filter(alignerProductionOrder ->
                        alignerProductionOrder.getStatus().equals(OrderStatus.ACTIVE))
                .findFirst()
                .orElseThrow(() -> new NoActiveAlignerProductionOrderFoundException(alignerJourneyId));

        var reminder = order.getReminders().stream()
                .filter(r -> r.getId().equals(request.getReminderId()))
                .findFirst()
                .orElseThrow(() -> new AlignerProductionOrderReminderNotFound(reminderId, alignerJourneyId));
        reminder.setStatus(ReminderStatus.INACTIVE);

        log.info("Deleted the reminder with id {} from aligner journey id {}", reminderId, alignerJourneyId);
        return alignerJourneyRepository.save(alignerJourney);
    }

    @Override
    @Transactional(noRollbackFor = {BusinessException.class})
    public AlignerJourney updateAlignerProductionOrderReminder(UpdateAlignerProductionReminderRequest request) {
        var alignerJourneyId = request.getAlignerJourneyId();
        var reminderId = request.getReminderId();

        var alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));

        cacheEvict.evictProductionCache(alignerJourney.getDoctorId());
        var statuses = EnumSet.allOf(ProductionStatus.class);
        if (!statuses.isEmpty()) {
            statuses.forEach(status -> {
                String statusKey = status.toString();
                cacheEvict.evictSpecificCache(alignerJourney.getDoctorId(), statusKey);
            });
        }

        var order = alignerJourney.getAlignerProductionOrders().stream()
                .filter(alignerProductionOrder ->
                        alignerProductionOrder.getStatus().equals(OrderStatus.ACTIVE))
                .findFirst()
                .orElseThrow(() -> new NoActiveAlignerProductionOrderFoundException(alignerJourneyId));

        var reminder = order.getReminders().stream()
                .filter(r -> r.getId().equals(request.getReminderId()))
                .findFirst()
                .orElseThrow(() -> new AlignerProductionOrderReminderNotFound(reminderId, alignerJourneyId));

        log.info("Updated the reminder with id {} from aligner journey id {}", reminderId, alignerJourneyId);
        return alignerJourneyRepository.save(alignerJourney);
    }
}
