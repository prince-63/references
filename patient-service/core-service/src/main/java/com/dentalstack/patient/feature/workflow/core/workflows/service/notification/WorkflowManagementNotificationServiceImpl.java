package com.dentalstack.patient.feature.workflow.core.workflows.service.notification;

import static com.dentalstack.patient.feature.workflow.core.task_tracker.service.PatientTaskTrackerServiceImpl.*;

import com.dentalstack.patient.application.config.WhatsappTemplateTypeProperties;
import com.dentalstack.patient.feature.doctor.entity.PatientDoctorOrganization;
import com.dentalstack.patient.feature.notification.dto.SendNotificationRequest;
import com.dentalstack.patient.feature.notification.dto.WhatsAppRequestBuilder;
import com.dentalstack.patient.feature.notification.dto.planningcustomer.CaseCompletedEmailRequest;
import com.dentalstack.patient.feature.notification.dto.planningcustomer.NeedMoreInfoEmailRequest;
import com.dentalstack.patient.feature.notification.dto.vsp.VspMoreInfoRequiredEmailRequest;
import com.dentalstack.patient.feature.notification.dto.vsp.VspPlanningCompletedEmailRequest;
import com.dentalstack.patient.feature.notification.enums.MessageSendTo;
import com.dentalstack.patient.feature.notification.enums.OrgName;
import com.dentalstack.patient.feature.notification.service.*;
import com.dentalstack.patient.feature.notification.util.ResolveWebUrl;
import com.dentalstack.patient.feature.notification.util.WhatsAppUtilities;
import com.dentalstack.patient.feature.notification.util.XOrganizationNameResolver;
import com.dentalstack.patient.feature.order.entity.Order;
import com.dentalstack.patient.feature.order.repository.OrderCommentsRepository;
import com.dentalstack.patient.feature.order.repository.OrderRepository;
import com.dentalstack.patient.feature.patient.dto.AddPatientCommentRequest;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.*;
import com.dentalstack.patient.feature.timeline.metadata.event.planningcustomer.PlanningCustomerCaseCompletedMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.planningcustomer.PlanningCustomerNeedMoreInfoRequestedMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.vsp.VspMoreInfoRequiredEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.vsp.VspPlanningCompletedEventMetadata;
import com.dentalstack.patient.feature.timeline.service.TimelineService;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.feature.vsp.dto.summary.VspOrderIdAndStatus;
import com.dentalstack.patient.feature.vsp.entity.VspPrescription;
import com.dentalstack.patient.feature.vsp.repository.VspOrderRepository;
import com.dentalstack.patient.feature.vsp.util.VspCaseActivityLogger;
import com.dentalstack.patient.feature.vsp.util.VspPortUrlResolver;
import com.dentalstack.patient.feature.workflow.core.task_tracker.dto.MoveTaskTrackerRequest;
import com.dentalstack.patient.feature.workflow.core.task_tracker.dto.SelectCaseForPatientTaskRequest;
import com.dentalstack.patient.feature.workflow.core.task_tracker.entity.PatientTaskTracker;
import com.dentalstack.patient.feature.workflow.core.task_tracker.repository.PatientTaskTrackerRepository;
import com.dentalstack.patient.feature.workflow.service_configuration.repository.ServiceConfigurationRepository;
import com.dentalstack.patient.feature.workflow.util.CaseActivityLogger;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@AllArgsConstructor
public class WorkflowManagementNotificationServiceImpl implements WorkflowManagementNotificationService {

    private final ChatService chatService;
    private final TimelineService timelineService;
    private final PatientTaskTrackerRepository patientTaskTrackerRepository;
    private final WhatsappTemplateTypeProperties whatsappTemplateTypeProperties;
    private final PatientDoctorOrganizationRepository pdoRepository;
    private final WhatsAppRequestBuilder whatsAppRequestBuilder;
    private final WhatsAppUtilities whatsAppUtilities;
    private final PlanningCustomerEmailService planningCustomerEmailService;
    private final ResolveWebUrl resolveWebUrl;
    private final ServiceConfigurationRepository serviceConfigurationRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final OrderCommentsRepository orderCommentsRepository;
    private final OrderRepository orderRepository;
    private final VspOrderRepository vspOrderRepository;
    private final VspPlanningEmailService vspPlanningEmailService;
    private final VspNotificationService vspNotificationService;
    private final VspCaseActivityLogger vspCaseActivityLogger;
    private final CaseActivityLogger caseActivityLogger;
    private final PlanningNotificationService planningNotificationService;
    private final XOrganizationNameResolver xOrgNameResolver;

