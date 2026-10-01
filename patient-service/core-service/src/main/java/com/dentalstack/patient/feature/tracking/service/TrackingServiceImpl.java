package com.dentalstack.patient.feature.tracking.service;

import com.dentalstack.patient.feature.aligner.dto.aligner.AlignerJourneyDetails;
import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.enums.TrackingType;
import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.doctor.entity.CustomerAccessAndRevoke;
import com.dentalstack.patient.feature.doctor.repository.CustomerAccessAndRevokeRepository;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.invitation.repository.PatientInvitationDetailsRepository;
import com.dentalstack.patient.feature.notification.service.NotificationService;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.storage.drive.service.GoogleDriveService;
import com.dentalstack.patient.feature.storage.files.repository.FileRepository;
import com.dentalstack.patient.feature.subcription.service.SubscriptionService;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.CreateRefinementTreatmentEventMetaData;
import com.dentalstack.patient.feature.timeline.metadata.event.ResumeTreatmentReminderEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.TreatmentResumedEventMetadata;
import com.dentalstack.patient.feature.timeline.service.TimelineService;
import com.dentalstack.patient.feature.tracking.dto.CurrentAlignerDetails;
import com.dentalstack.patient.feature.tracking.dto.GetTrackingResponse;
import com.dentalstack.patient.feature.tracking.dto.StlFileToggleRequest;
import com.dentalstack.patient.feature.tracking.entity.Tracking;
import com.dentalstack.patient.feature.tracking.enums.PatientTrackingStatus;
import com.dentalstack.patient.feature.tracking.enums.Status;
import com.dentalstack.patient.feature.tracking.enums.ToggleType;
import com.dentalstack.patient.feature.tracking.exception.SomePatientAlreadyHaveTrackingEnabledException;
import com.dentalstack.patient.feature.tracking.repository.TrackingRepository;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.dentalstack.patient.feature.treatment.repository.TreatmentPlanRepository;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.enums.ProductTypeName;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.function.Consumer;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@RequiredArgsConstructor
@Service
public class TrackingServiceImpl implements TrackingService {

    private final TrackingRepository trackingRepository;
    private final TreatmentPlanRepository treatmentPlanRepository;

    private final PatientInvitationDetailsRepository patientInvitationDetailsRepository;
    private final TimelineService timelineService;
    private final PatientRepository patientRepository;
    private final DoctorService doctorService;
    private final NotificationService notificationService;
    private final SubscriptionService subscriptionService;
    private final UserProfileRepository userProfileRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final CustomerAccessAndRevokeRepository customerAccessAndRevokeRepository;
    private final FileRepository fileRepository;
    private final GoogleDriveService googleDriveService;

    @Override
    public GetTrackingResponse getTracking(Long doctorId, Long patientId, ProductTypeName treatmentSubtype) {
        validateInput(doctorId, patientId, treatmentSubtype);

        Tracking tracking = fetchActiveTrackingForPatient(patientId);
        TreatmentPlan treatmentPlan = tracking.getTreatmentPlan();
        AlignerJourney alignerJourney = null;
        if (tracking.getAlignerJourney() != null) {
            alignerJourney = tracking.getAlignerJourney();
        }

        CurrentAlignerDetails currentAlignerDetails = null;
        if (alignerJourney != null) {
            currentAlignerDetails = getCurrentAlignerDetails(alignerJourney);
        } else {
            currentAlignerDetails = getDetailsOfCurrentAligner(treatmentPlan);
        }

        InvitationStatus invitationStatus = getInvitationStatus(doctorId, patientId);

        return GetTrackingResponse.builder()
                .treatmentPlanId(treatmentPlan.getId())
                .alignerJourneyId(alignerJourney != null ? alignerJourney.getId() : null)
                .trackingType(tracking.getTrackingType())
                .userType(tracking.getUserType())
                .askPatientToFill(tracking.getAskPatientToFill())
                .sendToPatient(tracking.getSendToPatient())
                .invitationStatus(invitationStatus)
                .pricing(tracking.getPricing())
                .status(tracking.getStatus())
                .patientDataFillStatus(tracking.getPatientDataFillStatus())
                .currentAlignerDetails(currentAlignerDetails)
                .alignerTreatmentStatus(treatmentPlan.getStatus())
                .build();
    }

