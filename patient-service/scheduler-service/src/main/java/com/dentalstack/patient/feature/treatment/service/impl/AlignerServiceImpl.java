package com.dentalstack.patient.feature.treatment.service.impl;

import com.dentalstack.patient.application.config.ReminderConfig;
import com.dentalstack.patient.feature.crons.jobs.AlignerReminderInfo;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.events.enums.EventType;
import com.dentalstack.patient.feature.events.metadata.RefinementTreatmentEventMetaData;
import com.dentalstack.patient.feature.events.metadata.event.AlignerChangeEventEventMetadata;
import com.dentalstack.patient.feature.events.metadata.event.ManualAlignerChangeEventEventMetadata;
import com.dentalstack.patient.feature.events.metadata.event.TreatmentSetupEventMetadata;
import com.dentalstack.patient.feature.events.metadata.event.TreatmentStartingEventMetadata;
import com.dentalstack.patient.feature.events.repository.ChargebeeRepository;
import com.dentalstack.patient.feature.events.repository.EventRepository;
import com.dentalstack.patient.feature.events.service.SchedulingService;
import com.dentalstack.patient.feature.events.service.TimelineService;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.notification.service.NotificationService;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientInvitationDetailsRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.reminder.dto.SetDefaultReminderRequest;
import com.dentalstack.patient.feature.reminder.dto.SetReminderRequest;
import com.dentalstack.patient.feature.reminder.entity.ReminderStatus;
import com.dentalstack.patient.feature.reminder.entity.ReminderTriggeredLog;
import com.dentalstack.patient.feature.reminder.enums.DefaultAlignerReminderType;
import com.dentalstack.patient.feature.reminder.enums.Frequency;
import com.dentalstack.patient.feature.reminder.enums.ReminderTriggeredLogEnum;
import com.dentalstack.patient.feature.reminder.exception.ReminderAlreadyExistsException;
import com.dentalstack.patient.feature.reminder.repository.ReminderLogRepository;
import com.dentalstack.patient.feature.tracking.entity.Tracking;
import com.dentalstack.patient.feature.tracking.enums.PatientTrackingStatus;
import com.dentalstack.patient.feature.tracking.enums.Status;
import com.dentalstack.patient.feature.tracking.enums.TrackingType;
import com.dentalstack.patient.feature.tracking.repository.TrackingRepository;
import com.dentalstack.patient.feature.treatment.dto.AlignerChangeRequest;
import com.dentalstack.patient.feature.treatment.dto.AlignerJourneyDetails;
import com.dentalstack.patient.feature.treatment.dto.CreateAlignerJourneyRequest;
import com.dentalstack.patient.feature.treatment.entity.Aligner;
import com.dentalstack.patient.feature.treatment.entity.AlignerJourney;
import com.dentalstack.patient.feature.treatment.entity.CustomAlignerReminder;
import com.dentalstack.patient.feature.treatment.entity.DefaultAlignerReminder;
import com.dentalstack.patient.feature.treatment.entity.action.AlignerAction;
import com.dentalstack.patient.feature.treatment.entity.production.AlignerProductionLab;
import com.dentalstack.patient.feature.treatment.enums.CreationStatus;
import com.dentalstack.patient.feature.treatment.enums.ProductionSubStatus;
import com.dentalstack.patient.feature.treatment.enums.ProgressStatus;
import com.dentalstack.patient.feature.treatment.exception.AlignerJourneyNotFoundException;
import com.dentalstack.patient.feature.treatment.exception.CurrentAlignerNotSetException;
import com.dentalstack.patient.feature.treatment.exception.TreatmentNotStartedException;
import com.dentalstack.patient.feature.treatment.exception.production.lab.AlignerProductionLabNotFoundException;
import com.dentalstack.patient.feature.treatment.repository.*;
import com.dentalstack.patient.feature.treatment.service.AlignerService;
import com.dentalstack.patient.global.enums.UserType;
import com.dentalstack.patient.global.exception.BadRequestException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlignerServiceImpl implements AlignerService {

    private final TimelineService timelineService;
    private final DoctorService doctorService;
    private final ChatService chatService;
    private final SchedulingService schedulingService;
    private final NotificationService notificationService;

    private final AlignerJourneyRepository alignerJourneyRepository;
    private final PatientRepository patientRepository;
    private final CustomAlignerReminderRepository customAlignerReminderRepository;
    private final DefaultAlignerReminderRepository defaultAlignerReminderRepository;
    private final EventRepository eventRepository;
    private final AlignerProductionLabRepository alignerProductionLabRepository;
    private final AlignerRepository alignerRepository;
    private final ReminderConfig scheduleConfig;
    private final TreatmentPlanRepository treatmentPlanRepository;
    private final TrackingRepository trackingRepository;
    private final PatientInvitationDetailsRepository patientInvitationRepository;
    private final ChargebeeRepository chargebeeRepository;
    private final ReminderLogRepository reminderLogRepository;
    private static final int BATCH_SIZE = 100;

    String ALIGNER_FOLDER_NAME = "Aligner";
    String ALIGNERS_FOLDER_NAME = "Aligners";

    @Transactional
    public AlignerJourney generateAlignerJourney(CreateAlignerJourneyRequest request, Tracking tracking) {
        request.validate();

        var productionLabId = request.getProductionLabId();
        var patientId = request.getPatientId();
        var doctorId = request.getDoctorId();

        AlignerProductionLab productionLab = null;
        if (request.getProductionLabId() != null) {
            productionLab = alignerProductionLabRepository
                    .findById(productionLabId)
                    .orElseThrow(() -> new AlignerProductionLabNotFoundException(productionLabId));
        }

        Patient patient =
                patientRepository.findById(patientId).orElseThrow(() -> new PatientNotFoundException(patientId));

        var today = LocalDate.now();
        var newAlignerJourney = AlignerJourney.newTreatment(request, patient, productionLab, tracking);
        if (newAlignerJourney.getProgressStatus().equals(ProgressStatus.IN_PROGRESS)) {
            alignerJourneyRepository
                    .findByPatientIdAndCreationStatus(patientId, CreationStatus.DONE)
                    .forEach(alignerJourney -> {
                        alignerJourney.setProgressStatus(ProgressStatus.DEACTIVATED);
                        alignerJourney.setDoctorTreatmentEndDate(today);
                        alignerJourneyRepository.save(alignerJourney);
                    });
        }
        newAlignerJourney.setTracking(tracking);
        newAlignerJourney.getTracking().setAlignerJourney(newAlignerJourney);
        AlignerJourney alignerJourney = alignerJourneyRepository.save(newAlignerJourney);

        log.info("Aligner journey created for patient {}", patient.getId());

        var doctor = doctorService.getDoctor(request.getDoctorId());
        // Sent notifications
        if (request.getIsTreatmentRefinement() != null && request.getIsTreatmentRefinement()) {
            // notificationService.notificationForRefinementTreatment(
            // doctor.getFirstName(), patient, doctor.isDrToDisplay());
            alignerJourney.getTracking().setPatientTrackingStatus(PatientTrackingStatus.REFINEMENT);
            timelineService.addEvent(
                    alignerJourney.getDoctorId(),
                    UserType.DOCTOR,
                    alignerJourney.getPatient().getId(),
                    UserType.PATIENT,
                    EventType.REFINEMENT_TREATMENT,
                    new RefinementTreatmentEventMetaData(
                            AlignerJourneyDetails.from(alignerJourney), tracking.getPatientDataFillStatus()));
        } else if (patient.getEmail() != null && !patient.getEmail().isEmpty()) {
            // notificationService.notificationForTreatmentSetup(alignerJourney, doctor);
        }

        // Store treatment creation event
        timelineService.addEvent(
                doctorId,
                UserType.DOCTOR,
                patientId,
                UserType.PATIENT,
                EventType.TREATMENT_SETUP,
                TreatmentSetupEventMetadata.builder()
                        .alignerJourneyDetails(AlignerJourneyDetails.from(alignerJourney))
                        .patientDataFillStatus(tracking.getPatientDataFillStatus())
                        .build());
        var treatmentStartDate = alignerJourney.getDoctorTreatmentStartDate();
        if (today.equals(treatmentStartDate) || today.plusDays(1).equals(treatmentStartDate)) {
            timelineService.addEvent(
                    patient.getId(),
                    UserType.PATIENT,
                    alignerJourney.getDoctorId(),
                    UserType.DOCTOR,
                    EventType.TREATMENT_STARTING,
                    new TreatmentStartingEventMetadata(AlignerJourneyDetails.from(alignerJourney)));
        }

        // Custom and default reminder
        alignerJourney = setReminderForAlignerJourney(alignerJourney.getId());

        // Inactivate invitation accepted events.
        eventRepository
                .findByUserIdAndUserTypeAndForUserIdAndForUserTypeAndActiveAndType(
                        patientId,
                        UserType.PATIENT,
                        doctorId,
                        UserType.DOCTOR,
                        true,
                        EventType.PATIENT_INVITATION_ACCEPTED)
                .forEach(event -> {
                    event.setActive(false);
                    eventRepository.save(event);
                });
        eventRepository
                .findByUserIdAndUserTypeAndForUserIdAndForUserTypeAndActiveAndType(
                        doctorId,
                        UserType.DOCTOR,
                        patientId,
                        UserType.PATIENT,
                        true,
                        EventType.DOCTOR_INVITATION_ACCEPTED)
                .forEach(event -> {
                    event.setActive(false);
                    eventRepository.save(event);
                });

        return alignerJourney;
    }

    private AlignerJourney setReminderForAlignerJourney(Long alignerJourneyId) {
        var alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));
        try {
            // Parse the time strings from the configuration
            LocalTime wearAfterBreakfastTime = LocalTime.parse(
                    scheduleConfig.getWearAfterBreakfastTime(), DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH));
            LocalTime wearAfterLunchTime = LocalTime.parse(
                    scheduleConfig.getWearAfterLunchTime(), DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH));
            LocalTime wearAfterDinnerTime = LocalTime.parse(
                    scheduleConfig.getWearAfterDinnerTime(), DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH));
            LocalTime changeAlignerTime = LocalTime.parse(
                    scheduleConfig.getChangeAlignerTime(), DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH));

            // Set reminders using the parsed times
            setCustomReminder(
                    alignerJourney,
                    SetReminderRequest.from(
                            alignerJourneyId, "Wear after breakfast", wearAfterBreakfastTime, Frequency.DAILY));
            setCustomReminder(
                    alignerJourney,
                    SetReminderRequest.from(alignerJourneyId, "Wear after lunch", wearAfterLunchTime, Frequency.DAILY));
            setCustomReminder(
                    alignerJourney,
                    SetReminderRequest.from(
                            alignerJourneyId, "Wear after dinner", wearAfterDinnerTime, Frequency.DAILY));

            if (!alignerJourney.shouldAskPatientForCurrentAlignerNo()
                    && !alignerJourney.shouldAskPatientForTreatmentStartDate()) {
                setDefaultReminder(
                        alignerJourney,
                        SetDefaultReminderRequest.from(alignerJourneyId, "Change Aligner", changeAlignerTime));
            }

            return alignerJourney;
        } catch (DateTimeParseException ignored) {
            log.warn("Failed to set reminders for aligner journey {}", alignerJourneyId);
            return alignerJourney;
        }
    }

    @Override
    public List<AlignerJourney> getAlignerJourney(
            long patientId,
            List<CreationStatus> creationStatuses,
            List<ProgressStatus> progressStatuses,
            Long alignerJourneyId) {
        if (alignerJourneyId != null) {
            return List.of(alignerJourneyRepository
                    .findById(alignerJourneyId)
                    .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId)));
        }
        return alignerJourneyRepository.findByPatientIdAndCreationStatusInAndProgressStatusIn(
                patientId, creationStatuses, progressStatuses);
    }

    @Override
    public AlignerJourney getAlignerJourney(Long alignerJourneyId) {
        return alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));
    }

    public void setCustomReminder(AlignerJourney alignerJourney, SetReminderRequest request) {
        var alignerJourneyId = alignerJourney.getId();
        if (alignerJourney.getProgressStatus().equals(ProgressStatus.DEACTIVATED)) {
            return;
        }

        LocalDate date = request.getDate();
        if (request.getFrequency().equals(Frequency.DAILY)) {
            date = null;
        } else if (request.getFrequency().equals(Frequency.ONE_TIME) && date == null) {
            date = LocalDate.now();
        }

        LocalTime time = request.getTime();
        customAlignerReminderRepository
                .findByNameAndDateAndTimeAndAlignerJourneyIdAndFrequency(
                        request.getName(), date, time, alignerJourneyId, request.getFrequency())
                .ifPresent(r -> {
                    throw new ReminderAlreadyExistsException(r, alignerJourneyId);
                });

        var reminder = CustomAlignerReminder.from(request, date, alignerJourney);
        reminder = customAlignerReminderRepository.save(reminder);

        alignerJourney.getCustomReminders().add(reminder);

        schedulingService.scheduleReminder(AlignerReminderInfo.from(reminder, request.getMessageIndex()));
    }

    public void setDefaultReminder(AlignerJourney alignerJourney, SetDefaultReminderRequest request) {

        final long alignerJourneyId = alignerJourney.getId();
        final DefaultAlignerReminderType type = request.getDefaultAlignerReminderType();
        var currentAligner = alignerJourney.getCurrentAligner();
        alignerJourney.isTreatmentDeactivated();

        if (currentAligner == null) {
            throw new TreatmentNotStartedException(request.getAlignerJourneyId());
        }

        LocalTime time = request.getTime();
        defaultAlignerReminderRepository
                .findByNameAndAlignerJourneyIdAndTypeAndTime(request.getName(), alignerJourneyId, type, time)
                .ifPresent(r -> {
                    throw new ReminderAlreadyExistsException(r, alignerJourneyId);
                });

        var reminder = DefaultAlignerReminder.from(request, alignerJourney);
        reminder = defaultAlignerReminderRepository.save(reminder);

        alignerJourney.getDefaultAlignerReminders().add(reminder);

        // Schedule the default reminder for the current aligner.
        // The reminders for the next aligner will be scheduled when aligner is changed.
        // This is done to simplify the reminders handling when aligner is not changed on the actual
        // changed date.
        schedulingService.scheduleDefaultReminderForCurrentAligner(reminder);
    }

    @Override
    public AlignerJourney manualAlignerChange(AlignerChangeRequest request) {
        final Long patientId = request.getPatientId();
        final long alignerJourneyId = request.getAlignerJourneyId();
        final int newAlignerNo = request.getNewAlignerNo();
        final LocalDate changeDate = request.getPreviousAlignerChangeDate();
        var today = LocalDate.now();
        if (!changeDate.equals(today) && changeDate.isAfter(today)) {
            throw new BadRequestException("Aligner change date must be today's date or a date before today");
        }
        AlignerJourney alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));

        alignerJourney.isTreatmentDeactivated();

        alignerJourney.validate();
        Integer previousAlignerNo = alignerJourney.getCurrentAlignerNo();
        if (previousAlignerNo == null) {
            throw new CurrentAlignerNotSetException(alignerJourneyId);
        }

        alignerJourney.changeCurrentAligner(newAlignerNo, changeDate);
        Aligner previousAligner = alignerJourney.getAligner(previousAlignerNo);

        Aligner currentAligner = alignerJourney.getCurrentAligner();
        if (currentAligner == null) {
            throw new CurrentAlignerNotSetException(alignerJourneyId);
        }
        var newAligner = alignerJourney.getAligner(newAlignerNo);
        newAligner.getAlignerProduction().changeStatus(ProductionSubStatus.ISSUED_TO_PATIENT);

        // Save aligner change action
        var alignerChangeAction = AlignerAction.createForceAlignerChangeAction(
                patientId, previousAligner, newAligner.getId(), null, null, null, request.getAlignerActionType());
        previousAligner.getActions().add(alignerChangeAction);

        if (request.getIsManual() != null && request.getIsManual()) {
            timelineService.addEvent(
                    patientId,
                    UserType.PATIENT,
                    alignerJourney.getDoctorId(),
                    UserType.DOCTOR,
                    EventType.MANUAL_ALIGNER_CHANGE,
                    ManualAlignerChangeEventEventMetadata.from(previousAligner, currentAligner, alignerChangeAction));
        } else {
            timelineService.addEvent(
                    patientId,
                    UserType.PATIENT,
                    alignerJourney.getDoctorId(),
                    UserType.DOCTOR,
                    EventType.ALIGNER_CHANGE,
                    AlignerChangeEventEventMetadata.forceAlignerChange(
                            previousAligner, currentAligner, alignerChangeAction));
        }

        return alignerJourneyRepository.save(alignerJourney);
    }

    @Override
    public synchronized void processAlignerChanges() {
        var alignerJourneys = alignerJourneyRepository.findAlignerJourneysWithTrackingTypeAndStatus(
                TrackingType.MANUAL, Status.ACTIVE);
        var exists = reminderLogRepository.existsByReminderTriggeredLogEnumAndTriggeredAt(
                ReminderTriggeredLogEnum.MANUAL_ALIGNER_CHANGE, LocalDate.now());

        if (!exists) {
            for (AlignerJourney alignerJourney : alignerJourneys) {
                try {
                    if (alignerJourney.getTracking().getTrackingType().equals(TrackingType.MANUAL)) {
                        processIndividualAlignerJourney(alignerJourney);

                        var manualAlignerChangeReminderLog = ReminderTriggeredLog.from(
                                alignerJourney.getId(),
                                ReminderStatus.ACTIVE,
                                ReminderTriggeredLogEnum.MANUAL_ALIGNER_CHANGE);
                        reminderLogRepository.save(manualAlignerChangeReminderLog);
                    }
                } catch (Exception e) {
                    log.error("Error processing aligner journey with ID: " + alignerJourney.getId(), e);
                    var reminderLog = ReminderTriggeredLog.from(
                            alignerJourney.getId(),
                            ReminderStatus.FAILED,
                            ReminderTriggeredLogEnum.MANUAL_ALIGNER_CHANGE);
                    reminderLogRepository.save(reminderLog);
                }
            }
        }
    }

    private void processIndividualAlignerJourney(AlignerJourney alignerJourney) {
        assert alignerJourney != null;
        LocalDate alignerChangeDate = alignerJourney.nextAlignerChangeDate();
        Aligner currentAligner = alignerJourney.getCurrentAligner();

        if (currentAligner != null && alignerChangeDate != null && alignerChangeDate.isEqual(LocalDate.now())) {
            int currentAlignerNo = currentAligner.getSrNo();
            int nextAlignerNo = currentAlignerNo + 1;
            var doctor = doctorService.getDoctor(alignerJourney.getDoctorId());

            manualAlignerChange(AlignerChangeRequest.manualAlignerChange(
                    alignerJourney, nextAlignerNo, currentAligner.getEndDate()));

            notificationService.notificationForAlignerChangeScheduled(
                    alignerJourney.getPatient(), doctor, currentAlignerNo, nextAlignerNo, alignerJourney.getId());

            var manualAlignerChangeReminderLog = ReminderTriggeredLog.from(
                    alignerJourney.getId(), ReminderStatus.ACTIVE, ReminderTriggeredLogEnum.MANUAL_ALIGNER_CHANGE);
            reminderLogRepository.save(manualAlignerChangeReminderLog);

            log.info("Manual aligner changes completed for journey ID: " + alignerJourney.getId());
        }
    }

    @Transactional
    @Override
    public void updateAlignerProductionStatus() {
        LocalDate currentDate = LocalDate.now();
        int pageNumber = 0;
        boolean hasMore = true;
        int totalProcessed = 0;

        log.info("Starting batch update of aligner production statuses for date: {}", currentDate);

        while (hasMore) {
            Page<Aligner> alignerPage = alignerRepository.findByProductionStatusAndStartDateLessThanEqual(
                    currentDate, PageRequest.of(pageNumber, BATCH_SIZE));

            if (alignerPage.hasContent()) {
                List<Aligner> aligners = alignerPage.getContent();
                updateAlignerBatch(aligners);
                totalProcessed += aligners.size();
                log.info(
                        "Processed batch {} with {} aligners. Total processed: {}",
                        pageNumber + 1,
                        aligners.size(),
                        totalProcessed);
            }

            hasMore = alignerPage.hasNext();
            pageNumber++;
        }

        log.info("Completed aligner production status update. Total aligners processed: {}", totalProcessed);
    }

    @Transactional
    protected void updateAlignerBatch(List<Aligner> aligners) {
        try {
            for (Aligner aligner : aligners) {
                aligner.getAlignerProduction().changeStatus(ProductionSubStatus.ISSUED_TO_PATIENT);
            }
            alignerRepository.saveAll(aligners);
        } catch (Exception e) {
            log.error("Error updating aligner batch: ", e);
            throw e;
        }
    }
}