    @Override
    public void workflowChangeNotifications(
            SelectCaseForPatientTaskRequest request, PatientTaskTracker existing, UserProfile userProfile) {
        if (userProfile.isInHouseManufacturingLab()) {
            return;
        }
        if (isMovingToPlanning(request)) {
            handleGenericNotifications(existing, userProfile, NotificationType.PLANNING, PLANNING_IN_HOUSE_WORKFLOW);
            if (whatsAppUtilities.isCustomer(request.getProfileId())) {
                Patient patient = existing.getPatient();
                String url = "profile/" + patient.getId() + "/plans-list";
                List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                        patient.getId(), List.of(MessageSendTo.SUPER_ADMIN, MessageSendTo.ADMIN));
                OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
                numbers.forEach((no) -> {
                    whatsAppRequestBuilder
                            .buildRequestIfMobileExists(
                                    true,
                                    orgName,
                                    no,
                                    whatsappTemplateTypeProperties.getCASE_MOVED_TO_PLANNING(),
                                    List.of(patient.fullName(), url))
                            .ifPresent(chatService::sendWhatsAppMessage);
                });
            }

            if (whatsAppUtilities.isSupperAdmin(request.getProfileId())) {
                Patient patient = existing.getPatient();
                String url = "profile/" + patient.getId() + "/plans-list";
                List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                        patient.getId(), List.of(MessageSendTo.CUSTOMER));
                OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
                numbers.forEach((no) -> {
                    whatsAppRequestBuilder
                            .buildRequestIfMobileExists(
                                    true,
                                    orgName,
                                    no,
                                    whatsappTemplateTypeProperties.getCASE_MOVED_TO_PLANNING(),
                                    List.of(patient.fullName(), url))
                            .ifPresent(chatService::sendWhatsAppMessage);
                });
            }
        } else if (isMovingToProduction(request)) {
            handleGenericNotifications(existing, userProfile, NotificationType.PRODUCTION, PLAN_OUTSOURCED_WORKFLOW);
            if (whatsAppUtilities.isCustomer(request.getProfileId())) {
                Patient patient = existing.getPatient();
                String url = "profile/" + patient.getId() + "/production";
                List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                        patient.getId(), List.of(MessageSendTo.SUPER_ADMIN, MessageSendTo.ADMIN));
                OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
                numbers.forEach((no) -> {
                    whatsAppRequestBuilder
                            .buildRequestIfMobileExists(
                                    true,
                                    orgName,
                                    no,
                                    whatsappTemplateTypeProperties.getCASE_MOVED_TO_PRODUCTION(),
                                    List.of(patient.fullName(), url))
                            .ifPresent(chatService::sendWhatsAppMessage);
                });
            }

            if (whatsAppUtilities.isSupperAdmin(request.getProfileId())) {
                Patient patient = existing.getPatient();
                String url = "profile/" + patient.getId() + "/production";
                List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                        patient.getId(), List.of(MessageSendTo.CUSTOMER));
                OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
                numbers.forEach((no) -> {
                    whatsAppRequestBuilder
                            .buildRequestIfMobileExists(
                                    true,
                                    orgName,
                                    no,
                                    whatsappTemplateTypeProperties.getCASE_MOVED_TO_PRODUCTION(),
                                    List.of(patient.fullName(), url))
                            .ifPresent(chatService::sendWhatsAppMessage);
                });
            }
        }
    }

    @Override
    public void moveTaskNotification(
            MoveTaskTrackerRequest request,
            PatientTaskTracker existing,
            UserProfile userProfile,
            String oldWorkflowStatus,
            String newWorkflowStatus) {
        if (userProfile.isInHouseManufacturingLab()) {
            return;
        }

        if (newWorkflowStatus.equals("Need information")
                && existing.getWorkflowName().equals("Planning In House")
                && serviceConfigurationRepository.isVspPlanningUser(request.getProfileId())) {
            PatientDoctorOrganization pdo = patientDoctorOrganizationRepository.findByPatient(request.getPatientId());
            Optional<VspOrderIdAndStatus> orderDetails =
                    vspOrderRepository.findLatestActiveVspOrderByPatientExcludingDraft(request.getPatientId());
            orderDetails.ifPresent(o -> {
                String practiceName = pdo.getUserProfile().getPracticeName();
                String labName = pdo.getAddedByUserProfile().getLabName();
                timelineService.addEvent(
                        pdo.getPatient().getId(),
                        UserType.PATIENT,
                        pdo.getUserProfile().getDoctor().getId(),
                        UserType.DOCTOR,
                        EventType.VSP_MORE_INFORMATION_REQUIRED,
                        new VspMoreInfoRequiredEventMetadata(
                                pdo.getPatient().getId(),
                                pdo.getPatient().fullName(),
                                o.getId(),
                                labName,
                                practiceName));
                PatientDoctorOrganization patientDoctorOrganization = patientDoctorOrganizationRepository.findByPatient(
                        existing.getPatient().getId());
                vspOrderRepository.findById(o.getId()).ifPresent(vspOrder -> {
                    VspPrescription latestPrescription = VspPrescription.getLatestPrescription(vspOrder);
                    String surgeryDate = VspPrescription.formatDate(
                            latestPrescription != null ? latestPrescription.getTentativeSurgeryDate() : null);
                    String planNeededBy = VspPrescription.formatDate(
                            latestPrescription != null ? latestPrescription.getEarliestTreatmentPlanByDate() : null);
                    String daysToSurgery = VspPrescription.calculateDays(
                            latestPrescription != null ? latestPrescription.getTentativeSurgeryDate() : null);
                    String daysToPlan = VspPrescription.calculateDays(
                            latestPrescription != null ? latestPrescription.getEarliestTreatmentPlanByDate() : null);
                    String surgeryType = VspPrescription.buildSurgeryType(latestPrescription);
                    String treatmentPlan = latestPrescription != null ? latestPrescription.getTreatmentPlan() : null;

                    String comment =
                            orderCommentsRepository.findLatestCommentByProfileId(request.getProfileId()).stream()
                                    .findFirst()
                                    .orElse(null);

                    VspMoreInfoRequiredEmailRequest emailRequest = VspMoreInfoRequiredEmailRequest.builder()
                            .product(vspOrder.getServiceProduct().getProductName())
                            .surgeryDate(surgeryDate)
                            .treatmentPlanInstructions(treatmentPlan)
                            .planNeededBy(planNeededBy)
                            .orthodontist(vspOrder.getOrthodontistName())
                            .oralSurgeon(vspOrder.getOralSurgeonName())
                            .caseStatus("NEED MORE INFO")
                            .portalUrl(VspPortUrlResolver.getPortalUrl())
                            .patientName(existing.getPatient().fullName())
                            .daysToPlan(daysToPlan)
                            .customerName(patientDoctorOrganization
                                    .getUserProfile()
                                    .getUser()
                                    .displayName())
                            .surgeryType(surgeryType)
                            .labRemarks(comment)
                            .daysToSurgery(daysToSurgery)
                            .email(pdo.getUserProfile().getUser().getEmail())
                            .orgName(OrgName.ROUTETOSMILE.name())
                            .build();

                    vspNotificationService.notifySafely(
                            "vsp-more-info-required-email",
                            () -> vspPlanningEmailService.sendVspMoreInfoRequiredEmail(emailRequest));
                    String url = String.format(
                            "vsp-profile/%s/plans?order_id=%s", pdo.getPatient().getId(), o.getId());
                    vspNotificationService.sendWhatsAppSafely(
                            pdo.getUserProfile(),
                            pdo.getUserProfile() != null && pdo.getUserProfile().getUser() != null
                                    ? pdo.getUserProfile().getUser().getMobileNo()
                                    : " ",
                            whatsappTemplateTypeProperties != null
                                            && whatsappTemplateTypeProperties.getVSP_CUSTOMER_NEED_MORE_INFORMATION()
                                                    != null
                                    ? whatsappTemplateTypeProperties.getVSP_CUSTOMER_NEED_MORE_INFORMATION()
                                    : " ",
                            List.of(
                                    existing.getPatient() != null
                                            ? existing.getPatient().fullName()
                                            : " ",
                                    comment != null ? comment : " ",
                                    url != null ? url : " "));
                    vspCaseActivityLogger.logMoreInfoRequired(
                            existing.getPatient(), pdo.getAddedByUserProfile(), comment);
                });
            });
        }

        if (newWorkflowStatus.equals("Planning done")
                && existing.getWorkflowName().equals("Planning In House")
                && serviceConfigurationRepository.isVspPlanningUser(request.getProfileId())) {
            PatientDoctorOrganization pdo = patientDoctorOrganizationRepository.findByPatient(request.getPatientId());
            Optional<VspOrderIdAndStatus> orderDetails =
                    vspOrderRepository.findLatestActiveVspOrderByPatientExcludingDraft(request.getPatientId());
            orderDetails.ifPresent(o -> {
                String practiceName = pdo.getUserProfile().getPracticeName();
                String labName = pdo.getAddedByUserProfile().getLabName();
                timelineService.addEvent(
                        pdo.getPatient().getId(),
                        UserType.PATIENT,
                        pdo.getUserProfile().getDoctor().getId(),
                        UserType.DOCTOR,
                        EventType.VSP_PLANNING_COMPLETED,
                        new VspPlanningCompletedEventMetadata(
                                pdo.getPatient().getId(),
                                pdo.getPatient().fullName(),
                                o.getId(),
                                labName,
                                practiceName));

                timelineService.addEvent(
                        pdo.getPatient().getId(),
                        UserType.PATIENT,
                        pdo.getAddedByUserProfile().getDoctor().getId(),
                        UserType.DOCTOR,
                        EventType.VSP_PLANNING_COMPLETED,
                        new VspPlanningCompletedEventMetadata(
                                pdo.getPatient().getId(),
                                pdo.getPatient().fullName(),
                                o.getId(),
                                labName,
                                practiceName),
                        pdo.getAddedByUserProfile(),
                        pdo.getAddedByUserProfile().getOrganization());

                PatientDoctorOrganization patientDoctorOrganization = patientDoctorOrganizationRepository.findByPatient(
                        existing.getPatient().getId());
                vspOrderRepository.findById(o.getId()).ifPresent(vspOrder -> {
                    VspPrescription latestPrescription = VspPrescription.getLatestPrescription(vspOrder);
                    String surgeryDate = VspPrescription.formatDate(
                            latestPrescription != null ? latestPrescription.getTentativeSurgeryDate() : null);
                    String daysToSurgery = VspPrescription.calculateDays(
                            latestPrescription != null ? latestPrescription.getTentativeSurgeryDate() : null);
                    String surgeryType = VspPrescription.buildSurgeryType(latestPrescription);

                    VspPlanningCompletedEmailRequest customerEmailRequest = VspPlanningCompletedEmailRequest.builder()
                            .product(vspOrder.getServiceProduct().getProductName())
                            .surgeryDate(surgeryDate)
                            .orthodontist(vspOrder.getOrthodontistName())
                            .oralSurgeon(vspOrder.getOralSurgeonName())
                            .caseStatus("PLANNING COMPLETED")
                            .portalUrl(VspPortUrlResolver.getPortalUrl())
                            .patientName(existing.getPatient().fullName())
                            .customerName(patientDoctorOrganization
                                    .getUserProfile()
                                    .getUser()
                                    .displayName())
                            .surgeryType(surgeryType)
                            .daysToSurgery(daysToSurgery)
                            .email(pdo.getUserProfile().getUser().getEmail())
                            .orgName(OrgName.ROUTETOSMILE.name())
                            .build();

                    VspPlanningCompletedEmailRequest labEmailRequest = VspPlanningCompletedEmailRequest.builder()
                            .product(vspOrder.getServiceProduct().getProductName())
                            .surgeryDate(surgeryDate)
                            .orthodontist(vspOrder.getOrthodontistName())
                            .oralSurgeon(vspOrder.getOralSurgeonName())
                            .caseStatus("PLANNING COMPLETED")
                            .portalUrl(VspPortUrlResolver.getPortalUrl())
                            .patientName(existing.getPatient().fullName())
                            .customerName(patientDoctorOrganization
                                    .getUserProfile()
                                    .getUser()
                                    .displayName())
                            .surgeryType(surgeryType)
                            .daysToSurgery(daysToSurgery)
                            .email(pdo.getOrgUserProfile().getUser().getEmail())
                            .orgName(OrgName.ROUTETOSMILE.name())
                            .build();

                    vspPlanningEmailService.sendVspPlanningCompletedEmail(labEmailRequest);
                    vspPlanningEmailService.sendVspPlanningCompletedEmail(customerEmailRequest);
                    vspCaseActivityLogger.logPlanningCompleted(existing.getPatient(), pdo.getOrgUserProfile());
                });
            });
        }

        if (newWorkflowStatus.equals("Need information")
                && existing.getWorkflowName().equals("Planning In House")
                && !serviceConfigurationRepository.isVspPlanningUser(request.getProfileId())) {
            PatientDoctorOrganization patientDoctorOrganization = patientDoctorOrganizationRepository.findByPatient(
                    existing.getPatient().getId());
            Patient patient = patientDoctorOrganization.getPatient();
            UserProfile receiverProfile = patientDoctorOrganization.getUserProfile();
            String email = receiverProfile.getUser().getEmail();
            String notes = orderCommentsRepository.findLatestCommentByProfileId(request.getProfileId()).stream()
                    .findFirst()
                    .orElse(null);
            planningCustomerEmailService.sendNeedMoreInfoEmail(NeedMoreInfoEmailRequest.builder()
                    .email(email)
                    .orgName(receiverProfile.getOrganizationBrandName())
                    .patientFirstName(patient.getFirstName())
                    .patientLastName(patient.getLastName())
                    .patientId(patient.getCustomerMappedId())
                    .practiceLocation(patient.getPracticeLocationName())
                    .portalUrl(resolveWebUrl.resolveOrgName(receiverProfile.getOrganizationBrandName()))
                    .labComments(notes)
                    .build());

            if (serviceConfigurationRepository.isPlanningUser(request.getProfileId())) {
                timelineService.addEvent(
                        patient.getId(),
                        UserType.PATIENT,
                        receiverProfile.getDoctor().getId(),
                        UserType.DOCTOR,
                        EventType.PLANNING_CUSTOMER_NEED_MORE_INFO_REQUESTED,
                        new PlanningCustomerNeedMoreInfoRequestedMetadata(patient.getId(), patient.fullName()),
                        receiverProfile,
                        receiverProfile.getOrganization());

                String title = "Action Required";
                String message = String.format("The lab needs more information for %s's case.", patient.fullName());
                chatService.sendNotification(SendNotificationRequest.builder()
                        .patientId(patient.getId())
                        .title(title)
                        .message(message)
                        .notificationIndex(162)
                        .mobile(receiverProfile.getUser().getMobileNo())
                        .email(receiverProfile.getUser().getEmail())
                        .globalId(Optional.ofNullable(existing.getOrder())
                                .map(Order::getId)
                                .orElse(null))
                        .isDoctorApp(true)
                        .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                        .xOrgName(xOrgNameResolver
                                .resolveFromUserProfile(receiverProfile)
                                .getXOrgName())
                        .organizationId(xOrgNameResolver
                                .resolveFromUserProfile(receiverProfile)
                                .getOrganizationId())
                        .build());

                whatsAppUtilities
                        .resolveMobileNumberOfSpecificUser(patient.getId(), List.of(MessageSendTo.CUSTOMER))
                        .forEach(mobileNo -> {
                            String url = "profile/" + patient.getId() + "/plans";
                            planningNotificationService.sendWhatsAppSafely(
                                    receiverProfile,
                                    mobileNo,
                                    whatsappTemplateTypeProperties.getPLANNING_MORE_INFORMATION_REQUIRED(),
                                    List.of(url));
                        });
            }
        }
        if (newWorkflowStatus.equals("Planning done")
                && existing.getWorkflowName().equals("Planning In House")
                && serviceConfigurationRepository.isPlanningUser(request.getProfileId())) {
            PatientDoctorOrganization patientDoctorOrganization = patientDoctorOrganizationRepository.findByPatient(
                    existing.getPatient().getId());
            Patient patient = patientDoctorOrganization.getPatient();
            UserProfile receiverProfile = patientDoctorOrganization.getUserProfile();
            UserProfile ownerProfile = patientDoctorOrganization.getAddedByUserProfile();

            String owenerEmail = ownerProfile.getUser().getEmail();
            planningCustomerEmailService.sendCaseCompletedEmail(CaseCompletedEmailRequest.builder()
                    .email(owenerEmail)
                    .orgName(ownerProfile.getOrganizationBrandName())
                    .patientFirstName(patient.getFirstName())
                    .patientLastName(patient.getLastName())
                    .patientId(patient.getCustomerMappedId())
                    .practiceLocation(patient.getPracticeLocationName())
                    .portalUrl(resolveWebUrl.resolveOrgName(ownerProfile.getOrganizationBrandName()))
                    .build());

            timelineService.addEvent(
                    patient.getId(),
                    UserType.PATIENT,
                    ownerProfile.getDoctor().getId(),
                    UserType.DOCTOR,
                    EventType.PLANNING_CASE_COMPLETED,
                    new PlanningCaseCompletedEventMetadata(patient.getId(), patient.fullName()),
                    ownerProfile,
                    ownerProfile.getOrganization());

            String ownerMessageTitle = "Case Completed";
            String ownerMessageDesc = String.format("Planning for %s is now complete.", patient.fullName());
            chatService.sendNotification(SendNotificationRequest.builder()
                    .patientId(patient.getId())
                    .title(ownerMessageTitle)
                    .message(ownerMessageDesc)
                    .notificationIndex(158)
                    .mobile(ownerProfile.getUser().getMobileNo())
                    .email(ownerProfile.getUser().getEmail())
                    .globalId(Optional.ofNullable(existing.getOrder())
                            .map(Order::getId)
                            .orElse(null))
                    .isDoctorApp(true)
                    .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                    .xOrgName(xOrgNameResolver
                            .resolveFromUserProfile(ownerProfile)
                            .getXOrgName())
                    .organizationId(xOrgNameResolver
                            .resolveFromUserProfile(ownerProfile)
                            .getOrganizationId())
                    .build());

            String email = receiverProfile.getUser().getEmail();
            planningCustomerEmailService.sendCaseCompletedEmail(CaseCompletedEmailRequest.builder()
                    .email(email)
                    .orgName(receiverProfile.getOrganizationBrandName())
                    .patientFirstName(patient.getFirstName())
                    .patientLastName(patient.getLastName())
                    .patientId(patient.getCustomerMappedId())
                    .practiceLocation(patient.getPracticeLocationName())
                    .portalUrl(resolveWebUrl.resolveOrgName(receiverProfile.getOrganizationBrandName()))
                    .build());

            timelineService.addEvent(
                    patient.getId(),
                    UserType.PATIENT,
                    receiverProfile.getDoctor().getId(),
                    UserType.DOCTOR,
                    EventType.PLANNING_CUSTOMER_CASE_COMPLETED,
                    new PlanningCustomerCaseCompletedMetadata(patient.getId(), patient.fullName()),
                    receiverProfile,
                    receiverProfile.getOrganization());

            String title = "Case Completed";
            String message = String.format("Planning for %s is now complete.", patient.fullName());
            chatService.sendNotification(SendNotificationRequest.builder()
                    .patientId(patient.getId())
                    .title(title)
                    .message(message)
                    .notificationIndex(158)
                    .mobile(receiverProfile.getUser().getMobileNo())
                    .email(receiverProfile.getUser().getEmail())
                    .globalId(Optional.ofNullable(existing.getOrder())
                            .map(Order::getId)
                            .orElse(null))
                    .isDoctorApp(true)
                    .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                    .xOrgName(xOrgNameResolver
                            .resolveFromUserProfile(receiverProfile)
                            .getXOrgName())
                    .organizationId(xOrgNameResolver
                            .resolveFromUserProfile(receiverProfile)
                            .getOrganizationId())
                    .build());

            whatsAppUtilities
                    .resolveMobileNumberOfSpecificUser(
                            patient.getId(), List.of(MessageSendTo.SUPER_ADMIN, MessageSendTo.ADMIN))
                    .forEach(mobileNo -> {
                        String url = "profile/" + patient.getId() + "/plans";
                        planningNotificationService.sendWhatsAppSafely(
                                receiverProfile,
                                mobileNo,
                                whatsappTemplateTypeProperties.getCASE_PLANNING_COMPLETED(),
                                List.of(url));
                    });

            caseActivityLogger.logPrimaryClosure(existing.getPatient(), ownerProfile);
        }

        if (!serviceConfigurationRepository.isPlanningUser(request.getProfileId())) {
            Set<UserProfile> targetProfiles = getNotificationRecipients(existing.getPatient(), userProfile);
            for (UserProfile recipient : targetProfiles) {
                sendStatusUpdateNotification(existing, recipient, oldWorkflowStatus, newWorkflowStatus);
            }

            if (whatsAppUtilities.isCustomer(request.getProfileId())) {
                List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                        existing.getPatient().getId(), List.of(MessageSendTo.SUPER_ADMIN, MessageSendTo.ADMIN));
                OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
                String url = "profile/" + existing.getPatient().getId();
                numbers.forEach((no) -> {
                    whatsAppRequestBuilder
                            .buildRequestIfMobileExists(
                                    true,
                                    orgName,
                                    no,
                                    whatsappTemplateTypeProperties.getSTATUS_UPDATED(),
                                    List.of(
                                            existing.getPatient().fullName(),
                                            oldWorkflowStatus,
                                            newWorkflowStatus,
                                            url))
                            .ifPresent(chatService::sendWhatsAppMessage);
                });
            }

            if (whatsAppUtilities.isAdmin(request.getProfileId())) {
                List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                        existing.getPatient().getId(), List.of(MessageSendTo.CUSTOMER, MessageSendTo.SUPER_ADMIN));
                OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
                String url = "profile/" + existing.getPatient().getId();
                numbers.forEach((no) -> {
                    whatsAppRequestBuilder
                            .buildRequestIfMobileExists(
                                    true,
                                    orgName,
                                    no,
                                    whatsappTemplateTypeProperties.getSTATUS_UPDATED(),
                                    List.of(
                                            existing.getPatient().fullName(),
                                            oldWorkflowStatus,
                                            newWorkflowStatus,
                                            url))
                            .ifPresent(chatService::sendWhatsAppMessage);
                });
            }

            if (whatsAppUtilities.isSupperAdmin(request.getProfileId())) {
                List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                        existing.getPatient().getId(), List.of(MessageSendTo.CUSTOMER, MessageSendTo.ADMIN));
                OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
                String url = "profile/" + existing.getPatient().getId();
                numbers.forEach((no) -> {
                    whatsAppRequestBuilder
                            .buildRequestIfMobileExists(
                                    true,
                                    orgName,
                                    no,
                                    whatsappTemplateTypeProperties.getSTATUS_UPDATED(),
                                    List.of(
                                            existing.getPatient().fullName(),
                                            oldWorkflowStatus,
                                            newWorkflowStatus,
                                            url))
                            .ifPresent(chatService::sendWhatsAppMessage);
                });
            }

            if (whatsAppUtilities.isPlanningUser(request.getProfileId())) {
                List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                        existing.getPatient().getId(), List.of(MessageSendTo.CUSTOMER));
                OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
                String url = "profile/" + existing.getPatient().getId();
                numbers.forEach((no) -> {
                    whatsAppRequestBuilder
                            .buildRequestIfMobileExists(
                                    true,
                                    orgName,
                                    no,
                                    whatsappTemplateTypeProperties.getSTATUS_UPDATED(),
                                    List.of(
                                            existing.getPatient().fullName(),
                                            oldWorkflowStatus,
                                            newWorkflowStatus,
                                            url))
                            .ifPresent(chatService::sendWhatsAppMessage);
                });
            }

            if (whatsAppUtilities.isProductionUser(request.getProfileId())) {
                List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                        existing.getPatient().getId(), List.of(MessageSendTo.CUSTOMER));
                OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
                String url = "profile/" + existing.getPatient().getId();
                numbers.forEach((no) -> {
                    whatsAppRequestBuilder
                            .buildRequestIfMobileExists(
                                    true,
                                    orgName,
                                    no,
                                    whatsappTemplateTypeProperties.getSTATUS_UPDATED(),
                                    List.of(
                                            existing.getPatient().fullName(),
                                            oldWorkflowStatus,
                                            newWorkflowStatus,
                                            url))
                            .ifPresent(chatService::sendWhatsAppMessage);
                });
            }
        }
    }

    @Override
    public void recordAddedNotification(UserProfile userProfile, Patient patient, String orderId) {
        if (userProfile.isInHouseManufacturingLab()) {
            return;
        }
        handleGenericNotifications(patient, userProfile, NotificationType.RECORDS_ADDED, orderId);
    }

    @Override
    public void prescriptionAdded(UserProfile userProfile, Patient patient, String orderId) {
        if (userProfile.isInHouseManufacturingLab()) {
            return;
        }
        handleGenericNotifications(patient, userProfile, NotificationType.PRESCRIPTION_ADDED, orderId);
    }

    @Override
    public void commentAddedNotification(UserProfile userProfile, Patient patient, AddPatientCommentRequest request) {
        if (userProfile.isInHouseManufacturingLab()) {
            return;
        }

        if (whatsAppUtilities.isSupperAdmin(request.getProfileId())) {
            List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                    request.getPatientId(), List.of(MessageSendTo.CUSTOMER));
            OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
            numbers.forEach((no) -> {
                whatsAppRequestBuilder
                        .buildRequestIfMobileExists(
                                true,
                                orgName,
                                no,
                                whatsappTemplateTypeProperties.getNEW_COMMENT(),
                                List.of(
                                        patient.fullName(),
                                        request.getNotes(),
                                        "profile/" + patient.getId() + "/activity-logs/comments"))
                        .ifPresent(chatService::sendWhatsAppMessage);
            });
        }

        if (whatsAppUtilities.isAdmin(request.getProfileId())) {
            List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                    request.getPatientId(), List.of(MessageSendTo.CUSTOMER, MessageSendTo.SUPER_ADMIN));
            OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
            numbers.forEach((no) -> {
                whatsAppRequestBuilder
                        .buildRequestIfMobileExists(
                                true,
                                orgName,
                                no,
                                whatsappTemplateTypeProperties.getNEW_COMMENT(),
                                List.of(
                                        patient.fullName(),
                                        request.getNotes(),
                                        "profile/" + patient.getId() + "/activity-logs/comments"))
                        .ifPresent(chatService::sendWhatsAppMessage);
            });
        }

        if (whatsAppUtilities.isCustomer(request.getProfileId())) {
            List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                    request.getPatientId(), List.of(MessageSendTo.ADMIN, MessageSendTo.SUPER_ADMIN));

            OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
            numbers.forEach((no) -> {
                whatsAppRequestBuilder
                        .buildRequestIfMobileExists(
                                true,
                                orgName,
                                no,
                                whatsappTemplateTypeProperties.getNEW_COMMENT(),
                                List.of(
                                        patient.fullName(),
                                        request.getNotes(),
                                        "profile/" + patient.getId() + "/activity-logs/comments"))
                        .ifPresent(chatService::sendWhatsAppMessage);
            });
        }

        handleGenericNotifications(patient, userProfile, NotificationType.COMMENT_ADDED, request.getNotes());
    }

    @Override
    public void treatmentReadyToBegin(
            MoveTaskTrackerRequest request, PatientTaskTracker existing, UserProfile userProfile) {
        if (userProfile.isInHouseManufacturingLab()) {
            return;
        }
        var manufacturingBatch = existing.getManufacturingBatch();
        if (existing.getWorkflowName().equals(PRODUCTION_IN_HOUSE_WORKFLOW)
                        && existing.getCurrentStatusName().equals(DELIVERED)
                || existing.getWorkflowName().equals(PRODUCTION_OUTSOURCE_WORKFLOW)
                        && existing.getCurrentStatusName().equals(DELIVERED)) {
            if (manufacturingBatch != null) {
                if (manufacturingBatch.getBatchNumber() == 1) {
                    handleGenericNotifications(
                            existing,
                            userProfile,
                            NotificationType.TREATMENT_READY_TO_BEGIN,
                            existing.getWorkflow().getName());

                    if (whatsAppUtilities.isCustomer(request.getProfileId())) {
                        String url = "profile/" + existing.getPatient().getId() + "/aligner-tracking";
                        List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                                request.getPatientId(), List.of(MessageSendTo.ADMIN, MessageSendTo.SUPER_ADMIN));
                        OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
                        numbers.forEach(no -> {
                            whatsAppRequestBuilder
                                    .buildRequestIfMobileExists(
                                            true,
                                            orgName,
                                            no,
                                            whatsappTemplateTypeProperties.getCASE_READY_TO_BEGIN_TREATMENT(),
                                            List.of(existing.getPatient().fullName(), url))
                                    .ifPresent(chatService::sendWhatsAppMessage);
                        });
                    }
                }
            }

            if (whatsAppUtilities.isCustomer(request.getProfileId())) {
                List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                        request.getPatientId(), List.of(MessageSendTo.ADMIN, MessageSendTo.SUPER_ADMIN));
                OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());

                numbers.forEach((no) -> {
                    whatsAppRequestBuilder
                            .buildRequestIfMobileExists(
                                    true,
                                    orgName,
                                    no,
                                    whatsappTemplateTypeProperties.getALIGNERS_DELIVERED(),
                                    List.of(
                                            existing.getPatient().fullName(),
                                            "profile/" + existing.getPatient().getId() + "/production"))
                            .ifPresent(chatService::sendWhatsAppMessage);
                });
            }

            if (whatsAppUtilities.isSupperAdmin(request.getProfileId())
                    || whatsAppUtilities.isAdmin(request.getProfileId())
                    || whatsAppUtilities.isProductionUser(request.getProfileId())) {
                List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                        request.getPatientId(), List.of(MessageSendTo.CUSTOMER));
                OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());

                numbers.forEach((no) -> {
                    whatsAppRequestBuilder
                            .buildRequestIfMobileExists(
                                    true,
                                    orgName,
                                    no,
                                    whatsappTemplateTypeProperties.getALIGNERS_DELIVERED(),
                                    List.of(
                                            existing.getPatient().fullName(),
                                            "profile/" + existing.getPatient().getId() + "/production"))
                            .ifPresent(chatService::sendWhatsAppMessage);
                });
            }
        }
    }

    @Override
    public void manufacturingCompleted(PatientTaskTracker existing, UserProfile userProfile) {
        if (userProfile.isInHouseManufacturingLab()) {
            return;
        }
        if (existing.getWorkflowName().equals(PRODUCTION_IN_HOUSE_WORKFLOW)
                        && existing.getCurrentStatusName().equals(PACKAGED)
                || existing.getWorkflowName().equals(PRODUCTION_OUTSOURCE_WORKFLOW)
                        && existing.getCurrentStatusName().equals(PACKAGED)) {
            handleGenericNotifications(
                    existing,
                    userProfile,
                    NotificationType.MANUFACTURING_COMPLETED,
                    existing.getWorkflow().getName());
        }
    }

    private boolean isMovingToPlanning(SelectCaseForPatientTaskRequest request) {
        return (PLANNING_IN_HOUSE_WORKFLOW.equals(request.getWorkflowName())
                        && TO_DO.equals(request.getWorkflowStatusName()))
                || (PLAN_OUTSOURCED_WORKFLOW.equals(request.getWorkflowName())
                        && TO_DO.equals(request.getWorkflowStatusName()));
    }

    private boolean isMovingToProduction(SelectCaseForPatientTaskRequest request) {
        return (PRODUCTION_IN_HOUSE_WORKFLOW.equals(request.getWorkflowName())
                        && TO_DO.equals(request.getWorkflowStatusName()))
                || (PRODUCTION_OUTSOURCE_WORKFLOW.equals(request.getWorkflowName())
                        && IN_PROGRESS.equals(request.getWorkflowStatusName()));
    }

    private void handleGenericNotifications(
            PatientTaskTracker existing,
            UserProfile userProfile,
            NotificationType notificationType,
            String workflowName) {
        Set<UserProfile> targetProfiles = getNotificationRecipients(existing, userProfile, workflowName);

        for (UserProfile recipient : targetProfiles) {
            sendGenericNotification(existing, recipient, notificationType);
        }
    }

    @Override
    public void handleGenericNotifications(
            Patient patient, UserProfile userProfile, NotificationType notificationType, String notes) {
        Set<UserProfile> targetProfiles = getNotificationRecipients(patient, userProfile);

        for (UserProfile recipient : targetProfiles) {
            sendGenericNotification(patient, recipient, notificationType, notes);
        }
    }

    @Override
    public Set<UserProfile> getNotificationRecipients(
            PatientTaskTracker existing, UserProfile userProfile, String workflowName) {
        Set<UserProfile> recipients = new HashSet<>();

        if (userProfile.isPractice()) {
            recipients.addAll(getPracticeNotificationRecipients(existing, userProfile, workflowName));
        } else if (userProfile.isEnterpriseOrDesignLab()) {
            recipients.addAll(getEnterpriseNotificationRecipients(existing));
        } else if (userProfile.isInternalUser()) {
            recipients.addAll(getInternalUserNotificationRecipients(existing, userProfile));
        }

        return recipients;
    }

    private Set<UserProfile> getNotificationRecipients(Patient patient, UserProfile userProfile) {
        Set<UserProfile> recipients = new HashSet<>();

        if (userProfile.isPractice()) {
            recipients.addAll(getPracticeNotificationRecipients(userProfile));
        } else if (userProfile.isEnterpriseOrDesignLab()) {
            recipients.addAll(getEnterpriseNotificationRecipients(patient));
        } else if (userProfile.isInternalUser()) {
            recipients.addAll(getInternalUserNotificationRecipients(patient, userProfile));
        }

        return recipients;
    }

    private Set<UserProfile> getPracticeNotificationRecipients(
            PatientTaskTracker existing, UserProfile userProfile, String workflowName) {
        Set<UserProfile> recipients = new HashSet<>();

        UserProfile inviterProfile = userProfile.getInviterProfile();
        if (inviterProfile != null) {
            recipients.add(inviterProfile);

            List<PatientTaskTracker> practicePatientTasks =
                    patientTaskTrackerRepository.findIndividualPatientTaskByProfileId(
                            inviterProfile.getOrganization().getId(),
                            inviterProfile.getId(),
                            existing.getPatient().getId());

            practicePatientTasks.stream()
                    .filter(task ->
                            workflowName.equalsIgnoreCase(task.getWorkflow().getName()))
                    .findFirst()
                    .ifPresent(patientTask -> {
                        UserProfile assignee = patientTask.getAssignee();
                        if (assignee != null && !assignee.getId().equals(inviterProfile.getId())) {
                            recipients.add(assignee);
                        }
                    });
        }

        return recipients;
    }

    private Set<UserProfile> getPracticeNotificationRecipients(UserProfile userProfile) {
        Set<UserProfile> recipients = new HashSet<>();

        UserProfile inviterProfile = userProfile.getInviterProfile();
        if (inviterProfile != null) {
            recipients.add(inviterProfile);
        }

        return recipients;
    }

    private Set<UserProfile> getEnterpriseNotificationRecipients(PatientTaskTracker existing) {
        Set<UserProfile> recipients = new HashSet<>();

        UserProfile practiceProfile = getPracticeProfile(existing);
        if (practiceProfile != null) {
            recipients.add(practiceProfile);
        }

        return recipients;
    }

    private Set<UserProfile> getEnterpriseNotificationRecipients(Patient patient) {
        Set<UserProfile> recipients = new HashSet<>();

        UserProfile practiceProfile = getPracticeProfile(patient);
        if (practiceProfile != null) {
            recipients.add(practiceProfile);
        }

        return recipients;
    }

    private Set<UserProfile> getInternalUserNotificationRecipients(
            PatientTaskTracker existing, UserProfile userProfile) {
        Set<UserProfile> recipients = new HashSet<>();

        UserProfile inviterProfile = userProfile.getInviterProfile();
        if (inviterProfile == null) return recipients;

        if (inviterProfile.isInHouseManufacturingLab()) {
            recipients.add(inviterProfile);
        } else if (inviterProfile.isEnterpriseOrDesignLab()) {
            recipients.add(inviterProfile);

            UserProfile practiceProfile = getPracticeProfile(existing);
            if (practiceProfile != null) {
                recipients.add(practiceProfile);
            }
        }

        return recipients;
    }

    private Set<UserProfile> getInternalUserNotificationRecipients(Patient patient, UserProfile userProfile) {
        Set<UserProfile> recipients = new HashSet<>();

        UserProfile inviterProfile = userProfile.getInviterProfile();
        if (inviterProfile == null) return recipients;

        if (inviterProfile.isInHouseManufacturingLab()) {
            recipients.add(inviterProfile);
        } else if (inviterProfile.isEnterpriseOrDesignLab()) {
            recipients.add(inviterProfile);

            UserProfile practiceProfile = getPracticeProfile(patient);
            if (practiceProfile != null) {
                recipients.add(practiceProfile);
            }
        }

        return recipients;
    }

    private void sendGenericNotification(
            PatientTaskTracker existing, UserProfile recipient, NotificationType notificationType) {
        String email = recipient.getUser().getEmail();
        String mobile = recipient.getUser().getMobileNo();
        Patient patient = existing.getPatient();

        switch (notificationType) {
            case PLANNING:
                sendPlanningNotification(email, mobile, patient, recipient, existing);
                break;
            case PRODUCTION:
                sendProductionNotification(email, mobile, patient, recipient);
                break;
            case TREATMENT_READY_TO_BEGIN:
                treatmentReadyToBeginNotification(existing, recipient);
                break;
            case MANUFACTURING_COMPLETED:
                manufacturingCompletedNotification(existing, recipient);
                break;
        }
    }

    private void sendGenericNotification(
            Patient patient, UserProfile recipient, NotificationType notificationType, String notes) {
        String email = recipient.getUser().getEmail();
        String mobile = recipient.getUser().getMobileNo();

        switch (notificationType) {
            case RECORDS_ADDED:
                caseRecordAddedNotification(email, mobile, patient, recipient, notes);
                break;
            case PRESCRIPTION_ADDED:
                prescriptionAddedNotification(email, mobile, patient, recipient, notes);
                break;
            case COMMENT_ADDED:
                commentAdded(email, mobile, patient, recipient, notes);
                break;
        }
    }

    private void sendPlanningNotification(
            String email, String mobile, Patient patient, UserProfile recipient, PatientTaskTracker existing) {
        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Case moved to Planning")
                .message(String.format("%s case has been moved to Planning.", patient.getFirstName()))
                .notificationIndex(143)
                .email(email)
                .mobile(mobile)
                .isDoctorApp(true)
                .patientId(patient.getId())
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .globalId(Optional.ofNullable(existing.getOrder())
                        .map(Order::getId)
                        .orElse(null))
                .xOrgName(xOrgNameResolver.resolveFromUserProfile(recipient).getXOrgName())
                .organizationId(
                        xOrgNameResolver.resolveFromUserProfile(recipient).getOrganizationId())
                .build());

        timelineService.addEvent(
                patient.getId(),
                UserType.PATIENT,
                recipient.getDoctor().getId(),
                UserType.DOCTOR,
                EventType.CASE_MOVED_TO_PLANNING,
                new CaseMovedToPlanningEventMetadata(patient.getId(), patient.fullName()),
                recipient,
                recipient.getOrganization());
    }

    private void caseRecordAddedNotification(
            String email, String mobile, Patient patient, UserProfile recipient, String orderId) {

        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Records Added")
                .message(String.format("New case records have been added for %s.", patient.getFirstName()))
                .notificationIndex(150)
                .email(email)
                .mobile(mobile)
                .isDoctorApp(true)
                .globalId(orderId)
                .patientId(patient.getId())
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .xOrgName(xOrgNameResolver.resolveFromUserProfile(recipient).getXOrgName())
                .organizationId(
                        xOrgNameResolver.resolveFromUserProfile(recipient).getOrganizationId())
                .build());

        timelineService.addEvent(
                patient.getId(),
                UserType.PATIENT,
                recipient.getDoctor().getId(),
                UserType.DOCTOR,
                EventType.RECORDS_ADDED,
                new RecordsAddedEventMetadata(patient.getId(), patient.fullName()),
                recipient,
                recipient.getOrganization());
    }

    private void prescriptionAddedNotification(
            String email, String mobile, Patient patient, UserProfile recipient, String orderId) {
        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Prescription Added")
                .message(String.format("A prescription has been added for %s.", patient.getFirstName()))
                .notificationIndex(151)
                .email(email)
                .mobile(mobile)
                .isDoctorApp(true)
                .patientId(patient.getId())
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .globalId(orderId)
                .xOrgName(xOrgNameResolver.resolveFromUserProfile(recipient).getXOrgName())
                .organizationId(
                        xOrgNameResolver.resolveFromUserProfile(recipient).getOrganizationId())
                .build());

        timelineService.addEvent(
                patient.getId(),
                UserType.PATIENT,
                recipient.getDoctor().getId(),
                UserType.DOCTOR,
                EventType.PRESCRIPTION_ADDED,
                new PrescriptionAddedEventMetadata(patient.getId(), patient.fullName()),
                recipient,
                recipient.getOrganization());
    }

    @Override
    public void commentAdded(String email, String mobile, Patient patient, UserProfile userProfile, String notes) {
        Optional<String> optionalOrderId = orderRepository.findLatestOrderIdByPatientId(patient.getId());
        timelineService.addEvent(
                patient.getId(),
                UserType.PATIENT,
                userProfile.getDoctor().getId(),
                UserType.DOCTOR,
                EventType.NEW_COMMENT_ADDED,
                new NewCommentAddedEventMetadata(patient.getId(), patient.fullName()),
                userProfile,
                userProfile.getOrganization());

        chatService.sendNotification(SendNotificationRequest.builder()
                .title("New Comment")
                .message(String.format("New comments have been added to %s case.", patient.fullName()))
                .notificationIndex(146)
                .email(email)
                .mobile(mobile)
                .isDoctorApp(true)
                .patientId(patient.getId())
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .globalId(optionalOrderId.orElse(null))
                .xOrgName(xOrgNameResolver.resolveFromUserProfile(userProfile).getXOrgName())
                .organizationId(
                        xOrgNameResolver.resolveFromUserProfile(userProfile).getOrganizationId())
                .build());
    }

    private void sendProductionNotification(String email, String mobile, Patient patient, UserProfile recipient) {
        if (recipient.isPractice()) {
            return;
        }
        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Case moved to Production")
                .message(String.format("%s case has been moved to Production.", patient.getFirstName()))
                .notificationIndex(145)
                .email(email)
                .mobile(mobile)
                .isDoctorApp(true)
                .patientId(patient.getId())
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .xOrgName(xOrgNameResolver.resolveFromUserProfile(recipient).getXOrgName())
                .organizationId(
                        xOrgNameResolver.resolveFromUserProfile(recipient).getOrganizationId())
                .build());

        timelineService.addEvent(
                patient.getId(),
                UserType.PATIENT,
                recipient.getDoctor().getId(),
                UserType.DOCTOR,
                EventType.CASE_MOVED_TO_PRODUCTION,
                new CaseMovedToProductionEventMetadata(patient.getId(), patient.fullName()),
                recipient,
                recipient.getOrganization());
    }

    private UserProfile getPracticeProfile(PatientTaskTracker existing) {
        if (existing.getPatient() != null && existing.getPatient().getDoctorOrganization() != null) {
            return existing.getPatient().getDoctorOrganization().getUserProfile();
        }
        return null;
    }

    private UserProfile getPracticeProfile(Patient patient) {
        if (patient != null && patient.getDoctorOrganization() != null) {
            return patient.getDoctorOrganization().getUserProfile();
        }
        return null;
    }

    private void sendStatusUpdateNotification(
            PatientTaskTracker existing, UserProfile recipient, String oldWorkflowStatus, String newWorkflowStatus) {
        PatientDoctorOrganization pdo =
                pdoRepository.findByPatient(existing.getPatient().getId());

        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Status Updated")
                .message(String.format(
                        "%s's case has moved to %s.",
                        existing.getPatient().getFirstName(), existing.getCurrentStatusName()))
                .notificationIndex(147)
                .globalId(existing.getCurrentStatusName() + ","
                        + existing.getWorkflow().getName())
                .email(recipient.getUser().getEmail())
                .mobile(recipient.getUser().getMobileNo())
                .isDoctorApp(true)
                .doctorRole(existing.getWorkflow().getName())
                .patientId(existing.getPatient().getId())
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(
                        existing.getPatient().getId()))
                .xOrgName(xOrgNameResolver.resolveFromUserProfile(recipient).getXOrgName())
                .organizationId(
                        xOrgNameResolver.resolveFromUserProfile(recipient).getOrganizationId())
                .build());

        timelineService.addEvent(
                existing.getPatient().getId(),
                UserType.PATIENT,
                recipient.getDoctor().getId(),
                UserType.DOCTOR,
                EventType.STATUS_UPDATED,
                new StatusUpdatedEventMetadata(existing.getPatient().getId()),
                recipient,
                recipient.getOrganization());
    }

    private void treatmentReadyToBeginNotification(PatientTaskTracker existing, UserProfile recipient) {
        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Case Ready to Begin Treatment")
                .message(String.format(
                        "Aligners delivered for %s. Add details to start tracking the patient's treatment.",
                        existing.getPatient().getFirstName()))
                .notificationIndex(148)
                .email(recipient.getUser().getEmail())
                .mobile(recipient.getUser().getMobileNo())
                .isDoctorApp(true)
                .patientId(existing.getPatient().getId())
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(
                        existing.getPatient().getId()))
                .xOrgName(xOrgNameResolver.resolveFromUserProfile(recipient).getXOrgName())
                .organizationId(
                        xOrgNameResolver.resolveFromUserProfile(recipient).getOrganizationId())
                .build());

        assert existing.getAssignee() != null;
        timelineService.addEvent(
                existing.getPatient().getId(),
                UserType.PATIENT,
                recipient.getDoctor().getId(),
                UserType.DOCTOR,
                EventType.CASE_READY_TO_BEGIN_TREATMENT,
                new CaseReadyToBeginTreatmentEventMetadata(
                        existing.getPatient().getId(), existing.getPatient().fullName()),
                recipient,
                recipient.getOrganization());
    }

    private void manufacturingCompletedNotification(PatientTaskTracker existing, UserProfile recipient) {
        if (recipient.isPractice()) {
            return;
        }
        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Manufacturing Completed")
                .message(String.format(
                        "Manufacturing is complete for %s. Add shipping details or mark as delivered.",
                        existing.getPatient().getFirstName()))
                .notificationIndex(144)
                .email(recipient.getUser().getEmail())
                .mobile(recipient.getUser().getMobileNo())
                .isDoctorApp(true)
                .patientId(existing.getPatient().getId())
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(
                        existing.getPatient().getId()))
                .xOrgName(xOrgNameResolver.resolveFromUserProfile(recipient).getXOrgName())
                .organizationId(
                        xOrgNameResolver.resolveFromUserProfile(recipient).getOrganizationId())
                .build());

        assert existing.getAssignee() != null;
        timelineService.addEvent(
                existing.getPatient().getId(),
                UserType.PATIENT,
                recipient.getDoctor().getId(),
                UserType.DOCTOR,
                EventType.MANUFACTURING_COMPLETED,
                new ManufacturingCompletedEventMetadata(existing.getPatient().getId()),
                recipient,
                recipient.getOrganization());
    }

    public enum NotificationType {
        PLANNING,
        PRODUCTION,
        STATUS_UPDATE,
        TREATMENT_READY_TO_BEGIN,
        MANUFACTURING_COMPLETED,
        RECORDS_ADDED,
        PRESCRIPTION_ADDED,
        COMMENT_ADDED
    }
}
