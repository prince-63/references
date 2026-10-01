package com.dentalstack.patient.feature.invitation.service;

import static com.dentalstack.patient.feature.storage.files.service.FilesService.ORDER_FOLDER_NAME;

import com.dentalstack.patient.application.config.WhatsappTemplateTypeProperties;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.enums.TrackingType;
import com.dentalstack.patient.feature.aligner.repository.AlignerJourneyRepository;
import com.dentalstack.patient.feature.aligner.repository.CustomAlignerReminderRepository;
import com.dentalstack.patient.feature.aligner.repository.DefaultAlignerReminderRepository;
import com.dentalstack.patient.feature.braces.enums.BracesTreatmentStage;
import com.dentalstack.patient.feature.braces.repository.BracesJourneyRepository;
import com.dentalstack.patient.feature.chat.entity.ChatParticipant;
import com.dentalstack.patient.feature.chat.entity.DoctorChat;
import com.dentalstack.patient.feature.chat.repository.DoctorChatRepository;
import com.dentalstack.patient.feature.doctor.dto.AssignPracticeLocationToPatientRequest;
import com.dentalstack.patient.feature.doctor.dto.DoctorDetails;
import com.dentalstack.patient.feature.doctor.entity.PatientDoctorOrganization;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationDetails;
import com.dentalstack.patient.feature.invitation.dto.*;
import com.dentalstack.patient.feature.invitation.dto.v2.InvitePatientRequestV2;
import com.dentalstack.patient.feature.invitation.entity.Invitation;
import com.dentalstack.patient.feature.invitation.entity.PatientCustomerInvitation;
import com.dentalstack.patient.feature.invitation.entity.PatientInvitationDetails;
import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.invitation.enums.PatientBelongsTo;
import com.dentalstack.patient.feature.invitation.exception.*;
import com.dentalstack.patient.feature.invitation.repository.InvitationCodeRepository;
import com.dentalstack.patient.feature.invitation.repository.InvitationRepository;
import com.dentalstack.patient.feature.invitation.repository.PatientCustomerInvitationRepository;
import com.dentalstack.patient.feature.invitation.repository.PatientInvitationDetailsRepository;
import com.dentalstack.patient.feature.notification.dto.*;
import com.dentalstack.patient.feature.notification.dto.planningcustomer.AddPatientEmailRequest;
import com.dentalstack.patient.feature.notification.enums.MessageSendTo;
import com.dentalstack.patient.feature.notification.enums.OrgName;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.notification.service.NotificationService;
import com.dentalstack.patient.feature.notification.service.PlanningCustomerEmailService;
import com.dentalstack.patient.feature.notification.service.PlanningNotificationService;
import com.dentalstack.patient.feature.notification.util.ResolveOrgName;
import com.dentalstack.patient.feature.notification.util.ResolveWebUrl;
import com.dentalstack.patient.feature.notification.util.WhatsAppUtilities;
import com.dentalstack.patient.feature.notification.util.XOrganizationNameResolver;
import com.dentalstack.patient.feature.order.entity.Order;
import com.dentalstack.patient.feature.order.repository.OrderRepository;
import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.entity.PatientLead;
import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import com.dentalstack.patient.feature.patient.enums.PatientType;
import com.dentalstack.patient.feature.patient.exception.PatientAlreadyAssignedToDoctorException;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientLeadRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.patient.service.PatientProfileService;
import com.dentalstack.patient.feature.patient_onboarding.repository.PatientOnboardingRepository;
import com.dentalstack.patient.feature.patient_onboarding.service.PatientOnboardingService;
import com.dentalstack.patient.feature.rewards.service.UserWalletService;
import com.dentalstack.patient.feature.storage.drive.async.DriveAsyncHelper;
import com.dentalstack.patient.feature.storage.files.dto.CreateFolderRequest;
import com.dentalstack.patient.feature.storage.files.service.FilesService;
import com.dentalstack.patient.feature.subcription.exception.OrderLimitExceededException;
import com.dentalstack.patient.feature.subcription.repository.SubscriptionRepository;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.AddedPatientEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.PatientInvitationAcceptedEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.PatientInvitationReceivedEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.UpgradePatientToMobileAppEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.planningcustomer.PlanningCustomerPatientOnboardMetadata;
import com.dentalstack.patient.feature.timeline.repository.EventRepository;
import com.dentalstack.patient.feature.timeline.service.TimelineService;
import com.dentalstack.patient.feature.tracking.entity.Tracking;
import com.dentalstack.patient.feature.tracking.repository.TrackingRepository;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.feature.user.exception.UserNotFoundException;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.vsp.entity.VspOrder;
import com.dentalstack.patient.feature.vsp.repository.VspOrderRepository;
import com.dentalstack.patient.feature.vsp.util.VspCaseActivityLogger;
import com.dentalstack.patient.feature.workflow.core.task_tracker.dto.PatientTaskTrackerResponse;
import com.dentalstack.patient.feature.workflow.core.task_tracker.entity.PatientTaskTracker;
import com.dentalstack.patient.feature.workflow.core.task_tracker.mapper.PatientTaskTrackerCreate;
import com.dentalstack.patient.feature.workflow.core.task_tracker.repository.PatientTaskTrackerRepository;
import com.dentalstack.patient.feature.workflow.core.task_tracker.service.PatientTaskTrackerService;
import com.dentalstack.patient.feature.workflow.core.workflows.entity.Workflow;
import com.dentalstack.patient.feature.workflow.core.workflows.entity.WorkflowStatus;
import com.dentalstack.patient.feature.workflow.core.workflows.exception.WorkflowStatusNotFoundException;
import com.dentalstack.patient.feature.workflow.core.workflows.repository.WorkflowRepository;
import com.dentalstack.patient.feature.workflow.core.workflows.repository.WorkflowStatusRepository;
import com.dentalstack.patient.feature.workflow.product.repository.ServiceProductRepository;
import com.dentalstack.patient.feature.workflow.service_configuration.repository.ServiceConfigurationRepository;
import com.dentalstack.patient.feature.workflow.util.CaseActivityLogger;
import com.dentalstack.patient.global.config.TimezoneConfig;
import com.dentalstack.patient.global.dto.UserId;
import com.dentalstack.patient.global.enums.ProductTypeName;
import com.dentalstack.patient.global.exception.BusinessException;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class InvitationServiceImpl implements InvitationService {

    private final InvitationCodeGenerator invitationCodeGenerator;

    private final DoctorService doctorService;
    private final PatientProfileService patientProfileService;
    private final NotificationService notificationService;
    private final TimelineService timelineService;
    private final ChatService chatService;
    private final DriveAsyncHelper driveAsyncHelper;

    private final InvitationRepository invitationRepository;
    private final AlignerJourneyRepository alignerJourneyRepository;
    private final PatientRepository patientRepository;
    private final InvitationCodeRepository invitationCodeRepository;
    private final EventRepository eventRepository;
    private final PatientLeadRepository patientLeadRepository;
    private final PatientInvitationDetailsRepository patientInvitationDetailsRepository;
    private final CustomAlignerReminderRepository customAlignerReminderRepository;
    private final DefaultAlignerReminderRepository defaultAlignerReminderRepository;
    private final BracesJourneyRepository bracesJourneyRepository;
    private final TrackingRepository trackingRepository;
    private final UserProfileRepository userProfileRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final PatientTaskTrackerService patientTaskTrackerService;
    private final WorkflowRepository workflowRepository;
    private final WorkflowStatusRepository workflowStatusRepository;
    private final WhatsappTemplateTypeProperties whatsappTemplateTypeProperties;
    private final PatientCustomerInvitationRepository patientCustomerInvitationRepository;
    private final PatientTaskTrackerRepository patientTaskTrackerRepository;
    private final OrderRepository orderRepository;
    private final ServiceProductRepository serviceProductRepository;
    private final FilesService filesService;
    private final UserWalletService walletService;
    private final WhatsAppUtilities whatsAppUtilities;
    private final WhatsAppRequestBuilder whatsAppRequestBuilder;
    private final CaseActivityLogger caseActivityLogger;
    private final VspCaseActivityLogger vspCaseActivityLogger;
    private final ServiceConfigurationRepository serviceConfigurationRepository;
    private final PlanningCustomerEmailService planningCustomerEmailService;
    private final ResolveWebUrl resolveWebUrl;
    private final PatientOnboardingService patientOnboardingService;
    private final PatientOnboardingRepository patientOnboardingRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final VspOrderRepository vspOrderRepository;
    private final DoctorChatRepository doctorChatRepository;
    private final PlanningNotificationService planningNotificationService;
    private final XOrganizationNameResolver xOrgNameResolver;

    // ...existing code...

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    @Deprecated
    public Invitation invitePatient(InvitePatientRequest request) {
        var inviterId = request.getInviterId();
        var inviterUserType = request.getInviterUserType();
        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

        Long adminProfileId = null;
        if (adminWithDefaultTag && userProfile.getInviterProfile() != null) {
            adminProfileId = userProfile.getId();
            userProfile = userProfile.getInviterProfile();
            request.setProfileId(userProfile.getId());
            request.setOrganizationId(userProfile.getOrganization().getId());
        }

        Boolean isVspPlanning = serviceConfigurationRepository.isVspPlanningUser(request.getProfileId());
        if (request.getReceiverProfileId() != null) {
            UserProfile receiverUserProfile = userProfileRepository
                    .findByIdWithOrgAndDoctorAndUser(request.getReceiverProfileId())
                    .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
            checkOrderSubscription(receiverUserProfile, isVspPlanning);
        }

        if (request.getMobile() != null) {
            var existingPatient = patientInvitationDetailsRepository.findByMobile(request.getMobile());
            existingPatient.ifPresent(details -> {
                Patient patient = details.getPatient();
                if (patient.getProductTypeNames().contains(ProductTypeName.BRACES)) {
                    throw new BracesPatientFoundException(patient.getFirstName());
                }
            });
        }
        if (request.getEmail() != null) {
            var existingPatient = patientInvitationDetailsRepository.findByEmail(
                    request.getEmail().toLowerCase());
            existingPatient.ifPresent(details -> {
                Patient patient = details.getPatient();
                if (patient.getProductTypeNames().contains(ProductTypeName.BRACES)) {
                    throw new BracesPatientFoundException(patient.getFirstName());
                }
            });
        }
        boolean alreadyInvited = invitationRepository
                .findByInviterIdAndInviterUserTypeAndInvitedUserType(inviterId, inviterUserType, UserType.PATIENT)
                .stream()
                .map(Invitation::getPatientInvitation)
                .filter(Objects::nonNull)
                .anyMatch(invite -> {
                    boolean mobileMatches =
                            request.getMobile() != null && Objects.equals(invite.getMobile(), request.getMobile());
                    boolean emailMatches = request.getEmail() != null
                            && Objects.equals(
                                    invite.getEmail() != null
                                            ? invite.getEmail().toLowerCase()
                                            : null,
                                    request.getEmail().toLowerCase());
                    return emailMatches || mobileMatches;
                });

        if (alreadyInvited) {
            throw new UserAlreadyInvitedException(inviterId, inviterUserType, UserType.PATIENT);
        }

        Patient patient = patientProfileService.registerPatientFromInvitation(adminProfileId, request);
        patientOnboardingService.initialize(patient);
        var invitation = Invitation.from(request, patient);

        var invitationCode = invitationCodeGenerator.generateInvitationCode(invitation);
        invitation.setInvitationCode(invitationCode);
        var savedPatient = patientRepository.save(patient);
        var savedInvitation = invitationRepository.save(invitation);

        if (!Objects.equals(request.getPatientType(), PatientType.EXISTING_PATIENT)) {
            var taskTrackerForNewPatient = createPatientTaskTrackerForNewPatient(savedPatient, userProfile, null);
            if (request.getPracticeProfileId() != null
                    && !request.getPracticeProfileId().equals(request.getProfileId())
                    && taskTrackerForNewPatient != null
                    && !adminWithDefaultTag) {
                var practiceProfile = userProfileRepository
                        .findByIdWithOrgAndDoctorAndUser(request.getPracticeProfileId())
                        .orElseThrow(() -> new DoctorNotFoundException(request.getPracticeProfileId()));
                createPatientTaskTrackerForNewPatient(savedPatient, practiceProfile, taskTrackerForNewPatient.getId());
            } else if (userProfile.isPractice()
                    && taskTrackerForNewPatient != null
                    && userProfile.getInviterProfile() != null) {
                var orgUserProfile = userProfileRepository
                        .findByIdWithOrgAndDoctorAndUser(
                                userProfile.getInviterProfile().getId())
                        .orElseThrow(() -> new DoctorNotFoundException(request.getPracticeProfileId()));
                createPatientTaskTrackerForNewPatient(savedPatient, orgUserProfile, taskTrackerForNewPatient.getId());
            }

            if (userProfile.isEnterprise()
                    && taskTrackerForNewPatient != null
                    && request.getPracticeProfileId() != null
                    && !request.getPracticeProfileId().equals(request.getProfileId())
                    && adminWithDefaultTag) {
                var practiceProfile = userProfileRepository
                        .findByIdWithOrgAndDoctorAndUser(request.getPracticeProfileId())
                        .orElseThrow(() -> new DoctorNotFoundException(request.getPracticeProfileId()));
                createPatientTaskTrackerForNewPatient(savedPatient, practiceProfile, taskTrackerForNewPatient.getId());
            }

            if (request.getPracticeProfileId() == null && taskTrackerForNewPatient != null) {
                patientCustomerInvitationRepository.save(PatientCustomerInvitation.builder()
                        .invitationCode(request.getPracticeInviteCode())
                        .patient(patient)
                        .parentTaskTrackerId(taskTrackerForNewPatient.getId())
                        .build());
            }
        }

        if (Objects.equals(request.getPatientType(), PatientType.EXISTING_PATIENT)) {
            patientCustomerInvitationRepository.save(PatientCustomerInvitation.builder()
                    .invitationCode(request.getPracticeInviteCode())
                    .patient(patient)
                    .build());
        }

        if (request.getPracticeLocationId() != null) {
            doctorService.assignPracticeLocationToPatientForApp(AssignPracticeLocationToPatientRequest.builder()
                    .userId(patient.getAddedByUserId())
                    .patientId(savedPatient.getId())
                    .practiceLocationId(request.getPracticeLocationId())
                    .build());
        }

        timelineService.addEvent(
                request.getInviterId(),
                UserType.DOCTOR,
                savedPatient.getId(),
                UserType.PATIENT,
                EventType.PATIENT_ADDED,
                new AddedPatientEventMetadata(PatientDetails.from(savedPatient)));
        createDefaultFolder(request, patient);

        String url = "profile/" + patient.getId().toString();
        if (whatsAppUtilities.isSupperAdmin(request.getProfileId())) {
            List<String> mobileNumbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                    patient.getId(), List.of(MessageSendTo.CUSTOMER));
            OrgName orgName = whatsAppUtilities.resolveOrgName(userProfile.getId());
            UserProfile user = userProfile;
            mobileNumbers.forEach((mobileNo) -> {
                whatsAppRequestBuilder
                        .buildRequestIfMobileExists(
                                true,
                                orgName,
                                mobileNo,
                                whatsappTemplateTypeProperties.getNEW_PATIENT_ASSIGNED_BY_ADMIN(),
                                List.of(patient.fullName(), user.getUser().displayName(), url))
                        .ifPresent(chatService::sendWhatsAppMessage);
            });
        }

        if (whatsAppUtilities.isCustomer(request.getProfileId())) {
            List<String> mobileNumbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                    patient.getId(), List.of(MessageSendTo.ADMIN, MessageSendTo.SUPER_ADMIN));
            OrgName orgName = whatsAppUtilities.resolveOrgName(userProfile.getId());
            UserProfile user = userProfile;
            mobileNumbers.forEach((mobileNo) -> {
                whatsAppRequestBuilder
                        .buildRequestIfMobileExists(
                                true,
                                orgName,
                                mobileNo,
                                whatsappTemplateTypeProperties.getNEW_PATIENT_ADDED_BY_PRACTICE(),
                                List.of(patient.fullName(), user.getUser().displayName(), url))
                        .ifPresent(chatService::sendWhatsAppMessage);
            });
        }
        ;

        log.info("Patient invited by the {} with id {}", inviterUserType, inviterId);
        return savedInvitation;
    }

    @Transactional(noRollbackFor = BusinessException.class)
    @Override
    public Invitation invitePatientV2(InvitePatientRequestV2 request) {
        var inviterId = request.getInviterId();
        var inviterUserType = request.getInviterUserType();
        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        Long ownerProfileId = null;
        if (adminWithDefaultTag && userProfile.getInviterProfile() != null) {
            ownerProfileId = userProfile.getId();
            userProfile = userProfile.getInviterProfile();
            request.setProfileId(userProfile.getId());
            request.setOrganizationId(userProfile.getOrganization().getId());
        }

        Boolean isVspPlanning = serviceConfigurationRepository.isVspPlanningUser(request.getProfileId());
        if (request.getReceiverProfileId() != null) {
            UserProfile receiverUserProfile = userProfileRepository
                    .findByIdWithOrgAndDoctorAndUser(request.getReceiverProfileId())
                    .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
            checkOrderSubscription(receiverUserProfile, isVspPlanning);
        }

        checkMobileEmailAlreadyExists(request);
        checkInvitationAlreadySent(request, inviterId, inviterUserType);

        Patient patient = patientProfileService.registerPatientFromInvitationV2(ownerProfileId, request);
        patientOnboardingService.initialize(patient);
        var invitation = Invitation.from(request, patient);

        var invitationCode = invitationCodeGenerator.generateInvitationCode(invitation);
        invitation.setInvitationCode(invitationCode);
        var savedPatient = patientRepository.save(patient);
        var savedInvitation = invitationRepository.save(invitation);

        if (Objects.equals(request.getPatientType(), PatientType.EXISTING_PATIENT)) {
            patientCustomerInvitationRepository.save(PatientCustomerInvitation.builder()
                    .invitationCode(request.getPracticeInviteCode())
                    .patient(patient)
                    .build());
        }

        final Patient finalPatient = patient;
        final Long finalUserProfileId = userProfile.getId();
        final Long finalProfileId = request.getProfileId();
        try {
            var freshUserProfile = userProfileRepository
                    .findByIdWithOrgAndDoctorAndUser(finalUserProfileId)
                    .orElseThrow(() -> new DoctorNotFoundException(finalUserProfileId));
            createKanbanTaskForPatient(request, freshUserProfile, savedPatient);

            if (request.getPracticeLocationId() != null) {
                doctorService.assignPracticeLocationToPatientForApp(AssignPracticeLocationToPatientRequest.builder()
                        .userId(finalPatient.getAddedByUserId())
                        .patientId(savedPatient.getId())
                        .practiceLocationId(request.getPracticeLocationId())
                        .build());
            }

            createDefaultFolder(request, finalPatient);

            if (serviceConfigurationRepository.isPlanningUser(finalProfileId)) {
                caseActivityLogger.logCaseSavedAsDraftIfAbsent(savedPatient, freshUserProfile);
            } else if (isVspPlanning) {
                vspCaseActivityLogger.logCaseSavedAsDraftIfAbsent(savedPatient, freshUserProfile);
            }

            Optional<UserProfile> customerProfile =
                    Optional.of(finalPatient.getDoctorOrganization().getUserProfile());
            customerProfile.ifPresent(r -> {
                if (serviceConfigurationRepository.isPlanningUser(finalProfileId)) {
                    planningCustomerEmailService.sendAddPatientEmail(AddPatientEmailRequest.builder()
                            .email(r.getUser().getEmail())
                            .orgName(ResolveOrgName.resolveOrgName(r.getOrganizationBrandName())
                                    .name())
                            .portalUrl(resolveWebUrl.resolveOrgName(r.getOrganizationBrandName()))
                            .patientFirstName(finalPatient.getFirstName())
                            .patientLastName(finalPatient.getLastName())
                            .practiceLocation(finalPatient.getPracticeLocationName())
                            .patientId(finalPatient.getCustomerMappedId())
                            .build());

                    timelineService.addEvent(
                            finalPatient.getId(),
                            UserType.PATIENT,
                            r.getDoctor().getId(),
                            UserType.DOCTOR,
                            EventType.PLANNING_CUSTOMER_PATIENT_ONBOARDED,
                            new PlanningCustomerPatientOnboardMetadata(finalPatient.getId(), finalPatient.fullName()),
                            r,
                            r.getOrganization());

                    String title = "New Patient Added";
                    String message = String.format(
                            "A record for %s has been created. Submit a case to start planning.",
                            finalPatient.fullName());
                    chatService.sendNotification(SendNotificationRequest.builder()
                            .patientId(finalPatient.getId())
                            .title(title)
                            .message(message)
                            .notificationIndex(156)
                            .mobile(r.getUser().getMobileNo())
                            .email(r.getUser().getEmail())
                            .isDoctorApp(true)
                            .serviceName("PLANNING")
                            .xOrgName(xOrgNameResolver
                                    .resolveFromUser(r.getUser())
                                    .getXOrgName())
                            .organizationId(xOrgNameResolver
                                    .resolveFromUser(r.getUser())
                                    .getOrganizationId())
                            .build());

                    whatsAppUtilities
                            .resolveMobileNumberOfSpecificUser(finalPatient.getId(), List.of(MessageSendTo.CUSTOMER))
                            .forEach(mobileNo -> {
                                String url = "profile/" + finalPatient.getId() + "/plans";
                                planningNotificationService.sendWhatsAppSafely(
                                        r,
                                        mobileNo,
                                        whatsappTemplateTypeProperties.getPATIENT_PLANNING_ADDED(),
                                        List.of(url));
                            });
                }
            });
        } catch (Exception e) {
            log.error("Failed to send post-invitation notifications for patient {}", finalPatient.getId(), e);
        }

        return savedInvitation;
    }

    private void checkOrderSubscription(UserProfile receiverUserProfile, Boolean isVspPlanning) {
        var totalOrderCounts = subscriptionRepository.findTotalOrdersByDoctorIdAndUserProfileId(
                receiverUserProfile.getDoctor().getId(), receiverUserProfile.getId());

        System.out.println(receiverUserProfile.getUser().getId() + " totalOrderCounts: " + totalOrderCounts);
        if (isVspPlanning) {
            var usedOrderCount = vspOrderRepository.findCountByProfileId(receiverUserProfile.getId());
            if (usedOrderCount > totalOrderCounts) {
                throw new OrderLimitExceededException();
            }
        } else {
            var usedOrderCount = orderRepository.countPatientsByProfileId(receiverUserProfile.getId());
            if (usedOrderCount > totalOrderCounts) {
                throw new OrderLimitExceededException();
            }
        }
    }

    private void createKanbanTaskForPatient(InvitePatientRequestV2 request, UserProfile userProfile, Patient patient) {
        if (!Objects.equals(request.getPatientType(), PatientType.EXISTING_PATIENT)) {
            var ownerKanbanTask = createPatientTaskTrackerForNewPatient(patient, userProfile, null);
            if (ownerKanbanTask != null && !userProfile.getId().equals(request.getReceiverProfileId())) {
                var receiversProfile = userProfileRepository
                        .findByIdWithOrgAndDoctorAndUser(request.getReceiverProfileId())
                        .orElseThrow(() -> new DoctorNotFoundException(request.getReceiverProfileId()));
                createPatientTaskTrackerForNewPatient(patient, receiversProfile, ownerKanbanTask.getId());
            }
            if (userProfile.isEnterprise()
                    && ownerKanbanTask != null
                    && request.getPracticeProfileId() != null
                    && !request.getPracticeProfileId().equals(request.getProfileId())) {
                var practiceProfile = userProfileRepository
                        .findByIdWithOrgAndDoctorAndUser(request.getPracticeProfileId())
                        .orElseThrow(() -> new DoctorNotFoundException(request.getPracticeProfileId()));
                createPatientTaskTrackerForNewPatient(patient, practiceProfile, ownerKanbanTask.getId());
            }
            if (request.getPracticeProfileId() == null && ownerKanbanTask != null) {
                patientCustomerInvitationRepository.save(PatientCustomerInvitation.builder()
                        .invitationCode(request.getPracticeInviteCode())
                        .patient(patient)
                        .parentTaskTrackerId(ownerKanbanTask.getId())
                        .build());
            }
        }
    }

    private void checkInvitationAlreadySent(InvitePatientRequestV2 request, long inviterId, UserType inviterUserType) {
        boolean alreadyInvited = invitationRepository.existsByInviterAndMobileOrEmail(
                inviterId, inviterUserType, UserType.PATIENT, request.getMobile(), request.getEmail());

        if (alreadyInvited) {
            throw new UserAlreadyInvitedException(inviterId, inviterUserType, UserType.PATIENT);
        }
    }

    private void checkMobileEmailAlreadyExists(InvitePatientRequestV2 request) {
        if (request.getMobile() != null) {
            var existingPatient = patientInvitationDetailsRepository.findByMobile(request.getMobile());
            existingPatient.ifPresent(details -> {
                Patient patient = details.getPatient();
                if (patient.getProductTypeNames().contains(ProductTypeName.BRACES)) {
                    throw new BracesPatientFoundException(patient.getFirstName());
                }
            });
        }
        if (request.getEmail() != null) {
            var existingPatient = patientInvitationDetailsRepository.findByEmail(
                    request.getEmail().toLowerCase());
            existingPatient.ifPresent(details -> {
                Patient patient = details.getPatient();
                if (patient.getProductTypeNames().contains(ProductTypeName.BRACES)) {
                    throw new BracesPatientFoundException(patient.getFirstName());
                }
            });
        }
    }

    public PatientTaskTrackerResponse createPatientTaskTrackerForNewPatient(
            Patient patient, UserProfile userProfile, Long parentTaskId) {
        try {
            var workflow = workflowRepository
                    .findByNameAndOrderTypeAndUserIdAndNotSystemDefined("New Case", "ALIGNER", userProfile.getId())
                    .orElse(null);
            if (workflow != null) {
                var workFlowStatus = workflowStatusRepository
                        .findByWorkflowIdAndStatusNameAndCustomFalse(workflow.getId(), "New Patient")
                        .orElseThrow();
                var task = PatientTaskTrackerCreate.createPatientTaskTrackerForNewPatient(
                        patient, userProfile, workflow, workFlowStatus, parentTaskId);
                if (task != null) {
                    return patientTaskTrackerService.createPatientTaskTracker(task);
                }
            }
            return null;

        } catch (Exception e) {
            return null;
        }
    }

    public void createPatientTaskTrackerForCustomerPatient(
            Patient patient, UserProfile userProfile, Long parentTaskId) {
        try {
            PatientTaskTracker parentTask =
                    patientTaskTrackerRepository.findById(parentTaskId).orElse(null);
            if (parentTask == null) return;

            String workflowName =
                    switch (parentTask.getWorkflowName()) {
                        case "New Case" -> "New Case";
                        case "Planning In House" -> "Plan Outsourced";
                        case "Production In House" -> "Production Outsource";
                        default -> null;
                    };
            if (workflowName == null) return;

            Workflow workflow = workflowRepository
                    .findByNameAndOrderTypeAndUserIdAndNotSystemDefined(workflowName, "ALIGNER", userProfile.getId())
                    .orElse(null);
            if (workflow == null) return;

            WorkflowStatus workflowStatus = null;
            if (parentTask.getWorkflowName().equals("Production In House")
                    && parentTask.getCurrentStatusName().equals("TO DO")) {
                workflowStatus = workflowStatusRepository
                        .findByWorkflowIdAndStatusNameAndCustomFalse(workflow.getId(), "In Progress")
                        .orElseThrow(() -> new WorkflowStatusNotFoundException("In Progress"));
            } else {
                workflowStatus = workflowStatusRepository
                        .findByWorkflowIdAndStatusNameAndCustomFalse(
                                workflow.getId(), parentTask.getCurrentStatusName())
                        .orElseThrow(() -> new WorkflowStatusNotFoundException(parentTask.getCurrentStatusName()));
            }

            var task = PatientTaskTrackerCreate.createPatientTaskTrackerForNewPatient(
                    patient, userProfile, workflow, workflowStatus, parentTaskId);
            if (task == null) return;

            var createdTask = patientTaskTrackerService.createPatientTaskTracker(task);
            PatientTaskTracker newTask =
                    patientTaskTrackerRepository.findById(createdTask.getId()).orElse(null);
            if (newTask == null) return;

            if (parentTask.getServiceProduct() != null) {
                serviceProductRepository
                        .findById(parentTask.getServiceProduct().getId())
                        .ifPresent(newTask::setServiceProduct);
            }
            newTask.setManufacturingBatch(parentTask.getManufacturingBatch());
            newTask.setServiceProducts(parentTask.getServiceProducts());
            newTask.setServiceProductId(parentTask.getServiceProductId());
            patientTaskTrackerRepository.save(newTask);
        } catch (Exception ignored) {
        }
    }

    private void createDefaultFolder(InvitePatientRequest request, Patient patient) {

        var doctorUserId = UserId.builder()
                .userId(request.getInviterId())
                .userType(UserType.DOCTOR)
                .build();
        var patientUserId = UserId.builder()
                .userId(patient.getId())
                .userType(UserType.PATIENT)
                .build();

        filesService.createFolderIfNotExists(CreateFolderRequest.builder()
                .folderName(ORDER_FOLDER_NAME)
                .parentPath("/")
                .uploader(patientUserId)
                .owners(Set.of(doctorUserId, patientUserId))
                .isDefaultFolder(true)
                .isPatientFolder(false)
                .build());

        driveAsyncHelper.createPatientFoldersAsync(request.getInviterId(), patient.getId());
    }

    private void createDefaultFolder(InvitePatientRequestV2 request, Patient patient) {
        var doctorUserId = UserId.builder()
                .userId(request.getInviterId())
                .userType(UserType.DOCTOR)
                .build();
        var patientUserId = UserId.builder()
                .userId(patient.getId())
                .userType(UserType.PATIENT)
                .build();

        filesService.createFolderIfNotExists(CreateFolderRequest.builder()
                .folderName(ORDER_FOLDER_NAME)
                .parentPath("/")
                .uploader(patientUserId)
                .owners(Set.of(doctorUserId, patientUserId))
                .isDefaultFolder(true)
                .isPatientFolder(false)
                .build());

        driveAsyncHelper.createPatientFoldersAsync(request.getInviterId(), patient.getId());
    }

    @Override
    @Transactional(noRollbackFor = BusinessException.class)
    public Invitation invitePatientFromMobile(InvitePatientRequest request) {
        var inviterId = request.getInviterId();
        var inviterUserType = request.getInviterUserType();

        boolean alreadyInvited = invitationRepository
                .findByInviterIdAndInviterUserTypeAndInvitedUserType(inviterId, inviterUserType, UserType.PATIENT)
                .stream()
                .map(Invitation::getPatientInvitation)
                .filter(Objects::nonNull)
                .anyMatch(invite -> {
                    boolean mobileMatches = request.getMobile() != null
                            && Objects.equals(invite.getPatient().getMobileNo(), request.getMobile());
                    boolean emailMatches = request.getEmail() != null
                            && Objects.equals(invite.getPatient().getEmail(), request.getEmail());
                    return emailMatches || mobileMatches;
                });

        if (alreadyInvited) {
            Patient patient = patientRepository
                    .findByMobileAndCountryCodeOrEmail(
                            request.getMobile(), request.getCountryCode().toString(), request.getEmail())
                    .orElseThrow(() -> new PatientNotFoundException(request.getFirstName()));

            if (patient.getProductTypeNames().contains(ProductTypeName.ALIGNERS)) {
                throw new PatientAlreadyAssignedToDoctorException(patient);
            } else {
                throw new UserAlreadyInvitedException(inviterId, inviterUserType, UserType.PATIENT);
            }
        }

        Patient patient = patientProfileService.registerPatientFromInvitationMobile(request);
        var invitation = Invitation.from(request, patient);

        var invitationCode = invitationCodeGenerator.generateInvitationCode(invitation);
        invitation.setInvitationCode(invitationCode);
        patientRepository.save(patient);
        if (request.getPracticeLocationId() != null) {
            doctorService.assignPracticeLocationToPatientForApp(AssignPracticeLocationToPatientRequest.builder()
                    .userId(patient.getAddedByUserId())
                    .patientId(patient.getId())
                    .practiceLocationId(request.getPracticeLocationId())
                    .build());
        }

        timelineService.addEvent(
                patient.getId(),
                UserType.PATIENT,
                request.getInviterId(),
                UserType.DOCTOR,
                EventType.PATIENT_ADDED,
                new AddedPatientEventMetadata(PatientDetails.from(patient)));

        timelineService.addEvent(
                request.getInviterId(),
                UserType.DOCTOR,
                patient.getId(),
                UserType.PATIENT,
                EventType.PATIENT_ADDED,
                new AddedPatientEventMetadata(PatientDetails.from(patient)));

        var invitationResponse = invitationRepository.save(invitation);

        createDefaultFolder(request, patient);

        return invitationResponse;
    }

    @Override
    public List<AllInvitationDetails> getDoctorAllInvitation(Long doctorId) {
        List<Invitation> invitations =
                invitationRepository.findByInviterIdAndInviterUserTypeAndInvitedUserTypeAndStatus(
                        doctorId, UserType.DOCTOR, UserType.PATIENT, InvitationStatus.SENT);

        List<AllInvitationDetails> allInvitationDetails = new ArrayList<>();
        for (Invitation invitation : invitations) {
            assert invitation.getPatientInvitation() != null;
            List<AlignerJourney> alignerJourneys = alignerJourneyRepository.findByPatientId(
                    invitation.getPatientInvitation().getPatient().getId());
            Optional<AlignerJourney> alignerJourney = alignerJourneys.stream().findFirst();

            AllInvitationDetails allInvitationDetail =
                    AllInvitationDetails.from(invitation, alignerJourney.isPresent(), alignerJourney.orElse(null));
            allInvitationDetails.add(allInvitationDetail);
        }
        return allInvitationDetails;
    }

    @Override
    public List<AllInvitationDetailsForMobile> getMobileLeadData(Long doctorId) {
        List<Invitation> invitations =
                invitationRepository.findByInviterIdAndInviterUserTypeAndInvitedUserTypeAndStatus(
                        doctorId, UserType.DOCTOR, UserType.PATIENT, InvitationStatus.SENT);
        List<AllInvitationDetailsForMobile> allInvitationDetails = new ArrayList<>();
        for (Invitation invitation : invitations) {
            assert invitation.getPatientInvitation() != null;
            var patientId = invitation.getPatientInvitation().getPatient().getId();
            var bracesJourney = bracesJourneyRepository.findByPatientIdAndBracesTreatmentStage(
                    patientId, BracesTreatmentStage.ACTIVE);

            if (alignerJourneyRepository.findByPatientId(patientId).isEmpty()) {
                if (bracesJourney.isPresent() && !bracesJourney.get().getIsTreatmentStarted()) {
                    AllInvitationDetailsForMobile allInvitationDetail = AllInvitationDetailsForMobile.from(
                            invitation, bracesJourney.get().getId());
                    allInvitationDetails.add(allInvitationDetail);
                } else if (bracesJourney.isEmpty()) {
                    AllInvitationDetailsForMobile allInvitationDetail =
                            AllInvitationDetailsForMobile.from(invitation, 0L);
                    allInvitationDetails.add(allInvitationDetail);
                }
            }
        }
        return allInvitationDetails;
    }

    @Override
    public List<AllInvitationDetailsForMobile> getMobileLeadsFromAppointments(
            Long doctorId, Boolean withoutAppointment, Boolean withoutReminder) {
        List<Invitation> invitations;
        if (withoutReminder) {
            invitations =
                    invitationRepository
                            .findByInviterIdAndInviterUserTypeAndInvitedUserTypeAndStatusAndAppointmentIsNullAndReminderIsNull(
                                    doctorId,
                                    UserType.DOCTOR.ordinal(),
                                    UserType.PATIENT.ordinal(),
                                    InvitationStatus.SENT.ordinal());
        } else if (withoutAppointment) {
            invitations =
                    invitationRepository
                            .findByInviterIdAndInviterUserTypeAndInvitedUserTypeAndStatusAndAppointmentIsNull(
                                    doctorId,
                                    UserType.DOCTOR.ordinal(),
                                    UserType.PATIENT.ordinal(),
                                    InvitationStatus.SENT.ordinal());
        } else {
            invitations = invitationRepository.findByInviterIdAndInviterUserTypeAndInvitedUserTypeAndStatus(
                    doctorId, UserType.DOCTOR, UserType.PATIENT, InvitationStatus.SENT);
        }

        List<AllInvitationDetailsForMobile> allInvitationDetails = new ArrayList<>();
        for (Invitation invitation : invitations) {
            assert invitation.getPatientInvitation() != null;
            var patientId = invitation.getPatientInvitation().getPatient().getId();

            Collection<BracesTreatmentStage> stages =
                    Arrays.asList(BracesTreatmentStage.ACTIVE, BracesTreatmentStage.DRAFT);
            var bracesJourney = bracesJourneyRepository.findByPatientIdAndBracesTreatmentStageIn(patientId, stages);

            if (alignerJourneyRepository.findByPatientId(patientId).isEmpty()) {
                if (bracesJourney.isPresent() && !bracesJourney.get().getIsTreatmentStarted()) {
                    AllInvitationDetailsForMobile allInvitationDetail = AllInvitationDetailsForMobile.from(
                            invitation, bracesJourney.get().getId());
                    allInvitationDetails.add(allInvitationDetail);
                } else if (bracesJourney.isEmpty()) {
                    AllInvitationDetailsForMobile allInvitationDetail =
                            AllInvitationDetailsForMobile.from(invitation, 0L);
                    allInvitationDetails.add(allInvitationDetail);
                }
            }
        }
        return allInvitationDetails;
    }

    @Override
    @Transactional
    public Invitation updateInvitation(UpdateInvitationRequest request) {
        Invitation invitation = invitationRepository
                .findById(request.getInvitationId())
                .orElseThrow(() -> new PatientInvitationNotFoundException(request.getInvitationId()));

        invitation.setStatus(request.getInvitationStatus());

        checkIfAlreadyInvited(invitation, request);

        Patient patient = patientRepository
                .findById(request.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException(request.getPatientId()));

        updatePatientFields(patient, request);

        patientRepository.save(patient);

        assert invitation.getPatientInvitation() != null;
        com.dentalstack.patient.feature.invitation.entity.PatientInvitationDetails.update(
                request, invitation.getPatientInvitation());

        return invitationRepository.save(invitation);
    }

    private void checkIfAlreadyInvited(Invitation invitation, UpdateInvitationRequest request) {
        boolean alreadyInvited = invitationRepository
                .findByInviterIdAndInviterUserTypeAndInvitedUserType(
                        invitation.getInviterId(), invitation.getInviterUserType(), UserType.PATIENT)
                .stream()
                .map(Invitation::getPatientInvitation)
                .filter(Objects::nonNull)
                .anyMatch(invite -> {
                    boolean emailMatches =
                            request.getEmail() != null && Objects.equals(invite.getEmail(), request.getEmail());
                    boolean mobileMatches =
                            request.getMobile() != null && Objects.equals(invite.getMobile(), request.getMobile());
                    return emailMatches || mobileMatches;
                });

        if (alreadyInvited) {
            throw new UserAlreadyInvitedException(
                    invitation.getInviterId(), invitation.getInviterUserType(), UserType.PATIENT);
        }
    }

    private void updatePatientFields(Patient patient, UpdateInvitationRequest request) {
        Optional.ofNullable(request.getMobile()).ifPresent(mobile -> {
            if (patientRepository.existsByMobileNo(mobile)) {
                throw new UserAlreadyInvitedException(mobile);
            }
            patient.setMobileNo(mobile);
        });

        Optional.ofNullable(request.getEmail()).ifPresent(email -> {
            if (patientRepository.existsByEmail(email)) {
                throw new UserAlreadyInvitedException(email);
            }
            patient.setEmail(email);
        });

        Optional.ofNullable(request.getChiefComplaint()).ifPresent(patient::setChiefComplaint);
        Optional.ofNullable(request.getAge()).ifPresent(patient::setAge);
        Optional.ofNullable(request.getGender()).ifPresent(patient::setGender);
        Optional.ofNullable(request.getCustomerMappedId()).ifPresent(patient::setCustomerMappedId);
        Optional.ofNullable(request.getCountryCode()).ifPresent(patient::setCountryCode);
        Optional.ofNullable(request.getLastName()).ifPresent(patient::setLastName);
    }

    @Override
    public DoctorInvitationDetails getInvitationDetails(String inviteCode) {
        var invitationCode = invitationCodeRepository
                .findByCode(inviteCode)
                .orElseThrow(() -> new InvalidInviteCodeException(inviteCode));

        Invitation invitation = invitationCode.getInvitation();
        assert invitation != null;
        var doctorId = invitation.getInviterId();
        DoctorDetails doctorDetails = doctorService.getDoctor(doctorId);
        return DoctorInvitationDetails.from(doctorDetails, invitation);
    }

    @Override
    @Transactional
    public PatientNewInvitationDetails changePatientInvitationStatusByPatient(ChangeInvitationStatusByPatient request) {
        final Long patientLeadId = request.getPatientId();
        Long invitationId = request.getInvitationId();
        InvitationStatus newStatus = request.getInvitationStatus().toInvitationStatus();
        Invitation invitation = invitationRepository
                .findById(invitationId)
                .orElseThrow(() -> new PatientInvitationNotFoundException(invitationId));

        assert invitation.getPatientInvitation() != null;
        var patientId = invitation.getPatientInvitation().getPatient().getId();
        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(
                        invitation.getPatientInvitation().getPatient().getId())
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        var userProfile = patient.getDoctorOrganization().getUserProfile();
        if (patient.getDoctorId() != null) {
            throw new PatientAlreadyAssignedToDoctorException(patient);
        }
        if (!invitation.getStatus().equals(InvitationStatus.SENT)) {
            throw new InvalidPatientInvitationException(
                    String.format("Invitation with id %s is not pending state", request.getInvitationId()));
        }

        log.info("Patient invitation status changed from {} to {}", invitation.getStatus(), newStatus);

        invitation.setStatus(newStatus);
        final var doctorId = invitation.getInviterId();
        DoctorDetails details = doctorService.getDoctor(doctorId);

        var patientDoctorOrganization = patientDoctorOrganizationRepository
                .findPatientDoctorOrganizationsWithPatientByPatientId(patient.getId())
                .orElseThrow(() -> new DoctorNotFoundException(doctorId));
        var doctorProfile = patientDoctorOrganization.getUserProfile().getUser();
        if (newStatus.equals(InvitationStatus.ACCEPTED)) {
            walletService.createWalletForPatient(patientId);

            assert invitation.getPatientInvitation() != null;
            var patientLead = patientLeadRepository
                    .findById(patientLeadId)
                    .orElseThrow(() -> new PatientNotFoundException(patientId));
            log.info("Declining all other invitations by doctors for patient {}", patientId);

            patient.setDoctorId(doctorId);
            patient.setPatientStatus(PatientStatus.ACTIVE);

            patientLead.setActive(false);
            patientLeadRepository.save(patientLead);
            Patient.updatePatientFromLead(patient, patientLead, doctorId);
            timelineService.addEvent(
                    patientId,
                    UserType.PATIENT,
                    doctorId,
                    UserType.DOCTOR,
                    EventType.PATIENT_CONNECTED_WITH_DOCTOR,
                    PatientInvitationAcceptedEventMetadata.from(patient, doctorId, invitation.getId()));
            List<Tracking> trackings = trackingRepository.findByPatientId(patientId);
            chatService.invitationAccepted(EmailSendReq.builder()
                    .doctorEmail(doctorProfile.getEmail())
                    .doctorFirstName(patientDoctorOrganization.getUserProfile().getOrgName())
                    .patientFirstName(patient.getFirstName())
                    .salutation(doctorProfile.getSalutation())
                    .patientId(patient.getId())
                    .orgName(userProfile.getOrganizationBrandName())
                    .build());
            if (doctorProfile.getEmail() != null) {
                notificationService.notificationForAcceptedInvite(
                        patientLead.getFirstName(),
                        userProfile.getUser().getMobileNo(),
                        doctorProfile.getEmail(),
                        patient.getId(),
                        doctorProfile.getId());
            }
            if (!trackings.isEmpty()) {
                Tracking latestTracking = trackings.stream()
                        .max(Comparator.comparing(Tracking::getCreatedAt))
                        .orElseThrow(() -> new IllegalStateException("Tracking list is not empty but max not found"));

                if (latestTracking.getTrackingType().equals(TrackingType.MANUAL)) {
                    var alignerJourney = latestTracking.getAlignerJourney();
                    Long alignerJourneyId = null;
                    if (alignerJourney != null) {
                        alignerJourneyId = alignerJourney.getId();
                    }
                    timelineService.addEvent(
                            patientId,
                            UserType.PATIENT,
                            doctorId,
                            UserType.DOCTOR,
                            EventType.UPGRADE_PATIENT_TO_MOBILE_APP,
                            new UpgradePatientToMobileAppEventMetadata(patient.getId(), alignerJourneyId));
                }

                latestTracking.setIsPatientConnected(true);
                trackingRepository.save(latestTracking);
            } else {
                timelineService.addEvent(
                        patientId,
                        UserType.PATIENT,
                        doctorId,
                        UserType.DOCTOR,
                        EventType.UPGRADE_PATIENT_TO_MOBILE_APP,
                        new UpgradePatientToMobileAppEventMetadata(patient.getId(), null));
            }

            patientRepository.save(patient);
        }
        eventRepository
                .findByUserIdAndUserTypeAndTypeAndActiveTrue(
                        invitation.getInviterId(), UserType.DOCTOR, EventType.PATIENT_INVITATION_RECEIVED)
                .stream()
                .filter(event -> {
                    var metadata = (PatientInvitationReceivedEventMetadata) event.getMetadata();
                    return metadata.getPatientInvitationId().equals(invitation.getId());
                })
                .forEach(event -> {
                    event.setActive(false);
                    eventRepository.save(event);
                });

        Invitation i = invitationRepository.save(invitation);

        return PatientNewInvitationDetails.from(i, details);
    }

    @Transactional
    @Override
    public PatientNewInvitationDetails changePatientInvitationStatusByDoctor(
            ChangeNewInvitationStatusByDoctorRequest request) {
        Long doctorId = request.getDoctorId();
        Long invitationId = request.getInvitationId();
        InvitationStatus newStatus = request.getInvitationStatus().toInvitationStatus();

        Invitation invitation = invitationRepository
                .findById(invitationId)
                .orElseThrow(() -> new PatientInvitationNotFoundException(invitationId));

        assert invitation.getPatientInvitation() != null;
        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(
                        invitation.getPatientInvitation().getPatient().getId())
                .orElseThrow(() -> new PatientNotFoundException(
                        invitation.getPatientInvitation().getPatient().getId()));

        if (!invitation.getStatus().equals(InvitationStatus.SENT)) {
            throw new InvalidPatientInvitationException(String.format(
                    "Cannot cancel or resent invitation %d that is not in a pending state", invitationId));
        }

        var doctorDetails = doctorService.getDoctor(doctorId);

        switch (request.getInvitationStatus()) {
            case RESENT -> {
                var sentCount = invitation.getSentCount();
                var inviteDate = invitation.getResentInviteAt();

                if (sentCount > 2) {
                    throw new MaximumLimitOfResentInvitationReachedException(invitation.getId());
                }
                if (inviteDate != null && inviteDate.toLocalDate().isEqual(LocalDate.now()) && sentCount == 1) {
                    throw new MaximumLimitOfResentInvitationReachedException(invitation.getId());
                }

                invitation.setSentCount(1);
                invitation.setResentInviteAt(ZonedDateTime.now());
                invitation.setStatus(newStatus);
                assert invitation.getPatientInvitation() != null;
                String mobileNo = invitation.getPatientInvitation().getPatient().getMobileNo();
                if (mobileNo != null && !mobileNo.isEmpty()) {
                    chatService.inviteToNonExistingPatient(SmsToDoctor.forPatient(
                            invitation.getPatientInvitation().getPatient(), request.getDoctorName()));
                }
                log.info(
                        "Patient invitation status changed from {} to {} by doctor {}",
                        invitation.getStatus(),
                        newStatus,
                        doctorId);
                assert invitation.getPatientInvitation() != null;
                invitationRepository.save(invitation);
            }
            case CANCELLED -> {
                invitation.setStatus(newStatus);
                assert invitation.getPatientInvitation() != null;
                String mobileNo = invitation.getPatientInvitation().getPatient().getMobileNo();
                String email = invitation.getPatientInvitation().getPatient().getEmail();
                if (mobileNo != null && !mobileNo.isEmpty() && email != null && !email.isEmpty()) {
                    notificationService.notificationForCancelledInvite(
                            request.getDoctorName(),
                            mobileNo,
                            email,
                            doctorDetails.isDrToDisplay(),
                            doctorDetails.getXOrganizationName(),
                            doctorDetails.getOrganizationId());
                }

                invitationRepository.deleteAllById(Collections.singleton(request.getInvitationId()));

                List<AlignerJourney> alignerJourneys = alignerJourneyRepository.findByPatientId(patient.getId());

                if (!alignerJourneys.isEmpty()) {
                    for (AlignerJourney alignerJourney : alignerJourneys) {
                        customAlignerReminderRepository.deleteAllByAlignerJourneyId(alignerJourney.getId());
                        defaultAlignerReminderRepository.deleteAllByAlignerJourneyId(alignerJourney.getId());
                    }
                    alignerJourneyRepository.deleteAll(alignerJourneys);
                    patientRepository.delete(patient);
                } else {
                    patientRepository.delete(patient);
                }
                eventRepository.deleteAllByUserIdAndUserType(patient.getId(), UserType.PATIENT);
            }
        }
        return PatientNewInvitationDetails.from(invitation, doctorDetails);
    }

    @Override
    @Deprecated
    @Transactional
    public Invitation notifyPatient(long patientId, String doctorName) {
        var patientInvitationDetails = patientInvitationDetailsRepository
                .findByPatientId(patientId)
                .orElseThrow(() -> new PatientInvitationNotFoundException(patientId));

        var invitation = patientInvitationDetails.getInvitation();

        if (!invitation.getIsInvitationSent()) {
            invitation.setInvitationSentAt(ZonedDateTime.now());
        }
        invitation.setSentCount(1);
        invitation.setResentInviteAt(ZonedDateTime.now());
        invitation.setIsInvitationSent(true);
        invitationRepository.save(invitation);

        Patient patient =
                patientRepository.findById(patientId).orElseThrow(() -> new PatientNotFoundException(patientId));

        var doctorDetails = doctorService.getDoctor(invitation.getInviterId());

        var patientDoctorOrganization = patientDoctorOrganizationRepository
                .findPatientDoctorOrganizationsWithPatientByPatientId(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));
        if (patient.getEmail() != null && !patient.getEmail().isEmpty()) {
            chatService.sendInvitation(InvitationRequest.forEmail(
                    patientDoctorOrganization.getUserProfile().getPracticeName(),
                    patient.getFirstName(),
                    invitation.getInvitationCode().getCode(),
                    patient.getEmail(),
                    doctorDetails.getDoctorId(),
                    doctorDetails.getOrgName()));
        }

        if (patient.getMobileNo() != null && !patient.getMobileNo().isEmpty()) {
            chatService.sendPatientInvitationSms(InvitationRequest.forSMS(
                    patientDoctorOrganization.getUserProfile().getPracticeName(),
                    invitation.getInvitationCode().getCode(),
                    patient.getMobileNo(),
                    String.valueOf(patient.getCountryCode()),
                    doctorDetails.getDoctorId()));
            notificationService.sendNotificationOfInvite(doctorName, patient, doctorDetails.isDrToDisplay());
        }
        return patientInvitationDetails.getInvitation();
    }

    @Override
    public Invitation notifyPatient(NotifyPatientRequest request) {
        var patientDoctorOrganization = patientDoctorOrganizationRepository
                .findPatientDoctorOrganizationsWithPatientByPatientId(request.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException(request.getPatientId()));
        var patientInvitationDetails = patientInvitationDetailsRepository
                .findByPatientId(request.getPatientId())
                .orElseThrow(() -> new PatientInvitationNotFoundException(request.getPatientId()));

        var invitation = patientInvitationDetails.getInvitation();
        var sentCount = invitation.getSentCount();
        var inviteDate = invitation.getResentInviteAt();

        if (sentCount > 2) {
            throw new MaximumLimitOfResentInvitationReachedException(invitation.getId());
        }
        if (inviteDate != null && inviteDate.toLocalDate().isEqual(LocalDate.now()) && sentCount == 1) {
            throw new MaximumLimitOfResentInvitationReachedException(invitation.getId());
        }

        invitation.setSentCount(1);
        invitation.setResentInviteAt(ZonedDateTime.now());
        invitation.setIsInvitationSent(true);
        invitationRepository.save(invitation);

        Patient patient = patientRepository
                .findById(request.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException(request.getPatientId()));

        var userProfile = userProfileRepository.userProfileDetailsById(request.getProfileId());
        var doctorDetails = doctorService.getDoctor(invitation.getInviterId());

        if (patient.getEmail() != null && !patient.getEmail().isEmpty() && userProfile.isPresent()) {
            chatService.sendInvitation(InvitationRequest.forEmail(
                    patientDoctorOrganization.getUserProfile().getUser().getSalutation() != null
                            ? patientDoctorOrganization
                                            .getUserProfile()
                                            .getUser()
                                            .getSalutation() + " "
                                    + patientDoctorOrganization
                                            .getUserProfile()
                                            .getUser()
                                            .getFirstName()
                            : patientDoctorOrganization
                                    .getUserProfile()
                                    .getUser()
                                    .getFirstName(),
                    patient.getFirstName(),
                    invitation.getInvitationCode().getCode(),
                    patient.getEmail(),
                    doctorDetails.getDoctorId(),
                    userProfile.get().getOrgName()));
        }

        if (patient.getMobileNo() != null && !patient.getMobileNo().isEmpty() && userProfile.isPresent()) {
            chatService.sendPatientInvitationSms(InvitationRequest.forSMS(
                    patientDoctorOrganization.getUserProfile().getPracticeName(),
                    invitation.getInvitationCode().getCode(),
                    patient.getMobileNo(),
                    String.valueOf(patient.getCountryCode()),
                    doctorDetails.getDoctorId()));
            notificationService.sendNotificationOfInvite(
                    userProfile.get().getDisplayName(), patient, doctorDetails.isDrToDisplay());
        }
        return patientInvitationDetails.getInvitation();
    }

    @Override
    public DoctorDetails getDoctorDetails(Long patientId) {

        Optional<PatientLead> patientLead = patientLeadRepository.findById(patientId);
        if (patientLead.isPresent() && patientLead.get().isActive()) {
            throw new DoctorNotFoundException(patientId);
        }
        Patient patient =
                patientRepository.findById(patientId).orElseThrow(() -> new PatientNotFoundException(patientId));
        if (patient.getDoctorId() != null) {
            return doctorService.getDoctor(patient.getDoctorId());
        }
        throw new DoctorNotFoundException(patientId);
    }

    @Override
    public DoctorDetails getDoctorDetails(String email) {

        Optional<PatientLead> patientLead = patientLeadRepository.findByEmail(email);
        if (patientLead.isPresent() && patientLead.get().isActive()) {
            throw new DoctorNotFoundException(email);
        }
        Patient patient = patientRepository.findByEmail(email).orElseThrow(() -> new PatientNotFoundException(email));
        if (patient.getDoctorId() != null) {
            return doctorService.getDoctor(patient.getDoctorId());
        }
        throw new DoctorNotFoundException(email);
    }

    @Override
    @Transactional
    public PatientDetails convertLeadToPatient(Long patientId) {
        Optional<PatientInvitationDetails> patientInvitationDetails =
                patientInvitationDetailsRepository.findByPatientId(patientId);

        Invitation invitation = invitationRepository
                .findById(patientInvitationDetails.get().getInvitation().getId())
                .orElseThrow(() ->
                        new PatientNotFoundException("Invitation details not found for patient id: " + patientId));

        assert invitation.getPatientInvitation() != null;
        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        var userProfile = patient.getDoctorOrganization().getUserProfile();
        Long invitationId = invitation.getId();

        assert invitation.getPatientInvitation() != null;

        if (patient.getDoctorId() != null) {
            throw new PatientAlreadyAssignedToDoctorException(patient);
        }
        if (!invitation.getStatus().equals(InvitationStatus.SENT)) {
            throw new InvalidPatientInvitationException(
                    String.format("Invitation with id %s is not pending state", invitationId));
        }

        invitation.setStatus(InvitationStatus.ACCEPTED);

        walletService.createWalletForPatient(patientId);

        final var doctorId = invitation.getInviterId();
        DoctorDetails details = doctorService.getDoctor(doctorId);

        assert invitation.getPatientInvitation() != null;
        var patientLead = patientLeadRepository
                .findByEmail(patient.getEmail())
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        var patientDoctorOrganization = patientDoctorOrganizationRepository
                .findPatientDoctorOrganizationsWithPatientByPatientId(patient.getId())
                .orElseThrow(() -> new DoctorNotFoundException(doctorId));
        var doctorProfile = patientDoctorOrganization.getUserProfile().getUser();
        if (details.getEmail() != null) {
            notificationService.notificationForAcceptedInvite(
                    patientLead.getFirstName(),
                    userProfile.getUser().getMobileNo(),
                    details.getEmail(),
                    patient.getId(),
                    userProfile.getId());
            chatService.invitationAccepted(EmailSendReq.builder()
                    .doctorEmail(doctorProfile.getEmail())
                    .doctorFirstName(doctorProfile.getFirstName())
                    .patientFirstName(patient.getFirstName())
                    .salutation(doctorProfile.getSalutation())
                    .patientId(patient.getId())
                    .orgName(userProfile.getOrgName())
                    .build());
        }

        timelineService.addEvent(
                patientId,
                UserType.PATIENT,
                doctorId,
                UserType.DOCTOR,
                EventType.PATIENT_CONNECTED_WITH_DOCTOR,
                PatientInvitationAcceptedEventMetadata.from(patient, doctorId, invitation.getId()));

        patient.setDoctorId(doctorId);
        patient.setPatientStatus(PatientStatus.ACTIVE);
        patientLead.setActive(false);

        patientLeadRepository.save(patientLead);
        Patient.updatePatientFromLead(patient, patientLead, doctorId);

        List<Tracking> trackings = trackingRepository.findByPatientId(patientId);
        if (!trackings.isEmpty()) {
            Tracking latestTracking = trackings.stream()
                    .max(Comparator.comparing(Tracking::getCreatedAt))
                    .orElseThrow(() -> new IllegalStateException("Tracking list is not empty but max not found"));

            latestTracking.setIsPatientConnected(true);
            trackingRepository.save(latestTracking);
        }

        LocalDate localDate = LocalDate.now();
        ZonedDateTime zonedDateTime = localDate.atStartOfDay(TimezoneConfig.DEFAULT_ZONE_ID);
        patient.setConnectionDate(zonedDateTime);
        invitation.getPatientInvitation().setEmail(patient.getEmail());
        invitationRepository.save(invitation);
        var savedPatient = patientRepository.save(patient);
        Boolean isPatientOnboardingCompleted = patientOnboardingRepository.isOnboardingCompleted(savedPatient.getId());
        Boolean isRewardPatient = false;
        return PatientDetails.from(savedPatient, isPatientOnboardingCompleted, isRewardPatient);
    }

    public ValidateInvitationResponse validationPatientInvitation(ValidateInvitationRequest validateInvitationRequest) {
        Invitation invitation;
        boolean isPatientPresent = true;
        try {
            if (validateInvitationRequest.getPatientEmailId().isEmpty()) {
                isPatientPresent = false;
            } else {
                invitation = invitationRepository.findByPatientEmailId(validateInvitationRequest.getPatientEmailId());
                isPatientPresent = invitation != null;
            }
        } catch (Exception ignored) {
        }

        ValidateInvitationResponse validateInvitationResponse = new ValidateInvitationResponse();
        validateInvitationResponse.setIsPatientPresent(isPatientPresent);

        return validateInvitationResponse;
    }

    @Override
    @Transactional
    public void createPatientTaskTrackerThrowSignup(Long patientId, Long practiceProfileId, Long parentTaskId) {
        Patient patient =
                patientRepository.findById(patientId).orElseThrow(() -> new PatientNotFoundException(patientId));
        UserProfile userProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(practiceProfileId)
                .orElseThrow(() -> new UserNotFoundException(practiceProfileId));

        if (parentTaskId != null) {
            createPatientTaskTrackerForCustomerPatient(patient, userProfile, parentTaskId);
        }

        assigneeToPractice(patient, userProfile);
        assigneOrder(patient, userProfile);
    }

    private void assigneeToPractice(Patient patient, UserProfile userProfile) {
        PatientDoctorOrganization pdo = patientDoctorOrganizationRepository.findAnyByPatientId(patient.getId());
        pdo.setUserProfile(userProfile);
        pdo.setPracticeAssigned(true);
        pdo.setDoctor(userProfile.getDoctor());
        pdo.setPatientBelongsTo(PatientBelongsTo.ASSIGNED_TO_PRACTICE);
        if (serviceConfigurationRepository.isVspPlanningUser(userProfile.getId())) {
            List<VspOrder> vspOrderList = vspOrderRepository.findAllOrderByPatientId(patient.getId());
            if (!vspOrderList.isEmpty()) {
                vspOrderList.forEach(o -> {
                    o.setCreatedByUserProfile(userProfile);
                    vspOrderRepository.save(o);
                });
            }
            Optional<DoctorChat> doctorChat = doctorChatRepository.findByPatientId(patient.getId());
            doctorChat.ifPresent(chat -> {
                chat.getParticipants()
                        .add(ChatParticipant.builder()
                                .chat(chat)
                                .userProfile(userProfile)
                                .isActive(true)
                                .isOnline(false)
                                .isTyping(false)
                                .joinedAt(ZonedDateTime.now())
                                .unreadCount(0)
                                .build());
            });
        } else {
            List<Order> orderList = orderRepository.findByPatientId(patient.getId());
            if (!orderList.isEmpty()) {
                orderList.forEach(o -> {
                    o.setOwnerProfile(userProfile);
                    orderRepository.save(o);
                });
            }
            Optional<DoctorChat> doctorChat = doctorChatRepository.findByPatientId(patient.getId());
            doctorChat.ifPresent(chat -> {
                chat.getParticipants()
                        .add(ChatParticipant.builder()
                                .chat(chat)
                                .userProfile(userProfile)
                                .isActive(true)
                                .isOnline(false)
                                .isTyping(false)
                                .joinedAt(ZonedDateTime.now())
                                .unreadCount(0)
                                .build());
            });
        }
        patientDoctorOrganizationRepository.save(pdo);
    }

    private void assigneOrder(Patient patient, UserProfile userProfile) {
        List<Order> ordersList = orderRepository.findByPatientId(patient.getId());
        ordersList.forEach((order) -> {
            order.setOwnerProfile(userProfile);
            orderRepository.save(order);
        });
    }

    @Transactional
    @Override
    public void createPatientTaskTracker(Long profileId, String invitationCode) {
        List<PatientCustomerInvitation> invitations =
                patientCustomerInvitationRepository.findByInvitationCode(invitationCode);

        if (invitations == null || invitations.isEmpty()) {
            return;
        }

        for (PatientCustomerInvitation invitation : invitations) {
            createTaskTrackerForInvitationSafe(profileId, invitation);
        }
    }

    private void createTaskTrackerForInvitationSafe(Long profileId, PatientCustomerInvitation invitation) {
        if (invitation == null || invitation.getPatient() == null) {
            log.warn("Skipping null invitation or missing patient for invitation: {}", invitation);
            return;
        }

        if (invitation.getParentTaskTrackerId() != null) {
            createPatientTaskTrackerThrowSignup(
                    invitation.getPatient().getId(), profileId, invitation.getParentTaskTrackerId());
        } else {
            createPatientTaskTrackerThrowSignup(invitation.getPatient().getId(), profileId, null);
        }
    }
}