    @Override
    public void reminderForPausedTreatment() {
        List<Tracking> allPausedTreatments = trackingRepository.findAllPausedTreatments();
        LocalDate today = LocalDate.now();

        for (Tracking treatment : allPausedTreatments) {
            if (treatment.getResumeDate() != null && treatment.getResumeDate().equals(today)) {
                if (treatment.getAlignerJourney() != null) {
                    timelineService.addEvent(
                            treatment.getPatientId(),
                            UserType.PATIENT,
                            treatment.getAlignerJourney().getDoctorId(),
                            UserType.DOCTOR,
                            EventType.RESUME_TREATMENT_REMINDER,
                            new ResumeTreatmentReminderEventMetadata(
                                    treatment.getPatientId(),
                                    treatment.getAlignerJourney().getId()));
                    var alignerJourney = treatment.getAlignerJourney();
                    var patient = patientRepository
                            .findByIdWithDoctorProfileDetails(treatment.getPatientId())
                            .orElseThrow(() -> new PatientNotFoundException(treatment.getPatientId()));

                    var userProfileId =
                            patient.getDoctorOrganization().getUserProfile().getId();
                    var orgWhatsAppDetails =
                            subscriptionService.isWhatsAppMessagingEnabled(patient.getAddedByUserId(), userProfileId);
                    var doctor = doctorService.getDoctor(patient.getAddedByUserId());
                    notificationService.notificationForResumePausedTreatment(
                            patient, doctor, alignerJourney.getId(), orgWhatsAppDetails);
                }
            }
        }
    }

    @Override
    public void reminderForResumeTreatment() {
        List<Tracking> allActiveTreatments = trackingRepository.findAllActiveTreatments();
        LocalDate today = LocalDate.now();

        for (Tracking tracking : allActiveTreatments) {
            LocalDate resumeDate = tracking.getResumeDate();
            if (resumeDate != null && resumeDate.equals(today)) {
                tracking.setPatientTrackingStatus(PatientTrackingStatus.RESUME);
                AlignerJourney alignerJourney = tracking.getAlignerJourney();
                if (alignerJourney != null) {
                    timelineService.addEvent(
                            alignerJourney.getDoctorId(),
                            UserType.DOCTOR,
                            alignerJourney.getPatient().getId(),
                            UserType.PATIENT,
                            EventType.TREATMENT_RESUMED,
                            new TreatmentResumedEventMetadata(AlignerJourneyDetails.from(alignerJourney)));

                    var doctorId = alignerJourney.getDoctorId();
                    var doctor = doctorService.getDoctor(doctorId);
                    var optionalPatient = patientRepository.findById(tracking.getPatientId());
                    if (!tracking.getTrackingType().equals(TrackingType.MANUAL)) {
                        optionalPatient.ifPresent(patient -> notificationService.resumeAlignerJourneyNotification(
                                doctor.getFirstName(), patient, doctor.isDrToDisplay()));
                    }
                    trackingRepository.save(tracking);
                }
            }
        }
    }

