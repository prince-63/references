package com.dentalstack.patient.feature.aligner.service.impl;

import static com.dentalstack.patient.feature.aligner.util.AlignerJourneyUtils.filterPhotoWithName;
import static com.dentalstack.patient.feature.storage.files.service.FilesService.*;
import static com.dentalstack.patient.feature.workflow.core.task_tracker.service.PatientTaskTrackerServiceImpl.CANCELLED;
import static com.dentalstack.patient.feature.workflow.core.task_tracker.service.PatientTaskTrackerServiceImpl.ONGOING_PRODUCT_LIST;

import com.amazonaws.services.kms.model.NotFoundException;
import com.dentalstack.patient.application.config.ReminderConfig;
import com.dentalstack.patient.feature.aligner.dto.aligner.*;
import com.dentalstack.patient.feature.aligner.dto.aligner.ChangeAlignerRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.action.*;
import com.dentalstack.patient.feature.aligner.dto.aligner.dailyweartime.DailyWearTimeLogEntry;
import com.dentalstack.patient.feature.aligner.dto.aligner.dailyweartime.DailyWearTimeLogsResponse;
import com.dentalstack.patient.feature.aligner.dto.aligner.dailyweartime.PaginationInfo;
import com.dentalstack.patient.feature.aligner.dto.aligner.dailyweartime.WearTimeSession;
import com.dentalstack.patient.feature.aligner.dto.aligner.feedback.AddAlignerFeedbackRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.feedback.AlignerCheckInFeedbackDetails;
import com.dentalstack.patient.feature.aligner.dto.aligner.feedback.MiscAlignerFeedbackDetails;
import com.dentalstack.patient.feature.aligner.dto.aligner.production.UpdateAlignerProductionRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.v2.CreateAlignerJourneyRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.v2.CurrentAlignerDetails;
import com.dentalstack.patient.feature.aligner.dto.alignertreatment.TreatmentDetails;
import com.dentalstack.patient.feature.aligner.entity.*;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerAction;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerActionType;
import com.dentalstack.patient.feature.aligner.entity.action.metadata.AlignerChangeActionMetadata;
import com.dentalstack.patient.feature.aligner.entity.action.metadata.AlignerCheckInMetadata;
import com.dentalstack.patient.feature.aligner.entity.action.metadata.AlignerIssueActionMetadata;
import com.dentalstack.patient.feature.aligner.entity.production.AlignerProductionLab;
import com.dentalstack.patient.feature.aligner.enums.ProductionSubStatus;
import com.dentalstack.patient.feature.aligner.enums.TrackingType;
import com.dentalstack.patient.feature.aligner.enums.aligner.*;
import com.dentalstack.patient.feature.aligner.enums.aligner.action.AlignerUpdateCategory;
import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.aligner.exception.aligner.*;
import com.dentalstack.patient.feature.aligner.exception.aligner.action.AlignerActionNotFoundException;
import com.dentalstack.patient.feature.aligner.exception.aligner.production.lab.AlignerProductionLabNotFoundException;
import com.dentalstack.patient.feature.aligner.projection.AlignerSummary;
import com.dentalstack.patient.feature.aligner.repository.*;
import com.dentalstack.patient.feature.aligner.repository.action.AlignerActionRepository;
import com.dentalstack.patient.feature.aligner.repository.action.AlignerRepository;
import com.dentalstack.patient.feature.aligner.service.AlignerService;
import com.dentalstack.patient.feature.aligner.service.production.AlignerProductionService;
import com.dentalstack.patient.feature.aligner.util.AlignerChangeEventUtil;
import com.dentalstack.patient.feature.appointment.entity.AppointmentReminder;
import com.dentalstack.patient.feature.appointment.repository.AppointmentReminderRepository;
import com.dentalstack.patient.feature.dashboardlabel.cache.DashboardCacheEvictService;
import com.dentalstack.patient.feature.doctor.dto.DoctorDetails;
import com.dentalstack.patient.feature.doctor.dto.DoctorPatientDetails;
import com.dentalstack.patient.feature.doctor.entity.Doctor;
import com.dentalstack.patient.feature.doctor.entity.PatientDoctorOrganization;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.doctor.repository.DoctorRepository;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.invitation.repository.PatientInvitationDetailsRepository;
import com.dentalstack.patient.feature.jobs.AlignerReminderInfo;
import com.dentalstack.patient.feature.notification.dto.AlignerDetailsReceivedReq;
import com.dentalstack.patient.feature.notification.dto.SendNotificationRequest;
import com.dentalstack.patient.feature.notification.dto.SmsToDoctor;
import com.dentalstack.patient.feature.notification.dto.WhatsAppRequestBuilder;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.notification.service.NotificationService;
import com.dentalstack.patient.feature.notification.util.XOrganizationNameResolver;
import com.dentalstack.patient.feature.order.enums.OrderTreatmentPlanStatus;
import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.reminder.dto.SetDefaultReminderRequest;
import com.dentalstack.patient.feature.reminder.dto.SetReminderRequest;
import com.dentalstack.patient.feature.reminder.dto.UpdateCustomReminderRequest;
import com.dentalstack.patient.feature.reminder.dto.UpdateDefaultReminderRequest;
import com.dentalstack.patient.feature.reminder.entity.ReminderStatus;
import com.dentalstack.patient.feature.reminder.entity.ReminderTriggeredLog;
import com.dentalstack.patient.feature.reminder.enums.DefaultAlignerReminderType;
import com.dentalstack.patient.feature.reminder.enums.Frequency;
import com.dentalstack.patient.feature.reminder.enums.ReminderTriggeredLogEnum;
import com.dentalstack.patient.feature.reminder.exception.CustomReminderNotFoundException;
import com.dentalstack.patient.feature.reminder.exception.DefaultReminderNotFoundException;
import com.dentalstack.patient.feature.reminder.exception.ReminderAlreadyExistsException;
import com.dentalstack.patient.feature.reminder.repository.ReminderLogRepository;
import com.dentalstack.patient.feature.reminder.service.SchedulingService;
import com.dentalstack.patient.feature.storage.drive.async.DriveAsyncHelper;
import com.dentalstack.patient.feature.storage.files.dto.CreateFolderHierarchyRequest;
import com.dentalstack.patient.feature.storage.files.dto.CreateFolderRequest;
import com.dentalstack.patient.feature.storage.files.service.FilesService;
import com.dentalstack.patient.feature.storage.gallery.dto.AlignerPhotoDetails;
import com.dentalstack.patient.feature.storage.gallery.service.GalleryService;
import com.dentalstack.patient.feature.subcription.exception.StorageLimitExceededException;
import com.dentalstack.patient.feature.subcription.repository.SubscriptionUserMappingRepository;
import com.dentalstack.patient.feature.subcription.service.SubscriptionService;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.RefinementTreatmentEventMetaData;
import com.dentalstack.patient.feature.timeline.metadata.TreatmentPausedEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.*;
import com.dentalstack.patient.feature.timeline.metadata.feedback.AlignerChangeFeedbackDetails;
import com.dentalstack.patient.feature.timeline.metadata.feedback.AlignerFeedbackType;
import com.dentalstack.patient.feature.timeline.repository.EventRepository;
import com.dentalstack.patient.feature.timeline.service.TimelineService;
import com.dentalstack.patient.feature.tracking.entity.Tracking;
import com.dentalstack.patient.feature.tracking.enums.PatientDataFillStatus;
import com.dentalstack.patient.feature.tracking.enums.PatientTrackingStatus;
import com.dentalstack.patient.feature.tracking.enums.Status;
import com.dentalstack.patient.feature.tracking.exception.TrackingNotFoundException;
import com.dentalstack.patient.feature.tracking.repository.TrackingRepository;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.dentalstack.patient.feature.treatment.exception.ActiveTreatmentPlanFoundException;
import com.dentalstack.patient.feature.treatment.exception.TreatmentNotFoundException;
import com.dentalstack.patient.feature.treatment.exception.TreatmentPlanNotFoundException;
import com.dentalstack.patient.feature.treatment.repository.TreatmentPlanRepository;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.workflow.core.task_tracker.repository.PatientTaskTrackerRepository;
import com.dentalstack.patient.feature.workflow.core.workflows.repository.WorkflowStatusRepository;
import com.dentalstack.patient.global.dto.UserId;
import com.dentalstack.patient.global.enums.ProductTypeName;
import com.dentalstack.patient.global.exception.BadRequestException;
import com.dentalstack.patient.global.exception.BusinessException;
import jakarta.annotation.Nullable;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlignerServiceImpl implements AlignerService {

    private final TimelineService timelineService;
    private final GalleryService galleryService;
    private final DoctorService doctorService;
    private final ChatService chatService;
    private final AlignerProductionService alignerProductionService;
    private final SchedulingService schedulingService;
    private final NotificationService notificationService;
    private final PatientTaskTrackerRepository patientTaskTrackerRepository;
    private final WorkflowStatusRepository workflowStatusRepository;

    private final AlignerJourneyRepository alignerJourneyRepository;
    private final PatientRepository patientRepository;
    private final CustomAlignerReminderRepository customAlignerReminderRepository;
    private final DefaultAlignerReminderRepository defaultAlignerReminderRepository;
    private final EventRepository eventRepository;
    private final AlignerFeedbackRepository alignerFeedbackRepository;
    private final AlignerProductionLabRepository alignerProductionLabRepository;
    private final AlignerActionRepository alignerActionRepository;
    private final AlignerRepository alignerRepository;
    private final AlignerPhotoRepository alignerPhotoRepository;
    private final ReminderConfig scheduleConfig;
    private final TreatmentPlanRepository treatmentPlanRepository;
    private final SubscriptionUserMappingRepository subscriptionUserMappingRepository;
    private final TrackingRepository trackingRepository;
    private final DailyAlignerWearTimeRepository dailyAlignerWearTimeRepository;
    private final FilesService filesService;
    private final PatientInvitationDetailsRepository patientInvitationRepository;
    private final DriveAsyncHelper driveAsyncHelper;

    @Lazy
    @Autowired
    private SubscriptionService subscriptionService;

    private final AppointmentReminderRepository appointmentReminderRepository;
    private final ReminderLogRepository reminderLogRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private static final int BATCH_SIZE = 100;
    private final DashboardCacheEvictService dashboardCacheEvictService;
    private final UserProfileRepository userProfileRepository;
    private final DoctorRepository doctorRepository;
    private final WhatsAppRequestBuilder whatsAppRequestBuilder;
    private final XOrganizationNameResolver xOrgNameResolver;

    // ...existing code...

    String ALIGNER_FOLDER_NAME = "Aligner";
    String ALIGNERS_FOLDER_NAME = "Aligners";

    @Override
    @Transactional
    public AlignerJourney createAlignerJourney(
            com.dentalstack.patient.feature.aligner.dto.aligner.CreateAlignerJourneyRequest request) {
        request.validate();

        var productionLabId = request.getProductionLabId();
        var patientId = request.getPatientId();
        var doctorId = request.getDoctorId();
        var productionLab = alignerProductionLabRepository
                .findById(productionLabId)
                .orElseThrow(() -> new AlignerProductionLabNotFoundException(productionLabId));

        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        var userProfile = patient.getDoctorOrganization().getUserProfile();

        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        var today = LocalDate.now();
        var tracking = new Tracking();
        tracking.setTrackingType(TrackingType.MANUAL);
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

        AlignerJourney alignerJourney = alignerJourneyRepository.save(newAlignerJourney);
        log.info("Aligner journey created for patient {}", patient.getId());

        timelineService.addEvent(
                doctorId,
                UserType.DOCTOR,
                patientId,
                UserType.PATIENT,
                EventType.TREATMENT_SETUP,
                TreatmentSetupEventMetadata.builder()
                        .alignerJourneyDetails(AlignerJourneyDetails.from(alignerJourney))
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

        alignerJourney = setReminderForAlignerJourney(alignerJourney.getId());

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

    @Transactional
    public AlignerJourney generateAlignerJourney(
            com.dentalstack.patient.feature.aligner.dto.aligner.CreateAlignerJourneyRequest request,
            Tracking tracking) {
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

        if (request.getIsTreatmentRefinement() != null && request.getIsTreatmentRefinement()) {

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

        }

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

        alignerJourney = setReminderForAlignerJourney(alignerJourney.getId());

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

            LocalTime wearAfterBreakfastTime = LocalTime.parse(
                    scheduleConfig.getWearAfterBreakfastTime(), DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH));
            LocalTime wearAfterLunchTime = LocalTime.parse(
                    scheduleConfig.getWearAfterLunchTime(), DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH));
            LocalTime wearAfterDinnerTime = LocalTime.parse(
                    scheduleConfig.getWearAfterDinnerTime(), DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH));
            LocalTime changeAlignerTime = LocalTime.parse(
                    scheduleConfig.getChangeAlignerTime(), DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH));

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
    @Transactional
    public AlignerJourney startAlignerJourney(StartAlignerJourneyRequest request) {
        var alignerJourneyId = request.getAlignerJourneyId();
        var patientId = request.getPatientId();

        var alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));
        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(alignerJourney.getPatient().getId())
                .orElseThrow(() ->
                        new PatientNotFoundException(alignerJourney.getPatient().getId()));

        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        alignerJourney.isTreatmentDeactivated();

        if (!alignerJourney.getPatient().getId().equals(patientId)) {
            throw AlignerJourneyNotFoundException.ofPatientId(patientId);
        }

        if (!alignerJourney.getCreationStatus().equals(CreationStatus.DONE)) {
            throw new BadRequestException(
                    String.format("Aligner journey %d is not completely created yet.", alignerJourneyId));
        }
        if (alignerJourney.getDoctorTreatmentStartDate().isAfter(LocalDate.now())) {
            throw new BadRequestException(String.format(
                    "Cannot start an aligner journey %d before the start date %s set by doctor",
                    alignerJourneyId, alignerJourney.getDoctorTreatmentStartDate()));
        }
        alignerJourney.validate();

        var today = LocalDate.now();

        alignerJourney.setPatientTreatmentStartDate(today);
        alignerJourney.setProgressStatus(ProgressStatus.IN_PROGRESS);

        log.info("Started the aligner journey {} on date {} by patient {}", alignerJourneyId, today, patientId);
        return alignerJourneyRepository.save(alignerJourney);
    }

    @Transactional(readOnly = true)
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

        Long doctorId = patientDoctorOrganizationRepository.findDoctorIdFromUserProfile(patientId);

        List<AlignerJourney> alignerJourneys =
                alignerJourneyRepository.findByPatientIdAndCreationStatusInAndProgressStatusIn(
                        patientId, creationStatuses, progressStatuses);
        alignerJourneys.forEach(alg -> {
            alg.setDoctorId(doctorId);
        });
        return alignerJourneys;
    }

    @Transactional(readOnly = true)
    @Override
    public AllAlignerJourneyDetails getAlignerJourneyDetails(
            long patientId,
            List<CreationStatus> creationStatuses,
            List<ProgressStatus> progressStatuses,
            Long alignerJourneyId) {
        List<AlignerJourney> journeys =
                getAlignerJourney(patientId, creationStatuses, progressStatuses, alignerJourneyId);
        AllAlignerJourneyDetails resp = new AllAlignerJourneyDetails();
        journeys.forEach(resp::addAlignerJourney);
        resp.getAlignerJourneys().sort(Comparator.comparing(AlignerJourneyDetails::getAlignerJourneyId));
        return resp;
    }

    @Override
    @Transactional(readOnly = true)
    public AlignerJourney getAlignerJourney(Long alignerJourneyId) {
        return alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));
    }

    @Override
    @Transactional
    public AlignerJourney updateAlignerJourney(UpdateAlignerJourneyRequest request) {
        final long alignerJourneyId = request.getAlignerJourneyId();
        AlignerJourney alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));

        alignerJourney.isTreatmentDeactivated();

        AlignerJourney finalAlignerJourney1 = alignerJourney;
        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(alignerJourney.getPatient().getId())
                .orElseThrow(() -> new PatientNotFoundException(
                        finalAlignerJourney1.getPatient().getId()));

        var userProfile = patient.getDoctorOrganization().getUserProfile();

        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        var today = LocalDate.now();
        var currentAlignerNo = request.getCurrentAlignerNo(alignerJourney);
        var newTreatmentStartDate = request.getDoctorTreatmentStartDate();

        var updateDetails = request.updateDetails(alignerJourney);

        if (updateDetails.isDoctorTreatmentStartDateUpdated()
                && newTreatmentStartDate.isBefore(today)
                && !alignerJourney.getTreatmentStage().equals(TreatmentStage.MID)) {
            throw new BadRequestException("New treatment start date cannot be in past");
        }

        if (updateDetails.isDoctorTreatmentStartDateSet())
            if (updateDetails.isAlignerStartDateUpdated()) {
                defaultAlignerReminderRepository
                        .findByAlignerJourneyId(alignerJourneyId)
                        .forEach(reminder -> {
                            schedulingService.deleteDefaultReminders(reminder);
                            schedulingService.scheduleDefaultReminderForCurrentAligner(reminder);
                        });
            }

        DoctorDetails doctor = doctorService.getDoctor(alignerJourney.getDoctorId());

        ModelMapper mapper = new ModelMapper();
        mapper.getConfiguration()
                .setSkipNullEnabled(true)
                .setMatchingStrategy(MatchingStrategies.STANDARD)
                .setAmbiguityIgnored(true);
        mapper.map(request, alignerJourney);

        if (updateDetails.isCurrentAlignerNoSet()) {
            alignerJourney.setCurrentAligner(currentAlignerNo);
        }

        if (updateDetails.isDoctorTreatmentStartDateSet() || updateDetails.isAlignerStartDateUpdated()) {

            if (newTreatmentStartDate.equals(today)) {
                log.info("Treatment start date changed to today {}. Starting the treatment", today);
                alignerJourney.setProgressStatus(ProgressStatus.IN_PROGRESS);
            } else if (newTreatmentStartDate.equals(today.plusDays(1))) {
                timelineService.addEvent(
                        alignerJourney.getPatient().getId(),
                        UserType.PATIENT,
                        alignerJourney.getDoctorId(),
                        UserType.DOCTOR,
                        EventType.TREATMENT_STARTING,
                        new TreatmentStartingEventMetadata(AlignerJourneyDetails.from(alignerJourney)));
            }
        }

        if (request.getAligners() != null && !request.getAligners().isEmpty()) {
            alignerJourney.updateAllAligners(request.getAligners());
            log.info("Updated the aligners of journey {}", alignerJourney.getId());
        }

        alignerJourney = alignerJourneyRepository.save(alignerJourney);

        AlignerJourney finalAlignerJourney = alignerJourney;
        var patientDoctorOrganization = patientDoctorOrganizationRepository
                .findPatientDoctorOrganizationsWithPatientByPatientId(
                        alignerJourney.getPatient().getId())
                .orElseThrow(() -> new PatientNotFoundException(
                        finalAlignerJourney.getPatient().getId()));
        var displayName = patientDoctorOrganization.getUserProfile().getPracticeName();

        notificationService.notificationForAlignerJourneyUpdates(
                displayName, updateDetails, patient, doctor.isDrToDisplay());

        if (request.getUpdaterUserType().equals(UserType.PATIENT)
                && (updateDetails.isAlignerStartDateUpdated() || updateDetails.isCurrentAlignerNoSet())) {
            chatService.sendAlignerDetailsReceivedEmail(
                    AlignerDetailsReceivedReq.from(patient, doctor, alignerJourneyId));
            chatService.sendSmsToDoctorForAlignerDetailsFilledByPatient(SmsToDoctor.from(doctor, patient));
        }

        if ((updateDetails.isCurrentAlignerNoSet() || updateDetails.isDoctorTreatmentStartDateSet())
                && !alignerJourney.shouldAskPatientForTreatmentStartDate()
                && !alignerJourney.shouldAskPatientForCurrentAlignerNo()) {

            timelineService.addEvent(
                    alignerJourney.getPatient().getId(),
                    UserType.PATIENT,
                    alignerJourney.getDoctorId(),
                    UserType.DOCTOR,
                    EventType.TREATMENT_CREATION_COMPLETE,
                    new TreatmentCreationCompleteEventMetadata(AlignerJourneyDetails.from(alignerJourney)));
        }

        log.info("Aligner journey updated of id {}", alignerJourneyId);
        return alignerJourney;
    }

    @Override
    @Transactional
    public AlignerJourney updateAlignerJourneyStartDate(long alignerJourneyId, LocalDate newStartDate) {
        AlignerJourney alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));
        alignerJourney.isTreatmentDeactivated();

        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(alignerJourney.getPatient().getId())
                .orElseThrow(() ->
                        new PatientNotFoundException(alignerJourney.getPatient().getId()));

        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        if (!alignerJourney.getProgressStatus().equals(ProgressStatus.NOT_STARTED)) {
            throw new BadRequestException("Start date can only be changed of the treatment that is not started yet.");
        }

        alignerJourney.changeStartDate(newStartDate);
        if (alignerJourney.getTracking() != null) {
            var treatmentPlan = alignerJourney.getTracking().getTreatmentPlan();
            treatmentPlan.setStartDate(newStartDate);
            treatmentPlanRepository.save(treatmentPlan);
        }
        log.info("Changed the start date of aligner journey {} to {}", alignerJourneyId, newStartDate);
        return alignerJourneyRepository.save(alignerJourney);
    }

    @Override
    @Transactional
    public AlignerJourney setDailyWearTime(
            long patientId, Long wearingDurationInSec, @Nullable LocalDate date, @Nullable Integer alignerSrNo) {
        if (patientRepository.findById(patientId).isEmpty()) {
            throw new PatientNotFoundException(patientId);
        }

        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        AlignerJourney alignerJourney =
                alignerJourneyRepository
                        .findByPatientIdAndProgressStatus(patientId, ProgressStatus.IN_PROGRESS)
                        .stream()
                        .findAny()
                        .orElseThrow(() -> NoActiveAlignerJourneyFoundException.ofPatientId(patientId));
        alignerJourney.validate();
        alignerJourney.isTreatmentDeactivated();
        if (alignerSrNo != null
                && (alignerSrNo <= 0
                        || alignerSrNo > alignerJourney.getAligners().size())) {
            throw new BadRequestException("Invalid aligner sr no");
        }

        var alignerJourneyId = alignerJourney.getId();

        Aligner aligner = null;
        if (alignerSrNo != null) {
            aligner = alignerJourney.getAligner(alignerSrNo);
        } else {
            aligner = alignerJourney.getCurrentAligner();
        }

        if (aligner == null) {
            throw new CurrentAlignerNotSetException(alignerJourney.getId());
        }
        var treatmentStartDate = alignerJourney.doctorTreatmentStartDate();
        var today = LocalDate.now();
        LocalDate dateToUpdate = date != null ? date : today;

        if (dateToUpdate.isBefore(treatmentStartDate)) {
            throw new InvalidAttemptToSetWearTime(patientId, alignerJourneyId, treatmentStartDate);
        }

        var record = aligner.addOrUpdateDailyWearTimeRecord(wearingDurationInSec, dateToUpdate);
        if (dateToUpdate.equals(today)
                && record.getTotalWearTimeSecs() >= alignerJourney.getRecommendedHoursToWearAligners() * 3600L
                && (alignerJourney.getWearTimeNotificationTriggeredAt() == null
                        || !alignerJourney.getWearTimeNotificationTriggeredAt().equals(today))) {

            notificationService.notificationForDailyGoalComplete(patient);
            alignerJourney.setWearTimeNotificationTriggeredAt(LocalDate.now());

            var manualAlignerChangeReminderLog = ReminderTriggeredLog.from(
                    alignerJourney.getId(), ReminderStatus.ACTIVE, ReminderTriggeredLogEnum.DAILY_GOAL_WEAR_TIME);
            reminderLogRepository.save(manualAlignerChangeReminderLog);
        }

        return alignerJourneyRepository.save(alignerJourney);
    }

    @Transactional
    @Override
    public AlignerJourney setCustomReminder(SetReminderRequest request) {
        final long alignerJourneyId = request.getAlignerJourneyId();
        AlignerJourney alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));
        alignerJourney.validate();

        alignerJourney.isTreatmentDeactivated();

        setCustomReminder(alignerJourney, request);

        log.info(
                "Custom reminder for {}:{} set for aligner journey {}",
                request.getDate(),
                request.getTime(),
                alignerJourneyId);
        return alignerJourneyRepository.save(alignerJourney);
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

    @Override
    @Transactional
    public AlignerJourney setDefaultReminder(SetDefaultReminderRequest request) {
        final long alignerJourneyId = request.getAlignerJourneyId();
        final DefaultAlignerReminderType type = request.getDefaultAlignerReminderType();
        AlignerJourney alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));
        alignerJourney.validate();
        alignerJourney.isTreatmentDeactivated();

        setDefaultReminder(alignerJourney, request);

        log.info(
                "Default reminder of type {} for {} set for aligner journey {}",
                type,
                request.getTime(),
                alignerJourneyId);
        return alignerJourneyRepository.save(alignerJourney);
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

        schedulingService.scheduleDefaultReminderForCurrentAligner(reminder);
    }

    @Override
    @Transactional
    public AlignerJourney deleteDefaultReminder(Long alignerJourneyId, Long defaultReminderId) {
        AlignerJourney alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));
        alignerJourney.validate();

        DefaultAlignerReminder reminder = alignerJourney
                .getDefaultReminder(defaultReminderId)
                .orElseThrow(() -> new DefaultReminderNotFoundException(defaultReminderId));
        alignerJourney.getDefaultAlignerReminders().remove(reminder);
        defaultAlignerReminderRepository.delete(reminder);
        schedulingService.deleteDefaultReminders(reminder);

        log.info("Deleted the default reminder with id {} in aligner journey {}", defaultReminderId, alignerJourneyId);
        return alignerJourney;
    }

    @Override
    @Transactional
    public AlignerJourney deleteCustomReminder(Long alignerJourneyId, Long customReminderId) {
        AlignerJourney alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));
        alignerJourney.validate();

        CustomAlignerReminder reminder = alignerJourney
                .getCustomReminder(customReminderId)
                .orElseThrow(() -> new CustomReminderNotFoundException(customReminderId));
        alignerJourney = deleteCustomReminder(reminder);

        log.info("Deleted the custom reminder with id {} in aligner journey {}", customReminderId, alignerJourneyId);
        return alignerJourney;
    }

    private AlignerJourney deleteCustomReminder(CustomAlignerReminder reminder) {
        var alignerJourney = reminder.getAlignerJourney();
        alignerJourney.getCustomReminders().remove(reminder);
        customAlignerReminderRepository.delete(reminder);

        schedulingService.deleteCustomReminder(reminder);
        return alignerJourneyRepository.save(alignerJourney);
    }

    @Transactional
    @Override
    public AlignerJourney updateDefaultReminder(UpdateDefaultReminderRequest request) {
        final Long alignerJourneyId = request.getAlignerJourneyId();
        final Long defaultReminderId = request.getDefaultReminderId();
        AlignerJourney alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));
        alignerJourney.validate();
        alignerJourney.isTreatmentDeactivated();

        DefaultAlignerReminder reminder = alignerJourney
                .getDefaultReminder(defaultReminderId)
                .orElseThrow(() -> new DefaultReminderNotFoundException(defaultReminderId));
        schedulingService.deleteDefaultReminders(reminder);

        ModelMapper mapper = new ModelMapper();
        mapper.getConfiguration()
                .setSkipNullEnabled(true)
                .setAmbiguityIgnored(true)
                .setMatchingStrategy(MatchingStrategies.STANDARD);
        mapper.map(request, reminder);
        reminder = defaultAlignerReminderRepository.save(reminder);
        schedulingService.scheduleDefaultReminderForCurrentAligner(reminder);

        log.info("Updated the default reminder with id {} for aligner journey {}", defaultReminderId, alignerJourneyId);
        return alignerJourneyRepository.save(alignerJourney);
    }

    @Transactional
    @Override
    public AlignerJourney updateCustomReminder(UpdateCustomReminderRequest request) {
        final Long alignerJourneyId = request.getAlignerJourneyId();
        final Long customReminderId = request.getCustomReminderId();
        var date = request.getDate();
        if (request.getFrequency().equals(Frequency.DAILY)) {
            date = null;
        } else if (date == null && request.getFrequency().equals(Frequency.ONE_TIME)) {
            date = LocalDate.now();
        }
        AlignerJourney alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));
        alignerJourney.validate();

        alignerJourney.isTreatmentDeactivated();

        customAlignerReminderRepository
                .findByNameAndDateAndTimeAndAlignerJourneyIdAndFrequency(
                        request.getName(),
                        request.getDate(),
                        request.getTime(),
                        alignerJourneyId,
                        request.getFrequency())
                .ifPresent(r -> {
                    throw new ReminderAlreadyExistsException(r, alignerJourneyId);
                });

        CustomAlignerReminder reminder = alignerJourney
                .getCustomReminder(customReminderId)
                .orElseThrow(() -> new CustomReminderNotFoundException(customReminderId));
        schedulingService.deleteCustomReminder(reminder);

        ModelMapper mapper = new ModelMapper();
        mapper.getConfiguration()
                .setSkipNullEnabled(true)
                .setAmbiguityIgnored(true)
                .setMatchingStrategy(MatchingStrategies.STANDARD);
        mapper.map(request, reminder);
        reminder.setDate(date);

        reminder = customAlignerReminderRepository.save(reminder);
        schedulingService.scheduleReminder(AlignerReminderInfo.from(reminder, request.getMessageIndex()));

        log.info("Updated the custom reminder with id {} for aligner journey {}", customReminderId, alignerJourneyId);
        return alignerJourneyRepository.save(alignerJourney);
    }

    @Override
    @Transactional
    public AlignerJourney addAlignerFeedback(AddAlignerFeedbackRequest request) {
        final Long alignerJourneyId = request.getAlignerJourneyId();
        final var alignerNo = request.getAlignerNo();

        AlignerJourney alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));
        alignerJourney.validate();

        Aligner aligner = alignerJourney.getAligner(alignerNo);
        final Patient patient = alignerJourney.getPatient();

        var feedback = AlignerFeedback.ofTypeMiscFeedback(request, aligner);
        feedback = alignerFeedbackRepository.save(feedback);

        aligner.getFeedbacks().add(feedback);
        alignerJourneyRepository.save(alignerJourney);

        timelineService.updateAlignerChangeEventWithFeedbacks(request, alignerJourney, alignerNo);

        var doctor = doctorService.getDoctor(alignerJourney.getDoctorId());

        if (request.getUserType().equals(UserType.DOCTOR)) {
            var patientDoctorOrganization = patientDoctorOrganizationRepository
                    .findPatientDoctorOrganizationsWithPatientByPatientId(
                            alignerJourney.getPatient().getId())
                    .orElseThrow(() -> new PatientNotFoundException(
                            alignerJourney.getPatient().getId()));
            var displayName = patientDoctorOrganization.getUserProfile().getPracticeName();

            if (request.isValidationFeedback()) {
                notificationService.notificationForAlignerAckByDoctor(
                        patient, alignerJourney, doctor.isDrToDisplay(), displayName);
            } else {
                notificationService.notificationForAlignerFeedbackAddedByDoctor(
                        patient, alignerJourney, doctor.isDrToDisplay(), displayName);
            }
        } else {

            log.info("Adding aligner change feedback event, {}", request);
            timelineService.addEvent(
                    request.getUserId(),
                    UserType.PATIENT,
                    alignerJourney.getDoctorId(),
                    UserType.DOCTOR,
                    EventType.ALIGNER_CHANGE_FEEDBACK_ADDED,
                    AlignerChangeFeedbackAddedEventMetadata.from(alignerJourney, aligner, feedback));
        }

        log.info(
                "Added feedback for aligner {} in aligner journey {} by {} {}",
                alignerNo,
                alignerJourneyId,
                request.getUserType(),
                request.getUserId());
        return alignerJourney;
    }

    @Override
    @Transactional
    public AlignerJourney discardAlignerJourney(Long alignerJourneyId) {
        AlignerJourney alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));

        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(alignerJourney.getPatient().getId())
                .orElseThrow(() ->
                        new PatientNotFoundException(alignerJourney.getPatient().getId()));

        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        alignerJourney.setProgressStatus(ProgressStatus.DEACTIVATED);
        alignerJourney.setDoctorTreatmentEndDate(LocalDate.now());
        log.info("Aligner journey with id {} is discarded.", alignerJourneyId);

        DoctorDetails doctorDetails = doctorService.getDoctor(alignerJourney.getDoctorId());
        var patientDoctorOrganization = patientDoctorOrganizationRepository
                .findPatientDoctorOrganizationsWithPatientByPatientId(
                        alignerJourney.getPatient().getId())
                .orElseThrow(() ->
                        new PatientNotFoundException(alignerJourney.getPatient().getId()));
        var displayName = patientDoctorOrganization.getUserProfile().getPracticeName();
        notificationService.alignerJourneyPaused(
                displayName, alignerJourney, alignerJourney.getPatient(), doctorDetails.isDrToDisplay());
        return alignerJourneyRepository.save(alignerJourney);
    }

    @Override
    public AlignerJourney updateAlignerJourneyByPatient(UpdateAlignerJourneyByPatientRequest request) {
        var alignerJourneyId = request.getAlignerJourneyId();
        final var patientId = request.getPatientId();
        AlignerJourney alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));

        AlignerJourney finalAlignerJourney = alignerJourney;
        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(alignerJourney.getPatient().getId())
                .orElseThrow(() -> new PatientNotFoundException(
                        finalAlignerJourney.getPatient().getId()));

        var userProfile = patient.getDoctorOrganization().getUserProfile().getId();
        alignerJourney.isTreatmentDeactivated();
        if (alignerJourney.getCreationStatus().equals(CreationStatus.IN_PROGRESS)) {
            throw new AlignerJourneyCreationNotCompleteException(alignerJourneyId);
        }

        if (alignerJourney.getCurrentAlignerNo() != null || alignerJourney.getDoctorTreatmentStartDate() != null) {
            throw new BadRequestException(String.format(
                    "The current aligner no and treatment start date is already set for aligner journey with id %d",
                    alignerJourneyId));
        }

        alignerJourney.setCurrentAlignerNo(request.getCurrentAlignerNo());
        alignerJourney.setDoctorTreatmentStartDate(request.getTreatmentStartDate());

        alignerJourney = alignerJourneyRepository.save(alignerJourney);
        log.info(
                "Patient {} filled the current aligner no. {} and treatment start date {} of aligner journey {}",
                patientId,
                request.getCurrentAlignerNo(),
                request.getTreatmentStartDate(),
                alignerJourneyId);

        timelineService.addEvent(
                patientId,
                UserType.PATIENT,
                alignerJourney.getDoctorId(),
                UserType.DOCTOR,
                EventType.TREATMENT_CREATION_COMPLETE,
                new TreatmentCreationCompleteEventMetadata(AlignerJourneyDetails.from(alignerJourney)));
        return alignerJourney;
    }

    @Override
    @Transactional
    public AlignerJourney changeAligner(ChangeAlignerRequest request, MultipartFile[] photos) {
        final Long patientId = request.getPatientId();
        final long alignerJourneyId = request.getAlignerJourneyId();
        final int newAlignerNo = request.getNewAlignerNo();
        final LocalDate changeDate = request.getPreviousAlignerChangeDate();
        var today = LocalDate.now();
        if (!changeDate.equals(today)) throw new BadRequestException("Aligner change date must be today's date");

        AlignerJourney alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));

        AlignerJourney finalAlignerJourney = alignerJourney;
        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(alignerJourney.getPatient().getId())
                .orElseThrow(() -> new PatientNotFoundException(
                        finalAlignerJourney.getPatient().getId()));

        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        alignerJourney.validate();
        Integer previousAlignerNo = alignerJourney.getCurrentAlignerNo();
        if (previousAlignerNo == null) {
            throw new CurrentAlignerNotSetException(alignerJourneyId);
        }
        if (newAlignerNo != previousAlignerNo + 1) {
            throw new BadRequestException("The new aligner number must be the current aligner number plus one.");
        }

        var previousAligner = alignerJourney.getAligner(previousAlignerNo);
        var recommendedEndDate = previousAligner.getEndDate();
        previousAligner.getAlignerProduction().changeStatus(ProductionSubStatus.ISSUED_TO_PATIENT);

        List<Pair<String, MultipartFile>> withPreviousAlignerPhotos = new ArrayList<>();
        List<Pair<String, MultipartFile>> withoutNewAlignerPhotos = new ArrayList<>();
        List<Pair<String, MultipartFile>> withNewAlignerPhotos = new ArrayList<>();

        if (photos != null && photos.length > 0) {
            PatientDoctorOrganization patientDoctorOrganization =
                    patientDoctorOrganizationRepository.findByPatientIdAndDoctorId(
                            alignerJourney.getPatient().getId(), alignerJourney.getDoctorId());

            if (patientDoctorOrganization == null) {
                throw new NotFoundException("No organization found for the given patient and doctor.");
            }

            var subscriptionResponse = subscriptionService.getSubSubscriptionDetails(
                    alignerJourney.getDoctorId(),
                    patientDoctorOrganization.getUserProfile().getId());

            if (subscriptionResponse != null) {
                double totalStorageGb = subscriptionResponse.getTotalStorageGb();
                double usedStorageMb = subscriptionResponse.getUsedStorageGb();
                long usedStorageBytes = (long) (usedStorageMb * 1_048_576L);

                long totalFilesSizeBytes = 0;
                for (MultipartFile file : photos) {
                    totalFilesSizeBytes += file.getSize();
                }

                long totalStorageBytes = (long) (totalStorageGb * 1_073_741_824L);

                if (usedStorageBytes + totalFilesSizeBytes > totalStorageBytes) {
                    throw new StorageLimitExceededException(alignerJourney.getDoctorId());
                }
            }
            withPreviousAlignerPhotos = request.getWithPreviousAlignerPhotoFiles().stream()
                    .map(mapping -> Pair.of(
                            mapping.getSaveAsFilename(), filterPhotoWithName(photos, mapping.getOriginalFilename())))
                    .toList();
            withoutNewAlignerPhotos = request.getWithoutNewAlignerPhotoFiles().stream()
                    .map(mapping -> Pair.of(
                            mapping.getSaveAsFilename(), filterPhotoWithName(photos, mapping.getOriginalFilename())))
                    .toList();
            withNewAlignerPhotos = request.getWithNewAlignerPhotoFiles().stream()
                    .map(mapping -> Pair.of(
                            mapping.getSaveAsFilename(), filterPhotoWithName(photos, mapping.getOriginalFilename())))
                    .toList();
        }

        var newAligner = alignerJourney.getAligner(newAlignerNo);
        List<AlignerPhoto> previousAlignerPhotos = new ArrayList<>();
        List<AlignerPhoto> newAlignerPhotos = new ArrayList<>();

        for (var mapping : withPreviousAlignerPhotos) {
            var alignerPhoto = galleryService.uploadPhotoByPatient(
                    previousAligner, patientId, mapping.getFirst(), true, mapping.getSecond());
            previousAlignerPhotos.add(alignerPhoto);
        }
        for (var mapping : withNewAlignerPhotos) {
            var alignerPhoto = galleryService.uploadPhotoByPatient(
                    newAligner, patientId, mapping.getFirst(), true, mapping.getSecond());
            newAlignerPhotos.add(alignerPhoto);
        }
        for (var mapping : withoutNewAlignerPhotos) {
            var alignerPhoto = galleryService.uploadPhotoByPatient(
                    newAligner, patientId, mapping.getFirst(), false, mapping.getSecond());
            newAlignerPhotos.add(alignerPhoto);
        }

        alignerJourney.changeCurrentAligner(newAlignerNo, changeDate);
        previousAligner.setEndDate(recommendedEndDate);

        var previousAlignerFeedbackIds = new ArrayList<Long>();
        request.getAlignerFeedbacks().forEach(f -> {
            var feedback = AlignerFeedback.ofTypeAlignerChangeFeedback(patientId, UserType.PATIENT, f, previousAligner);
            feedback = alignerFeedbackRepository.save(feedback);
            previousAlignerFeedbackIds.add(feedback.getId());
            previousAligner.getFeedbacks().add(feedback);
        });

        Aligner currentAligner = alignerJourney.getCurrentAligner();
        if (currentAligner == null) {
            throw new CurrentAlignerNotSetException(alignerJourneyId);
        }

        var alignerChangeAction = AlignerAction.alignerChangeByPatient(
                patientId,
                previousAligner,
                newAligner.getId(),
                previousAlignerPhotos,
                newAlignerPhotos,
                previousAlignerFeedbackIds);
        previousAligner.getActions().add(alignerChangeAction);
        alignerJourney = alignerJourneyRepository.save(alignerJourney);

        timelineService.addEvent(
                patientId,
                UserType.PATIENT,
                alignerJourney.getDoctorId(),
                UserType.DOCTOR,
                EventType.ALIGNER_CHANGE,
                AlignerChangeEventEventMetadata.from(
                        previousAligner, currentAligner, previousAlignerPhotos, newAlignerPhotos, alignerChangeAction));

        defaultAlignerReminderRepository
                .findByAlignerJourneyId(alignerJourneyId)
                .forEach(reminder -> schedulingService.scheduleDefaultReminder(reminder, currentAligner));
        DoctorDetails doctorDetails = doctorService.getDoctor(alignerJourney.getDoctorId());

        chatService.smsForAlignerChangeAlert(SmsToDoctor.from(doctorDetails, alignerJourney.getPatient()));

        return alignerJourney;
    }

    @Override
    public AllAlignerActions getAlignerActions(long alignerJourneyId) {
        var alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));

        return new AllAlignerActions(alignerJourney.getAligners().stream()
                .flatMap(aligner -> aligner.getActions().stream())
                .filter(action -> List.of(
                                AlignerActionType.ALIGNER_CHANGE,
                                AlignerActionType.CHECK_IN,
                                AlignerActionType.ISSUE_REPORT)
                        .contains(action.getType()))
                .sorted(Comparator.comparing(AlignerAction::getPerformedAt).reversed())
                .map(action -> {
                    var aligner = action.getAligner();
                    Aligner newAligner = null;
                    if (action.getType().equals(AlignerActionType.ALIGNER_CHANGE)) {
                        var metadata = (AlignerChangeActionMetadata) action.getMetadata();
                        newAligner = alignerRepository
                                .findById(metadata.getNewAlignerId())
                                .orElse(null);
                    }

                    var actionDetails = AllAlignerActions.AlignerActionBriefDetails.builder()
                            .alignerActonId(action.getId())
                            .previousAligner(AlignerSrNoDetails.from(aligner))
                            .type(action.getType())
                            .updateCategory(action.getUpdateCategory())
                            .updateCategoryReason(action.getUpdateCategoryReason())
                            .performedAt(action.getPerformedAt())
                            .build();
                    if (newAligner != null) {
                        actionDetails.setNewAligner(AlignerSrNoDetails.from(newAligner));
                    }

                    return actionDetails;
                })
                .toList());
    }

    @Override
    public void approvePendingAligner(long alignerJourneyId) {
        var alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));

        alignerJourney.getAligners().forEach(aligner -> {
            aligner.getActions().forEach(action -> {
                if (action.isActive()) {
                    action.setValidated(true);
                    action.setActive(false);
                }
                alignerActionRepository.save(action);
            });
        });
    }

    @Override
    @Transactional(readOnly = true)
    public AlignerJourney getCurrentAlignerJourney(Long patientId) {
        return alignerJourneyRepository.findByPatientIdAndProgressStatus(patientId, ProgressStatus.IN_PROGRESS).stream()
                .findFirst()
                .orElseThrow(() -> NoActiveAlignerJourneyFoundException.ofPatientId(patientId));
    }

    @Nullable
    @Override
    @Transactional(readOnly = true)
    public Aligner getCurrentAligner(Long patientId) {
        return alignerJourneyRepository
                .findCurrentAlignerByLatestJourney(patientId)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlignerJourney> getAlignerJourneysByDoctor(Long doctorId) {
        return alignerJourneyRepository.findByDoctorIdAndProgressStatus(doctorId, ProgressStatus.IN_PROGRESS);
    }

    @Override
    public void sendNotifications() {
        alignerJourneyRepository
                .findByCreationStatusAndProgressStatus(CreationStatus.DONE, ProgressStatus.IN_PROGRESS)
                .forEach(alignerJourney -> {
                    notificationService.notificationForCompliance(alignerJourney);
                    notificationService.notificationForMilestones(alignerJourney);
                    notificationService.notificationForMissedAlignerChange(alignerJourney);
                    notificationService.notificationForTreatmentStartingToday(alignerJourney);
                    notificationService.sendReminderOfAlignerCheckIn(alignerJourney);
                });
        alignerJourneyRepository
                .findByCreationStatusAndProgressStatus(CreationStatus.DONE, ProgressStatus.NOT_STARTED)
                .forEach(notificationService::notificationForTreatmentStartingTomorrow);

        LocalDate today = LocalDate.now();
        LocalDate oneDayBefore = today.plusDays(1);
        ReminderStatus status = ReminderStatus.ACTIVE;

        List<AppointmentReminder> oneDayPriorReminders =
                appointmentReminderRepository.findByDateAndStatus(oneDayBefore, status);
        oneDayPriorReminders.forEach(notificationService::sendOneDayPriorReminderOfAppointment);

        log.info("Processed reminders for today and one day prior.");
    }

    @Override
    public void sendNotifications(Long patientId) {
        alignerJourneyRepository.findByPatientId(patientId).stream()
                .filter(alignerJourney -> alignerJourney.getCreationStatus().equals(CreationStatus.DONE))
                .forEach(alignerJourney -> {
                    if (alignerJourney.getProgressStatus().equals(ProgressStatus.IN_PROGRESS)) {
                        notificationService.notificationForCompliance(alignerJourney);
                        notificationService.notificationForMilestones(alignerJourney);
                        notificationService.notificationForMissedAlignerChange(alignerJourney);
                        notificationService.sendReminderOfAlignerCheckIn(alignerJourney);
                        notificationService.notificationForTreatmentStartingToday(alignerJourney);

                    } else if (alignerJourney.getProgressStatus().equals(ProgressStatus.NOT_STARTED)) {
                        notificationService.notificationForTreatmentStartingToday(alignerJourney);
                        notificationService.notificationForTreatmentStartingTomorrow(alignerJourney);
                    }
                });
    }

    @Transactional
    @Override
    public void createAlignerJourney(CreateAlignerJourneyRequest request) {

        var ownerUserProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(ownerUserProfile);

        var treatmentPlanId = request.getAlignerTreatmentPlanId();
        TreatmentPlan treatmentPlan = treatmentPlanRepository
                .findById(treatmentPlanId)
                .orElseThrow(() -> new TreatmentPlanNotFoundException(treatmentPlanId));

        if (request.isTreatmentUpdating()) {
            if (treatmentPlan.getIsTreatmentFinalised()) {
                throw new ActiveAlignerJourneyFoundException(treatmentPlanId);
            }
            TreatmentPlan treatmentPlanWithTracking = treatmentPlanRepository
                    .findByIdWithTracking(treatmentPlanId)
                    .orElseThrow(() -> new TreatmentPlanNotFoundException(treatmentPlanId));
            var patient = treatmentPlan.getPatient();

            if (!treatmentPlanWithTracking.getTracking().getAskPatientToFill()
                    && request.isAskToPatientFill()
                    && patient.getEmail() != null) {
                var doctor = doctorService.getDoctor(treatmentPlan.getDoctorId());
                notificationService.askPatientToFillMissingAlignerDetailsNotification(
                        doctor.getFirstName(), patient, doctor.isDrToDisplay());
            }

            updateAlignerJourneyTreatment(request, treatmentPlanWithTracking, treatmentPlanWithTracking.getTracking());
        } else if (request.getStatus() == Status.DRAFT) {

            Optional<Tracking> activeTracking = trackingRepository.findByTreatmentPlanId(treatmentPlanId);
            if (activeTracking.isPresent()) {
                throw new ActiveTreatmentPlanFoundException(treatmentPlanId);
            }

            var tracking = Tracking.addTracking(treatmentPlan, request);
            var patient = treatmentPlan.getPatient();
            if (request.isAskToPatientFill() && patient.getEmail() != null) {
                var doctor = doctorService.getDoctor(treatmentPlan.getDoctorId());
                notificationService.askPatientToFillMissingAlignerDetailsNotification(
                        doctor.getFirstName(), patient, doctor.isDrToDisplay());
            }
            var patientInvitations = patientInvitationRepository.findByPatientId(
                    treatmentPlan.getPatient().getId());
            if (patientInvitations.isPresent()) {
                var invitation = patientInvitations.get().getInvitation();
                if (invitation.getStatus().equals(InvitationStatus.ACCEPTED)) {
                    tracking.setIsPatientConnected(true);
                }
            }
            TreatmentPlan updatedTreatmentPlan = treatmentPlan.updateTreatmentPlanDetails(tracking, request);
            treatmentPlanRepository.save(updatedTreatmentPlan);
        } else {
            finaliseAlignerJourneyTreatment(treatmentPlan, request);
        }
    }

    private void updateAlignerJourneyTreatment(
            CreateAlignerJourneyRequest request, TreatmentPlan treatmentPlan, Tracking tracking) {
        if (tracking.getStatus() == Status.ACTIVE) {
            throw new ActiveAlignerJourneyFoundException(tracking.getId());
        }
        if (request.getStatus() == Status.DRAFT) {
            var updatedTracking = tracking.updateTreatmentPlanDetails(request);
            TreatmentPlan updatedTreatmentPlan = treatmentPlan.updateTreatmentPlanDetails(updatedTracking, request);
            treatmentPlanRepository.save(updatedTreatmentPlan);
        } else {
            updateAndFinaliseAlignerJourneyTreatment(request, treatmentPlan, tracking);
        }
    }

    private List<Integer> addMissingNumbersToRange(List<Integer> range) {
        List<Integer> updatedRange = new ArrayList<>(range);
        int minValue = range.stream().min(Integer::compareTo).orElse(Integer.MAX_VALUE);
        for (int i = 1; i < minValue; i++) {
            if (!updatedRange.contains(i)) {
                updatedRange.add(i);
            }
        }
        Collections.sort(updatedRange);
        return updatedRange;
    }

    private void updateAndFinaliseAlignerJourneyTreatment(
            CreateAlignerJourneyRequest request, TreatmentPlan treatmentPlan, Tracking tracking) {
        var currentAlignerDetails = request.getCurrentAlignerDetails();
        var alignerDetailsMetadata = treatmentPlan.getAlignerDetailsMetadata();
        int daysToWearEachAligner = treatmentPlan.getDaysToWearEachAligner();

        List<Integer> originalLowerJawRange =
                new ArrayList<>(alignerDetailsMetadata.getLowerJawDetails().getRange());
        List<Integer> originalUpperJawRange =
                new ArrayList<>(alignerDetailsMetadata.getUpperJawDetails().getRange());

        int minUpper = originalUpperJawRange.stream().min(Integer::compareTo).orElse(Integer.MAX_VALUE);
        int minLower = originalLowerJawRange.stream().min(Integer::compareTo).orElse(Integer.MAX_VALUE);

        List<Integer> updatedLowerJawRange = new ArrayList<>(originalLowerJawRange);
        List<Integer> updatedUpperJawRange = new ArrayList<>(originalUpperJawRange);

        if (!originalLowerJawRange.contains(1) && !originalUpperJawRange.contains(1)) {
            if (minUpper <= minLower) {
                updatedUpperJawRange = addMissingNumbersToRange(originalUpperJawRange);
            } else {
                updatedLowerJawRange = addMissingNumbersToRange(originalLowerJawRange);
            }
        }

        TreatmentStage treatmentStage = Optional.ofNullable(currentAlignerDetails)
                .map(details -> {
                    LocalDate startDate = details.getStartDate();
                    LocalDate today = LocalDate.now();

                    if (startDate != null && startDate.isAfter(today)) {
                        return TreatmentStage.NEW;
                    } else {
                        return TreatmentStage.MID;
                    }
                })
                .orElse(TreatmentStage.MID);

        var newAligners = getNewAlignersDetails(
                currentAlignerDetails,
                daysToWearEachAligner,
                new HashSet<>(updatedLowerJawRange),
                new HashSet<>(updatedUpperJawRange));

        com.dentalstack.patient.feature.aligner.dto.aligner.CreateAlignerJourneyRequest createAlignerJourneyRequest =
                com.dentalstack.patient.feature.aligner.dto.aligner.CreateAlignerJourneyRequest.from(
                        newAligners, request, treatmentPlan, treatmentStage);

        var alignerJourney = generateAlignerJourney(createAlignerJourneyRequest, tracking);
        alignerJourney.getTracking().setStatus(request.getStatus());
        treatmentPlanRepository.save(treatmentPlan.finaliseTreatment(alignerJourney.getTracking(), request));
    }

    private List<Integer> addMissingNumbersToUpperAndLowerJaw(
            List<Integer> lowerJawRange, List<Integer> upperJawRange) {
        if (!lowerJawRange.contains(1) && !upperJawRange.contains(1)) {
            int minUpper = upperJawRange.stream().min(Integer::compareTo).orElse(Integer.MAX_VALUE);
            int minLower = lowerJawRange.stream().min(Integer::compareTo).orElse(Integer.MAX_VALUE);

            if (minUpper <= minLower) {
                return addMissingNumbersToRange(upperJawRange);
            } else {
                return addMissingNumbersToRange(lowerJawRange);
            }
        }
        return lowerJawRange;
    }

    @Override
    public void finaliseAlignerJourneyTreatment(TreatmentPlan treatmentPlan, CreateAlignerJourneyRequest request) {
        Optional<Tracking> activeTracking = trackingRepository.findByTreatmentPlanId(treatmentPlan.getId());
        if (activeTracking.isPresent()) {
            throw new ActiveTreatmentPlanFoundException(treatmentPlan.getId());
        }
        var tracking = Tracking.addTracking(treatmentPlan, request);
        var patientId = UserId.builder()
                .userId(tracking.getPatientId())
                .userType(UserType.PATIENT)
                .build();
        var doctorId = UserId.builder()
                .userId(treatmentPlan.getDoctorId())
                .userType(UserType.DOCTOR)
                .build();
        if (tracking.getTrackingType().equals(TrackingType.PATIENTAPP)) {

            driveAsyncHelper.createFoldersAsync(
                    List.of(CreateFolderRequest.builder()
                            .folderName(CHAT_FOLDER_NAME)
                            .parentPath("/")
                            .uploader(patientId)
                            .owners(Set.of(doctorId, patientId))
                            .isDefaultFolder(true)
                            .isPatientFolder(true)
                            .build()),
                    "Aligner journey Chat folder for patient " + tracking.getPatientId());
        }

        driveAsyncHelper.createFolderHierarchiesAsync(
                List.of(
                        CreateFolderHierarchyRequest.builder()
                                .path(Paths.get("/", IMAGE_FOLDER_NAME, PRE_TREATMENT)
                                        .toString())
                                .uploader(patientId)
                                .owners(Set.of(doctorId, patientId))
                                .isDefaultFolder(true)
                                .isPatientFolder(true)
                                .build(),
                        CreateFolderHierarchyRequest.builder()
                                .path(Paths.get("/", IMAGE_FOLDER_NAME, POST_TREATMENT)
                                        .toString())
                                .uploader(patientId)
                                .owners(Set.of(doctorId, patientId))
                                .isDefaultFolder(true)
                                .isPatientFolder(true)
                                .build()),
                "Aligner journey Pre/Post treatment folders for patient " + tracking.getPatientId());

        var patientInvitations = patientInvitationRepository.findByPatientId(
                treatmentPlan.getPatient().getId());
        if (patientInvitations.isPresent()) {
            var invitation = patientInvitations.get().getInvitation();
            if (invitation.getStatus().equals(InvitationStatus.ACCEPTED)) {
                tracking.setIsPatientConnected(true);
            }
        }

        updateAndFinaliseAlignerJourneyTreatment(request, treatmentPlan, tracking);
        treatmentPlan.setIsTreatmentFinalised(true);

        if (!tracking.getTrackingType().equals(TrackingType.MANUAL)) {
            String title = notificationService.getLocalizedMessages(
                    treatmentPlan.getPatient(), "notification.treatment.finalization.title", null);
            String message = notificationService.getLocalizedMessages(
                    treatmentPlan.getPatient(), "notification.treatment.finalization.message", null);
            chatService.sendNotification(SendNotificationRequest.builder()
                    .title(title)
                    .message(message)
                    .notificationIndex(105)
                    .mobile(treatmentPlan.getPatient().getMobileNo())
                    .email(treatmentPlan.getPatient().getEmail())
                    .isDoctorApp(false)
                    .xOrgName(xOrgNameResolver
                            .resolveFromPatient(treatmentPlan.getPatient())
                            .getXOrgName())
                    .organizationId(xOrgNameResolver
                            .resolveFromPatient(treatmentPlan.getPatient())
                            .getOrganizationId())
                    .build());
            var patient = patientRepository
                    .findByIdWithDoctorProfileDetails(treatmentPlan.getPatient().getId())
                    .orElseThrow();
        }

        treatmentPlanRepository.save(treatmentPlan);
    }

    private List<NewAlignerDetails> getNewAlignersDetails(
            CurrentAlignerDetails currentAlignerDetails,
            int daysToWearEachAligner,
            Set<Integer> lowerJawRange,
            Set<Integer> upperJawRange) {
        var aligners = new ArrayList<NewAlignerDetails>();
        for (int i = 1; ; i++) {
            boolean lowerJaw = lowerJawRange.contains(i);
            boolean upperJaw = upperJawRange.contains(i);
            if (!lowerJaw && !upperJaw) {
                break;
            }
            JawType jawType = lowerJaw ? JawType.LOWER : JawType.UPPER;
            if (lowerJaw && upperJaw) {
                jawType = JawType.BOTH;
            }

            var newAligner = new NewAlignerDetails();
            newAligner.setAlignerNo(i);
            newAligner.setJawType(jawType);
            newAligner.setNoOfDaysToWear(daysToWearEachAligner);
            aligners.add(newAligner);
        }

        aligners.sort(Comparator.comparing(NewAlignerDetails::getAlignerNo));
        if (currentAlignerDetails.getNumber() != null
                && currentAlignerDetails.getEndDate() != null
                && currentAlignerDetails.getStartDate() != null) {
            LocalDate startDate = currentAlignerDetails.getStartDate();
            LocalDate endDate = currentAlignerDetails.getEndDate();
            for (int i = currentAlignerDetails.getNumber(); i >= 1; --i) {
                var aligner = aligners.get(i - 1);
                aligner.setStartDate(startDate);
                aligner.setEndDate(endDate);

                endDate = startDate;
                startDate = startDate.minusDays(daysToWearEachAligner);
            }

            startDate = currentAlignerDetails.getStartDate();
            endDate = currentAlignerDetails.getEndDate();
            for (int i = currentAlignerDetails.getNumber(); i <= aligners.size(); i++) {
                var aligner = aligners.get(i - 1);
                aligner.setStartDate(startDate);
                aligner.setEndDate(endDate);

                startDate = endDate;
                endDate = endDate.plusDays(daysToWearEachAligner);
            }
        }

        return aligners;
    }

    @Override
    public void scheduleReminders() {
        var now = LocalDateTime.now();

        customAlignerReminderRepository.findAll().stream()
                .filter(CustomAlignerReminder::isActive)
                .forEach(reminder -> {
                    try {
                        var triggerTime = LocalDateTime.of(reminder.getDate(), reminder.getTime());
                        if (reminder.getFrequency().equals(Frequency.DAILY) || triggerTime.isAfter(now)) {
                            schedulingService.scheduleReminder(AlignerReminderInfo.from(reminder));
                        } else {
                            deleteCustomReminder(reminder);
                        }
                    } catch (Exception e) {
                        log.error("Error scheduling custom reminder for reminder ID: " + reminder.getId(), e);
                    }
                });
        log.info("Scheduled the custom reminders.");

        defaultAlignerReminderRepository.findAll().forEach(reminder -> {
            try {
                if (!schedulingService.reminderExists(reminder)) {
                    schedulingService.deleteDefaultReminders(reminder);
                    schedulingService.scheduleDefaultReminderForCurrentAligner(reminder);
                }
            } catch (Exception e) {
                log.error("Error scheduling default reminder for reminder ID: " + reminder.getId(), e);
            }
        });
        log.info("Scheduled the default reminders.");
    }

    @Override
    @Transactional
    public AlignerJourney updateWearDays(UpdateWearDaysRequest request) {
        AlignerJourney alignerJourney = alignerJourneyRepository
                .findById(request.getAlignerJourneyId())
                .orElseThrow(() -> new AlignerJourneyNotFoundException(request.getAlignerJourneyId()));

        alignerJourney.isTreatmentDeactivated();

        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(alignerJourney.getPatient().getId())
                .orElseThrow(() ->
                        new PatientNotFoundException(alignerJourney.getPatient().getId()));

        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);

        List<AlignerChangeData> alignerChanges =
                updateWearDays(alignerJourney, request.getAlignerNos(), request.getDaysToWearEachAligner());

        var currentAligner = alignerJourney.getCurrentAligner();
        if (currentAligner != null) {
            var isCurrentAligner = request.getAlignerNos().contains(currentAligner.getSrNo());
            long doctorId = alignerJourney.getDoctorId();
            var doctor = doctorService.getDoctor(doctorId);

            var patientDoctorOrganization = patientDoctorOrganizationRepository
                    .findPatientDoctorOrganizationsWithPatientByPatientId(
                            alignerJourney.getPatient().getId())
                    .orElseThrow(() -> new PatientNotFoundException(
                            alignerJourney.getPatient().getId()));
            notificationService.wearDaysUpdateNotificationFromTracking(
                    patientDoctorOrganization.getUserProfile().getPracticeName(),
                    isCurrentAligner,
                    alignerJourney,
                    doctor.isDrToDisplay());
            boolean isMultipleAlignerUpdated = request.getAlignerNos().size() > 1;

            timelineService.addEvent(
                    alignerJourney.getPatient().getId(),
                    UserType.PATIENT,
                    alignerJourney.getDoctorId(),
                    UserType.DOCTOR,
                    EventType.WEAR_DAYS_UPDATED,
                    new WearDaysUpdateEventMetaData(
                            AlignerJourneyDetails.from(alignerJourney), isMultipleAlignerUpdated, alignerChanges));
        }
        var saved = alignerJourneyRepository.save(alignerJourney);
        initializeForDetails(saved);
        return saved;
    }

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public AlignerJourneyDetails updateAligner(UpdateAlignerRequest request) {
        var requestedStartDate = request.getStartDate();
        var requestedEndDate = request.getEndDate();
        if (requestedEndDate != null && requestedEndDate.isBefore(requestedStartDate)) {
            throw new BadRequestException("End date cannot be before the start date");
        }

        var srNo = request.getAlignerSrNo();
        var alignerNos = Set.of(srNo);
        AlignerJourney alignerJourney = alignerJourneyRepository
                .findById(request.getAlignerJourneyId())
                .orElseThrow(() -> new AlignerJourneyNotFoundException(request.getAlignerJourneyId()));

        alignerJourney.isTreatmentDeactivated();

        AlignerJourney finalAlignerJourney1 = alignerJourney;
        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(alignerJourney.getPatient().getId())
                .orElseThrow(() -> new PatientNotFoundException(
                        finalAlignerJourney1.getPatient().getId()));

        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        alignerProductionService.updateAlignerProduction(
                alignerJourney, alignerNos, request.getSubStatus(), request.getProductionLabId());

        var aligner = alignerJourney.getAligner(request.getAlignerSrNo());
        aligner.setJawType(request.getJawType());
        List<AlignerChangeData> alignerChanges;
        if (alignerJourney.getTracking().getTrackingType().equals(TrackingType.MANUAL)) {
            alignerChanges =
                    alignerJourney.changeWearDatesOfAlignerForManual(srNo, requestedStartDate, requestedEndDate);
        } else {
            alignerChanges = alignerJourney.changeWearDatesOfAligner(srNo, requestedStartDate, requestedEndDate);
        }

        Aligner currentAlignerBasedOnToday = alignerBasedOnToday(alignerJourney);
        var currentAlignerNo = alignerJourney.getCurrentAlignerNo();

        if (request.getIsForceAlignerChange() != null && !request.getIsForceAlignerChange()) {
            if (currentAlignerBasedOnToday != null) {
                if (currentAlignerBasedOnToday.getSrNo() != 0) {
                    srNo = currentAlignerBasedOnToday.getSrNo();
                    var alignerNo = alignerJourney.getCurrentAligner();
                    if (alignerNo != null) {
                        if (currentAlignerBasedOnToday.getSrNo() >= alignerJourney.getStartAlignerNo()
                                && srNo != alignerNo.getSrNo()) {
                            return AlignerJourneyDetails.from(alignerJourney, alignerNo, currentAlignerBasedOnToday);
                        }
                    }
                }
            }
        }

        if (currentAlignerBasedOnToday != null) {
            int newCurrentAlignerNo = currentAlignerBasedOnToday.getSrNo() >= alignerJourney.getStartAlignerNo()
                    ? currentAlignerBasedOnToday.getSrNo()
                    : alignerJourney.getStartAlignerNo();

            if (currentAlignerBasedOnToday.getSrNo() >= alignerJourney.getStartAlignerNo()) {
                alignerJourney.setCurrentAlignerNo(currentAlignerBasedOnToday.getSrNo());

                for (var i = currentAlignerBasedOnToday.getSrNo(); i < alignerJourney.getCurrentAlignerNo(); i++) {
                    var a = alignerJourney.getAligner(i);
                    a.setChangeDate(null);
                }
            }

            var toTriggerNotification = request.getIsToTriggerNotification() == null;
            if (toTriggerNotification || request.getIsToTriggerNotification()) {
                var isCurrentAligner = request.getAlignerSrNo() == newCurrentAlignerNo;
                long doctorId = alignerJourney.getDoctorId();
                var doctorDetails = doctorService.getDoctor(doctorId);

                AlignerJourney finalAlignerJourney = alignerJourney;
                var patientDoctorOrganization = patientDoctorOrganizationRepository
                        .findPatientDoctorOrganizationsWithPatientByPatientId(
                                alignerJourney.getPatient().getId())
                        .orElseThrow(() -> new PatientNotFoundException(
                                finalAlignerJourney.getPatient().getId()));
                var displayName = patientDoctorOrganization.getUserProfile().getPracticeName();

                if (isCurrentAligner) {
                    if (request.getIsNotificationForPauseResume() != null
                            && request.getIsNotificationForPauseResume()) {
                        notificationService.currentWearDaysUpdateNotification(
                                displayName, patient, alignerJourney, 23, doctorDetails.isDrToDisplay());
                    } else {
                        notificationService.currentWearDaysUpdateNotification(
                                displayName, patient, alignerJourney, 23, doctorDetails.isDrToDisplay());
                    }
                    timelineService.addEvent(
                            alignerJourney.getPatient().getId(),
                            UserType.PATIENT,
                            alignerJourney.getDoctorId(),
                            UserType.DOCTOR,
                            EventType.WEAR_DAYS_UPDATED,
                            new WearDaysUpdateEventMetaData(
                                    AlignerJourneyDetails.from(alignerJourney), false, alignerChanges));
                } else {

                    if (request.getIsNotificationForPauseResume() != null
                            && request.getIsNotificationForPauseResume()) {
                        notificationService.wearDaysUpdateNotification(
                                displayName, patient, true, alignerJourney, 23, doctorDetails.isDrToDisplay());
                    } else {
                        notificationService.wearDaysUpdateNotification(
                                displayName, patient, false, alignerJourney, 24, doctorDetails.isDrToDisplay());
                    }
                    timelineService.addEvent(
                            alignerJourney.getPatient().getId(),
                            UserType.PATIENT,
                            alignerJourney.getDoctorId(),
                            UserType.DOCTOR,
                            EventType.WEAR_DAYS_UPDATED,
                            new WearDaysUpdateEventMetaData(
                                    AlignerJourneyDetails.from(alignerJourney), false, alignerChanges));
                }
            }
        }
        alignerJourney = alignerJourneyRepository.save(alignerJourney);
        return AlignerJourneyDetails.from(alignerJourney);
    }

    @Nullable
    private Aligner alignerBasedOnToday(AlignerJourney alignerJourney) {
        var aligners = alignerJourney.getAligners();
        var today = LocalDate.now();
        aligners.sort(Comparator.comparing(Aligner::getSrNo));
        for (var aligner : aligners) {
            if (!today.isBefore(aligner.getStartDate()) && !today.isAfter(aligner.getEndDate())) {
                return aligner;
            }
        }

        return null;
    }

    private List<AlignerChangeData> updateWearDays(
            AlignerJourney alignerJourney, Set<Integer> alignerNos, int daysToWearEachAligner) {
        List<Aligner> aligners = alignerJourney.getAligners();
        aligners.sort(Comparator.comparing(Aligner::getSrNo));

        List<AlignerChangeData> alignerChanges = new ArrayList<>();
        LocalDate previousEndDate = null;

        for (Aligner aligner : aligners) {
            int daysToWear = aligner.getNoOfDaysToWear();
            LocalDate oldEndDate = aligner.getEndDate();

            if (alignerNos.contains(aligner.getSrNo())) {
                daysToWear = daysToWearEachAligner;
                aligner.setNoOfDaysToWear(daysToWear);
            }

            if (aligner.getSrNo() >= 2) {
                Aligner previousAligner = alignerJourney.getAligner(aligner.getSrNo() - 1);

                if (previousAligner.getChangeDate() == null) {
                    if (previousEndDate != null) {
                        aligner.setStartDate(previousEndDate);
                    }
                } else {
                    aligner.setStartDate(previousAligner.getChangeDate());
                }
            } else {
                if (previousEndDate != null) {
                    aligner.setStartDate(previousEndDate);
                }
            }

            LocalDate startDate = aligner.getStartDate();
            LocalDate endDate = startDate.plusDays(daysToWear - 1);
            aligner.setEndDate(endDate);

            if (alignerNos.contains(aligner.getSrNo()) || (oldEndDate != null && !oldEndDate.equals(endDate))) {
                alignerChanges.add(new AlignerChangeData(aligner.getSrNo(), oldEndDate, endDate));
            }

            previousEndDate = endDate;
        }

        return alignerChanges;
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
    @Transactional
    public AlignerJourney forceAlignerChange(AlignerChangeRequest request, MultipartFile[] photos) {

        final Long patientId = request.getPatientId();
        final long alignerJourneyId = request.getAlignerJourneyId();
        final int newAlignerNo = request.getNewAlignerNo();
        final LocalDate changeDate = request.getPreviousAlignerChangeDate();

        AlignerJourney alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));

        alignerJourney.validate();
        Integer previousAlignerNo = alignerJourney.getCurrentAlignerNo();
        if (previousAlignerNo == null) {
            throw new CurrentAlignerNotSetException(alignerJourneyId);
        }
        if (newAlignerNo != previousAlignerNo + 1) {
            throw new BadRequestException("The new aligner number must be the current aligner number plus one.");
        }

        List<Pair<String, MultipartFile>> withPreviousAlignerPhotos = new ArrayList<>();
        List<Pair<String, MultipartFile>> withoutNewAlignerPhotos = new ArrayList<>();
        List<Pair<String, MultipartFile>> withNewAlignerPhotos = new ArrayList<>();

        if (photos != null && photos.length > 0) {

            PatientDoctorOrganization patientDoctorOrganization =
                    patientDoctorOrganizationRepository.findByPatientIdAndDoctorId(
                            alignerJourney.getPatient().getId(), alignerJourney.getDoctorId());

            if (patientDoctorOrganization == null) {
                throw new NotFoundException("No organization found for the given patient and doctor.");
            }

            var subscriptionResponse = subscriptionService.getSubSubscriptionDetails(
                    alignerJourney.getDoctorId(),
                    patientDoctorOrganization.getUserProfile().getId());

            if (subscriptionResponse != null) {
                double totalStorageGb = subscriptionResponse.getTotalStorageGb();
                double usedStorageMb = subscriptionResponse.getUsedStorageGb();
                long usedStorageBytes = (long) (usedStorageMb * 1_048_576L);

                long totalFilesSizeBytes = 0;
                for (MultipartFile file : photos) {
                    totalFilesSizeBytes += file.getSize();
                }

                long totalStorageBytes = (long) (totalStorageGb * 1_073_741_824L);

                if (usedStorageBytes + totalFilesSizeBytes > totalStorageBytes) {
                    throw new StorageLimitExceededException(alignerJourney.getDoctorId());
                }
            }
            withPreviousAlignerPhotos = Optional.ofNullable(request.getWithPreviousAlignerPhotoFiles())
                    .map(files -> files.stream()
                            .map(mapping -> Pair.of(
                                    mapping.getSaveAsFilename(),
                                    filterPhotoWithName(photos, mapping.getOriginalFilename())))
                            .toList())
                    .orElse(List.of());

            withoutNewAlignerPhotos = Optional.ofNullable(request.getWithoutNewAlignerPhotoFiles())
                    .map(files -> files.stream()
                            .map(mapping -> Pair.of(
                                    mapping.getSaveAsFilename(),
                                    filterPhotoWithName(photos, mapping.getOriginalFilename())))
                            .toList())
                    .orElse(List.of());

            withNewAlignerPhotos = Optional.ofNullable(request.getWithNewAlignerPhotoFiles())
                    .map(files -> files.stream()
                            .map(mapping -> Pair.of(
                                    mapping.getSaveAsFilename(),
                                    filterPhotoWithName(photos, mapping.getOriginalFilename())))
                            .toList())
                    .orElse(List.of());
        }

        var previousAligner = alignerJourney.getAligner(previousAlignerNo);

        var previousAlignerStartDate = previousAligner.getStartDate();
        var previousAlignerEndDate = previousAligner.getEndDate();

        var newAligner = alignerJourney.getAligner(newAlignerNo);
        newAligner.getAlignerProduction().changeStatus(ProductionSubStatus.ISSUED_TO_PATIENT);

        List<AlignerPhoto> previousAlignerPhotos = new ArrayList<>();
        List<AlignerPhoto> newAlignerPhotos = new ArrayList<>();

        for (var mapping : withPreviousAlignerPhotos) {
            var alignerPhoto = galleryService.uploadPhotoByPatient(
                    previousAligner, patientId, mapping.getFirst(), true, mapping.getSecond());
            previousAlignerPhotos.add(alignerPhoto);
        }
        for (var mapping : withNewAlignerPhotos) {
            var alignerPhoto = galleryService.uploadPhotoByPatient(
                    previousAligner, patientId, mapping.getFirst(), true, mapping.getSecond());
            newAlignerPhotos.add(alignerPhoto);
        }
        for (var mapping : withoutNewAlignerPhotos) {
            var alignerPhoto = galleryService.uploadPhotoByPatient(
                    previousAligner, patientId, mapping.getFirst(), false, mapping.getSecond());
            newAlignerPhotos.add(alignerPhoto);
        }

        alignerJourney.forceAlignerChange(newAlignerNo, changeDate, request.getPreviousAlignerChangeTime());
        previousAligner.setStartDate(previousAlignerStartDate);
        previousAligner.setEndDate(previousAlignerEndDate);

        Aligner currentAligner = alignerJourney.getCurrentAligner();
        if (currentAligner == null) {
            throw new CurrentAlignerNotSetException(alignerJourneyId);
        }

        var alignerChangeAction = AlignerAction.createForceAlignerChangeAction(
                patientId,
                previousAligner,
                newAligner.getId(),
                previousAlignerPhotos,
                newAlignerPhotos,
                null,
                request.getAlignerActionType());
        previousAligner.getActions().add(alignerChangeAction);

        timelineService.addEvent(
                alignerJourney.getDoctorId(),
                UserType.DOCTOR,
                patientId,
                UserType.PATIENT,
                EventType.FORCE_ALIGNER_CHANGE,
                ForceAlignerChangeEventEventMetadata.forceAlignerChange(previousAligner, currentAligner));

        defaultAlignerReminderRepository
                .findByAlignerJourneyId(alignerJourneyId)
                .forEach(reminder -> schedulingService.scheduleDefaultReminder(reminder, currentAligner));
        var tracking = alignerJourney.getTracking();
        if (!tracking.getTrackingType().equals(TrackingType.MANUAL)) {
            notificationService.forceAlignerChangeNotification(
                    previousAlignerNo, newAlignerNo, alignerJourney.getPatient());
        }
        alignerJourney.getTracking().setPatientTrackingStatus(PatientTrackingStatus.FORCE_ALIGNER);
        var saved = alignerJourneyRepository.save(alignerJourney);
        initializeForDetails(saved);
        return saved;
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

    @Override
    @Transactional
    public AlignerJourney updateAlignerProductionAndWearDays(UpdateAlignerProductionRequest request) {
        if (request.getWearDays() != null) {
            updateWearDays(UpdateWearDaysRequest.from(request));
        }
        var ownerUserProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(ownerUserProfile);
        var result = alignerProductionService.updateAlignerProduction(request);
        initializeForDetails(result);
        return result;
    }

    @Transactional
    @Override
    public AlignerJourney pauseOrResumeTreatment(TreatmentPauseAndResumeRequest request) {

        var ownerUserProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(ownerUserProfile);
        return trackingRepository
                .findByAlignerJourneyId(request.getAlignerJourneyId())
                .filter(tracking -> tracking.getAlignerJourney() != null)
                .filter(tracking -> canOperateOnTreatment(tracking, request.getTreatmentState()))
                .map(tracking -> {
                    var treatmentPlan = tracking.getTreatmentPlan();

                    if (tracking.getAlignerJourney().getProgressStatus().equals(ProgressStatus.DEACTIVATED)) {
                        throw new AlignerJourneyDeactivatedException(
                                tracking.getAlignerJourney().getId());
                    }

                    if (request.getTreatmentState().equals(Status.PAUSED)) {
                        tracking.setStatus(Status.PAUSED);

                        treatmentPlan.setStatus(AlignerTreatmentStatus.PAUSED);
                        tracking.setPauseDate(LocalDate.now());
                        tracking.setDaysExtended(null);
                        tracking.setIsCurrentAlignerDaysExtended(false);
                        tracking.setIsCurrentAlignerChanged(false);
                        tracking.setPatientTrackingStatus(PatientTrackingStatus.PAUSED);
                        tracking.setReasonForPausing(request.getReasonForPausing());
                        tracking.setResumeDate(request.getResumeDate());

                        timelineService.addEvent(
                                tracking.getAlignerJourney().getDoctorId(),
                                UserType.DOCTOR,
                                tracking.getAlignerJourney().getPatient().getId(),
                                UserType.PATIENT,
                                EventType.TREATMENT_PAUSED,
                                new TreatmentPausedEventMetadata(
                                        AlignerJourneyDetails.from(tracking.getAlignerJourney())));
                        if (tracking.getAlignerJourney() != null) {
                            var doctorId = tracking.getAlignerJourney().getDoctorId();
                            var doctor = doctorService.getDoctor(doctorId);
                            var optionalPatient =
                                    patientDoctorOrganizationRepository
                                            .findPatientDoctorOrganizationsWithPatientByPatientId(
                                                    tracking.getPatientId());
                            optionalPatient.ifPresent(patient -> notificationService.pauseAlignerJourneyNotification(
                                    optionalPatient.get().getUserProfile().getPracticeName(),
                                    optionalPatient.get().getPatient(),
                                    doctor.isDrToDisplay()));
                        }
                    } else if (request.getTreatmentState().equals(Status.ACTIVE)) {
                        tracking.setResumeDate(request.getResumeDate());

                        if (request.getResumeDate().equals(LocalDate.now())) {
                            tracking.setStatus(Status.ACTIVE);

                            treatmentPlan.setStatus(AlignerTreatmentStatus.ACTIVE);

                            tracking.setPatientTrackingStatus(PatientTrackingStatus.RESUME);
                            timelineService.addEvent(
                                    tracking.getAlignerJourney().getDoctorId(),
                                    UserType.DOCTOR,
                                    tracking.getAlignerJourney().getPatient().getId(),
                                    UserType.PATIENT,
                                    EventType.TREATMENT_RESUMED,
                                    new TreatmentResumedEventMetadata(
                                            AlignerJourneyDetails.from(tracking.getAlignerJourney())));
                            if (tracking.getAlignerJourney() != null) {
                                var doctorId = tracking.getAlignerJourney().getDoctorId();
                                var doctor = doctorService.getDoctor(doctorId);
                                var optionalPatient = patientRepository.findById(tracking.getPatientId());
                                if (!tracking.getTrackingType().equals(TrackingType.MANUAL)) {
                                    optionalPatient.ifPresent(
                                            patient -> notificationService.resumeAlignerJourneyNotification(
                                                    doctor.getFirstName(), patient, doctor.isDrToDisplay()));
                                }
                            }
                        }
                        if (request.getStartDate() != null
                                && request.getStartDate().isEqual(LocalDate.now())) {
                            tracking.setIsCurrentAlignerChanged(true);
                        }
                        if (request.getWearDays() != null) {
                            tracking.setDaysExtended(request.getWearDays());
                            tracking.setIsCurrentAlignerDaysExtended(true);
                            var alignerJourney = tracking.getAlignerJourney();
                            var currentAligner = alignerJourney.getCurrentAligner();
                            if (currentAligner != null
                                    && currentAligner.getStartDate() != null
                                    && currentAligner.getEndDate() != null) {
                                var previousWearDays = (int) ChronoUnit.DAYS.between(
                                        currentAligner.getStartDate(), currentAligner.getEndDate());
                                tracking.setPreviousAlignerWearDays(previousWearDays);
                            }
                        }
                    }
                    if (request.getWearDays() != null) {
                        var alignerJourney = tracking.getAlignerJourney();
                        var alignerNo = request.getAlignerNo();
                        var newAligner = alignerJourney.getAligner(alignerNo);
                        newAligner.getAlignerProduction().changeStatus(ProductionSubStatus.ISSUED_TO_PATIENT);

                        Aligner currentAligner = alignerJourney.getCurrentAligner();

                        assert currentAligner != null;
                        UpdateAlignerRequest updateAlignerRequest = UpdateAlignerRequest.builder()
                                .alignerJourneyId(alignerJourney.getId())
                                .startDate(currentAligner.getStartDate())
                                .endDate(currentAligner.getStartDate().plusDays(request.getWearDays()))
                                .alignerSrNo(currentAligner.getSrNo())
                                .jawType(currentAligner.getJawType())
                                .productionLabId(tracking.getTreatmentPlan().getProductionLabId())
                                .isToTriggerNotification(false)
                                .isNotificationForPauseResume(true)
                                .build();

                        updateAligner(updateAlignerRequest);
                    }

                    if (request.getStartDate() != null) {
                        var alignerJourney = tracking.getAlignerJourney();
                        Aligner currentAligner = alignerJourney.getCurrentAligner();
                        if (currentAligner != null) {
                            var alignerNo = request.getAlignerNo();

                            alignerJourney.getAligner(currentAligner.getSrNo());
                            var newAligner = alignerJourney.getAligner(alignerNo);
                            newAligner.getAlignerProduction().changeStatus(ProductionSubStatus.ISSUED_TO_PATIENT);

                            var startDate = request.getStartDate();
                            int wearDays = treatmentPlan.getDaysToWearEachAligner();

                            UpdateAlignerRequest updateAlignerRequest = UpdateAlignerRequest.builder()
                                    .alignerJourneyId(alignerJourney.getId())
                                    .startDate(startDate)
                                    .endDate(startDate.plusDays(wearDays))
                                    .alignerSrNo(request.getAlignerNo())
                                    .jawType(currentAligner.getJawType())
                                    .productionLabId(treatmentPlan.getProductionLabId())
                                    .isToTriggerNotification(false)
                                    .isNotificationForPauseResume(true)
                                    .build();

                            updateAligner(updateAlignerRequest);
                            if (request.getStartDate().isEqual(LocalDate.now())) {
                                manualAlignerChange(AlignerChangeRequest.from(
                                        alignerJourney, currentAligner.getSrNo() + 1, request.getStartDate()));
                            }
                        }
                    }
                    treatmentPlanRepository.save(treatmentPlan);
                    var savedJourney = trackingRepository.save(tracking).getAlignerJourney();
                    initializeForDetails(savedJourney);
                    return savedJourney;
                })
                .orElseThrow(TreatmentNotFoundException::new);
    }

    @Override
    @Transactional(readOnly = true)
    public TreatmentDetails getAlignerTreatmentDetails(long alignerJourneyId) {
        var alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));
        Aligner currentAligner = alignerJourney.getCurrentAligner();
        assert currentAligner != null;

        int nextAlignerNo = currentAligner.getSrNo() + 1;
        Aligner nextAligner = alignerJourney.getAlignerIfPresent(nextAlignerNo);
        var tracking = alignerJourney.getTracking();

        LocalDate pauseDate =
                Optional.ofNullable(tracking).map(Tracking::getPauseDate).orElse(null);
        LocalDate resumeDate =
                Optional.ofNullable(tracking).map(Tracking::getResumeDate).orElse(null);

        long daysPaused = pauseDate == null ? 0 : ChronoUnit.DAYS.between(pauseDate, LocalDate.now());
        int daysRemaining = Optional.ofNullable(alignerJourney.daysRemainingOnCurrentAligner())
                .orElse(0);

        JawType nextJawType = nextAligner == null ? null : nextAligner.getJawType();
        int nextAlignerNumber = nextAligner == null ? 0 : nextAligner.getSrNo();
        int currentAlignerNumber = currentAligner.getSrNo();

        return TreatmentDetails.builder()
                .pauseDate(pauseDate)
                .daysRemainingOnCurrentAligner(daysRemaining)
                .noOfDaysTreatmentWasPausedFor((int) daysPaused)
                .resumeDate(resumeDate)
                .nextAligner(nextAlignerNumber)
                .currentAlignerNumber(currentAlignerNumber)
                .currentAlignerJawType(currentAligner.getJawType())
                .nextAlignerJawType(nextJawType)
                .build();
    }

    @Override
    @Transactional
    public AlignerAction validateAlignerChange(ValidateAlignerChangeRequest request) {
        AlignerAction alignerAction = alignerActionRepository
                .findById(request.getAlignerActionId())
                .orElseThrow(() -> new AlignerActionNotFoundException(request.getAlignerActionId()));
        alignerAction.updateValidationDetails(request);
        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(alignerAction
                        .getAligner()
                        .getAlignerJourney()
                        .getPatient()
                        .getId())
                .orElseThrow(() -> new PatientNotFoundException(alignerAction
                        .getAligner()
                        .getAlignerJourney()
                        .getPatient()
                        .getId()));

        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);

        if (request.getValidatedByUserType().equals(UserType.DOCTOR)) {
            var doctor = doctorService.getDoctor(request.getValidatedBy());
            notificationService.notifyAlignerActionValidated(
                    patient, doctor, alignerAction.getType(), doctor.isDrToDisplay());
            timelineService.addEvent(
                    doctor.getDoctorId(),
                    UserType.DOCTOR,
                    patient.getId(),
                    UserType.PATIENT,
                    EventType.ALIGNER_CHANGE_VALIDATED,
                    new AlignerChangeValidatedEventEventMetadata(AlignerJourneyDetails.from(
                            alignerAction.getAligner().getAlignerJourney())));
        }

        return alignerActionRepository.save(alignerAction);
    }

    @Override
    @Transactional(readOnly = true)
    public AlignerActionDetails getAlignerActionDetails(long alignerActionId) {
        var action = alignerActionRepository
                .findById(alignerActionId)
                .orElseThrow(() -> new AlignerActionNotFoundException(alignerActionId));
        var aligner = action.getAligner();
        var currentAlignerNumber = aligner.getSrNo();
        var nextAlignerNumber = currentAlignerNumber + 1;

        Aligner nextAligner = null;
        try {
            nextAligner = aligner.getAlignerJourney().getAligner(nextAlignerNumber);
        } catch (AlignerNotFoundException ignored) {
        }

        var details = AlignerActionDetails.builder()
                .alignerActionId(action.getId())
                .aligner(AlignerActionDetails.AlignerStatistics.from(action))
                .recommendedHoursToWearAligners(
                        action.getAligner().getAlignerJourney().getRecommendedHoursToWearAligners())
                .performAt(action.getPerformedAt())
                .performedBy(action.getPerformedBy())
                .performedByUserType(action.getPerformedByUserType())
                .type(action.getType())
                .validateAt(action.getValidatedAt())
                .validated(action.isValidated())
                .validatedBy(action.getValidatedBy())
                .updateCategory(action.getUpdateCategory())
                .validatedByUserType(action.getValidatedByUserType());

        if (action.getType().equals(AlignerActionType.ISSUE_REPORT)) {
            var metadata = (AlignerIssueActionMetadata) action.getMetadata();
            details.alignerIssue(AlignerIssueDetails.builder()
                    .alignerNo(aligner.getSrNo())
                    .jawType(aligner.getJawType())
                    .otherIssues(metadata.getOtherIssues())
                    .issue(metadata.getIssue())
                    .performedAt(action.getPerformedAt())
                    .build());
        } else if (action.getType().equals(AlignerActionType.ALIGNER_CHANGE)) {
            if (nextAligner != null) {
                details.nextAlignerDetails(AlignerDetails.forActionDetails(nextAligner));
            }
            details.previousAlignerDetails(AlignerDetails.forActionDetails(aligner));

            var metadata = (AlignerChangeActionMetadata) action.getMetadata();

            if (metadata.getNewAlignerPhotoIds() != null) {
                var photos = alignerPhotoRepository.findAllById(metadata.getNewAlignerPhotoIds());
                photos.addAll(alignerPhotoRepository.findAllById(metadata.getPreviousAlignerPhotoIds()));
                details.photos(photos.stream().map(AlignerPhotoDetails::from).toList());
            }

            List<AlignerFeedback> feedbacks = new ArrayList<>();

            if (metadata.getPreviousAlignerFeedbackIds() != null) {
                feedbacks = alignerFeedbackRepository.findAllById(metadata.getPreviousAlignerFeedbackIds());
            }

            var alignerChangeFeedback = feedbacks.stream()
                    .filter(f -> f.getFeedbackType().equals(AlignerFeedbackType.ALIGNER_CHANGE))
                    .findAny();
            var miscFeedbacks = feedbacks.stream()
                    .filter(f -> f.getFeedbackType().equals(AlignerFeedbackType.MISC))
                    .toList();

            var patientIds = miscFeedbacks.stream()
                    .filter(f -> f.getFeedbackerUserType() == UserType.PATIENT)
                    .map(AlignerFeedback::getFeedbackerUserId)
                    .collect(Collectors.toSet());
            var doctorIds = miscFeedbacks.stream()
                    .filter(f -> f.getFeedbackerUserType() == UserType.DOCTOR && f.getFeedbackerUserProfileId() == null)
                    .map(AlignerFeedback::getFeedbackerUserId)
                    .collect(Collectors.toSet());
            var userProfileIds = miscFeedbacks.stream()
                    .filter(f -> f.getFeedbackerUserType() == UserType.DOCTOR && f.getFeedbackerUserProfileId() != null)
                    .map(AlignerFeedback::getFeedbackerUserProfileId)
                    .collect(Collectors.toSet());

            Map<Long, Patient> patientMap = patientIds.isEmpty()
                    ? Map.of()
                    : patientRepository.findAllById(patientIds).stream()
                            .collect(Collectors.toMap(Patient::getId, p -> p));
            Map<Long, Doctor> doctorMap = doctorIds.isEmpty()
                    ? Map.of()
                    : doctorRepository.findAllById(doctorIds).stream().collect(Collectors.toMap(Doctor::getId, d -> d));
            Map<Long, UserProfile> userProfileMap = userProfileIds.isEmpty()
                    ? Map.of()
                    : userProfileRepository.findAllByIdWithOrgAndDoctorAndUser(userProfileIds).stream()
                            .collect(Collectors.toMap(UserProfile::getId, up -> up));

            var comments = miscFeedbacks.stream()
                    .map(f -> {
                        String senderName = "";
                        String senderProfileImageUrl = "";

                        if (f.getFeedbackerUserType() == UserType.PATIENT) {
                            Patient patient = patientMap.get(f.getFeedbackerUserId());
                            if (patient == null) throw new PatientNotFoundException(f.getFeedbackerUserId());
                            senderName = patient.fullName();
                            senderProfileImageUrl = patient.getProfilePictureUrl();
                        } else if (f.getFeedbackerUserType() == UserType.DOCTOR) {
                            if (f.getFeedbackerUserProfileId() == null) {
                                Doctor doctor = doctorMap.get(f.getFeedbackerUserId());
                                if (doctor == null) throw new DoctorNotFoundException(f.getFeedbackerUserProfileId());
                                senderName = doctor.getFirstName();
                                senderProfileImageUrl = doctor.getProfileImage();
                            } else {
                                UserProfile userProfile = userProfileMap.get(f.getFeedbackerUserProfileId());
                                if (userProfile == null)
                                    throw new DoctorNotFoundException(f.getFeedbackerUserProfileId());
                                senderName = userProfile.getUser().fullName();
                                senderProfileImageUrl =
                                        userProfile.getDoctorBilling().getCompanyImageUrl();
                            }
                        }

                        return MiscAlignerFeedbackDetails.from(f, senderName, senderProfileImageUrl);
                    })
                    .sorted(Comparator.comparing(MiscAlignerFeedbackDetails::getCreatedAt))
                    .toList();
            details.comments(comments);

            if (alignerChangeFeedback.isPresent()) {
                var f = alignerChangeFeedback.get();
                var fDetails = (AlignerChangeFeedbackDetails) f.getFeedback();

                details.alignerCheckInFeedback(AlignerCheckInFeedbackDetails.builder()
                        .alignerFeedbackId(f.getId())
                        .feedbackerUserId(f.getFeedbackerUserId())
                        .feedbackerUserType(f.getFeedbackerUserType())
                        .createdAt(f.getCreatedAt())
                        .otherIssues(fDetails.getOtherIssues())
                        .build());
            }
            var isMoveToPreviousAlignerEnable = false;

            if (nextAligner != null) {

                var nextAlignerNum = Optional.ofNullable(aligner.getAlignerJourney())
                        .map(journey -> {
                            try {
                                return journey.getAligner(nextAlignerNumber);
                            } catch (AlignerNotFoundException ignored) {
                                return null;
                            }
                        })
                        .orElse(null);

                assert aligner.getAlignerJourney() != null;
                if (aligner.getAlignerJourney().getCurrentAlignerNo() > 1
                        && aligner.getAlignerJourney().getCurrentAlignerNo() - 1 == aligner.getSrNo()) {
                    boolean noMoveBackActions = Optional.ofNullable(nextAlignerNum)
                            .map(next -> next.getActions().stream()
                                    .noneMatch(a -> a.getType().equals(AlignerActionType.MOVE_TO_PREVIOUS_ALIGNER)))
                            .orElse(false);

                    boolean hasUnapprovedAlignerChange = aligner.getActions().stream()
                            .anyMatch(changeAction -> changeAction.getType().equals(AlignerActionType.ALIGNER_CHANGE)
                                    && !changeAction.isValidated());

                    isMoveToPreviousAlignerEnable =
                            noMoveBackActions && hasUnapprovedAlignerChange && !isManuallyAlignerChanged(aligner);
                }
            }
            details.moveToPreviousAlignerEnable(isMoveToPreviousAlignerEnable);

        } else if (action.getType().equals(AlignerActionType.CHECK_IN)) {
            var metadata = (AlignerCheckInMetadata) action.getMetadata();

            var photos = alignerPhotoRepository.findAllById(metadata.getAlignerPhotoIds());
            details.photos(photos.stream().map(AlignerPhotoDetails::from).toList());

            var feedbacks = alignerFeedbackRepository.findAllById(metadata.getAlignerFeedbackIds());
            var alignerCheckInFeedback = feedbacks.stream()
                    .filter(f -> f.getFeedbackType().equals(AlignerFeedbackType.ALIGNER_CHECK_IN))
                    .findAny();
            var miscFeedbacksCheckIn = feedbacks.stream()
                    .filter(f -> f.getFeedbackType().equals(AlignerFeedbackType.MISC))
                    .toList();

            var ciPatientIds = miscFeedbacksCheckIn.stream()
                    .filter(f -> f.getFeedbackerUserType() == UserType.PATIENT)
                    .map(AlignerFeedback::getFeedbackerUserId)
                    .collect(Collectors.toSet());
            var ciDoctorIds = miscFeedbacksCheckIn.stream()
                    .filter(f -> f.getFeedbackerUserType() == UserType.DOCTOR && f.getFeedbackerUserProfileId() == null)
                    .map(AlignerFeedback::getFeedbackerUserId)
                    .collect(Collectors.toSet());
            var ciUserProfileIds = miscFeedbacksCheckIn.stream()
                    .filter(f -> f.getFeedbackerUserType() == UserType.DOCTOR && f.getFeedbackerUserProfileId() != null)
                    .map(AlignerFeedback::getFeedbackerUserProfileId)
                    .collect(Collectors.toSet());

            Map<Long, Patient> ciPatientMap = ciPatientIds.isEmpty()
                    ? Map.of()
                    : patientRepository.findAllById(ciPatientIds).stream()
                            .collect(Collectors.toMap(Patient::getId, p -> p));
            Map<Long, Doctor> ciDoctorMap = ciDoctorIds.isEmpty()
                    ? Map.of()
                    : doctorRepository.findAllById(ciDoctorIds).stream()
                            .collect(Collectors.toMap(Doctor::getId, d -> d));
            Map<Long, UserProfile> ciUserProfileMap = ciUserProfileIds.isEmpty()
                    ? Map.of()
                    : userProfileRepository.findAllByIdWithOrgAndDoctorAndUser(ciUserProfileIds).stream()
                            .collect(Collectors.toMap(UserProfile::getId, up -> up));

            var comments = miscFeedbacksCheckIn.stream()
                    .map(f -> {
                        String senderName = "";
                        String senderProfileImageUrl = "";

                        if (f.getFeedbackerUserType() == UserType.PATIENT) {
                            Patient patient = ciPatientMap.get(f.getFeedbackerUserId());
                            if (patient == null) throw new PatientNotFoundException("Patient not found");
                            senderName = patient.fullName();
                            senderProfileImageUrl = patient.getProfilePictureUrl();
                        } else if (f.getFeedbackerUserType() == UserType.DOCTOR) {
                            if (f.getFeedbackerUserProfileId() == null) {
                                Doctor doctor = ciDoctorMap.get(f.getFeedbackerUserId());
                                if (doctor == null) throw new DoctorNotFoundException(f.getFeedbackerUserProfileId());
                                senderName = doctor.getFirstName();
                                senderProfileImageUrl = doctor.getProfileImage();
                            } else {
                                UserProfile userProfile = ciUserProfileMap.get(f.getFeedbackerUserProfileId());
                                if (userProfile == null)
                                    throw new DoctorNotFoundException(f.getFeedbackerUserProfileId());
                                senderName = userProfile.getUser().fullName();
                                senderProfileImageUrl =
                                        userProfile.getDoctorBilling().getCompanyImageUrl();
                            }
                        }

                        return MiscAlignerFeedbackDetails.from(f, senderName, senderProfileImageUrl);
                    })
                    .sorted(Comparator.comparing(MiscAlignerFeedbackDetails::getCreatedAt))
                    .toList();
            details.comments(comments);

            if (alignerCheckInFeedback.isPresent()) {
                var f = alignerCheckInFeedback.get();
                var fDetails =
                        (com.dentalstack.patient.feature.timeline.metadata.feedback.AlignerCheckInFeedbackDetails)
                                f.getFeedback();

                details.alignerCheckInFeedback(AlignerCheckInFeedbackDetails.builder()
                        .alignerFeedbackId(f.getId())
                        .feedbackerUserId(f.getFeedbackerUserId())
                        .feedbackerUserType(f.getFeedbackerUserType())
                        .createdAt(f.getCreatedAt())
                        .otherIssues(fDetails.getOtherIssues())
                        .feedbacks(fDetails.getFeedbacks())
                        .build());
            }
        }

        action.setUpdateCategory(
                switch (action.getUpdateCategory()) {
                    case CRITICAL, APPROVED -> action.getUpdateCategory();
                    default -> AlignerUpdateCategory.NORMAL;
                });
        if (action.getType().equals(AlignerActionType.ISSUE_REPORT)) {

            action.setActive(false);
        }

        alignerActionRepository.save(action);

        return details.build();
    }

    private boolean isManuallyAlignerChanged(Aligner aligner) {
        return AlignerChangeEventUtil.isManuallyAlignerChanged(aligner, eventRepository);
    }

    @Override
    public AlignerJourney completeAlignerJourney(long alignerJourneyId) {
        var alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));

        alignerJourney.isTreatmentDeactivated();
        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(alignerJourney.getPatient().getId())
                .orElseThrow(() ->
                        new PatientNotFoundException(alignerJourney.getPatient().getId()));

        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        alignerJourney.setProgressStatus(ProgressStatus.COMPLETE);
        var tracking = alignerJourney.getTracking();

        if (tracking != null) {
            tracking.setStatus(Status.COMPLETE);
            var treatmentPlan = tracking.getTreatmentPlan();
            treatmentPlan.setStatus(AlignerTreatmentStatus.COMPLETE);
            treatmentPlanRepository.save(treatmentPlan);
        }

        log.info("Completed the aligner journey with id {}", alignerJourneyId);
        return alignerJourneyRepository.save(alignerJourney);
    }

    @Override
    @Transactional
    public void patientFillMissingAlignerDetails(PatientFillMissingAlignerDetails request) {

        var ownerUserProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(ownerUserProfile);
        var treatmentPlan = treatmentPlanRepository
                .findByIdWithTracking(request.getTreatmentPlanId())
                .orElseThrow(() -> new TreatmentPlanNotFoundException(request.getTreatmentPlanId()));

        treatmentPlan.updateTreatmentPlanDetails(
                treatmentPlan.getTracking(),
                CreateAlignerJourneyRequest.builder()
                        .currentAlignerDetails(CurrentAlignerDetails.builder()
                                .startDate(request.getStartDate())
                                .endDate(request.getEndDate())
                                .number(request.getCurrentAlignerNo())
                                .build())
                        .build());

        treatmentPlan.getTracking().setPatientDataFillStatus(PatientDataFillStatus.PATIENT_FILLED_DATA);
        treatmentPlan.getTracking().setAskPatientToFill(false);

        var patientId = treatmentPlan.getTracking().getPatientId();
        var patient = patientRepository.findById(patientId).orElseThrow();
        timelineService.addEvent(
                patient.getId(),
                UserType.PATIENT,
                treatmentPlan.getDoctorId(),
                UserType.DOCTOR,
                EventType.PATIENT_FILLED_MISSING_DATA,
                new MissingAlignerDataFillEventMetadata(PatientDetails.from(patient)));
        var doctor = doctorService.getDoctor(patient.getAddedByUserId());
        notificationService.notificationForFillAlignerMissingDetails(patient, doctor);

        treatmentPlanRepository.save(treatmentPlan);
    }

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public void deactivateAlignerJourney(Long treatmentPlanId, String reasonForDeactivation, String otherRemarks) {
        var treatmentPlan = treatmentPlanRepository
                .findById(treatmentPlanId)
                .orElseThrow(() -> new TreatmentPlanNotFoundException(treatmentPlanId));
        var treatmentPlanWithTracking = treatmentPlanRepository.findByIdWithTracking(treatmentPlanId);
        var progressStatuses = List.of(ProgressStatus.NOT_STARTED, ProgressStatus.IN_PROGRESS);
        var alignerJourneys = alignerJourneyRepository.findByPatientIdAndProgressStatusIn(
                treatmentPlan.getPatient().getId(), progressStatuses);

        var patient = patientRepository
                .findByIdWithDoctorProfileDetails(treatmentPlan.getPatient().getId())
                .orElseThrow(() ->
                        new PatientNotFoundException(treatmentPlan.getPatient().getId()));
        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);

        treatmentPlan.setStatus(AlignerTreatmentStatus.DEACTIVATED);

        for (AlignerJourney alignerJourney : alignerJourneys) {
            alignerJourney.setProgressStatus(ProgressStatus.DEACTIVATED);
            alignerJourneyRepository.save(alignerJourney);
        }

        if (treatmentPlanWithTracking.isPresent()) {
            treatmentPlanWithTracking.get().getTracking().setPatientTrackingStatus(PatientTrackingStatus.DEACTIVATE);
            var tracking = treatmentPlanWithTracking.get().getTracking();
            tracking.setPatientTrackingStatus(PatientTrackingStatus.DEACTIVATE);

            if (tracking.getAlignerJourney() != null) {
                tracking.getAlignerJourney().setProgressStatus(ProgressStatus.DEACTIVATED);
                if (tracking.getAlignerJourney().getProgressStatus().equals(ProgressStatus.DEACTIVATED)) {
                    timelineService.addEvent(
                            tracking.getAlignerJourney().getDoctorId(),
                            UserType.DOCTOR,
                            tracking.getAlignerJourney().getPatient().getId(),
                            UserType.PATIENT,
                            EventType.TREATMENT_DEACTIVATED,
                            new TreatmentDeactivatedEventMetaData(
                                    AlignerJourneyDetails.from(tracking.getAlignerJourney())));
                }
                var doctorId = tracking.getAlignerJourney().getDoctorId();
                var doctor = doctorService.getDoctor(doctorId);

                notificationService.deactivatedAlignerJourneyNotification(doctor.getFirstName(), patient);
                trackingRepository.save(tracking);
            }
        }
        var patientTaskTrackers = patientTaskTrackerRepository.findPatientTasksByPatientId(patient.getId());
        patientTaskTrackers.forEach(tracker -> {
            tracker.setIsActive(false);
            tracker.setCurrentStatusName("CANCELLED");
            if (tracker.getWorkflow().getName().equals(ONGOING_PRODUCT_LIST)) {
                workflowStatusRepository
                        .findByWorkflowIdAndStatusNameAndCustomFalse(
                                tracker.getWorkflow().getId(), CANCELLED)
                        .ifPresent(tracker::setCurrentWorkflowStatus);
            }
            patientTaskTrackerRepository.save(tracker);
        });
        treatmentPlan.setReasonForDeactivation(reasonForDeactivation);
        treatmentPlan.setDeactivatedAt(LocalDate.now());
        treatmentPlan.setOtherRemarks(otherRemarks);
        treatmentPlan.setApproverStatus(OrderTreatmentPlanStatus.DEACTIVATED);
        treatmentPlan.setInitiatorStatus(OrderTreatmentPlanStatus.DEACTIVATED);
        treatmentPlanRepository.save(treatmentPlan);
    }

    @Transactional(noRollbackFor = BusinessException.class)
    public AlignerJourney moveToPreviousAligner(MoveToPreviousAlignerRequest request) {
        var alignerJourneyId = request.getAlignerJourneyId();
        var previousAlignerSrNo = request.getPreviousAlignerSrNo();
        var alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));

        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(alignerJourney.getPatient().getId())
                .orElseThrow(() ->
                        new PatientNotFoundException(alignerJourney.getPatient().getId()));

        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);

        var currentAlignerNo = alignerJourney.getCurrentAlignerNo();

        if (currentAlignerNo - 1 != previousAlignerSrNo) {
            throw new BadRequestException(
                    String.format("Incorrect previous aligner no set, expected %s", currentAlignerNo - 1));
        }
        if (currentAlignerNo == 1) {
            throw new BadRequestException(
                    "Cannot move to previous aligner because current aligner is the first aligner");
        }
        var previousAligner = alignerJourney.getAligner(currentAlignerNo - 1);
        if (request.getPreviousAlignerNewEndDate().isBefore(previousAligner.getStartDate())) {
            throw new BadRequestException("New previous aligner end date cannot be before its start date");
        }
        previousAligner.setChangeDate(null);

        var currentAligner = alignerJourney.getCurrentAligner();

        if (currentAligner != null) {
            previousAligner.validateAllActions();

            dailyAlignerWearTimeRepository.deleteAll(currentAligner.getDailyWearTimeRecords());
            currentAligner.getDailyWearTimeRecords().clear();

            alignerActionRepository.save(AlignerAction.newMoveToPreviousAligner(
                    previousAligner,
                    alignerJourney.getDoctorId(),
                    currentAligner.getId(),
                    previousAligner.getId(),
                    request.getReason()));
        }

        alignerJourney.moveToPreviousAligner(request.getPreviousAlignerNewEndDate());
        alignerJourney.getTracking().setPatientTrackingStatus(PatientTrackingStatus.MOVED_TO_PREVIOUS_ALIGNER);

        var doctor = doctorService.getDoctor(alignerJourney.getDoctorId());
        if (!alignerJourney.getTracking().getTrackingType().equals(TrackingType.MANUAL)) {

            var patientDoctorOrganization = patientDoctorOrganizationRepository
                    .findPatientDoctorOrganizationsWithPatientByPatientId(
                            alignerJourney.getPatient().getId())
                    .orElseThrow(() -> new PatientNotFoundException(
                            alignerJourney.getPatient().getId()));
            var displayName = patientDoctorOrganization.getUserProfile().getPracticeName();
            notificationService.notifyMoveToPreviousAligner(alignerJourney.getPatient(), doctor, displayName);
        }

        return alignerJourneyRepository.save(alignerJourney);
    }

    @Override
    @Transactional(readOnly = true)
    public ForceAlignerChangeResponse getForceAlignerChangeDetails(long alignerJourneyId) {
        var alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));
        return ForceAlignerChangeResponse.from(alignerJourney);
    }

    @Override
    @Transactional(readOnly = true)
    public ResumeTreatmentResponse getResumeTreatmentDetails(long patientId) {
        List<Tracking> trackings = trackingRepository.findByPatientId(patientId);

        if (trackings.isEmpty()) {
            throw new TrackingNotFoundException(patientId);
        }
        Tracking latestTracking = trackings.stream()
                .max(Comparator.comparing(Tracking::getCreatedAt))
                .orElseThrow(() -> new IllegalStateException("Tracking list is not empty but max not found"));

        return ResumeTreatmentResponse.from(latestTracking);
    }

    @Override
    public AlignerJourneyResponse getCurrentJourneyDetails(long patientId) {
        return treatmentPlanRepository
                .findActiveTreatmentPlanByPatientIdAndTreatmentSubTypeWithTracking(patientId, ProductTypeName.ALIGNERS)
                .map(activeTreatmentPlan -> {
                    boolean isAlignerJourneyDeactivated =
                            activeTreatmentPlan.getTracking().getAlignerJourney() == null;
                    return isAlignerJourneyDeactivated
                            ? AlignerJourneyResponse.builder()
                                    .isAlignerJourneyDeactivated(true)
                                    .build()
                            : AlignerJourneyResponse.from(
                                    activeTreatmentPlan,
                                    activeTreatmentPlan.getTracking().getAlignerJourney());
                })
                .orElseGet(() -> AlignerJourneyResponse.builder()
                        .isAlignerJourneyDeactivated(true)
                        .build());
    }

    public PatientActionDetails getPatientActionDetails(long alignerJourneyId) {
        AlignerJourney alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));

        PatientActionDetails patientActionDetails = PatientActionDetails.builder()
                .alignerChanged(AlignerUpdateCategory.COMPLETED)
                .alignerCheckInReported(AlignerUpdateCategory.COMPLETED)
                .issueReported(AlignerUpdateCategory.COMPLETED)
                .build();

        Optional.ofNullable(alignerJourney.getTracking()).ifPresent(tracking -> {
            patientActionDetails.setType(tracking.getTrackingType());
            patientActionDetails.setStatus(tracking.getTreatmentPlan().getStatus());
        });

        List<AlignerAction> nonValidatedActions = alignerJourney.getAligners().stream()
                .flatMap(aligner -> aligner.getActions().stream())
                .filter(action -> !action.isValidated())
                .toList();

        Optional<AlignerAction> recentAlignerChange = nonValidatedActions.stream()
                .filter(action -> action.getType() == AlignerActionType.ALIGNER_CHANGE)
                .max(Comparator.comparing(AlignerAction::getPerformedAt));

        Optional<AlignerAction> recentReportAction = nonValidatedActions.stream()
                .filter(action -> action.getType() == AlignerActionType.ISSUE_REPORT)
                .max(Comparator.comparing(AlignerAction::getPerformedAt));

        Optional<AlignerAction> recentCheckIn = nonValidatedActions.stream()
                .filter(action -> action.getType() == AlignerActionType.CHECK_IN)
                .max(Comparator.comparing(AlignerAction::getPerformedAt));

        recentCheckIn.ifPresent(action -> patientActionDetails.setAlignerCheckInReported(
                recentCheckIn.get().getUpdateCategory()));

        recentAlignerChange.ifPresent(action ->
                patientActionDetails.setAlignerChanged(recentAlignerChange.get().getUpdateCategory()));

        recentReportAction.ifPresent(action ->
                patientActionDetails.setIssueReported(recentReportAction.get().getUpdateCategory()));

        return patientActionDetails;
    }

    @Override
    @Transactional
    public void patientTrackingStatusChange(PatientTrackingStatus patientTrackingStatus, long alignerJourneyId) {
        var alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));
        var patient = patientRepository
                .findByIdWithDoctorProfileDetails(alignerJourney.getPatient().getId())
                .orElseThrow(() ->
                        new PatientNotFoundException(alignerJourney.getPatient().getId()));
        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        if (alignerJourney.getTracking() != null) {
            alignerJourney.getTracking().setPatientTrackingStatus(patientTrackingStatus);
            alignerJourneyRepository.save(alignerJourney);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlignerJourneyPatientDetails> getPatientAccordingToAlignerFilter(AlignerJourneyFilterRequest request) {

        var patientIds = patientDoctorOrganizationRepository.findPatientIdsByDoctorOrgAndProfile(
                request.getDoctorId(), request.getOrganizationId(), request.getProfileId());

        var progressStatuses = List.of(ProgressStatus.IN_PROGRESS);
        var alignerJourneys =
                alignerJourneyRepository.findByPatientIdInAndProgressStatusIn(patientIds, progressStatuses);

        LocalDate today = LocalDate.now();

        Set<Long> uniquePatientIds = new HashSet<>();

        return alignerJourneys.stream()
                .filter(journey -> journey.getCurrentAligner() != null)
                .filter(alignerJourney -> Boolean.TRUE.equals(
                                alignerJourney.getTracking().getIsPatientConnected())
                        && alignerJourney.getTracking().getTrackingType().equals(TrackingType.PATIENTAPP))
                .filter(alignerJourney ->
                        alignerJourney.getPatient().getPatientStatus().equals(PatientStatus.ACTIVE))
                .filter(journey ->
                        matchesFilter(journey, journey.getCurrentAligner(), request.getAlignerJourneyFilter(), today))
                .map(journey -> AlignerJourneyPatientDetails.from(journey, journey.getCurrentAligner()))
                .filter(details -> {
                    if (request.getAlignerJourneyFilter() == AlignerJourneyFilterRequest.AlignerJourneyFilter.ALL) {
                        return uniquePatientIds.add(details.getPatientId());
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    private boolean matchesFilter(
            AlignerJourney journey,
            Aligner currentAligner,
            AlignerJourneyFilterRequest.AlignerJourneyFilter filter,
            LocalDate today) {
        var endDate = currentAligner.getEndDate();
        var nextAlignerNo = currentAligner.getSrNo() + 1;

        return switch (filter) {
            case ALIGNER_CHECK_IN_PENDING -> isAlignerCheckInPending(currentAligner, today, endDate);
            case MISSED_ALIGNER_CHANGE_DATE -> isMissedAlignerChangeDate(journey, currentAligner, today, nextAlignerNo);
            case UPCOMING_ALIGNER_CHANGE -> isUpcomingAlignerChange(today, endDate);
            case POOR_COMPLIANCE -> Objects.equals(currentAligner.compliance(), Compliance.POOR);
            case GOOD_COMPLIANCE -> Objects.equals(currentAligner.compliance(), Compliance.GOOD);
            case ALL -> true;
        };
    }

    private boolean isAlignerCheckInPending(Aligner currentAligner, LocalDate today, LocalDate endDate) {
        return currentAligner.getActions() == null
                && !today.isAfter(endDate)
                && ChronoUnit.DAYS.between(today, endDate) <= 3;
    }

    private boolean isMissedAlignerChangeDate(
            AlignerJourney journey, Aligner currentAligner, LocalDate today, int nextAlignerNo) {
        return nextAlignerNo <= journey.totalAligners() && today.isAfter(currentAligner.getEndDate());
    }

    private boolean isUpcomingAlignerChange(LocalDate today, LocalDate endDate) {
        return !today.isAfter(endDate) && ChronoUnit.DAYS.between(today, endDate) <= 5;
    }

    private boolean canOperateOnTreatment(Tracking tracking, Status requestedStatus) {
        Status currentStatus = tracking.getStatus();
        return (!currentStatus.equals(Status.DRAFT) && requestedStatus.equals(Status.PAUSED))
                || (currentStatus.equals(Status.PAUSED) && requestedStatus.equals(Status.ACTIVE));
    }

    @Override
    public List<DoctorPatientDetails> getActivePatients(Long doctorId) {
        List<AlignerSummary> alignerSummaries = alignerRepository.findActiveAlignerSummaries(doctorId);

        return alignerSummaries.stream()
                .map(summary -> {
                    DoctorPatientDetails details = new DoctorPatientDetails();

                    details.setPatientId(summary.getPatientId());
                    details.setPatientName(summary.getFirstName() + " " + summary.getLastName());
                    details.setMobile(summary.getMobileNo());
                    details.setCountryCode(summary.getCountryCode());
                    details.setPatientProfile(summary.getProfilePictureUrl());
                    details.setEmail(summary.getEmail());

                    details.setAlignerJourneyId(summary.getAlignerJourneyId());
                    details.setStatus(summary.getTreatmentStatus());
                    details.setProgressStatus(summary.getProgressStatus());
                    details.setTreatmentStartDate(summary.getTreatmentStartDate());

                    String currentAligner = summary.getCurrentAlignerJawType() + " " + summary.getCurrentAlignerSrNo()
                            + " of " + summary.getTotalAligners();
                    details.setCurrentAligner(currentAligner);
                    details.setBrandName(summary.getBrandName());

                    details.setCurrentAlignerStartDate(summary.getStartDate());
                    details.setCurrentAlignerEndDate(summary.getEndDate());
                    details.setDaysRemaining(summary.getDaysRemaining());
                    details.setTreatmentPauseDate(summary.getTreatmentPauseDate());
                    details.setTreatmentCompleteDate(summary.getTreatmentCompleteDate());

                    details.setCurrentAlignerCompliance(summary.getCompliance());

                    details.setPracticeLocationName(summary.getPracticeLocationName());

                    return details;
                })
                .collect(Collectors.toList());
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

    @Transactional(readOnly = true)
    public DailyWearTimeLogsResponse getDailyWearTimeLogs(
            Long patientId, int page, int size, LocalDate fromDate, LocalDate toDate) {

        if (patientRepository.findById(patientId).isEmpty()) {
            throw new PatientNotFoundException(patientId);
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<DailyAlignerWearTime> dailyWearTimePage;

        if (fromDate != null && toDate != null) {
            dailyWearTimePage = dailyAlignerWearTimeRepository.findDailyWearTimeLogsByPatientIdAndDateRange(
                    patientId, fromDate, toDate, pageable);
        } else {
            dailyWearTimePage = dailyAlignerWearTimeRepository.findDailyWearTimeLogsByPatientId(patientId, pageable);
        }

        List<DailyWearTimeLogEntry> logEntries = dailyWearTimePage.getContent().stream()
                .map(this::convertToLogEntry)
                .collect(Collectors.toList());

        PaginationInfo paginationInfo = PaginationInfo.builder()
                .page(page)
                .size(size)
                .totalElements(dailyWearTimePage.getTotalElements())
                .totalPages(dailyWearTimePage.getTotalPages())
                .hasNext(dailyWearTimePage.hasNext())
                .hasPrevious(dailyWearTimePage.hasPrevious())
                .build();

        return DailyWearTimeLogsResponse.builder()
                .logs(logEntries)
                .pagination(paginationInfo)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ConsistencyAlertDetails getConsistencyAlertDetails(Long patientId) {
        List<DailyAlignerWearTime> wearTimes = dailyAlignerWearTimeRepository.findWearTimesForActiveAligners(patientId);
        long untrackedDays =
                wearTimes.stream().filter(w -> w.getTotalWearTimeSecs() == 0).count();

        long ghostLogs = wearTimes.stream()
                .filter(w -> w.getTotalWearTimeSecs() >= 86400)
                .count();

        return ConsistencyAlertDetails.builder()
                .untrackedDays(untrackedDays)
                .ghostLogs(ghostLogs)
                .build();
    }

    private DailyWearTimeLogEntry convertToLogEntry(DailyAlignerWearTime dailyWearTime) {
        List<WearTimeSession> sessions = generateSessionsFromDailyData(dailyWearTime);

        return DailyWearTimeLogEntry.builder()
                .date(dailyWearTime.getDate())
                .totalDurationSecs(dailyWearTime.getTotalWearTimeSecs())
                .sessions(sessions)
                .build();
    }

    private List<WearTimeSession> generateSessionsFromDailyData(DailyAlignerWearTime dailyWearTime) {
        List<WearTimeSession> sessions = new ArrayList<>();
        long totalWearTime = dailyWearTime.getTotalWearTimeSecs();

        if (totalWearTime <= 0) {
            return sessions;
        }

        if (totalWearTime <= 3600) {
            sessions.add(createSession("09:00:00", totalWearTime));
        } else if (totalWearTime <= 14400) {
            long firstSession = totalWearTime / 2;
            long secondSession = totalWearTime - firstSession;

            sessions.add(createSession("09:00:00", firstSession));
            sessions.add(createSession("15:00:00", secondSession));
        } else {
            long sessionDuration = totalWearTime / 3;
            long remainder = totalWearTime % 3;

            sessions.add(createSession("08:00:00", sessionDuration));
            sessions.add(createSession("14:00:00", sessionDuration));
            sessions.add(createSession("20:00:00", sessionDuration + remainder));
        }

        return sessions;
    }

    private WearTimeSession createSession(String startTime, long durationSecs) {
        LocalTime inTime = LocalTime.parse(startTime);
        LocalTime outTime = inTime.plusSeconds(durationSecs);

        return WearTimeSession.builder()
                .inTime(inTime)
                .outTime(outTime)
                .durationSecs(durationSecs)
                .build();
    }

    private void initializeForDetails(AlignerJourney aj) {
        aj.getAligners().size();
        aj.getCustomReminders().size();
        for (var aligner : aj.getAligners()) {
            aligner.getDailyWearTimeRecords().size();
            aligner.getPhotos().size();
            aligner.getFeedbacks().size();
            aligner.getActions().size();
            var alignerProduction = aligner.getAlignerProduction();
            if (alignerProduction != null) {
                alignerProduction.getSubStatus();
            }
        }
        aj.getDefaultAlignerReminders().size();
        aj.getPreAlignerPhotos().size();
        aj.getNotes().size();
        aj.getAlignerProductionOrders().size();
        aj.getPatient().getId();
        var tracking = aj.getTracking();
        if (tracking != null) {
            var tp = tracking.getTreatmentPlan();
            if (tp != null) {
                tp.getAlignerDetailsMetadata();
                tp.getTreatmentPlanName();
                tp.getStatus();
            }
        }
    }
}
