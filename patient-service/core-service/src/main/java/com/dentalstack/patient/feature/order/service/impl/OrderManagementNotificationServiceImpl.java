package com.dentalstack.patient.feature.order.service.impl;

import com.dentalstack.patient.application.config.WhatsappTemplateTypeProperties;
import com.dentalstack.patient.feature.notification.dto.OrgWhatsAppDetails;
import com.dentalstack.patient.feature.notification.dto.SendNotificationRequest;
import com.dentalstack.patient.feature.notification.dto.WhatsAppRequestBuilder;
import com.dentalstack.patient.feature.notification.enums.MessageSendTo;
import com.dentalstack.patient.feature.notification.enums.OrgName;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.notification.util.WhatsAppUtilities;
import com.dentalstack.patient.feature.notification.util.XOrganizationNameResolver;
import com.dentalstack.patient.feature.order.dto.UpdateOrderRequest;
import com.dentalstack.patient.feature.order.enums.OrderStatus;
import com.dentalstack.patient.feature.order.service.OrderManagementNotificationService;
import com.dentalstack.patient.feature.patient.dto.TreatmentPlanRequest;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.subcription.service.SubscriptionService;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class OrderManagementNotificationServiceImpl implements OrderManagementNotificationService {

    private final ChatService chatService;
    private final WhatsAppRequestBuilder whatsAppRequestBuilder;
    private final WhatsAppUtilities whatsAppUtilities;
    private final UserProfileRepository userProfileRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;

    @Autowired
    @Lazy
    private SubscriptionService subscriptionService;

    private final WhatsappTemplateTypeProperties whatsappTemplateTypeProperties;
    private final XOrganizationNameResolver xOrganizationNameResolver;

    @Override
    public void notificationForNewOrder(
            Patient patient, String doctorName, String email, String orderId, Long profileId, String mobileNumber) {
        chatService.sendNotification(SendNotificationRequest.builder()
                .title("New case")
                .message(String.format("%s has sent you a new case for %s.", doctorName, patient.getFirstName()))
                .notificationIndex(111)
                .email(email)
                .isDoctorApp(true)
                .patientId(patient.getId())
                .globalId(orderId)
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .xOrgName(xOrganizationNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(
                        xOrganizationNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());

        if (whatsAppUtilities.isCustomer(profileId)) {
            List<String> mobileNumbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                    patient.getId(), List.of(MessageSendTo.SUPER_ADMIN));
            OrgName orgName = whatsAppUtilities.resolveOrgName(profileId);
            mobileNumbers.forEach((mobileNo) -> {
                String url = "profile/" + patient.getId();
                whatsAppRequestBuilder
                        .buildRequestIfMobileExists(
                                true,
                                orgName,
                                mobileNo,
                                whatsappTemplateTypeProperties.getNEW_CASE(),
                                List.of(patient.fullName(), doctorName, url))
                        .ifPresent(chatService::sendWhatsAppMessage);
            });
        }
    }

    @Override
    public void notificationForTreatmentPlanApproval(
            Patient patient,
            String email,
            String orderId,
            String doctorName,
            OrderStatus oldOrderStatus,
            OrderStatus newOrderStatus,
            OrgWhatsAppDetails orgWhatsAppDetails,
            String mobileNo,
            TreatmentPlanRequest request) {
        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Plan received")
                .message(String.format("A new treatment plan has been added for %s.", patient.getFirstName()))
                .notificationIndex(112)
                .email(email)
                .isDoctorApp(true)
                .patientId(patient.getId())
                .globalId(orderId)
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .xOrgName(xOrganizationNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(
                        xOrganizationNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());

        if (whatsAppUtilities.isSupperAdmin(request.getProfileId())
                || whatsAppUtilities.isAdmin(request.getProfileId())
                || whatsAppUtilities.isPlanningUser(request.getProfileId())) {
            List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                    patient.getId(), List.of(MessageSendTo.CUSTOMER));
            OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());

            numbers.forEach((no) -> {
                String url = "profile/" + patient.getId() + "/plans-list";
                whatsAppRequestBuilder
                        .buildRequestIfMobileExists(
                                true,
                                orgName,
                                no,
                                whatsappTemplateTypeProperties.getPLAN_RECEIVED(),
                                List.of(patient.getFirstName(), url))
                        .ifPresent(chatService::sendWhatsAppMessage);
            });
        }
    }

    @Override
    public void notificationForSTLFileApproved(
            TreatmentPlanRequest request,
            Patient patient,
            String email,
            String orderId,
            String doctorName,
            Long treatmentPlanId,
            OrderStatus oldOrderStatus,
            OrderStatus newOrderStatus,
            UserProfile userProfile) {
        chatService.sendNotification(SendNotificationRequest.builder()
                .title("STL files approved")
                .message(String.format("%s has approved the STL files for %s.", doctorName, patient.getFirstName()))
                .notificationIndex(129)
                .email(email)
                .isDoctorApp(true)
                .patientId(patient.getId())
                .globalId(treatmentPlanId.toString() + ":" + orderId)
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .xOrgName(xOrganizationNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(
                        xOrganizationNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());

        if (whatsAppUtilities.isCustomer(request.getProfileId())) {
            String approverName = userProfileRepository.findDisplayName(request.getProfileId());
            List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                    patient.getId(), List.of(MessageSendTo.SUPER_ADMIN, MessageSendTo.ADMIN));
            OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
            String url = "profile/" + patient.getId() + "/plans-list";
            numbers.forEach((no) -> {
                whatsAppRequestBuilder
                        .buildRequestIfMobileExists(
                                true,
                                orgName,
                                no,
                                whatsappTemplateTypeProperties.getPLAN_APPROVED(),
                                List.of(patient.fullName(), approverName, url))
                        .ifPresent(chatService::sendWhatsAppMessage);
            });
        }

        if (whatsAppUtilities.isSupperAdmin(request.getProfileId())
                || whatsAppUtilities.isPlanningUser(request.getProfileId())) {
            String approverName = userProfileRepository.findDisplayName(request.getProfileId());
            List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                    patient.getId(), List.of(MessageSendTo.ADMIN, MessageSendTo.CUSTOMER));
            OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
            String url = "profile/" + patient.getId() + "/plans-list";
            numbers.forEach((no) -> {
                whatsAppRequestBuilder
                        .buildRequestIfMobileExists(
                                true,
                                orgName,
                                no,
                                whatsappTemplateTypeProperties.getPLAN_APPROVED(),
                                List.of(patient.fullName(), approverName, url))
                        .ifPresent(chatService::sendWhatsAppMessage);
            });
        }
    }

    @Override
    public void notificationForTreatmentPlanFinalized(
            TreatmentPlanRequest request,
            Patient patient,
            String doctorName,
            String email,
            String orderId,
            OrderStatus oldOrderStatus,
            OrderStatus newOrderStatus,
            String mobileNo) {
        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Plan Finalized - Start Manufacturing")
                .message(String.format(
                        "Treatment plan has been finalized for  %s. Start manufacturing aligners.",
                        patient.getFirstName()))
                .notificationIndex(113)
                .email(email)
                .isDoctorApp(true)
                .patientId(patient.getId())
                .globalId(orderId)
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .xOrgName(xOrganizationNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(
                        xOrganizationNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());

        if (whatsAppUtilities.isCustomer(request.getProfileId())) {
            String finalizerName = userProfileRepository.findDisplayName(request.getProfileId());
            List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                    patient.getId(), List.of(MessageSendTo.SUPER_ADMIN, MessageSendTo.ADMIN));
            OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
            String url = "profile/" + patient.getId() + "/plans-list";
            numbers.forEach((no) -> {
                whatsAppRequestBuilder
                        .buildRequestIfMobileExists(
                                true,
                                orgName,
                                no,
                                whatsappTemplateTypeProperties.getPLAN_FINALIZED(),
                                List.of(patient.fullName(), finalizerName, url))
                        .ifPresent(chatService::sendWhatsAppMessage);
            });
        }

        if (whatsAppUtilities.isSupperAdmin(request.getProfileId())
                || whatsAppUtilities.isPlanningUser(request.getProfileId())) {
            String finalizerName = userProfileRepository.findDisplayName(request.getProfileId());
            List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                    patient.getId(), List.of(MessageSendTo.CUSTOMER));
            OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
            String url = "profile/" + patient.getId() + "/plans-list";
            numbers.forEach((no) -> {
                whatsAppRequestBuilder
                        .buildRequestIfMobileExists(
                                true,
                                orgName,
                                no,
                                whatsappTemplateTypeProperties.getPLAN_FINALIZED(),
                                List.of(patient.fullName(), finalizerName, url))
                        .ifPresent(chatService::sendWhatsAppMessage);
            });
        }
    }

    @Override
    public void notificationForRePlanRequest(
            TreatmentPlanRequest request,
            OrgWhatsAppDetails orgWhatsAppDetails,
            Patient patient,
            String doctorName,
            String email,
            String orderId,
            OrderStatus oldOrderStatus,
            OrderStatus newOrderStatus,
            String mobileNo) {
        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Revision requested")
                .message(String.format("%s has requested a revision for %s.", doctorName, patient.getFirstName()))
                .notificationIndex(114)
                .email(email)
                .isDoctorApp(true)
                .patientId(patient.getId())
                .globalId(orderId)
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .xOrgName(xOrganizationNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(
                        xOrganizationNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());

        if (whatsAppUtilities.isCustomer(request.getProfileId())) {
            List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                    patient.getId(), List.of(MessageSendTo.SUPER_ADMIN, MessageSendTo.ADMIN));
            OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
            String url = "profile/" + patient.getId() + "/plans-list";
            numbers.forEach((no) -> {
                whatsAppRequestBuilder
                        .buildRequestIfMobileExists(
                                true,
                                orgName,
                                no,
                                whatsappTemplateTypeProperties.getREVISION_REQUESTED(),
                                List.of(patient.fullName(), url))
                        .ifPresent(chatService::sendWhatsAppMessage);
            });
        }

        if (whatsAppUtilities.isSupperAdmin(request.getProfileId())
                || whatsAppUtilities.isPlanningUser(request.getProfileId())) {
            List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                    patient.getId(), List.of(MessageSendTo.CUSTOMER));
            OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
            String url = "profile/" + patient.getId() + "/plans-list";
            numbers.forEach((no) -> {
                whatsAppRequestBuilder
                        .buildRequestIfMobileExists(
                                true,
                                orgName,
                                no,
                                whatsappTemplateTypeProperties.getREVISION_REQUESTED(),
                                List.of(patient.fullName(), url))
                        .ifPresent(chatService::sendWhatsAppMessage);
            });
        }
    }

    @Override
    public void notificationForOrderOnHold(Patient patient, String email, String orderId) {
        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Order on Hold!")
                .message(String.format("Order for %s has been put on hold by the lab.", patient.getFirstName()))
                .notificationIndex(115)
                .email(email)
                .isDoctorApp(true)
                .patientId(patient.getId())
                .globalId(orderId)
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .xOrgName(xOrganizationNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(
                        xOrganizationNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());
    }

    @Override
    public void notificationForOrderCancelled(Patient patient, String email, String orderId) {
        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Order Cancelled!")
                .message(String.format("Order for %s has been cancelled by the lab.", patient.getFirstName()))
                .notificationIndex(116)
                .email(email)
                .isDoctorApp(true)
                .patientId(patient.getId())
                .globalId(orderId)
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .xOrgName(xOrganizationNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(
                        xOrganizationNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());
    }

    @Override
    public void notificationForNewOrderAssigned(
            String labAdminDisplayName,
            String email,
            String orderId,
            String patientName,
            Long patientId,
            String mobileNo,
            OrderStatus orderStatus,
            OrgWhatsAppDetails orgWhatsAppDetails) {
        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Case assigned")
                .message(String.format("%s has assigned a case to you — %s", labAdminDisplayName, patientName))
                .notificationIndex(118)
                .email(email)
                .isDoctorApp(true)
                .xOrgName(xOrganizationNameResolver
                        .resolveFromPatientId(patientId)
                        .getXOrgName())
                .organizationId(xOrganizationNameResolver
                        .resolveFromPatientId(patientId)
                        .getOrganizationId())
                .build());
    }

    @Override
    public void orgRequestedNeedMoreInfo(String email, String orderId, String patientName, Long patientId) {
        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Need more information")
                .message(String.format("Update order details for %s's case.", patientName))
                .notificationIndex(136)
                .email(email)
                .globalId(orderId)
                .isDoctorApp(true)
                .xOrgName(xOrganizationNameResolver
                        .resolveFromPatientId(patientId)
                        .getXOrgName())
                .organizationId(xOrganizationNameResolver
                        .resolveFromPatientId(patientId)
                        .getOrganizationId())
                .build());
    }

    @Override
    public void notificationForOrderCancelled(
            String orderReceiverName, String email, String orderId, String patientName, Long patientId) {
        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Order cancelled")
                .message(String.format("%s has cancelled the order for %s.", orderReceiverName, patientName))
                .notificationIndex(138)
                .email(email)
                .isDoctorApp(true)
                .globalId(orderId)
                .xOrgName(xOrganizationNameResolver
                        .resolveFromPatientId(patientId)
                        .getXOrgName())
                .organizationId(xOrganizationNameResolver
                        .resolveFromPatientId(patientId)
                        .getOrganizationId())
                .build());
    }

    @Override
    public void notificationForTreatmentPlanApproved(
            TreatmentPlanRequest request,
            String customerDisplayName,
            String email,
            String treatmentPlanName,
            String orderId,
            Long treatmentPlanId,
            Long patientId,
            String patientName,
            String patientMobileNo,
            OrderStatus oldOrderStatus,
            OrderStatus newOrderStatus,
            String mobileNo) {
        chatService.sendNotification(SendNotificationRequest.builder()
                .title("Plan approved")
                .message(String.format("%s has approved your treatment plan for %s.", customerDisplayName, patientName))
                .notificationIndex(120)
                .patientId(patientId)
                .email(email)
                .isDoctorApp(true)
                .globalId(treatmentPlanId.toString() + ":" + orderId)
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patientId))
                .xOrgName(xOrganizationNameResolver
                        .resolveFromPatientId(patientId)
                        .getXOrgName())
                .organizationId(xOrganizationNameResolver
                        .resolveFromPatientId(patientId)
                        .getOrganizationId())
                .build());

        String safePatientName = patientName != null ? patientName : "";
        String safePatientId = patientId != null ? patientId.toString() : "";

        if (whatsAppUtilities.isCustomer(request.getProfileId())) {
            String approverName = userProfileRepository.findDisplayName(request.getProfileId());
            List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                    patientId, List.of(MessageSendTo.SUPER_ADMIN, MessageSendTo.ADMIN));
            OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
            String url = "profile/" + safePatientId + "/plans-list";
            numbers.forEach((no) -> {
                whatsAppRequestBuilder
                        .buildRequestIfMobileExists(
                                true,
                                orgName,
                                no,
                                whatsappTemplateTypeProperties.getPLAN_APPROVED(),
                                List.of(safePatientName, approverName, url))
                        .ifPresent(chatService::sendWhatsAppMessage);
            });
        }

        if (whatsAppUtilities.isSupperAdmin(request.getProfileId())
                || whatsAppUtilities.isPlanningUser(request.getProfileId())) {
            String approverName = userProfileRepository.findDisplayName(request.getProfileId());
            List<String> numbers =
                    whatsAppUtilities.resolveMobileNumberOfSpecificUser(patientId, List.of(MessageSendTo.CUSTOMER));
            OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
            String url = "profile/" + safePatientId + "/plans-list";
            numbers.forEach((no) -> {
                whatsAppRequestBuilder
                        .buildRequestIfMobileExists(
                                true,
                                orgName,
                                no,
                                whatsappTemplateTypeProperties.getPLAN_APPROVED(),
                                List.of(safePatientName, approverName, url))
                        .ifPresent(chatService::sendWhatsAppMessage);
            });
        }
    }

    @Override
    public void notificationForSTLFilesRequested(
            TreatmentPlanRequest request,
            String customerDisplayName,
            String email,
            String orderId,
            Long treatmentPlanId,
            Patient patient,
            OrderStatus oldOrderStatus,
            OrderStatus newOrderStatus,
            String mobileNumber) {
        chatService.sendNotification(SendNotificationRequest.builder()
                .title("STL files requested")
                .message(String.format(
                        "%s has requested STL files for %s.", customerDisplayName, patient.getFirstName()))
                .notificationIndex(122)
                .email(email)
                .isDoctorApp(true)
                .globalId(treatmentPlanId.toString() + ":" + orderId)
                .patientId(patient.getId())
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .xOrgName(xOrganizationNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(
                        xOrganizationNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());

        if (whatsAppUtilities.isCustomer(request.getProfileId())) {
            List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                    patient.getId(), List.of(MessageSendTo.SUPER_ADMIN, MessageSendTo.ADMIN));
            OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
            String url = "profile/" + patient.getId() + "/plans-list";
            numbers.forEach((no) -> {
                whatsAppRequestBuilder
                        .buildRequestIfMobileExists(
                                true,
                                orgName,
                                no,
                                whatsappTemplateTypeProperties.getSTL_FILES_REQUESTED(),
                                List.of(patient.fullName(), url))
                        .ifPresent(chatService::sendWhatsAppMessage);
            });
        }

        if (whatsAppUtilities.isSupperAdmin(request.getProfileId())) {
            List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                    patient.getId(), List.of(MessageSendTo.CUSTOMER));
            OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
            String url = "profile/" + patient.getId() + "/plans-list";
            numbers.forEach((no) -> {
                whatsAppRequestBuilder
                        .buildRequestIfMobileExists(
                                true,
                                orgName,
                                no,
                                whatsappTemplateTypeProperties.getSTL_FILES_REQUESTED(),
                                List.of(patient.fullName(), url))
                        .ifPresent(chatService::sendWhatsAppMessage);
            });
        }
    }

    @Override
    public void notificationForSTLFilesRequested(
            UpdateOrderRequest request,
            String customerDisplayName,
            String email,
            String orderId,
            Long treatmentPlanId,
            Patient patient,
            OrderStatus oldOrderStatus,
            OrderStatus newOrderStatus,
            String mobileNumber) {
        chatService.sendNotification(SendNotificationRequest.builder()
                .title("STL files requested")
                .message(String.format(
                        "%s has requested STL files for %s.", customerDisplayName, patient.getFirstName()))
                .notificationIndex(122)
                .email(email)
                .isDoctorApp(true)
                .globalId(treatmentPlanId.toString() + ":" + orderId)
                .patientId(patient.getId())
                .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                .xOrgName(xOrganizationNameResolver.resolveFromPatient(patient).getXOrgName())
                .organizationId(
                        xOrganizationNameResolver.resolveFromPatient(patient).getOrganizationId())
                .build());

        if (whatsAppUtilities.isCustomer(request.getProfileId())) {
            List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                    patient.getId(), List.of(MessageSendTo.SUPER_ADMIN, MessageSendTo.ADMIN));
            OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
            String url = "profile/" + patient.getId() + "/plans-list";
            numbers.forEach((no) -> {
                whatsAppRequestBuilder
                        .buildRequestIfMobileExists(
                                true,
                                orgName,
                                no,
                                whatsappTemplateTypeProperties.getSTL_FILES_REQUESTED(),
                                List.of(patient.fullName(), url))
                        .ifPresent(chatService::sendWhatsAppMessage);
            });
        }

        if (whatsAppUtilities.isSupperAdmin(request.getProfileId())) {
            List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                    patient.getId(), List.of(MessageSendTo.CUSTOMER));
            OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
            String url = "profile/" + patient.getId() + "/plans-list";
            numbers.forEach((no) -> {
                whatsAppRequestBuilder
                        .buildRequestIfMobileExists(
                                true,
                                orgName,
                                no,
                                whatsappTemplateTypeProperties.getSTL_FILES_REQUESTED(),
                                List.of(patient.fullName(), url))
                        .ifPresent(chatService::sendWhatsAppMessage);
            });
        }
    }
}