    @Override
    public void refinementReminder() {
        LocalDate elevenDaysAgo = LocalDate.now().minusDays(11);
        LocalDate tenDaysAgo = LocalDate.now().minusDays(10);
        log.info("Checking for treatments deactivated between: {} and {}", elevenDaysAgo, tenDaysAgo);

        long totalEligible = 0;

        List<TreatmentPlan> latestTreatmentPlans = treatmentPlanRepository.findLatestTreatmentPlanForAllPatients();

        log.info("Processing {} latest treatment plans", latestTreatmentPlans.size());

        for (TreatmentPlan treatmentPlan : latestTreatmentPlans) {
            Long patientId = treatmentPlan.getPatient().getId();

            log.info(
                    "Processing latest treatment plan ID: {} for patient ID: {}. Status: {}, DeactivatedAt: {}, CreatedAt: {}",
                    treatmentPlan.getId(),
                    patientId,
                    treatmentPlan.getStatus(),
                    treatmentPlan.getDeactivatedAt(),
                    treatmentPlan.getCreatedAt());

            if (treatmentPlan.getStatus() == AlignerTreatmentStatus.DEACTIVATED
                    && treatmentPlan.getDeactivatedAt() != null
                    && treatmentPlan.getDeactivatedAt().isBefore(tenDaysAgo)
                    && !treatmentPlan.getDeactivatedAt().isBefore(elevenDaysAgo)) {

                timelineService.addEvent(
                        patientId,
                        UserType.PATIENT,
                        treatmentPlan.getDoctorId(),
                        UserType.DOCTOR,
                        EventType.CREATE_REFINEMENT_REMINDER,
                        new CreateRefinementTreatmentEventMetaData(patientId));

                var patient = treatmentPlan.getPatient();
                var doctor = doctorService.getDoctor(patient.getAddedByUserId());
                notificationService.notificationForRefinementReminder(patient, doctor);

                totalEligible++;
            }
        }
    }

    @Override
    public void toggleIsTrackingForCustomer(Long profileId) throws SomePatientAlreadyHaveTrackingEnabledException {
        UserProfile userProfile = userProfileRepository
                .findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile not found with id " + profileId));

        if (userProfile.getDoctor() == null || userProfile.getOrganization() == null) {
            throw new IllegalStateException("Doctor or Organization not set for profile " + profileId);
        }

        if (Boolean.TRUE.equals(userProfile.getIsTrackingEnabled()) && userProfile.getInviterProfile() != null) {
            List<Long> patientIds = patientDoctorOrganizationRepository.findPatientIdsByDoctorOrgAndProfile(
                    userProfile.getDoctor().getId(),
                    userProfile.getOrganization().getId(),
                    userProfile.getId());

            if (patientIds == null || patientIds.isEmpty()) {
                userProfile.setIsTrackingEnabled(false);
                userProfileRepository.save(userProfile);
                return;
            }

            Boolean anyActive = treatmentPlanRepository.existsActiveTrackingForPatientIds(patientIds, Status.ACTIVE);

            if (Boolean.TRUE.equals(anyActive)) {
                throw new SomePatientAlreadyHaveTrackingEnabledException(profileId);
            }

            userProfile.setIsTrackingEnabled(false);
        } else {
            userProfile.setIsTrackingEnabled(true);
        }

        userProfileRepository.save(userProfile);
    }

    @Override
    public void toggleDetails(StlFileToggleRequest request) {
        UserProfile userProfile = userProfileRepository
                .findById(request.getCustomerProfileId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "UserProfile not found with id " + request.getCustomerProfileId()));

        CustomerAccessAndRevoke access = customerAccessAndRevokeRepository
                .findByProfileIdAndOrganizationId(request.getCustomerProfileId(), request.getOrganizationId())
                .orElseThrow(() -> new IllegalStateException("Customer access not found"));

        for (String toggle : request.getToggleType()) {
            ToggleType type = ToggleType.valueOf(toggle);

            switch (type) {
                case TRACKING -> {
                    validateTracking(access, userProfile, request.getOrganizationId());
                    access.setIsTrackingEnabled(!Boolean.TRUE.equals(access.getIsTrackingEnabled()));
                }

                case STL_FILE -> access.setIsStlFileViewEnabled(!Boolean.TRUE.equals(access.getIsStlFileViewEnabled()));

                case SCAN_FILE -> handleFileToggle(
                        access,
                        userProfile,
                        request.getOrganizationId(),
                        Boolean.TRUE.equals(access.getIsScanFileViewEnabled()),
                        fileRepository::findAllScanFilesByPatientIds,
                        access::setIsScanFileViewEnabled);

                case PRINT_FILE -> handleFileToggle(
                        access,
                        userProfile,
                        request.getOrganizationId(),
                        Boolean.TRUE.equals(access.getIsPrintFileViewEnabled()),
                        fileRepository::findAllPrintFilesByPatientIds,
                        access::setIsPrintFileViewEnabled);

                default -> throw new IllegalArgumentException("Unsupported toggle type: " + toggle);
            }
        }

