package com.dentalstack.patient.feature.aligner.service.impl;

import static com.dentalstack.patient.feature.aligner.util.AlignerJourneyUtils.filterPhotoWithName;

import com.amazonaws.services.kms.model.NotFoundException;
import com.dentalstack.patient.feature.aligner.dto.aligner.action.*;
import com.dentalstack.patient.feature.aligner.dto.aligner.feedback.ReportAlignerIssueRequest;
import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerFeedback;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.entity.AlignerPhoto;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerAction;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerActionType;
import com.dentalstack.patient.feature.aligner.entity.action.metadata.AlignerChangeActionMetadata;
import com.dentalstack.patient.feature.aligner.entity.action.metadata.AlignerCheckInMetadata;
import com.dentalstack.patient.feature.aligner.enums.ProductionSubStatus;
import com.dentalstack.patient.feature.aligner.enums.TrackingType;
import com.dentalstack.patient.feature.aligner.enums.aligner.ProgressStatus;
import com.dentalstack.patient.feature.aligner.enums.aligner.action.AlignerUpdateCategory;
import com.dentalstack.patient.feature.aligner.exception.aligner.AlignerJourneyNotFoundException;
import com.dentalstack.patient.feature.aligner.exception.aligner.CurrentAlignerNotSetException;
import com.dentalstack.patient.feature.aligner.exception.aligner.action.AlignerActionNotFoundException;
import com.dentalstack.patient.feature.aligner.repository.AlignerFeedbackRepository;
import com.dentalstack.patient.feature.aligner.repository.AlignerJourneyRepository;
import com.dentalstack.patient.feature.aligner.repository.DefaultAlignerReminderRepository;
import com.dentalstack.patient.feature.aligner.repository.action.AlignerActionRepository;
import com.dentalstack.patient.feature.aligner.service.AlignerActionService;
import com.dentalstack.patient.feature.dashboardlabel.cache.DashboardCacheEvictService;
import com.dentalstack.patient.feature.doctor.dto.DoctorDetails;
import com.dentalstack.patient.feature.doctor.entity.CustomerAccessAndRevoke;
import com.dentalstack.patient.feature.doctor.entity.PatientDoctorOrganization;
import com.dentalstack.patient.feature.doctor.repository.CustomerAccessAndRevokeRepository;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.notification.dto.AddChatRequest;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.notification.service.NotificationService;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.reminder.service.SchedulingService;
import com.dentalstack.patient.feature.storage.gallery.service.GalleryService;
import com.dentalstack.patient.feature.subcription.exception.StorageLimitExceededException;
import com.dentalstack.patient.feature.subcription.service.SubscriptionService;
import com.dentalstack.patient.feature.timeline.dto.ChatEventObject;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.*;
import com.dentalstack.patient.feature.timeline.service.TimelineService;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.exception.BadRequestException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlignerActionServiceImpl implements AlignerActionService {

    private final AlignerJourneyRepository alignerJourneyRepository;
    private final AlignerFeedbackRepository alignerFeedbackRepository;
    private final AlignerActionRepository alignerActionRepository;
    private final DefaultAlignerReminderRepository defaultAlignerReminderRepository;

    private final GalleryService galleryService;
    private final TimelineService timelineService;
    private final NotificationService notificationService;
    private final SchedulingService schedulingService;
    private final DoctorService doctorService;
    private final SubscriptionService subscriptionService;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final PatientRepository patientRepository;
    private final DashboardCacheEvictService dashboardCacheEvictService;
    private final CustomerAccessAndRevokeRepository customerAccessAndRevokeRepository;
    private final ChatService chatService;

    @Override
    @Transactional
    public AlignerJourney reportIssue(ReportAlignerIssueRequest request) {
        final Long alignerJourneyId = request.getAlignerJourneyId();
        final var alignerNo = request.getAlignerNo();

        AlignerJourney alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));
        alignerJourney.validate();

        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(alignerJourney.getPatient().getId())
                .orElseThrow(() ->
                        new PatientNotFoundException(alignerJourney.getPatient().getId()));
        var userProfile = patient.getDoctorOrganization().getUserProfile();
        Long organizationId = patient.getDoctorOrganization().getOrganization().getId();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);

        var aligner = alignerJourney.getAligner(alignerNo);
        var report = AlignerAction.newIssueReportAction(request, aligner);
        aligner.getActions().add(report);

        var feedback = AlignerFeedback.ofTypeIssueReport(request, aligner);
        feedback = alignerFeedbackRepository.save(feedback);
        alignerActionRepository.save(report);

        aligner.getFeedbacks().add(feedback);
        alignerJourneyRepository.save(alignerJourney);

        AlignerIssueEventMetadata metadata = AlignerIssueEventMetadata.from(
                aligner, request.getUserId(), request.getAlignerIssue(), request.getOtherIssues(), report);

        timelineService.addEvent(
                alignerJourney.getDoctorId(),
                UserType.DOCTOR,
                request.getUserId(),
                UserType.PATIENT,
                EventType.ISSUE_REPORTED,
                metadata);
        var doctor = doctorService.getDoctor(patient.getAddedByUserId());

        Optional<CustomerAccessAndRevoke> customerAccessAndRevoke =
                customerAccessAndRevokeRepository.findByProfileIdAndOrganizationId(userProfile.getId(), organizationId);
        customerAccessAndRevoke.ifPresent((c) -> {
            if (c.getIsTrackingEnabled()) {
                notificationService.notificationForIssueReported(
                        doctor, patient, alignerJourney.getId(), report.getId(), userProfile);
            }
        });

        ChatEventObject chatEventObject = ChatEventObject.builder()
                .eventType(EventType.ISSUE_REPORTED)
                .eventMetadata(metadata)
                .build();

        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode jsonNode = objectMapper.valueToTree(chatEventObject);

        var addChatRequest = AddChatRequest.builder()
                .createdBy(patient.fullName())
                .doctorName(userProfile.getUser().displayName())
                .doctorId(doctor.getDoctorId())
                .patientId(patient.getId())
                .patientName(patient.fullName())
                .roleName(UserType.PATIENT.name())
                .additionalData(jsonNode)
                .build();

        try {
            chatService.addChatEvent(addChatRequest);
        } catch (Exception e) {
            log.info("Something went wrong during chat event issue reported by patient: " + e.getLocalizedMessage());
        }

        log.info(
                "Reported an issue for aligner {} in aligner journey {} by {} {}",
                alignerNo,
                alignerJourneyId,
                request.getUserType(),
                request.getUserId());

        return alignerJourney;
    }

    @Override
    @Transactional
    public void checkIn(CheckInAlignerRequest request, MultipartFile[] photos) {
        var userId = request.getUserId();
        var userType = request.getUserType();
        if (!userType.equals(UserType.PATIENT)) {
            throw new BadRequestException("Only patient can check in the aligner");
        }

        final long alignerJourneyId = request.getAlignerJourneyId();
        final int alignerNo = request.getAlignerNo();

        AlignerJourney alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));

        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(alignerJourney.getPatient().getId())
                .orElseThrow(() ->
                        new PatientNotFoundException(alignerJourney.getPatient().getId()));

        var userProfile = patient.getDoctorOrganization().getUserProfile();
        Long organizationId = patient.getDoctorOrganization().getOrganization().getId();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);

        alignerJourney.validate();
        var aligner = alignerJourney.getAligner(alignerNo);

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
            withoutNewAlignerPhotos = request.getWithoutAlignerPhotoFiles().stream()
                    .map(mapping -> Pair.of(
                            mapping.getSaveAsFilename(), filterPhotoWithName(photos, mapping.getOriginalFilename())))
                    .toList();
            withNewAlignerPhotos = request.getWithAlignerPhotoFiles().stream()
                    .map(mapping -> Pair.of(
                            mapping.getSaveAsFilename(), filterPhotoWithName(photos, mapping.getOriginalFilename())))
                    .toList();
        }

        List<AlignerPhoto> alignerCheckInPhotos = new ArrayList<>();
        for (var mapping : withNewAlignerPhotos) {
            try {
                var alignerPhoto = galleryService.uploadPhotoByPatient(
                        aligner, userId, mapping.getFirst(), true, mapping.getSecond());
                alignerCheckInPhotos.add(alignerPhoto);
            } catch (Exception e) {
                log.error("Failed to upload photo: {}", mapping.getFirst(), e);
            }
        }
        for (var mapping : withoutNewAlignerPhotos) {
            try {
                var alignerPhoto = galleryService.uploadPhotoByPatient(
                        aligner, userId, mapping.getFirst(), false, mapping.getSecond());
                alignerCheckInPhotos.add(alignerPhoto);
            } catch (Exception e) {
                log.error("Failed to upload photo: {}", mapping.getFirst(), e);
            }
        }

        AlignerFeedback feedback = null;
        if (request.getFeedback() != null) {
            feedback = AlignerFeedback.ofTypeAlignerCheckIn(request, aligner);
            feedback = alignerFeedbackRepository.save(feedback);
            aligner.getFeedbacks().add(feedback);
        }
        if (!alignerCheckInPhotos.isEmpty()) {
            String parentPath = String.format(
                    "Aligners/%s/Aligner %d/",
                    alignerJourney.getTracking().getTreatmentPlan().getTreatmentPlanName(), alignerNo);
            timelineService.addEvent(
                    alignerJourney.getPatient().getId(),
                    UserType.PATIENT,
                    alignerJourney.getDoctorId(),
                    UserType.DOCTOR,
                    EventType.PHOTO_ADDED_BY_PATIENT,
                    new PatientAddedPhotoEventMetadata(
                            alignerJourney.getPatient().getId(), parentPath));
        }

        var alignerCheckInAction =
                AlignerAction.alignerCheckInByPatient(userId, aligner, alignerCheckInPhotos, feedback);
        aligner.getActions().add(alignerCheckInAction);
        var doctor = doctorService.getDoctor(patient.getAddedByUserId());
        alignerActionRepository.save(alignerCheckInAction);

        alignerJourneyRepository.save(alignerJourney);

        if (alignerCheckInAction.getUpdateCategory().equals(AlignerUpdateCategory.CRITICAL)) {
            Optional<CustomerAccessAndRevoke> customerAccessAndRevoke =
                    customerAccessAndRevokeRepository.findByProfileIdAndOrganizationId(
                            userProfile.getId(), organizationId);
            customerAccessAndRevoke.ifPresent(c -> {
                if (c.getIsTrackingEnabled()) {
                    notificationService.notificationForCriticalCheckIn(
                            doctor,
                            patient,
                            alignerJourney.getId(),
                            alignerCheckInAction.getId(),
                            userProfile.getId(),
                            userProfile.getDoctor().getId());
                }
            });
        } else {
            Optional<CustomerAccessAndRevoke> customerAccessAndRevoke =
                    customerAccessAndRevokeRepository.findByProfileIdAndOrganizationId(
                            userProfile.getId(), organizationId);
            customerAccessAndRevoke.ifPresent(c -> {
                if (c.getIsTrackingEnabled()) {
                    notificationService.notificationForNormalCheckIn(
                            doctor,
                            patient,
                            alignerJourney.getId(),
                            alignerCheckInAction.getId(),
                            userProfile.getId(),
                            userProfile.getUser().getMobileNo(),
                            userProfile.getDoctor().getId());
                }
            });
        }

        timelineService.addEvent(
                userId,
                UserType.PATIENT,
                alignerJourney.getDoctorId(),
                UserType.DOCTOR,
                EventType.ALIGNER_CHECK_IN_FOR_DOCTOR,
                AlignerCheckInForDoctorEventMetadata.checkIn(
                        aligner,
                        alignerCheckInPhotos,
                        alignerJourney.getPatient().getId(),
                        request.getFeedback(),
                        alignerCheckInAction));

        timelineService.addEvent(
                doctor.getDoctorId(),
                UserType.DOCTOR,
                userId,
                UserType.PATIENT,
                EventType.ALIGNER_CHECK_IN,
                AlignerCheckInEventMetadata.checkIn(
                        aligner,
                        alignerCheckInPhotos,
                        alignerJourney.getPatient().getId(),
                        request.getFeedback(),
                        alignerCheckInAction));
    }

    @Override
    @Transactional
    public void commentOnAction(CommentOnAlignerActionRequest request) {
        var alignerActionId = request.getAlignerActionId();
        var action = alignerActionRepository
                .findById(alignerActionId)
                .orElseThrow(() -> new AlignerActionNotFoundException(alignerActionId));
        var allowedActionTypes = List.of(
                AlignerActionType.ALIGNER_CHANGE, AlignerActionType.FORCE_ALIGNER_CHANGE, AlignerActionType.CHECK_IN);
        if (!allowedActionTypes.contains(action.getType())) {
            throw new BadRequestException(
                    String.format("Comments can only added for action types %s", allowedActionTypes));
        }

        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(
                        action.getAligner().getAlignerJourney().getPatient().getId())
                .orElseThrow(() -> new PatientNotFoundException(
                        action.getAligner().getAlignerJourney().getPatient().getId()));

        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);

        var aligner = action.getAligner();
        var alignerNo = aligner.getSrNo();
        var alignerJourney = aligner.getAlignerJourney();
        alignerJourney.validate();

        var doctor = doctorService.getDoctor(patient.getAddedByUserId());
        var feedback = AlignerFeedback.ofTypeMiscFeedback(request, aligner);
        feedback = alignerFeedbackRepository.save(feedback);
        aligner.getFeedbacks().add(feedback);

        switch (action.getType()) {
            case CHECK_IN -> {
                var details = (AlignerCheckInMetadata) action.getMetadata();
                if (details.getAlignerFeedbackIds() != null) {
                    details.getAlignerFeedbackIds().add(feedback.getId());
                } else {
                    details.setAlignerFeedbackIds(Collections.singletonList(feedback.getId()));
                }
            }
            case ALIGNER_CHANGE, FORCE_ALIGNER_CHANGE -> {
                var details = (AlignerChangeActionMetadata) action.getMetadata();
                if (details.getPreviousAlignerFeedbackIds() != null) {
                    details.getPreviousAlignerFeedbackIds().add(feedback.getId());
                } else {
                    details.setPreviousAlignerFeedbackIds(Collections.singletonList(feedback.getId()));
                }
            }
        }

        alignerJourneyRepository.save(alignerJourney);

        if (request.getUserType().equals(UserType.DOCTOR)) {
            var patientDoctorOrganization = patientDoctorOrganizationRepository
                    .findPatientDoctorOrganizationsWithPatientByPatientId(
                            alignerJourney.getPatient().getId())
                    .orElseThrow(() -> new PatientNotFoundException(
                            alignerJourney.getPatient().getId()));
            var displayName = patientDoctorOrganization.getUserProfile().getPracticeName();

            notificationService.notificationForAlignerFeedbackAddedByDoctor(
                    patient, alignerJourney, doctor.isDrToDisplay(), displayName);

            log.info("Adding aligner change feedback event, {}", request);
            timelineService.addEvent(
                    alignerJourney.getDoctorId(),
                    UserType.DOCTOR,
                    alignerJourney.getPatient().getId(),
                    UserType.PATIENT,
                    EventType.ALIGNER_CHANGE_FEEDBACK_ADDED_BY_DOCTOR,
                    AlignerChangeFeedbackAddedByPatientEventMetadata.from(
                            alignerJourney, aligner, feedback, alignerActionId));
        } else {
            notificationService.notificationForAlignerFeedbackAddedByPatient(
                    doctor, patient, alignerJourney.getId(), alignerActionId);

            log.info("Adding aligner change feedback event, {}", request);
            timelineService.addEvent(
                    alignerJourney.getPatient().getId(),
                    UserType.PATIENT,
                    alignerJourney.getDoctorId(),
                    UserType.DOCTOR,
                    EventType.ALIGNER_CHANGE_FEEDBACK_ADDED,
                    AlignerChangeFeedbackAddedEventMetadata.from(alignerJourney, aligner, feedback, alignerActionId));
        }

        log.info(
                "Added feedback for aligner {} in aligner journey {} by {} {}",
                alignerNo,
                alignerJourney.getId(),
                request.getUserType(),
                request.getUserId());
    }

    @Override
    @Transactional
    public void changeAligner(ChangeAlignerRequest request) {
        if (!request.getUserType().equals(UserType.PATIENT)) {
            throw new BadRequestException("Only patient is allowed to change the aligner");
        }

        var alignerJourneyId = request.getAlignerJourneyId();
        var alignerJourney = alignerJourneyRepository
                .findById(alignerJourneyId)
                .orElseThrow(() -> new AlignerJourneyNotFoundException(alignerJourneyId));

        AlignerJourney finalAlignerJourney = alignerJourney;
        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(alignerJourney.getPatient().getId())
                .orElseThrow(() -> new PatientNotFoundException(
                        finalAlignerJourney.getPatient().getId()));

        var userProfile = patient.getDoctorOrganization().getUserProfile();
        Long organizationId = patient.getDoctorOrganization().getOrganization().getId();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        alignerJourney.validate();

        final long patientId = request.getUserId();
        final int newAlignerNo = request.getNextAlignerNo();
        final LocalDate changeDate = request.getChangeDate();

        Integer previousAlignerNo = alignerJourney.getCurrentAlignerNo();
        if (previousAlignerNo == null) {
            throw new CurrentAlignerNotSetException(alignerJourneyId);
        }
        if (newAlignerNo != previousAlignerNo + 1) {
            throw new BadRequestException("The new aligner number must be the current aligner number plus one.");
        }

        var previousAligner = alignerJourney.getAligner(previousAlignerNo);
        var newAligner = alignerJourney.getAligner(newAlignerNo);
        newAligner.getAlignerProduction().changeStatus(ProductionSubStatus.ISSUED_TO_PATIENT);

        var recommendedChangeDate = previousAligner.getEndDate();
        DoctorDetails doctorDetails = doctorService.getDoctor(alignerJourney.getDoctorId());

        var startDate = previousAligner.getStartDate();

        alignerJourney.changeCurrentAligner(newAlignerNo, changeDate);

        Aligner currentAligner = alignerJourney.getCurrentAligner();
        if (currentAligner == null) {
            throw new CurrentAlignerNotSetException(alignerJourneyId);
        }

        var alignerChangeAction = AlignerAction.alignerChangeByPatient(patientId, previousAligner, newAligner.getId());
        previousAligner.getActions().add(alignerChangeAction);
        previousAligner.setEndDate(recommendedChangeDate);
        previousAligner.setStartDate(startDate);
        alignerActionRepository.save(alignerChangeAction);

        alignerJourney = alignerJourneyRepository.save(alignerJourney);
        Long delayInDays = ChronoUnit.DAYS.between(previousAligner.getEndDate(), previousAligner.getChangeDate());

        Optional<CustomerAccessAndRevoke> customerAccessAndRevoke =
                customerAccessAndRevokeRepository.findByProfileIdAndOrganizationId(userProfile.getId(), organizationId);
        AlignerJourney finalAlignerJourney1 = alignerJourney;
        customerAccessAndRevoke.ifPresent(c -> {
            if (c.getIsTrackingEnabled()) {
                notificationService.notificationForAlignerChange(
                        userProfile,
                        patient,
                        doctorDetails,
                        previousAligner.getSrNo(),
                        newAlignerNo,
                        finalAlignerJourney1.getId(),
                        alignerChangeAction.getId(),
                        delayInDays);
            }
        });

        AlignerChangeEventEventMetadata metadata =
                AlignerChangeEventEventMetadata.from(previousAligner, currentAligner, alignerChangeAction);

        timelineService.addEvent(
                patientId,
                UserType.PATIENT,
                alignerJourney.getDoctorId(),
                UserType.DOCTOR,
                EventType.ALIGNER_CHANGE,
                metadata);

        defaultAlignerReminderRepository
                .findByAlignerJourneyId(alignerJourneyId)
                .forEach(reminder -> schedulingService.scheduleDefaultReminder(reminder, currentAligner));

        ChatEventObject chatEventObject = ChatEventObject.builder()
                .eventType(EventType.ALIGNER_CHECK_IN)
                .eventMetadata(metadata)
                .build();

        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        JsonNode jsonNode = mapper.valueToTree(chatEventObject);

        var addChatRequest = AddChatRequest.builder()
                .createdBy(patient.fullName())
                .doctorName(userProfile.getUser().displayName())
                .doctorId(userProfile.getDoctor().getId())
                .patientId(patient.getId())
                .patientName(patient.fullName())
                .roleName(UserType.PATIENT.name())
                .additionalData(jsonNode)
                .build();

        try {
            chatService.addChatEvent(addChatRequest);
        } catch (Exception e) {
            log.info("Something went wrong during check-in chat event: " + e.getLocalizedMessage());
        }
    }

    @Override
    public ActionDetailCategorizedResponse getAlignerActionDetails(
            AlignerActionType enumActionType, Boolean isActive, Long doctorId, Long organizationId) {

        List<PatientDoctorOrganization> patientDoctorOrganizations =
                patientDoctorOrganizationRepository.findByDoctorIdAndOrganizationId(doctorId, organizationId);

        Set<Long> mappedPatientIds = patientDoctorOrganizations.stream()
                .map(pdo -> pdo.getPatient().getId())
                .collect(Collectors.toSet());

        var alignerJourneys = alignerJourneyRepository.findByDoctorIdAndProgressStatusAndPatientIdIn(
                doctorId, ProgressStatus.IN_PROGRESS, mappedPatientIds.stream().toList());

        ActionDetailCategorizedResponse response = new ActionDetailCategorizedResponse();
        Set<String> addedPatientActionCombos = new HashSet<>();

        List<ActionDetail> allActionsList = new ArrayList<>();

        for (AlignerJourney alignerJourney : alignerJourneys) {
            if (alignerJourney.getTracking().getTrackingType().equals(TrackingType.PATIENTAPP)) {
                Long patientId = alignerJourney.getPatient().getId();

                List<AlignerAction> filteredActions = alignerJourney.getAligners().stream()
                        .flatMap(aligner -> aligner.getActions().stream())
                        .filter(action -> !action.isValidated()
                                && action.getType() != AlignerActionType.FORCE_ALIGNER_CHANGE
                                && action.getType() != AlignerActionType.MOVE_TO_PREVIOUS_ALIGNER
                                && (action.isActive() == isActive))
                        .sorted(Comparator.comparing(AlignerAction::getPerformedAt))
                        .toList();

                for (AlignerAction action : filteredActions) {
                    String patientActionCombo = patientId + "-" + action.getType();
                    if (!addedPatientActionCombos.contains(patientActionCombo)) {
                        ActionDetail actionDetail = new ActionDetail(action);
                        response.getCategorizedActions().get(action.getType()).add(actionDetail);
                        allActionsList.add(actionDetail);

                        addedPatientActionCombos.add(patientActionCombo);
                    }
                }
            }
        }

        for (AlignerActionType actionType : AlignerActionType.values()) {
            List<ActionDetail> actions = response.getCategorizedActions().get(actionType);
            response.getActionCounts().put(actionType, actions.size());
        }

        response.getCategorizedActions().put(AlignerActionType.ALL, allActionsList);
        response.getActionCounts().put(AlignerActionType.ALL, allActionsList.size());

        return response;
    }

    @Override
    public Map<AlignerActionType, Integer> getAlignerActionCounts(Long doctorId, Boolean isActive) {
        var alignerJourneys =
                alignerJourneyRepository.findByDoctorIdAndProgressStatus(doctorId, ProgressStatus.IN_PROGRESS);

        Map<AlignerActionType, Integer> actionCounts = new EnumMap<>(AlignerActionType.class);

        for (AlignerActionType actionType : AlignerActionType.values()) {
            actionCounts.put(actionType, 0);
        }

        for (AlignerJourney alignerJourney : alignerJourneys) {
            if (alignerJourney.getTracking().getTrackingType().equals(TrackingType.PATIENTAPP)) {
                Long patientId = alignerJourney.getPatient().getId();

                List<AlignerAction> filteredActions = alignerJourney.getAligners().stream()
                        .flatMap(aligner -> aligner.getActions().stream())
                        .filter(action -> !action.isValidated()
                                && action.getType() != AlignerActionType.FORCE_ALIGNER_CHANGE
                                && action.getType() != AlignerActionType.MOVE_TO_PREVIOUS_ALIGNER
                                && (action.isActive() == isActive))
                        .toList();

                for (AlignerAction action : filteredActions) {
                    actionCounts.put(action.getType(), actionCounts.get(action.getType()) + 1);
                }
            }
        }

        return actionCounts;
    }

    @Override
    public void inactivateActions(List<Long> actionIds, long doctorId) {
        actionIds.forEach(this::inactivateAction);
    }

    private void inactivateAction(Long actionId) {
        var action = alignerActionRepository
                .findById(actionId)
                .orElseThrow(() -> new AlignerActionNotFoundException(actionId));
        action.setActive(false);

        log.info("Inactivated the action {}", actionId);
        alignerActionRepository.save(action);
    }
}