        customerAccessAndRevokeRepository.save(access);
    }

    private void validateTracking(CustomerAccessAndRevoke access, UserProfile userProfile, Long organizationId) {
        if (!Boolean.TRUE.equals(access.getIsTrackingEnabled())) {
            return;
        }
        List<Long> patientIds = patientDoctorOrganizationRepository.findPatientIdsByDoctorOrgAndProfile(
                userProfile.getDoctor().getId(), organizationId, userProfile.getId());
        if (patientIds != null && !patientIds.isEmpty()) {
            boolean anyActive = treatmentPlanRepository.existsActiveTrackingForPatientIds(patientIds, Status.ACTIVE);

            if (anyActive) {
                throw new SomePatientAlreadyHaveTrackingEnabledException(userProfile.getId());
            }
        }
    }

    private void handleFileToggle(
            CustomerAccessAndRevoke access,
            UserProfile userProfile,
            Long organizationId,
            boolean currentlyEnabled,
            Function<Long[], List<String>> fileFetcher,
            Consumer<Boolean> flagSetter) {
        Long ownerProfileId = userProfileRepository.findSuperAdminProfileId(organizationId);
        if (ownerProfileId == null) {
            return;
        }
        List<Long> patientIds = patientDoctorOrganizationRepository.findPatientIdsByCustomerProfileAndOrganization(
                userProfile.getId(), organizationId);

        if (patientIds == null || patientIds.isEmpty()) {
            flagSetter.accept(!currentlyEnabled);
            return;
        }
        List<String> fullPaths = fileFetcher.apply(patientIds.toArray(new Long[0]));
        List<String> emails = List.of(userProfile.getUser().getEmail());
        for (String fullPath : fullPaths) {
            try {
                if (!currentlyEnabled) {
                    googleDriveService.shareFile(ownerProfileId, fullPath, emails, "reader", null);
                } else {
                    googleDriveService.unShareFile(ownerProfileId, fullPath, emails, null);
                }
            } catch (Exception e) {
                log.error(
                        "Failed to update sharing for file {}, profileId {}, error {}",
                        fullPath,
                        userProfile.getId(),
                        e.getMessage(),
                        e);
            }
        }
        flagSetter.accept(!currentlyEnabled);
    }

    private CurrentAlignerDetails getDetailsOfCurrentAligner(TreatmentPlan treatmentPlan) {
        return CurrentAlignerDetails.from(
                treatmentPlan.getCurrentAlignerNumber(), treatmentPlan.getStartDate(), treatmentPlan.getEndDate());
    }

    private void validateInput(Long doctorId, Long patientId, ProductTypeName treatmentSubtype) {
        if (doctorId == null || patientId == null || treatmentSubtype == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "required parameters cannot be null.\nParameters: [doctor_id, patient_id, treatment_subtype]");
        }
    }

    private Tracking fetchActiveTrackingForPatient(Long patientId) {
        List<Tracking> trackings = trackingRepository.findByPatientId(patientId);

        if (trackings.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, String.format("No treatment plan found for the patient(id=%s)", patientId));
        }
        return trackings.stream()
                .max(Comparator.comparing(Tracking::getCreatedAt))
                .orElseThrow(() -> new IllegalStateException("Tracking list is not empty but max not found"));
    }

    private CurrentAlignerDetails getCurrentAlignerDetails(AlignerJourney alignerJourney) {
        if (alignerJourney == null) {
            return null;
        }
        Aligner currentAligner = alignerJourney.getCurrentAligner();
        if (currentAligner != null) {
            return CurrentAlignerDetails.from(
                    currentAligner.getSrNo(), currentAligner.getStartDate(), currentAligner.getEndDate());
        } else {
            return null;
        }
    }

    private InvitationStatus getInvitationStatus(Long doctorId, Long patientId) {
        var patientInvitationDetails = patientInvitationDetailsRepository.findByPatientId(patientId);
        if (patientInvitationDetails.isPresent()) {
            var invitation = patientInvitationDetails.get().getInvitation();
            return invitation.getStatus();
        } else {
            return InvitationStatus.NOT_SENT;
        }
    }
}
