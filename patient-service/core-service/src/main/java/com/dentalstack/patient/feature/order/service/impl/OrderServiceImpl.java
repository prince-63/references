package com.dentalstack.patient.feature.order.service.impl;

import static com.dentalstack.patient.feature.storage.files.service.FilesService.*;
import static com.dentalstack.patient.feature.workflow.core.task_tracker.service.PatientTaskTrackerServiceImpl.*;

import com.dentalstack.patient.feature.aligner.dto.AlignerInfo;
import com.dentalstack.patient.feature.aligner.dto.aligner.STLFileMetadata;
import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.aligner.repository.AlignerJourneyRepository;
import com.dentalstack.patient.feature.caserecord.entity.CaseRecord;
import com.dentalstack.patient.feature.caserecord.exception.CaseRecordNotFoundException;
import com.dentalstack.patient.feature.caserecord.repository.CaseRecordRepository;
import com.dentalstack.patient.feature.chat.dto.request.CreateChatRequest;
import com.dentalstack.patient.feature.chat.entity.DoctorChat;
import com.dentalstack.patient.feature.chat.repository.DoctorChatRepository;
import com.dentalstack.patient.feature.chat.service.PatientChatService;
import com.dentalstack.patient.feature.doctor.entity.CustomerAccessAndRevoke;
import com.dentalstack.patient.feature.doctor.entity.PatientDoctorOrganization;
import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.doctor.enums.ProfileType;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.doctor.repository.CustomerAccessAndRevokeRepository;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationCountRequest;
import com.dentalstack.patient.feature.invitation.entity.Invitation;
import com.dentalstack.patient.feature.invitation.service.InvitationService;
import com.dentalstack.patient.feature.notification.dto.OrderManagementEmailRequest;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.notification.service.NotificationService;
import com.dentalstack.patient.feature.order.constant.OrderConstant;
import com.dentalstack.patient.feature.order.dto.*;
import com.dentalstack.patient.feature.order.dto.v2.CloneOrderRequestV2;
import com.dentalstack.patient.feature.order.dto.v2.CreateOrderRequestV2;
import com.dentalstack.patient.feature.order.dto.v2.MinimumOrderDetailResponse;
import com.dentalstack.patient.feature.order.entity.ManufacturingBatch;
import com.dentalstack.patient.feature.order.entity.Order;
import com.dentalstack.patient.feature.order.entity.OrderComments;
import com.dentalstack.patient.feature.order.enums.*;
import com.dentalstack.patient.feature.order.exception.OrderException;
import com.dentalstack.patient.feature.order.exception.ShippingDetailsNotFoundException;
import com.dentalstack.patient.feature.order.projection.OrderCountSummary;
import com.dentalstack.patient.feature.order.projection.OrderDetailsProjection;
import com.dentalstack.patient.feature.order.projection.TreatmentPlanDetailsProjection;
import com.dentalstack.patient.feature.order.repository.*;
import com.dentalstack.patient.feature.order.service.OrderManagementNotificationService;
import com.dentalstack.patient.feature.order.service.OrderResponseService;
import com.dentalstack.patient.feature.order.service.OrderService;
import com.dentalstack.patient.feature.order.service.ShippingDetailsService;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.exception.ForbiddenException;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.prescription.dto.prescription.PrescriptionDetails;
import com.dentalstack.patient.feature.prescription.entity.Prescription;
import com.dentalstack.patient.feature.prescription.service.PrescriptionService;
import com.dentalstack.patient.feature.rbac.enums.PermissionType;
import com.dentalstack.patient.feature.rbac.repository.SubRoleRepository;
import com.dentalstack.patient.feature.storage.drive.GDrivePlatformProvider;
import com.dentalstack.patient.feature.storage.drive.service.GoogleDriveService;
import com.dentalstack.patient.feature.storage.files.dto.CreateFolderRequest;
import com.dentalstack.patient.feature.storage.files.dto.FileDetails;
import com.dentalstack.patient.feature.storage.files.dto.OrderFileDetailsDTO;
import com.dentalstack.patient.feature.storage.files.dto.UserFilesDetails;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.storage.files.enums.HasShared;
import com.dentalstack.patient.feature.storage.files.enums.Status;
import com.dentalstack.patient.feature.storage.files.repository.FileRepository;
import com.dentalstack.patient.feature.storage.files.service.FilesService;
import com.dentalstack.patient.feature.subcription.exception.OrderLimitExceededException;
import com.dentalstack.patient.feature.subcription.repository.SubscriptionRepository;
import com.dentalstack.patient.feature.subcription.service.SubscriptionService;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.laborder.LabAdminAssignTheOrderMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.laborder.OrgRequestedNeedMoreInfoMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.laborder.ThirdPartyCustomerRequestForStlFilesMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.order.CommentAddedOnOrderEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.order.NewOrderAddedEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.order.OrderCancelledEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.order.OrderOnHoldEventMetadata;
import com.dentalstack.patient.feature.timeline.service.TimelineService;
import com.dentalstack.patient.feature.treatment.dto.BracesAlignerTreatmentResponse;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.dentalstack.patient.feature.treatment.exception.TreatmentNotFoundException;
import com.dentalstack.patient.feature.treatment.repository.TreatmentPlanRepository;
import com.dentalstack.patient.feature.treatment.service.TreatmentService;
import com.dentalstack.patient.feature.user.entity.Role;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.feature.user.exception.UserNotFoundException;
import com.dentalstack.patient.feature.user.projection.UserProfileSummary;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.workflow.core.task_tracker.dto.MoveSingleTaskRequest;
import com.dentalstack.patient.feature.workflow.core.task_tracker.entity.PatientTaskTracker;
import com.dentalstack.patient.feature.workflow.core.task_tracker.repository.PatientTaskTrackerRepository;
import com.dentalstack.patient.feature.workflow.core.task_tracker.service.PatientTaskTrackerService;
import com.dentalstack.patient.feature.workflow.core.workflows.service.notification.WorkflowManagementNotificationService;
import com.dentalstack.patient.feature.workflow.product.entity.ServiceProduct;
import com.dentalstack.patient.feature.workflow.product.exception.ServiceProductNotFoundException;
import com.dentalstack.patient.feature.workflow.product.repository.ServiceProductRepository;
import com.dentalstack.patient.feature.workflow.service_configuration.repository.ServiceConfigurationRepository;
import com.dentalstack.patient.feature.workflow.util.CaseActivityLogger;
import com.dentalstack.patient.global.config.TimezoneConfig;
import com.dentalstack.patient.global.dto.UserId;
import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;
import com.dentalstack.patient.global.exception.GenericException;
import com.dentalstack.patient.global.utils.InternalUserProfileUtil;
import com.dentalstack.patient.global.utils.OrderTreatmentCommonUtil;
import com.dentalstack.patient.global.utils.UserProfileUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.constraints.NotNull;
import java.time.*;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final PatientsOrderDetailsRepository patientsOrderDetailsRepository;
    private final PatientsOrderCountDetailsRepository patientsOrderCountDetailsRepository;

    private final InvitationService invitationService;
    private final PrescriptionService prescriptionService;
    private final FilesService filesService;
    private final OrderCommentsRepository orderCommentsRepository;
    private final UserProfileRepository userProfileRepository;
    private final PatientRepository patientRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final OrderManagementNotificationService orderManagementNotificationService;
    private final SubscriptionService subscriptionService;
    private final ChatService chatService;
    private final TreatmentService treatmentService;
    private final TimelineService timelineService;
    private final DoctorService doctorService;
    private final FileRepository fileRepository;
    private final TreatmentPlanRepository treatmentPlanRepository;
    private final NotificationService notificationService;
    private final OrderResponseService orderResponseService;
    private final ShippingDetailsRepository shippingDetailsRepository;
    private final ShippingDetailsService shippingDetailsService;
    private final AlignerJourneyRepository alignerJourneyRepository;
    private final ManufacturingRepository manufacturingRepository;
    private final PatientTaskTrackerService patientTaskTrackerService;
    private final SubRoleRepository subRoleRepository;
    private final CaseRecordRepository caseRecordRepository;
    private final PatientTaskTrackerRepository patientTaskTrackerRepository;
    private final GDrivePlatformProvider gDrivePlatformProvider;
    private final GoogleDriveService googleDriveService;
    private final ServiceProductRepository serviceProductRepository;
    private final CustomerAccessAndRevokeRepository customerAccessAndRevokeRepository;
    private final PatientChatService patientChatService;
    private final DoctorChatRepository doctorChatRepository;
    private final CaseActivityLogger caseActivityLogger;
    private final SubscriptionRepository subscriptionRepository;
    private final ServiceConfigurationRepository serviceConfigurationRepository;
    private final WorkflowManagementNotificationService workflowManagementNotificationService;

    @Transactional(rollbackFor = {BusinessException.class})
    public CreateOrderResponse createOrder(CreateOrderRequest orderRequest) {

        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(orderRequest.getProfileId());
        var ownerUserProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(orderRequest.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(orderRequest.getProfileId()));
        UserProfile requestProfile = ownerUserProfile;

        if (adminWithDefaultTag && ownerUserProfile.getInviterProfile() != null) {
            ownerUserProfile = ownerUserProfile.getInviterProfile();
            orderRequest.setProfileId(requestProfile.getId());
            orderRequest.setDoctorId(requestProfile.getDoctor().getId());
            orderRequest.setOrganizationId(requestProfile.getOrganization().getId());
        }
        UserProfile practiceUserProfile = null;
        if (orderRequest.getPracticeProfileId() != null) {
            practiceUserProfile = userProfileRepository
                    .findByIdWithOrgAndDoctorAndUser(orderRequest.getPracticeProfileId())
                    .orElseThrow(() -> new DoctorNotFoundException(orderRequest.getProfileId()));
            orgCreatingPracticeOrder(orderRequest);
        }
        Order order;
        Prescription prescription;
        Invitation invitation;
        if (orderRequest.getOrderId() == null) {
            order = new Order();
            if (orderRequest.getPatientId() == null) {
                invitation = invitationService.invitePatient(orderRequest.getPatientDetails());
                assert invitation.getPatientInvitation() != null;
                order.setPatient(invitation.getPatientInvitation().getPatient());
            } else {
                Patient patient = patientRepository
                        .findById(orderRequest.getPatientId())
                        .orElseThrow(() -> new UserNotFoundException(orderRequest.getPatientId()));
                order.setPatient(patient);
            }
        } else {
            order = orderRepository
                    .findByIdWithPatientAndDoctorOrganizationAndUser(orderRequest.getOrderId())
                    .orElseThrow(() -> new OrderException(orderRequest.getOrderId()));
        }

        UserProfile receiverUserProfile = null;
        if (orderRequest.getOrderDetails() != null
                && orderRequest.getOrderDetails().getTargetUserDetails() != null) {
            receiverUserProfile = userProfileRepository
                    .findByIdWithOrgAndDoctorAndUser(orderRequest
                            .getOrderDetails()
                            .getTargetUserDetails()
                            .getProfileId())
                    .orElseThrow(() -> new DoctorNotFoundException(orderRequest.getProfileId()));

            if (orderRequest.getOrderId() == null || order.getStatus().equals(OrderStatus.DRAFT)) {
                checkOrderSubscription(receiverUserProfile);
            }
        }

        order.setCurrentStep(orderRequest.getCurrentStep());
        order.setCreatedByProfile(requestProfile);
        if (orderRequest.getOrderDetails() != null) {
            order.setDoctorId(orderRequest.getDoctorId());
            order.setProfileId(orderRequest.getProfileId());
            order.setOrganizationId(orderRequest.getOrganizationId());
            order.setLabId(orderRequest.getOrderDetails().getLabId());
            order.setLabName(orderRequest.getOrderDetails().getLabName());
            order.setDueBy(orderRequest.getOrderDetails().getDueBy());
            order.setIsUrgent(orderRequest.getOrderDetails().getIsUrgent());
            order.setOrderType(orderRequest.getOrderDetails().getOrderType());
        }
        if (orderRequest.getCaseType() != null) {
            order.setTaskType(orderRequest.getCaseType());
        }
        if (orderRequest.getServiceProducts() != null) {
            order.setServiceProducts(orderRequest.getServiceProducts());
        }
        if (orderRequest.getServiceProductId() != null) {
            ServiceProduct serviceProduct = serviceProductRepository
                    .findById(orderRequest.getServiceProductId())
                    .orElseThrow(() -> new ServiceProductNotFoundException(orderRequest.getServiceProductId()));
            order.setServiceProduct(serviceProduct);
        }

        order.setOwnerProfile(practiceUserProfile != null ? practiceUserProfile : ownerUserProfile);
        if (orderRequest.getOrderDetails() != null
                && orderRequest.getOrderDetails().getTargetUserDetails() != null) {
            order.setTargetProfile(receiverUserProfile);
        }

        order.setStatus(orderRequest.getStatus());

        ShippingDetails shippingDetails = null;
        order = orderRepository.save(order);

        if (orderRequest.getShippingDetails() != null) {
            shippingDetails = updateShippingDetails(orderRequest.getShippingDetails());
            order.setShippingDetails(shippingDetails);
        }
        if (orderRequest.getDeliveryPreference() != null) {
            order.setDeliveryPreference(orderRequest.getDeliveryPreference());
        }

        order = orderRepository.save(order);

        if (orderRequest.getCaseRecordId() != null) {
            boolean isExists = caseRecordRepository.existsById(orderRequest.getCaseRecordId());
            if (isExists) {
                Order finalOrder1 = order;

                caseRecordRepository.findById(orderRequest.getCaseRecordId()).ifPresent(caseRecord -> {
                    caseRecord.setOrderId(finalOrder1.getId());
                    caseRecordRepository.save(caseRecord);
                });

                Long patientId = order.getPatient().getId();
                List<CaseRecord> otherCaseRecordsWithNullOrder =
                        caseRecordRepository.findByPatientIdAndOrderIdIsNull(patientId);

                for (CaseRecord caseRecord : otherCaseRecordsWithNullOrder) {
                    if (!caseRecord.getId().equals(orderRequest.getCaseRecordId())) {
                        caseRecord.setOrderId(finalOrder1.getId());
                        caseRecordRepository.save(caseRecord);
                    }
                }

                order.setCaseRecordId(orderRequest.getCaseRecordId());
            } else {
                throw new CaseRecordNotFoundException(orderRequest.getCaseRecordId());
            }
        } else {
            if (Boolean.TRUE.equals(orderRequest.getMapToCaseRecord())) {
                Long patientId = order.getPatient().getId();
                List<CaseRecord> caseRecordsWithNullOrder =
                        caseRecordRepository.findByPatientIdAndOrderIdIsNull(patientId);
                if (!caseRecordsWithNullOrder.isEmpty()) {
                    for (CaseRecord caseRecord : caseRecordsWithNullOrder) {
                        caseRecord.setOrderId(order.getId());
                        caseRecordRepository.save(caseRecord);
                    }
                    order.setCaseRecordId(caseRecordsWithNullOrder.get(0).getId());
                }
            }
        }

        if (Objects.equals(orderRequest.getStatus(), OrderStatus.ORDERED)) {
            OrderComments orderComments = new OrderComments();
            orderComments.setOrderId(order.getId());
            orderComments.setDoctorId(order.getDoctorId());
            orderComments.setProfileId(order.getProfileId());
            orderComments.setNotes(String.format(
                    OrderConstant.TIMELINE_PLAN_CREATED,
                    OrderTreatmentCommonUtil.capitalize(orderRequest.getStatus().toString())));
            order.setIsNewOrder(true);
            orderCommentsRepository.save(orderComments);
        }

        createOrderAndChildFolder(orderRequest.getDoctorId(), order);

        if (orderRequest.getPrescriptionDetails() != null && Boolean.TRUE.equals(orderRequest.getMapToPrescription())) {
            if (orderRequest.getPrescriptionDetails().getId() != null) {
                prescription = prescriptionService.updatePrescription(
                        order.getPatient(), orderRequest.getPrescriptionDetails(), order.getId());
            } else {
                prescription = prescriptionService.addPrescription(
                        order.getPatient(), orderRequest.getPrescriptionDetails(), order.getId());
            }
            order.setPrescription(prescription);
            orderRepository.save(order);
        }

        CreateOrderResponse orderResponse = new CreateOrderResponse();

        orderResponse.setOrderId(order.getId());
        orderResponse.setShippingId(shippingDetails != null ? shippingDetails.getId() : null);
        Order finalOrder = order;

        String orgName;
        if (ownerUserProfile.isPractice()) {
            orgName = ownerUserProfile.getPracticeName();
        } else {
            orgName = ownerUserProfile.getOrgName();
        }
        if (finalOrder.getTargetProfile() != null && orderRequest.getStatus().equals(OrderStatus.ORDERED)) {
            var targetProfile = finalOrder.getTargetProfile();
            if (order.getParentOrder() != null) {
                patientTaskTrackerService.createCloneOrderTasks(
                        order.getOwnerProfile(), order.getTargetProfile(), order, order.getParentOrder());
            }
            String formatted = order.getOrderType().name().replace("_", " ").toLowerCase();
            formatted = formatted.substring(0, 1).toUpperCase() + formatted.substring(1);
            chatService.orderSend(OrderManagementEmailRequest.builder()
                    .orderSenderEmail(ownerUserProfile.getUser().getEmail())
                    .orderSenderName(orgName)
                    .orderReceiverName(targetProfile.getOrgName())
                    .dueBy(finalOrder.getDueBy())
                    .orderType(formatted)
                    .orderId(finalOrder.getId())
                    .patientName(finalOrder.getPatient().getFirstName())
                    .orderReceiverEmail(targetProfile.getUser().getEmail())
                    .orgName(targetProfile.getOrganizationBrandName())
                    .build());

            orderManagementNotificationService.notificationForNewOrder(
                    finalOrder.getPatient(),
                    orgName,
                    targetProfile.getUser().getEmail(),
                    finalOrder.getId(),
                    orderRequest.getProfileId(),
                    targetProfile.getUser().getMobileNo());

            timelineService.addEvent(
                    finalOrder.getPatient().getId(),
                    UserType.PATIENT,
                    targetProfile.getDoctor().getId(),
                    UserType.DOCTOR,
                    EventType.NEW_ORDER_ADDED,
                    new NewOrderAddedEventMetadata(
                            finalOrder.getPatient().getId(),
                            finalOrder.getPatient().getFirstName(),
                            orgName,
                            finalOrder.getId()),
                    targetProfile,
                    targetProfile.getOrganization());
        }

        if (serviceConfigurationRepository.isPlanningUser(orderRequest.getProfileId())) {
            if (orderRequest.getCaseRecordId() != null) {
                workflowManagementNotificationService.recordAddedNotification(
                        ownerUserProfile, order.getPatient(), order.getId());
            }
            if ((orderRequest.getPrescriptionDetails() != null
                            && orderRequest.getPrescriptionDetails().getId() != null)
                    || orderRequest.getPrescriptionId() != null) {
                workflowManagementNotificationService.prescriptionAdded(
                        ownerUserProfile, order.getPatient(), order.getId());
            }
        }

        List<PatientTaskTracker> patientTaskTrackerList =
                patientTaskTrackerRepository.findPatientTasksByPatientId(orderRequest.getPatientId());
        if (patientTaskTrackerList != null && !patientTaskTrackerList.isEmpty()) {
            for (PatientTaskTracker patientTaskTracker : patientTaskTrackerList) {
                if (patientTaskTracker.getAssignee() != null
                        && patientTaskTracker.getAssignee().isInternalUser()
                        && patientTaskTracker.getAssignee().getUser().getEmail() != null
                        && patientTaskTracker.getAssignee().getInviterProfile() != null) {
                    UserProfile invitorProfile =
                            patientTaskTracker.getAssignee().getInviterProfile();
                    boolean isEnabled = gDrivePlatformProvider.isGDrivePlatformEnabled(
                            invitorProfile.getDoctor().getId(), invitorProfile.getId());

                    if (isEnabled) {
                        List<File> files = gDrivePlatformProvider.findFilesForPatientOrdersOrDocumentsAndImages(
                                patientTaskTracker.getPatient());
                        if (files != null && !files.isEmpty()) {
                            for (File file : files) {
                                try {
                                    googleDriveService.shareFile(
                                            invitorProfile.getId(),
                                            file.getFullPath(),
                                            List.of(patientTaskTracker
                                                    .getAssignee()
                                                    .getUser()
                                                    .getEmail()),
                                            "reader",
                                            file.getDriveFileId());
                                    Set<HasShared> newSet = new HashSet<>(file.getSharedWith());
                                    newSet.add(HasShared.INTERNAL_USER);
                                    file.setSharedWith(newSet);
                                    fileRepository.save(file);
                                } catch (Exception ignored) {

                                }
                            }
                        }
                    }
                }
            }
        }
        if (orderRequest.getStatus().equals(OrderStatus.ORDERED)) {
            var orderCount = orderRepository.countSentOrdersByPatientId(
                    order.getPatient().getId(), order.getOwnerProfile().getId());
            if (orderCount > 1) {
                caseActivityLogger.logRefinementSubmitted(order.getPatient(), order.getOwnerProfile(), orderCount);
            }
            createChatForOrderIfNeeded(
                    orderRequest.getPatientId(), orderRequest.getProfileId(), receiverUserProfile, requestProfile);
        }
        if (orderRequest.getStatus() != null && orderRequest.getStatus().equals(OrderStatus.COMPLETED)) {
            caseActivityLogger.logPrimaryClosure(order.getPatient(), order.getTargetProfile());
        }

        return orderResponse;
    }

    private void checkOrderSubscription(UserProfile receiverUserProfile) {
        var totalOrderCounts = subscriptionRepository.findTotalOrdersByDoctorIdAndUserProfileId(
                receiverUserProfile.getDoctor().getId(), receiverUserProfile.getId());

        var usedOrderCount = orderRepository.countPatientsByProfileId(receiverUserProfile.getId());

        if (usedOrderCount > totalOrderCounts) {
            throw new OrderLimitExceededException();
        }
    }

    @Transactional(rollbackFor = {BusinessException.class})
    @Override
    public CreateOrderResponse createOrderV2(CreateOrderRequestV2 request) {

        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());
        var requestUserProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        if (adminWithDefaultTag && requestUserProfile.getInviterProfile() != null) {
            return adminCreatingOrder(request);
        }

        UserProfile senderUserProfile = getSenderProfile(request.getSenderProfileId());
        UserProfile receiverUserProfile = getReceiverProfile(request.getReceiverProfileId());

        if (request.getOrderId() == null || request.getStatus().equals(OrderStatus.DRAFT)) {
            checkOrderSubscription(receiverUserProfile);
        }
        Order order = createOrRetrieveOrder(request, requestUserProfile, senderUserProfile, receiverUserProfile);

        if (request.getCaseSubmitted() != null) {
            order.setCaseSubmitted(request.getCaseSubmitted());
        }

        ShippingDetails shippingDetails = updateShipping(request, order);
        addCaseRecordToOrder(request, order);
        saveOrderComments(request, order);
        createOrderAndChildFolder(request.getDoctorId(), order);
        addPrescription(request, order);
        orderNotifications(request, order, requestUserProfile);
        updateGDriveSharingForInternalUsers(request);

        if (request.getStatus().equals(OrderStatus.ORDERED)) {
            createChatForOrderIfNeeded(
                    request.getPatientId(), request.getProfileId(), receiverUserProfile, requestUserProfile);
            caseActivityLogger.logCaseSubmitted(order.getPatient(), requestUserProfile);
        }
        if (request.getStatus().equals(OrderStatus.ORDERED)) {
            var orderCount = orderRepository.countSentOrdersByPatientId(
                    order.getPatient().getId(), order.getOwnerProfile().getId());
            if (orderCount > 1) {
                caseActivityLogger.logRefinementSubmitted(order.getPatient(), order.getOwnerProfile(), orderCount);
            }
        }
        if (request.getStatus() != null && request.getStatus().equals(OrderStatus.COMPLETED)) {
            caseActivityLogger.logPrimaryClosure(order.getPatient(), order.getTargetProfile());
        }

        var orderCount = orderRepository.countSentOrdersByPatientId(
                order.getPatient().getId(), order.getOwnerProfile().getId());
        if (orderCount > 1) {
            List<String> nonArchivedPreviousOrderIds =
                    orderRepository.findNonArchivedOrderIdsByPatientIdExcludingCurrent(
                            order.getPatient().getId(),
                            order.getOwnerProfile().getId(),
                            OrderStatus.ARCHIVED,
                            order.getId());

            nonArchivedPreviousOrderIds.forEach(previousOrderId -> {
                orderRepository.findById(previousOrderId).ifPresent(previousOrder -> {
                    previousOrder.setStatus(OrderStatus.ARCHIVED);
                    orderRepository.save(previousOrder);
                });

                treatmentPlanRepository
                        .findTreatmentPlansByOrderIdAndPatientId(
                                previousOrderId, order.getPatient().getId())
                        .forEach(tp -> {
                            tp.setStatus(AlignerTreatmentStatus.ARCHIVED);
                            treatmentPlanRepository.save(tp);
                        });
            });
            if (requestUserProfile.isPractice()) {
                var targetProfileId = order.getTargetProfile().getId();
                var ownerProfileId = order.getOwnerProfile().getId();
                patientTaskTrackerService.moveSingleTask(
                        MoveSingleTaskRequest.builder()
                                .workflowStausName(TO_DO)
                                .workflowName(PLANNING_IN_HOUSE_WORKFLOW)
                                .patientId(order.getPatient().getId())
                                .profileId(targetProfileId)
                                .build(),
                        order);
                patientTaskTrackerService.moveSingleTask(
                        MoveSingleTaskRequest.builder()
                                .workflowStausName(TO_DO)
                                .workflowName(PLAN_OUTSOURCED_WORKFLOW)
                                .patientId(order.getPatient().getId())
                                .profileId(ownerProfileId)
                                .build(),
                        order);
            }
        }

        if (serviceConfigurationRepository.isPlanningUser(request.getProfileId())) {
            if (request.getCaseRecordId() != null) {
                workflowManagementNotificationService.recordAddedNotification(
                        requestUserProfile, order.getPatient(), order.getId());
            }
            if ((request.getPrescriptionDetails() != null
                            && request.getPrescriptionDetails().getId() != null)
                    || request.getPrescriptionId() != null) {
                workflowManagementNotificationService.prescriptionAdded(
                        requestUserProfile, order.getPatient(), order.getId());
            }
        }

        return CreateOrderResponse.from(order.getId(), shippingDetails != null ? shippingDetails.getId() : null);
    }

    private void createChatForOrderIfNeeded(
            Long patientId, Long profileId, UserProfile receiverUserProfile, UserProfile requestUserProfile) {
        if (patientId == null || profileId == null) {
            log.debug("Cannot create chat: patientId or profileId is null");
            return;
        }

        Optional<DoctorChat> existingChat = doctorChatRepository.findActiveByPatientId(patientId);

        if (existingChat.isPresent()) {
            return;
        }

        createChatForPatient(patientId, profileId, receiverUserProfile, requestUserProfile);
    }

    private void createChatForPatient(
            Long patientId, Long profileId, UserProfile receiverUserProfile, UserProfile requestUserProfile) {
        try {
            Set<Long> participantIds = new HashSet<>();

            if (receiverUserProfile != null) {
                participantIds.add(receiverUserProfile.getId());
            }

            if (requestUserProfile.isEnterprise() || requestUserProfile.isInHouseManufacturingLab()) {
                List<Long> adminUserProfileIds =
                        userProfileRepository.findAdminUserProfileIdsByInviter(requestUserProfile.getId());
                participantIds.addAll(adminUserProfileIds);
            }

            if (receiverUserProfile != null && receiverUserProfile.isEnterprise()) {
                List<Long> adminUserProfileIds =
                        userProfileRepository.findAdminUserProfileIdsByInviter(receiverUserProfile.getId());
                participantIds.addAll(adminUserProfileIds);
            }

            if (requestUserProfile.isInternalUser() && requestUserProfile.getInviterProfile() != null) {
                List<Long> adminUserProfileIds = userProfileRepository.findAdminUserProfileIdsByInviter(
                        requestUserProfile.getInviterProfile().getId());
                participantIds.addAll(adminUserProfileIds);
                participantIds.add(requestUserProfile.getId());
            }

            PatientDoctorOrganization pdo = patientDoctorOrganizationRepository.findByPatient(patientId);

            if (!pdo.getUserProfile().isOwner()) {
                participantIds.add(pdo.getUserProfile().getId());
            }

            Patient patient = pdo.getPatient();
            String chatName = patient.fullName();

            CreateChatRequest chatRequest = CreateChatRequest.builder()
                    .patientId(patientId)
                    .profileId(profileId)
                    .chatName(chatName)
                    .description(null)
                    .caseTeamIds(null)
                    .participantUserProfileIds(new ArrayList<>(participantIds))
                    .build();

            patientChatService.createChat(chatRequest);
            log.info("Chat created successfully for patient: {}", patientId);

        } catch (GenericException e) {
            if (e.getMessage() != null && e.getMessage().contains("Chat already exists")) {
                log.info("Chat already exists for patient: {} (detected during creation)", patientId);
            } else {
                log.error("Business error creating chat for patient: {} - {}", patientId, e.getMessage());
            }
        } catch (Exception e) {
            log.error("Unexpected error creating chat for patient: {}", patientId, e);
        }
    }

    private CreateOrderResponse adminCreatingOrder(CreateOrderRequestV2 request) {
        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());
        var ownerUserProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

        UserProfile requestProfile = ownerUserProfile;
        if (adminWithDefaultTag && ownerUserProfile.getInviterProfile() != null) {
            ownerUserProfile = ownerUserProfile.getInviterProfile();
            updateToOwnerProfile(ownerUserProfile, request);
        }

        UserProfile senderUserProfile = getSenderProfile(request.getSenderProfileId());
        UserProfile receiverUserProfile = getReceiverProfile(request.getReceiverProfileId());
        Order order = createOrRetrieveOrder(request, requestProfile, senderUserProfile, receiverUserProfile);

        ShippingDetails shippingDetails = updateShipping(request, order);
        addCaseRecordToOrder(request, order);
        saveOrderComments(request, order);
        createOrderAndChildFolder(request.getDoctorId(), order);
        addPrescription(request, order);
        orderNotifications(request, order, senderUserProfile);
        updateGDriveSharingForInternalUsers(request);

        if (request.getStatus().equals(OrderStatus.ORDERED)) {
            createChatForOrderIfNeeded(
                    request.getPatientId(), request.getProfileId(), receiverUserProfile, ownerUserProfile);
            caseActivityLogger.logCaseSubmitted(order.getPatient(), ownerUserProfile);
        }

        return CreateOrderResponse.from(order.getId(), shippingDetails != null ? shippingDetails.getId() : null);
    }

    private ShippingDetails updateShipping(CreateOrderRequestV2 request, Order order) {
        ShippingDetails shippingDetails = null;
        if (request.getShippingDetails() != null) {
            shippingDetails = updateShippingDetails(request.getShippingDetails());
            order.setShippingDetails(shippingDetails);
        }
        return shippingDetails;
    }

    private UserProfile getSenderProfile(Long profileId) {
        return userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(profileId)
                .orElseThrow(() -> new DoctorNotFoundException(profileId));
    }

    private UserProfile getReceiverProfile(Long profileId) {
        return userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(profileId)
                .orElseThrow(() -> new DoctorNotFoundException(profileId));
    }

    private Order createOrRetrieveOrder(
            CreateOrderRequestV2 request,
            UserProfile requestProfile,
            UserProfile ownerUserProfile,
            UserProfile receiverUserProfile) {
        ServiceProduct serviceProduct = null;
        if (request.getServiceProductId() != null) {
            serviceProduct = serviceProductRepository
                    .findById(request.getServiceProductId())
                    .orElseThrow(() -> new ServiceProductNotFoundException(request.getServiceProductId()));
        }
        if (request.getOrderId() == null) {
            Patient patient = getOrCreatePatient(request);

            return Order.createNewOrder(
                    request, patient, requestProfile, ownerUserProfile, receiverUserProfile, serviceProduct);
        } else {
            Order order = orderRepository
                    .findByIdWithPatientAndDoctorOrganizationAndUser(request.getOrderId())
                    .orElseThrow(() -> new OrderException(request.getOrderId()));

            Order.updateExistingOrder(
                    order, request, requestProfile, ownerUserProfile, receiverUserProfile, serviceProduct);
            return order;
        }
    }

    private Patient getOrCreatePatient(CreateOrderRequestV2 request) {
        if (request.getPatientId() == null) {
            Invitation invitation = invitationService.invitePatientV2(request.getPatientDetails());
            assert invitation.getPatientInvitation() != null;
            return invitation.getPatientInvitation().getPatient();
        } else {
            return patientRepository
                    .findById(request.getPatientId())
                    .orElseThrow(() -> new UserNotFoundException(request.getPatientId()));
        }
    }

    private void addCaseRecordToOrder(CreateOrderRequestV2 request, Order order) {
        if (request.getCaseRecordId() != null && Boolean.TRUE.equals(request.getMapToCaseRecord())) {
            CaseRecord caseRecord = caseRecordRepository
                    .findById(request.getCaseRecordId())
                    .orElseThrow(() -> new RuntimeException("CaseRecord not found: " + request.getCaseRecordId()));

            order.setCaseRecordId(caseRecord.getId());
            Order savedOrder = orderRepository.save(order);
            caseRecord.setOrderId(savedOrder.getId());
            caseRecordRepository.save(caseRecord);
        } else {
            orderRepository.save(order);
        }
    }

    private void saveOrderComments(CreateOrderRequestV2 request, Order order) {
        if (Objects.equals(request.getStatus(), OrderStatus.ORDERED)) {
            OrderComments orderComments = new OrderComments();
            orderComments.setOrderId(order.getId());
            orderComments.setDoctorId(order.getDoctorId());
            orderComments.setProfileId(order.getProfileId());
            orderComments.setNotes(String.format(
                    OrderConstant.TIMELINE_PLAN_CREATED,
                    OrderTreatmentCommonUtil.capitalize(request.getStatus().toString())));
            order.setIsNewOrder(true);
            orderCommentsRepository.save(orderComments);
        }
    }

    private void addPrescription(CreateOrderRequestV2 request, Order order) {
        Prescription prescription;
        if (request.getPrescriptionDetails() != null && Boolean.TRUE.equals(request.getMapToPrescription())) {
            if (request.getPrescriptionDetails().getId() != null) {
                prescription = prescriptionService.updatePrescription(
                        order.getPatient(), request.getPrescriptionDetails(), order.getId());
            } else {
                prescription = prescriptionService.addPrescription(
                        order.getPatient(), request.getPrescriptionDetails(), order.getId());
            }
            order.setPrescription(prescription);
        }

        if (request.getServiceProductId() != null) {
            ServiceProduct serviceProduct = serviceProductRepository
                    .findById(request.getServiceProductId())
                    .orElseThrow(() -> new ServiceProductNotFoundException(request.getServiceProductId()));
            order.setServiceProduct(serviceProduct);
        }
        orderRepository.save(order);
    }

    private void orderNotifications(CreateOrderRequestV2 request, Order finalOrder, UserProfile ownerUserProfile) {
        String orgName;
        if (ownerUserProfile.isPractice()) {
            orgName = ownerUserProfile.getPracticeName();
        } else {
            orgName = ownerUserProfile.getOrgName();
        }

        if (finalOrder.getTargetProfile() != null && request.getStatus().equals(OrderStatus.ORDERED)) {
            var targetProfile = finalOrder.getTargetProfile();
            if (finalOrder.getParentOrder() != null) {
                patientTaskTrackerService.createCloneOrderTasks(
                        finalOrder.getOwnerProfile(),
                        finalOrder.getTargetProfile(),
                        finalOrder,
                        finalOrder.getParentOrder());
            }
            String formatted =
                    finalOrder.getOrderType().name().replace("_", " ").toLowerCase();
            formatted = formatted.substring(0, 1).toUpperCase() + formatted.substring(1);
            chatService.orderSend(OrderManagementEmailRequest.builder()
                    .orderSenderEmail(ownerUserProfile.getUser().getEmail())
                    .orderSenderName(orgName)
                    .orderReceiverName(targetProfile.getOrgName())
                    .dueBy(finalOrder.getDueBy())
                    .orderType(formatted)
                    .orderId(finalOrder.getId())
                    .patientName(finalOrder.getPatient().getFirstName())
                    .orderReceiverEmail(targetProfile.getUser().getEmail())
                    .orgName(targetProfile.getOrganizationBrandName())
                    .build());

            orderManagementNotificationService.notificationForNewOrder(
                    finalOrder.getPatient(),
                    orgName,
                    targetProfile.getUser().getEmail(),
                    finalOrder.getId(),
                    request.getProfileId(),
                    targetProfile.getUser().getMobileNo());

            timelineService.addEvent(
                    finalOrder.getPatient().getId(),
                    UserType.PATIENT,
                    targetProfile.getDoctor().getId(),
                    UserType.DOCTOR,
                    EventType.NEW_ORDER_ADDED,
                    new NewOrderAddedEventMetadata(
                            finalOrder.getPatient().getId(),
                            finalOrder.getPatient().getFirstName(),
                            orgName,
                            finalOrder.getId()),
                    targetProfile,
                    targetProfile.getOrganization());
        }
    }

    private void updateGDriveSharingForInternalUsers(CreateOrderRequestV2 request) {
        List<PatientTaskTracker> patientTaskTrackerList =
                patientTaskTrackerRepository.findPatientTasksByPatientId(request.getPatientId());

        if (patientTaskTrackerList != null && !patientTaskTrackerList.isEmpty()) {
            for (PatientTaskTracker patientTaskTracker : patientTaskTrackerList) {
                if (patientTaskTracker.getAssignee() != null
                        && patientTaskTracker.getAssignee().isInternalUser()
                        && patientTaskTracker.getAssignee().getUser().getEmail() != null
                        && patientTaskTracker.getAssignee().getInviterProfile() != null) {
                    UserProfile invitorProfile =
                            patientTaskTracker.getAssignee().getInviterProfile();
                    boolean isEnabled = gDrivePlatformProvider.isGDrivePlatformEnabled(
                            invitorProfile.getDoctor().getId(), invitorProfile.getId());

                    if (isEnabled) {
                        List<File> files = gDrivePlatformProvider.findFilesForPatientOrdersOrDocumentsAndImages(
                                patientTaskTracker.getPatient());
                        if (files != null && !files.isEmpty()) {
                            for (File file : files) {
                                try {
                                    googleDriveService.shareFile(
                                            invitorProfile.getId(),
                                            file.getFullPath(),
                                            List.of(patientTaskTracker
                                                    .getAssignee()
                                                    .getUser()
                                                    .getEmail()),
                                            "reader",
                                            file.getDriveFileId());
                                    Set<HasShared> newSet = new HashSet<>(file.getSharedWith());
                                    newSet.add(HasShared.INTERNAL_USER);
                                    file.setSharedWith(newSet);
                                    fileRepository.save(file);
                                } catch (Exception ignored) {

                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private void orgCreatingPracticeOrder(CreateOrderRequest request) {
        if (request.getPracticeDoctorId() != null
                && request.getPracticeOrganizationId() != null
                && request.getPracticeProfileId() != null) {
            request.setProfileId(request.getPracticeProfileId());
            request.setOrganizationId(request.getPracticeOrganizationId());
            request.setDoctorId(request.getPracticeDoctorId());
        } else {
            throw new GenericException("Practice user ids not coming properly");
        }
    }

    private ShippingDetails updateShippingDetails(@NotNull ShippingDetailsRequest request) {
        if (request.getShippingId() != null) {
            UpdateShippingDetailsRequest updateRequest = UpdateShippingDetailsRequest.builder()
                    .shippingId(request.getShippingId())
                    .profileId(request.getProfileId())
                    .addressedTo(request.getAddressedTo())
                    .name(request.getName())
                    .addressLine(request.getAddressLine())
                    .city(request.getCity())
                    .state(request.getState())
                    .country(request.getCountry())
                    .pincode(request.getPincode())
                    .mobileNumber(request.getMobileNumber())
                    .build();
            ShippingDetailsResponse response = shippingDetailsService.updateShippingDetails(updateRequest);
            return shippingDetailsRepository
                    .findById(response.getShippingId())
                    .orElseThrow(() -> new ShippingDetailsNotFoundException(response.getShippingId()));
        } else {
            CreateShippingDetailsRequest createRequest = CreateShippingDetailsRequest.builder()
                    .profileId(request.getProfileId())
                    .addressedTo(request.getAddressedTo())
                    .name(request.getName())
                    .addressLine(request.getAddressLine())
                    .city(request.getCity())
                    .state(request.getState())
                    .country(request.getCountry())
                    .pincode(request.getPincode())
                    .mobileNumber(request.getMobileNumber())
                    .isDefault(request.isDefault())
                    .customerProfileId(request.getCustomerProfileId())
                    .build();
            ShippingDetailsResponse response = shippingDetailsService.createShippingDetails(createRequest);
            return shippingDetailsRepository
                    .findById(response.getShippingId())
                    .orElseThrow(() -> new ShippingDetailsNotFoundException(response.getShippingId()));
        }
    }

    @Transactional(rollbackFor = {BusinessException.class})
    public void updateOrder(UpdateOrderRequest orderRequest) {

        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(orderRequest.getProfileId());
        var ownerUserProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(orderRequest.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(orderRequest.getProfileId()));
        if (adminWithDefaultTag && ownerUserProfile.getInviterProfile() != null) {
            ownerUserProfile = ownerUserProfile.getInviterProfile();
            orderRequest.setProfileId(ownerUserProfile.getId());
            orderRequest.setDoctorId(ownerUserProfile.getDoctor().getId());
            orderRequest.setOrganizationId(ownerUserProfile.getOrganization().getId());
        }
        Order order = orderRepository
                .findById(orderRequest.getOrderId())
                .orElseThrow(() -> new OrderException(orderRequest.getOrderId()));
        if (orderRequest.getDueBy() != null) {
            order.setDueBy(orderRequest.getDueBy());
            return;
        }

        if (orderRequest.getIsNewOrder() != null) {
            order.setIsNewOrder(orderRequest.getIsNewOrder());
            return;
        }
        OrderStatus oldStatus = order.getStatus();
        OrderStatus newStatus = orderRequest.getStatus();

        UserProfile orgProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(orderRequest.getProfileId())
                .orElseThrow(DoctorNotFoundException::new);

        if (newStatus != null && !Objects.equals(oldStatus, newStatus)) {
            order.setStatus(orderRequest.getStatus());
            var patient = order.getPatient();

            OrderComments orderComments = new OrderComments();
            orderComments.setOrderId(order.getId());
            orderComments.setDoctorId(order.getDoctorId());
            orderComments.setProfileId(order.getProfileId());
            if (Objects.equals(oldStatus, OrderStatus.DRAFT)) {
                orderComments.setNotes(String.format(
                        OrderConstant.TIMELINE_PLAN_CREATED,
                        OrderTreatmentCommonUtil.capitalize(newStatus.toString())));
            } else {
                orderComments.setNotes(String.format(
                        OrderConstant.TIMELINE_PLAN_MODIFIED,
                        OrderTreatmentCommonUtil.capitalize(oldStatus.toString()),
                        OrderTreatmentCommonUtil.capitalize(newStatus.toString())));
            }
            orderCommentsRepository.save(orderComments);

            orderRepository.save(order);
            if (orderRequest.getStatus().equals(OrderStatus.ON_HOLD)) {

                if (orgProfile.getInviterProfile() != null) {

                    timelineService.addEvent(
                            patient.getId(),
                            UserType.PATIENT,
                            orgProfile.getInviterProfile().getDoctor().getId(),
                            UserType.DOCTOR,
                            EventType.ORDER_ON_HOLD,
                            new OrderOnHoldEventMetadata(
                                    patient.getId(),
                                    patient.getFirstName(),
                                    orgProfile.getUser().getFirstName(),
                                    order.getId()),
                            orgProfile.getInviterProfile(),
                            orgProfile.getOrganization());

                    orderManagementNotificationService.notificationForOrderOnHold(
                            patient, orgProfile.getInviterProfile().getUser().getEmail(), order.getId());
                }
            }
            if (orderRequest.getStatus().equals(OrderStatus.CANCELLED)) {
                if (orgProfile.getInviterProfile() != null) {

                    timelineService.addEvent(
                            patient.getId(),
                            UserType.PATIENT,
                            orgProfile.getInviterProfile().getDoctor().getId(),
                            UserType.DOCTOR,
                            EventType.ORDER_CANCELLED,
                            new OrderCancelledEventMetadata(
                                    patient.getId(),
                                    patient.getFirstName(),
                                    orgProfile.getUser().getFirstName(),
                                    order.getId()),
                            orgProfile.getInviterProfile(),
                            orgProfile.getOrganization());
                    orderManagementNotificationService.notificationForOrderCancelled(
                            patient, orgProfile.getInviterProfile().getUser().getEmail(), order.getId());
                }
            }
        }

        if (orderRequest.getAssignedUserDetails() != null
                && orderRequest.getAssignedUserDetails().getAssignedUserProfileId() != null) {
            order.setAssignedLabUserId(orderRequest.getAssignedUserDetails().getAssignedUserProfileId());
            order.setAssignedLabUserName(orderRequest.getAssignedUserDetails().getAssignedUserName());

            UserProfile labUserProfile = userProfileRepository
                    .findById(orderRequest.getAssignedUserDetails().getAssignedUserProfileId())
                    .orElseThrow(DoctorNotFoundException::new);
            String labAdminDisplayName = orgProfile.getOrgName();
            if (labAdminDisplayName == null) {
                labAdminDisplayName = orgProfile.getUser().fullNameWithSalutation();
            }
            timelineService.addEvent(
                    order.getPatient().getId(),
                    UserType.PATIENT,
                    labUserProfile.getDoctor().getId(),
                    UserType.DOCTOR,
                    EventType.LAB_ADMIN_ASSIGN_ORDER,
                    new LabAdminAssignTheOrderMetadata(labAdminDisplayName, order.getId()),
                    labUserProfile,
                    labUserProfile.getOrganization());
            var orgWhatsAppDetails = subscriptionService.isWhatsAppMessagingEnabled(
                    orgProfile.getDoctor().getId(), orgProfile.getId());

            orderManagementNotificationService.notificationForNewOrderAssigned(
                    orgProfile.getOrgName(),
                    labUserProfile.getUser().getEmail(),
                    order.getId(),
                    order.getPatient().getFirstName(),
                    order.getPatient().getId(),
                    order.getPatient().getMobileNo(),
                    order.getStatus(),
                    orgWhatsAppDetails);

            orderRepository.save(order);
        }

        if (OrderStatus.STL_FILES_REQUESTED.equals(orderRequest.getStatus())) {
            TreatmentPlan treatmentPlan = treatmentPlanRepository
                    .findByIdWithLinkedPlan(orderRequest.getTreatmentPlanId())
                    .orElseThrow(() -> new TreatmentNotFoundException(orderRequest.getTreatmentPlanId()));
            treatmentPlan.setIsStlFileRequested(true);
            treatmentPlan.setStlFileRequestedAt(ZonedDateTime.now());
            treatmentPlanRepository.save(treatmentPlan);
            caseActivityLogger.logStlRequested(
                    treatmentPlan.getPatient(),
                    ownerUserProfile,
                    treatmentPlan.getTreatmentPlanTagName(),
                    treatmentPlan.getTreatmentPlanVersion());

            stlFileRequestedByCustomer(
                    orgProfile, order, order.getPatient(), treatmentPlan, orderRequest, oldStatus, newStatus);
        }
    }

    private void stlFileRequestedByCustomer(
            UserProfile senderUserProfile,
            Order order,
            Patient patient,
            TreatmentPlan treatmentPlan,
            UpdateOrderRequest request,
            OrderStatus oldOrderStatus,
            OrderStatus newOrderStatus) {
        int totalAligners = OrderTreatmentCommonUtil.getTotalAligners(treatmentPlan.getAlignerDetailsMetadata());

        String stlFileTypeText;
        if (treatmentPlan.getStlFileMetadata() != null
                && treatmentPlan.getStlFileMetadata().getPrintingType()
                        == STLFileMetadata.PrintingType.THREE_D_PRINTED) {
            stlFileTypeText = "3D models";
        } else {
            stlFileTypeText = "Direct printed Aligners";
        }

        var receiverUserProfile = order.getTargetProfile();
        chatService.requestForStlFileEmail(OrderManagementEmailRequest.builder()
                .stlFileType(stlFileTypeText)
                .orderSenderEmail(senderUserProfile.getUser().getEmail())
                .patientName(patient.getFirstName())
                .orderReceiverEmail(receiverUserProfile.getUser().getEmail())
                .treatmentPlanName(treatmentPlan.getTreatmentPlanTagName())
                .treatmentPlanId(treatmentPlan.getTreatmentPlanName())
                .upperJawSeries(
                        treatmentPlan
                                                        .getAlignerDetailsMetadata()
                                                        .getUpperJawDetails()
                                                        .getStartsWith()
                                                != null
                                        && treatmentPlan
                                                        .getAlignerDetailsMetadata()
                                                        .getUpperJawDetails()
                                                        .getEndsWith()
                                                != null
                                ? "Aligner "
                                        + treatmentPlan
                                                .getAlignerDetailsMetadata()
                                                .getUpperJawDetails()
                                                .getStartsWith()
                                        + "-"
                                        + treatmentPlan
                                                .getAlignerDetailsMetadata()
                                                .getUpperJawDetails()
                                                .getEndsWith()
                                : "-")
                .lowerJawSeries(
                        treatmentPlan
                                                        .getAlignerDetailsMetadata()
                                                        .getLowerJawDetails()
                                                        .getStartsWith()
                                                != null
                                        && treatmentPlan
                                                        .getAlignerDetailsMetadata()
                                                        .getLowerJawDetails()
                                                        .getEndsWith()
                                                != null
                                ? "Aligner "
                                        + treatmentPlan
                                                .getAlignerDetailsMetadata()
                                                .getLowerJawDetails()
                                                .getStartsWith()
                                        + "-"
                                        + treatmentPlan
                                                .getAlignerDetailsMetadata()
                                                .getLowerJawDetails()
                                                .getEndsWith()
                                : "-")
                .totalAligners(totalAligners)
                .orderId(order.getId())
                .orderReceiverEmail(receiverUserProfile.getUser().getEmail())
                .orderSenderName(senderUserProfile.getOrgName())
                .orgName(senderUserProfile.getOrganizationBrandName())
                .build());

        timelineService.addEvent(
                patient.getId(),
                UserType.PATIENT,
                receiverUserProfile.getDoctor().getId(),
                UserType.DOCTOR,
                EventType.THIRD_PARTY_CUSTOMER_REQUEST_STL_FILES,
                new ThirdPartyCustomerRequestForStlFilesMetadata(
                        senderUserProfile.getOrgName(), order.getId(), treatmentPlan.getId()),
                receiverUserProfile,
                receiverUserProfile.getOrganization());

        orderManagementNotificationService.notificationForSTLFilesRequested(
                request,
                senderUserProfile.getOrgName(),
                receiverUserProfile.getUser().getEmail(),
                order.getId(),
                treatmentPlan.getId(),
                patient,
                oldOrderStatus,
                newOrderStatus,
                receiverUserProfile.getUser().getMobileNo());
    }

    @Transactional
    public OrderResponse getOrder(OrderRequest orderRequest) {
        AtomicReference<Boolean> isCustomerTackingEnabled = new AtomicReference<>(false);
        AtomicReference<Boolean> isCustomerStlFileEnabled = new AtomicReference<>(false);
        AtomicReference<Boolean> isCustomerScanFileEnabled = new AtomicReference<>(false);
        AtomicReference<Boolean> isCustomerPrintFileEnabled = new AtomicReference<>(false);

        List<BracesAlignerTreatmentResponse> getTreatmentPlanResponses;

        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(orderRequest.getProfileId());
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(orderRequest.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(orderRequest.getProfileId()));
        if (adminWithDefaultTag && userProfile.getInviterProfile() != null) {
            userProfile = userProfile.getInviterProfile();
            orderRequest.setProfileId(userProfile.getId());
            orderRequest.setDoctorId(userProfile.getDoctor().getId());
            orderRequest.setOrganizationId(userProfile.getOrganization().getId());
        }
        Order order = orderRepository
                .findByIdWithPatientAndDoctorOrganizationAndUser(orderRequest.getOrderId())
                .orElseThrow(() -> new OrderException(orderRequest.getOrderId()));

        var isOrderPresent = orderRepository.existsOrderWithPatientAndProfileWithNullCheck(
                order.getPatient().getId(), orderRequest.getProfileId());

        if (!isOrderPresent) {
            if (userProfile.getProfileType().equals(ProfileType.INVITED)) {
                var targetProfileOrgId =
                        order.getTargetProfile().getOrganization().getId();
                var ownerProfileOrgId =
                        order.getOwnerProfile().getOrganization().getId();
                var userProfileOrgId = userProfile.getOrganization().getId();
                if (!targetProfileOrgId.equals(userProfileOrgId) || !ownerProfileOrgId.equals(userProfileOrgId)) {
                    throw new ForbiddenException();
                }
            }
        }

        var ownerProfile = order.getOwnerProfile();
        List<OrderCommentsResponse> orderCommentsResponses = getAllComments(orderRequest.getOrderId());
        OrderFileDetailsDTO orderFileDetailsDTO = orderFilesDetails(order, orderRequest);

        if (Boolean.TRUE.equals(orderRequest.getRetrieveTreatmentPlan())) {
            getTreatmentPlanResponses = treatmentService.getTreatmentPlanFromOrder(
                    order, orderRequest.getDoctorId(), orderRequest.getProfileId());
        } else {
            getTreatmentPlanResponses = new ArrayList<>();
        }
        long linkedOrderPlanCount = 0L;
        if (order.getChildOrder() != null) {
            linkedOrderPlanCount = treatmentPlanRepository.countNonDraftTreatmentPlansByOrderId(
                    order.getChildOrder().getId(), OrderTreatmentPlanStatus.SENT_FOR_APPROVAL);
        }
        Set<Role> roles = order.getOwnerProfile().getRoles();
        boolean isCustomerOrder = false;
        boolean isPracticeOrder = false;

        if (roles.stream().anyMatch(role -> "CUSTOMER".equals(role.getName()))) {
            isCustomerOrder = true;
        }
        if (roles.stream()
                .anyMatch(role ->
                        "CONSULTING_ORTHODONTIST".equals(role.getName()) || "CLINIC_OWNER".equals(role.getName()))) {
            isPracticeOrder = true;
        }
        LocalDate result = null;
        if (order.getManufacturingBatches() != null
                && !order.getManufacturingBatches().isEmpty()) {
            var manufacturingBatches = order.getManufacturingBatches();
            ManufacturingBatch latestBatch = manufacturingBatches.stream()
                    .max(Comparator.comparing(ManufacturingBatch::getCreatedAt))
                    .orElse(null);

            int remainingAlignerStartNumber = ManufacturingBatch.getRemainingAlignerStartNumber(latestBatch);

            Optional<LocalDate> endDate = alignerJourneyRepository.findAlignerEndDateByPatientIdAndSrNo(
                    order.getPatient().getId(), remainingAlignerStartNumber);

            result = endDate.orElse(null);
        }

        PatientDoctorOrganization pdo = patientDoctorOrganizationRepository.findByPatient(
                order.getPatient().getId());
        Long organizationId = pdo.getOrganization().getId();
        Long customerProfileId = pdo.getUserProfile().getId();

        if (organizationId != null && customerProfileId != null) {
            Optional<CustomerAccessAndRevoke> car = customerAccessAndRevokeRepository.findByProfileIdAndOrganizationId(
                    customerProfileId, organizationId);
            car.ifPresent(c -> {
                isCustomerTackingEnabled.set(c.getIsTrackingEnabled());
                isCustomerStlFileEnabled.set(c.getIsStlFileViewEnabled());
                isCustomerPrintFileEnabled.set(c.getIsPrintFileViewEnabled());
                isCustomerScanFileEnabled.set(c.getIsScanFileViewEnabled());
            });
        }

        return OrderResponse.from(
                order,
                orderFileDetailsDTO,
                orderCommentsResponses,
                getTreatmentPlanResponses,
                orderFileDetailsDTO.getParentOrderId(),
                linkedOrderPlanCount,
                orderRequest,
                isCustomerOrder,
                ownerProfile.getUser().fullName(),
                isPracticeOrder,
                result,
                isCustomerTackingEnabled,
                isCustomerStlFileEnabled,
                isCustomerScanFileEnabled,
                isCustomerPrintFileEnabled);
    }

    @Override
    @Transactional
    public FilteredOrderDetails getFilteredOrdersV2(FilteredOrderRequest request) {

        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        if (adminWithDefaultTag && userProfile.getInviterProfile() != null) {
            userProfile = userProfile.getInviterProfile();
            request.setProfileId(userProfile.getId());
            request.setDoctorId(userProfile.getDoctor().getId());
            request.setOrganizationId(userProfile.getOrganization().getId());
        }
        Long subRoleId = null;
        if (userProfile.getSubRole() != null) {
            subRoleId = userProfile.getSubRole().getId();
        }

        List<Long> internalUserProfileIds = new ArrayList<>();
        boolean isInternalUser = userProfile.getRoles().stream()
                .anyMatch(role -> role.getName().equals(DoctorRole.INTERNAL_USER.name()));
        if (userProfile.getProfileType().equals(ProfileType.INVITED) && isInternalUser) {

            var hasPermissionCustomerOrders = subRoleRepository.hasPermission(
                    subRoleId, "Customer Order Management", "Receive Customer Orders", PermissionType.VIEW);

            var hasPermissionOfPracticeOrders = subRoleRepository.hasPermission(
                    subRoleId, "Practice Order Management", "Receive Practice Orders", PermissionType.VIEW);

            var hasPermissionOfLabOrders = subRoleRepository.hasPermission(
                    subRoleId, "Lab Order Management", "Receive Lab Orders", PermissionType.VIEW);
            if (hasPermissionCustomerOrders || hasPermissionOfPracticeOrders || hasPermissionOfLabOrders) {
                if (userProfile.getInviterProfile() != null) {
                    var userProfileId = userProfile.getInviterProfile().getId();
                    userProfile = userProfileRepository
                            .findByIdWithOrgAndDoctor(userProfileId)
                            .orElseThrow(() -> new DoctorNotFoundException(userProfileId));
                    internalUserProfileIds =
                            userProfileRepository.findInvitedInternalUserProfileIdsByInviter(userProfile.getId());
                    internalUserProfileIds.add(userProfile.getId());
                }
            } else {
                throw new ForbiddenException();
            }
        }
        if (userProfile.getSubRole() != null
                && userProfile.isEnterpriseOrDesignLab()
                && request.getPatientId() == null) {
            internalUserProfileIds =
                    userProfileRepository.findInvitedInternalUserProfileIdsByInviter(userProfile.getId());
        }
        internalUserProfileIds.add(userProfile.getId());
        var profileId = userProfile.getId();

        long receivedByPracticeCount = 0;
        long receivedByCustomerCount = 0;
        List<OrderDetailsProjection> orderDetailsProjections;
        Long totalOrderCount;
        Set<String> userRoles =
                userProfile.getRoles().stream().map(Role::getName).collect(Collectors.toSet());

        Set<String> LAB_ROLES = Set.of(
                "IN_OFFICE_MANUFACTURER",
                "ALIGNER_COMPANY_OR_LAB",
                "COMMERCIAL_ALIGNER_LAB",
                "LAB_STAFF",
                "ENTERPRISE_COMPANY_LAB");

        ManufacturingStatus updatedManufacturingStatus =
                mapOrderStatusToManufacturingStatus(request.getFilterByStatus());

        final OrderStatus statusForOrderFilter =
                (updatedManufacturingStatus != null) ? null : request.getFilterByStatus();

        boolean isLabRole = userRoles.stream().anyMatch(LAB_ROLES::contains);
        String statusName = updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null;
        if (isLabRole) {
            if (userRoles.contains("IN_OFFICE_MANUFACTURER")
                    || userRoles.contains("ALIGNER_COMPANY_OR_LAB")
                    || userRoles.contains("ENTERPRISE_COMPANY_LAB")) {
                if (request.getOrderFlow() == OrderFlow.SENT) {
                    orderDetailsProjections = patientsOrderDetailsRepository.findSentOrderByProfileIdWithPagination(
                            profileId,
                            internalUserProfileIds,
                            updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                            statusName,
                            statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                            request.getFilterByDueBy() != null
                                    ? request.getFilterByDueBy().name()
                                    : null,
                            request.getFilterByAssignedUser() != null
                                    ? request.getFilterByAssignedUser().name()
                                    : null,
                            request.getPatientId(),
                            request.getSearch(),
                            request.getSortCriteria().getType(),
                            request.getSortCriteria().getSort(),
                            request.getPageNumber(),
                            request.getPageSize());

                    totalOrderCount = patientsOrderCountDetailsRepository.countSentOrdersByProfileId(
                            profileId,
                            internalUserProfileIds,
                            updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                            statusName,
                            statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                            request.getFilterByDueBy() != null
                                    ? request.getFilterByDueBy().name()
                                    : null,
                            request.getFilterByAssignedUser() != null
                                    ? request.getFilterByAssignedUser().name()
                                    : null,
                            request.getPatientId(),
                            request.getSearch());

                } else if (request.getOrderFlow() == OrderFlow.CUSTOMER) {
                    orderDetailsProjections =
                            patientsOrderDetailsRepository.findReceivedOrdersByProfileIdAndRolesWithPagination(
                                    profileId,
                                    internalUserProfileIds,
                                    List.of(DoctorRole.CUSTOMER.name(), DoctorRole.ALIGNER_COMPANY_OR_LAB.name()),
                                    updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                                    statusName,
                                    statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                                    request.getFilterByDueBy() != null
                                            ? request.getFilterByDueBy().name()
                                            : null,
                                    request.getFilterByAssignedUser() != null
                                            ? request.getFilterByAssignedUser().name()
                                            : null,
                                    request.getPatientId(),
                                    request.getSearch(),
                                    request.getSortCriteria().getType(),
                                    request.getSortCriteria().getSort(),
                                    request.getPageNumber(),
                                    request.getPageSize());
                    totalOrderCount = patientsOrderCountDetailsRepository.countReceivedOrdersByProfileIdAndRoles(
                            profileId,
                            internalUserProfileIds,
                            List.of(DoctorRole.CUSTOMER.name(), DoctorRole.ALIGNER_COMPANY_OR_LAB.name()),
                            updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                            statusName,
                            statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                            request.getFilterByDueBy() != null
                                    ? request.getFilterByDueBy().name()
                                    : null,
                            request.getFilterByAssignedUser() != null
                                    ? request.getFilterByAssignedUser().name()
                                    : null,
                            request.getPatientId(),
                            request.getSearch());

                } else if (request.getOrderFlow() == OrderFlow.PRACTICE) {
                    orderDetailsProjections =
                            patientsOrderDetailsRepository.findReceivedOrdersByProfileIdAndRolesWithPagination(
                                    profileId,
                                    internalUserProfileIds,
                                    List.of(DoctorRole.CONSULTING_ORTHODONTIST.name()),
                                    updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                                    statusName,
                                    statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                                    request.getFilterByDueBy() != null
                                            ? request.getFilterByDueBy().name()
                                            : null,
                                    request.getFilterByAssignedUser() != null
                                            ? request.getFilterByAssignedUser().name()
                                            : null,
                                    request.getPatientId(),
                                    request.getSearch(),
                                    request.getSortCriteria().getType(),
                                    request.getSortCriteria().getSort(),
                                    request.getPageNumber(),
                                    request.getPageSize());

                    totalOrderCount = patientsOrderCountDetailsRepository.countReceivedOrdersByProfileIdAndRoles(
                            profileId,
                            internalUserProfileIds,
                            List.of(DoctorRole.CONSULTING_ORTHODONTIST.name()),
                            updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                            statusName,
                            statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                            request.getFilterByDueBy() != null
                                    ? request.getFilterByDueBy().name()
                                    : null,
                            request.getFilterByAssignedUser() != null
                                    ? request.getFilterByAssignedUser().name()
                                    : null,
                            request.getPatientId(),
                            request.getSearch());
                } else {
                    orderDetailsProjections =
                            patientsOrderDetailsRepository.findReceivedOrdersByProfileIdWithPagination(
                                    profileId,
                                    internalUserProfileIds,
                                    updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                                    statusName,
                                    statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                                    request.getFilterByDueBy() != null
                                            ? request.getFilterByDueBy().name()
                                            : null,
                                    request.getFilterByAssignedUser() != null
                                            ? request.getFilterByAssignedUser().name()
                                            : null,
                                    request.getPatientId(),
                                    request.getSearch(),
                                    request.getSortCriteria().getType(),
                                    request.getSortCriteria().getSort(),
                                    request.getPageNumber(),
                                    request.getPageSize());
                    totalOrderCount = patientsOrderCountDetailsRepository.countReceivedOrdersByProfileId(
                            profileId,
                            internalUserProfileIds,
                            updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                            statusName,
                            statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                            request.getFilterByDueBy() != null
                                    ? request.getFilterByDueBy().name()
                                    : null,
                            request.getFilterByAssignedUser() != null
                                    ? request.getFilterByAssignedUser().name()
                                    : null,
                            request.getPatientId(),
                            request.getSearch());
                }

                receivedByPracticeCount = orderRepository.countReceivedOrdersByProfileIdAndRoles(
                        profileId, List.of(DoctorRole.CONSULTING_ORTHODONTIST.name()));
                receivedByCustomerCount = orderRepository.countReceivedOrdersByProfileIdAndRoles(
                        profileId, List.of(DoctorRole.CUSTOMER.name()));
            } else if (userRoles.contains("COMMERCIAL_ALIGNER_LAB")) {
                orderDetailsProjections = patientsOrderDetailsRepository.findReceivedOrdersByProfileIdWithPagination(
                        profileId,
                        internalUserProfileIds,
                        updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                        statusName,
                        statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                        request.getFilterByDueBy() != null
                                ? request.getFilterByDueBy().name()
                                : null,
                        request.getFilterByAssignedUser() != null
                                ? request.getFilterByAssignedUser().name()
                                : null,
                        request.getPatientId(),
                        request.getSearch(),
                        request.getSortCriteria().getType(),
                        request.getSortCriteria().getSort(),
                        request.getPageNumber(),
                        request.getPageSize());
                totalOrderCount = patientsOrderCountDetailsRepository.countReceivedOrdersByProfileId(
                        profileId,
                        internalUserProfileIds,
                        updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                        statusName,
                        statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                        request.getFilterByDueBy() != null
                                ? request.getFilterByDueBy().name()
                                : null,
                        request.getFilterByAssignedUser() != null
                                ? request.getFilterByAssignedUser().name()
                                : null,
                        request.getPatientId(),
                        request.getSearch());
            } else if (userRoles.contains("LAB_STAFF")) {
                if (request.getOrderFlow() == OrderFlow.CUSTOMER) {
                    orderDetailsProjections =
                            patientsOrderDetailsRepository.findReceivedOrdersByProfileIdForLabStaffFilterByRoles(
                                    profileId,
                                    List.of(DoctorRole.CUSTOMER.name()),
                                    updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                                    statusName,
                                    statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                                    request.getFilterByDueBy() != null
                                            ? request.getFilterByDueBy().name()
                                            : null,
                                    request.getFilterByAssignedUser() != null
                                            ? request.getFilterByAssignedUser().name()
                                            : null,
                                    request.getPatientId(),
                                    request.getSearch(),
                                    request.getSortCriteria().getType(),
                                    request.getSortCriteria().getSort(),
                                    request.getPageNumber(),
                                    request.getPageSize());

                    totalOrderCount =
                            patientsOrderCountDetailsRepository.countReceivedOrdersByProfileIdForLabStaffFilterByRoles(
                                    profileId,
                                    List.of(DoctorRole.CUSTOMER.name()),
                                    updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                                    statusName,
                                    statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                                    request.getFilterByDueBy() != null
                                            ? request.getFilterByDueBy().name()
                                            : null,
                                    request.getFilterByAssignedUser() != null
                                            ? request.getFilterByAssignedUser().name()
                                            : null,
                                    request.getPatientId(),
                                    request.getSearch());

                    receivedByPracticeCount = orderRepository.countReceivedOrdersForLabStaffByProfileIdAndRoles(
                            profileId,
                            List.of(
                                    DoctorRole.CONSULTING_ORTHODONTIST.name(),
                                    DoctorRole.ENTERPRISE_COMPANY_LAB.name()));
                    receivedByCustomerCount = orderRepository.countReceivedOrdersForLabStaffByProfileIdAndRoles(
                            profileId, List.of(DoctorRole.CUSTOMER.name()));
                } else if (request.getOrderFlow() == OrderFlow.PRACTICE) {

                    orderDetailsProjections =
                            patientsOrderDetailsRepository.findReceivedOrdersByProfileIdForLabStaffFilterByRoles(
                                    profileId,
                                    List.of(
                                            DoctorRole.CONSULTING_ORTHODONTIST.name(),
                                            DoctorRole.ENTERPRISE_COMPANY_LAB.name()),
                                    updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                                    statusName,
                                    statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                                    request.getFilterByDueBy() != null
                                            ? request.getFilterByDueBy().name()
                                            : null,
                                    request.getFilterByAssignedUser() != null
                                            ? request.getFilterByAssignedUser().name()
                                            : null,
                                    request.getPatientId(),
                                    request.getSearch(),
                                    request.getSortCriteria().getType(),
                                    request.getSortCriteria().getSort(),
                                    request.getPageNumber(),
                                    request.getPageSize());

                    totalOrderCount =
                            patientsOrderCountDetailsRepository.countReceivedOrdersByProfileIdForLabStaffFilterByRoles(
                                    profileId,
                                    List.of(
                                            DoctorRole.CONSULTING_ORTHODONTIST.name(),
                                            DoctorRole.ENTERPRISE_COMPANY_LAB.name()),
                                    updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                                    statusName,
                                    statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                                    request.getFilterByDueBy() != null
                                            ? request.getFilterByDueBy().name()
                                            : null,
                                    request.getFilterByAssignedUser() != null
                                            ? request.getFilterByAssignedUser().name()
                                            : null,
                                    request.getPatientId(),
                                    request.getSearch());
                    receivedByPracticeCount = orderRepository.countReceivedOrdersForLabStaffByProfileIdAndRoles(
                            profileId,
                            List.of(
                                    DoctorRole.CONSULTING_ORTHODONTIST.name(),
                                    DoctorRole.ENTERPRISE_COMPANY_LAB.name()));
                    receivedByCustomerCount = orderRepository.countReceivedOrdersForLabStaffByProfileIdAndRoles(
                            profileId, List.of(DoctorRole.CUSTOMER.name()));
                } else {
                    orderDetailsProjections = patientsOrderDetailsRepository.findReceivedOrdersByProfileIdForLabStaff(
                            profileId,
                            updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                            statusName,
                            statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                            request.getFilterByDueBy() != null
                                    ? request.getFilterByDueBy().name()
                                    : null,
                            request.getFilterByAssignedUser() != null
                                    ? request.getFilterByAssignedUser().name()
                                    : null,
                            request.getPatientId(),
                            request.getSearch(),
                            request.getSortCriteria().getType(),
                            request.getSortCriteria().getSort(),
                            request.getPageNumber(),
                            request.getPageSize());

                    totalOrderCount = patientsOrderCountDetailsRepository.countReceivedOrdersByProfileIdForLabStaff(
                            profileId,
                            updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                            statusName,
                            statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                            request.getFilterByDueBy() != null
                                    ? request.getFilterByDueBy().name()
                                    : null,
                            request.getFilterByAssignedUser() != null
                                    ? request.getFilterByAssignedUser().name()
                                    : null,
                            request.getPatientId(),
                            request.getSearch());
                }
            } else {
                orderDetailsProjections = Collections.emptyList();
                totalOrderCount = 0L;
            }
        } else if (userRoles.contains("CONSULTING_ORTHODONTIST")
                || userRoles.contains("CLINIC_OWNER")
                || userRoles.contains("CUSTOMER")) {
            orderDetailsProjections = patientsOrderDetailsRepository.findSentOrderByProfileIdWithPagination(
                    profileId,
                    internalUserProfileIds,
                    updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                    statusName,
                    statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                    request.getFilterByDueBy() != null
                            ? request.getFilterByDueBy().name()
                            : null,
                    request.getFilterByAssignedUser() != null
                            ? request.getFilterByAssignedUser().name()
                            : null,
                    request.getPatientId(),
                    request.getSearch(),
                    request.getSortCriteria().getType(),
                    request.getSortCriteria().getSort(),
                    request.getPageNumber(),
                    request.getPageSize());

            totalOrderCount = patientsOrderCountDetailsRepository.countSentOrdersByProfileId(
                    profileId,
                    internalUserProfileIds,
                    updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                    statusName,
                    statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                    request.getFilterByDueBy() != null
                            ? request.getFilterByDueBy().name()
                            : null,
                    request.getFilterByAssignedUser() != null
                            ? request.getFilterByAssignedUser().name()
                            : null,
                    request.getPatientId(),
                    request.getSearch());

        } else if (userRoles.contains("VENDOR")) {
            orderDetailsProjections = patientsOrderDetailsRepository.findReceivedOrdersByProfileIdWithPagination(
                    profileId,
                    internalUserProfileIds,
                    updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                    statusName,
                    statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                    request.getFilterByDueBy() != null
                            ? request.getFilterByDueBy().name()
                            : null,
                    request.getFilterByAssignedUser() != null
                            ? request.getFilterByAssignedUser().name()
                            : null,
                    request.getPatientId(),
                    request.getSearch(),
                    request.getSortCriteria().getType(),
                    request.getSortCriteria().getSort(),
                    request.getPageNumber(),
                    request.getPageSize());
            totalOrderCount = patientsOrderCountDetailsRepository.countReceivedOrdersByProfileId(
                    profileId,
                    internalUserProfileIds,
                    updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                    statusName,
                    statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                    request.getFilterByDueBy() != null
                            ? request.getFilterByDueBy().name()
                            : null,
                    request.getFilterByAssignedUser() != null
                            ? request.getFilterByAssignedUser().name()
                            : null,
                    request.getPatientId(),
                    request.getSearch());
        } else {
            totalOrderCount = 0L;
            orderDetailsProjections = Collections.emptyList();
        }

        int pageNumber = request.getPageNumber();
        int pageSize = request.getPageSize();

        int totalElements = Math.toIntExact(totalOrderCount);
        int totalPages = (int) Math.ceil((double) totalElements / pageSize);

        long sentCount = orderRepository.countSentOrdersByProfileId(profileId);
        long receivedCount = orderRepository.countReceivedOrdersByProfileId(profileId);

        List<Long> profileIds = orderDetailsProjections.stream()
                .flatMap(order -> Stream.of(order.getOwnerProfileId(), order.getTargetProfileId()))
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        List<UserProfileSummary> userProfileSummaries = userProfileRepository.findSummaryByIds(profileIds);

        Map<Long, UserProfileSummary> userProfileSummaryMap = userProfileSummaries.stream()
                .collect(Collectors.toMap(UserProfileSummary::getProfileId, userProfileSummary -> userProfileSummary));

        List<FilteredOrderDetails.OrderDetails> orderDetails = orderDetailsProjections.stream()
                .map(order -> {
                    String roleNames = order.getOwnerRoleNames();
                    boolean isCustomerOrder = false;
                    boolean isPracticeOrder = false;

                    if (roleNames != null) {
                        isCustomerOrder =
                                Arrays.stream(roleNames.split(",")).anyMatch(role -> "CUSTOMER".equals(role.trim()));

                        isPracticeOrder = Arrays.stream(roleNames.split(",")).anyMatch(role -> {
                            String trimmed = role.trim();
                            return "CONSULTING_ORTHODONTIST".equals(trimmed) || "CLINIC_OWNER".equals(trimmed);
                        });
                    }
                    boolean isPurchaseOrder = Objects.equals(profileId, order.getOwnerProfileId());
                    String purchaseOrderId = isPurchaseOrder ? order.getParentOrderId() : order.getChildOrderId();

                    String practiceName;
                    if (order.getParentOrderId() != null) {
                        practiceName = fullName(
                                order.getParentOwnerUserSalutation(),
                                order.getParentOwnerUserFirstName(),
                                order.getParentOwnerUserLastName());
                    } else {
                        practiceName = fullName(
                                order.getOwnerUserSalutation(),
                                order.getOwnerUserFirstName(),
                                order.getOwnerUserLastName());
                    }

                    String labDisplayName = null;
                    Long labProfileId = null;

                    if (order.getTargetProfileId() != null) {
                        UserProfileSummary profileSummary = userProfileSummaryMap.get(order.getTargetProfileId());
                        if (profileSummary != null) {
                            labDisplayName = (profileSummary.getSalutation() + ". "
                                            + (profileSummary.getFirstName() != null
                                                    ? profileSummary.getFirstName()
                                                    : "")
                                            + " "
                                            + (profileSummary.getLastName() != null
                                                    ? profileSummary.getLastName()
                                                    : ""))
                                    .trim();
                        }

                        labProfileId = order.getTargetProfileId();
                    }

                    var manufacturingBatches = manufacturingRepository.findByOrderId(order.getOrderId());
                    ManufacturingBatch latestManufacturingBatch = null;
                    if (manufacturingBatches != null && !manufacturingBatches.isEmpty()) {
                        latestManufacturingBatch = manufacturingBatches.stream()
                                .max(Comparator.comparing(ManufacturingBatch::getCreatedAt))
                                .orElse(null);
                    }
                    TreatmentPlan treatmentPlan = null;
                    if (latestManufacturingBatch != null) {
                        treatmentPlan = latestManufacturingBatch.getTreatmentPlan();
                    }
                    AlignerInfo unprocessedAlignerDetails = null;
                    if (treatmentPlan != null) {
                        var totalAligner = treatmentPlan.getManufacturingBatches() != null
                                ? TreatmentPlan.getTotalAlignersFromMetadata(treatmentPlan)
                                : null;
                        unprocessedAlignerDetails = totalAligner != null
                                ? ManufacturingBatch.calculatePendingAligners(totalAligner, manufacturingBatches)
                                : null;
                    }
                    ZonedDateTime orderCreationDate = order.getCreatedAt() != null
                            ? order.getCreatedAt().atZone(TimezoneConfig.DEFAULT_ZONE_ID)
                            : null;

                    ZonedDateTime orderCancelDate = order.getCancelledOn() != null
                            ? order.getCancelledOn().atZone(TimezoneConfig.DEFAULT_ZONE_ID)
                            : null;

                    ZonedDateTime needMoreInfoOnDate = order.getNeedMoreInfoUpdatedOn() != null
                            ? order.getNeedMoreInfoUpdatedOn().atZone(TimezoneConfig.DEFAULT_ZONE_ID)
                            : null;

                    ObjectMapper objectMapper = new ObjectMapper();

                    JsonNode serviceProducts = null;
                    String serviceProductsJson = order.getServiceProducts();

                    if (serviceProductsJson != null) {
                        try {
                            serviceProducts = objectMapper.readTree(serviceProductsJson);
                        } catch (Exception ignored) {
                        }
                    }
                    return FilteredOrderDetails.OrderDetails.builder()
                            .orderId(order.getOrderId())
                            .doctorId(order.getDoctorId())
                            .doctorProfileId(order.getProfileId())
                            .doctorName(practiceName)
                            .patientId(order.getPatientId())
                            .patientName(order.getPatientFirstName() + " " + order.getPatientLastName())
                            .orderCreationDate(orderCreationDate)
                            .orderType(order.getOrderType())
                            .orderStatus(order.getStatus())
                            .orderDueBy(order.getDueBy())
                            .isUrgent(order.getIsUrgent())
                            .assignedLabUserId(order.getAssignedLabUserId())
                            .assignedLabUserName(order.getAssignedLabUserName())
                            .linkedOrderId(purchaseOrderId)
                            .labDisplayName(labDisplayName)
                            .labProfileId(labProfileId)
                            .latestManufacturingResponse(
                                    manufacturingBatches != null && !manufacturingBatches.isEmpty()
                                            ? manufacturingBatches.stream()
                                                    .max(Comparator.comparing(ManufacturingBatch::getCreatedAt))
                                                    .map(ManufacturingResponse::createManufacturingResponse)
                                                    .orElse(null)
                                            : null)
                            .unprocessedAlignerDetails(unprocessedAlignerDetails)
                            .isPracticeOrder(isPracticeOrder)
                            .isCustomerOrder(isCustomerOrder)
                            .needMoreInfoRemark(order.getNeedMoreInfoRemark())
                            .isNeedMoreInfoUpdated(order.getIsNeedMoreInfoUpdated())
                            .cancelOrderRemark(order.getCancelOrderRemark())
                            .cancelledOn(orderCancelDate)
                            .needMoreInfoUpdatedOn(needMoreInfoOnDate)
                            .serviceProducts(serviceProducts)
                            .build();
                })
                .toList();

        FilteredOrderDetails.PaginationDetails paginationDetails = FilteredOrderDetails.PaginationDetails.builder()
                .pageNumber(pageNumber)
                .pageSize(pageSize)
                .totalOrders(totalElements)
                .totalPages(totalPages)
                .hasNext(pageNumber < totalPages - 1)
                .hasPrevious(pageNumber > 0)
                .sent((int) sentCount)
                .received((int) receivedCount)
                .receivedByPractice((int) receivedByPracticeCount)
                .receivedByCustomer((int) receivedByCustomerCount)
                .build();

        return FilteredOrderDetails.builder()
                .orderDetails(orderDetails)
                .paginationDetails(paginationDetails)
                .build();
    }

    @Transactional
    @Override
    public List<PatientOrderDetails> getPatientOrderDetails(PatientOrderRequest request) {
        var requestProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        var isAdminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());

        if (isAdminWithDefaultTag && requestProfile.getInviterProfile() != null) {
            requestProfile = requestProfile.getInviterProfile();
            updateToOwnerProfile(requestProfile, request);
        }
        List<Long> internalUserProfileIds = new ArrayList<>(
                InternalUserProfileUtil.getInternalUserProfileIds(requestProfile, userProfileRepository));

        if (requestProfile.getSubRole() != null
                && requestProfile.isEnterpriseOrDesignLab()
                && request.getPatientId() == null) {
            internalUserProfileIds =
                    userProfileRepository.findInvitedInternalUserProfileIdsByInviter(requestProfile.getId());
            internalUserProfileIds.add(requestProfile.getId());
        }
        var profileId = requestProfile.getId();

        List<OrderDetailsProjection> orderDetailsProjections;
        Set<String> userRoles =
                requestProfile.getRoles().stream().map(Role::getName).collect(Collectors.toSet());

        Set<String> LAB_ROLES =
                Set.of("IN_OFFICE_MANUFACTURER", "ALIGNER_COMPANY_OR_LAB", "ENTERPRISE_COMPANY_LAB", "INTERNAL_USER");

        ManufacturingStatus updatedManufacturingStatus =
                mapOrderStatusToManufacturingStatus(request.getFilterByStatus());

        final OrderStatus statusForOrderFilter =
                (updatedManufacturingStatus != null) ? null : request.getFilterByStatus();

        boolean isLabRole = userRoles.stream().anyMatch(LAB_ROLES::contains);
        String statusName = updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null;

        internalUserProfileIds.add(requestProfile.getId());

        orderDetailsProjections = new ArrayList<>();

        if (isLabRole) {
            if (userRoles.contains("IN_OFFICE_MANUFACTURER")
                    || userRoles.contains("ALIGNER_COMPANY_OR_LAB")
                    || userRoles.contains("ENTERPRISE_COMPANY_LAB")
                    || requestProfile.isInternalUser()) {
                if (requestProfile.isInternalUser()) {
                    if (requestProfile.getInviterProfile() != null) {
                        var inviterProfileId =
                                requestProfile.getInviterProfile().getId();
                        if (!internalUserProfileIds.contains(inviterProfileId)) {
                            internalUserProfileIds.add(inviterProfileId);
                        }
                    }
                }

                List<OrderDetailsProjection> sentOrder = patientsOrderDetailsRepository.findSentOrdersByProfileId(
                        profileId,
                        internalUserProfileIds,
                        updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                        statusName,
                        statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                        request.getFilterByDueBy() != null
                                ? request.getFilterByDueBy().name()
                                : null,
                        request.getFilterByAssignedUser() != null
                                ? request.getFilterByAssignedUser().name()
                                : null,
                        request.getPatientId(),
                        request.getSearch(),
                        request.getSortCriteria().getType(),
                        request.getSortCriteria().getSort(),
                        request.getCustomerProfileId());

                List<OrderDetailsProjection> receivedOrders =
                        patientsOrderDetailsRepository.findReceivedOrdersByProfileId(
                                profileId,
                                internalUserProfileIds,
                                updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                                statusName,
                                statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                                request.getFilterByDueBy() != null
                                        ? request.getFilterByDueBy().name()
                                        : null,
                                request.getFilterByAssignedUser() != null
                                        ? request.getFilterByAssignedUser().name()
                                        : null,
                                request.getPatientId(),
                                request.getSearch(),
                                request.getSortCriteria().getType(),
                                request.getSortCriteria().getSort(),
                                request.getCustomerProfileId());

                orderDetailsProjections = new ArrayList<>(Stream.concat(
                                sentOrder != null ? sentOrder.stream() : Stream.empty(),
                                receivedOrders != null ? receivedOrders.stream() : Stream.empty())
                        .collect(Collectors.toMap(
                                OrderDetailsProjection::getOrderId, order -> order, (existing, duplicate) -> existing))
                        .values());
            }
        } else if (userRoles.contains("CONSULTING_ORTHODONTIST")) {
            List<OrderDetailsProjection> sentOrders = patientsOrderDetailsRepository.findSentOrdersByProfileId(
                    profileId,
                    internalUserProfileIds,
                    updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                    statusName,
                    statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                    request.getFilterByDueBy() != null
                            ? request.getFilterByDueBy().name()
                            : null,
                    request.getFilterByAssignedUser() != null
                            ? request.getFilterByAssignedUser().name()
                            : null,
                    request.getPatientId(),
                    request.getSearch(),
                    request.getSortCriteria().getType(),
                    request.getSortCriteria().getSort(),
                    request.getCustomerProfileId());

            if (sentOrders != null) {
                orderDetailsProjections = sentOrders;
            }

        } else {
            orderDetailsProjections = Collections.emptyList();
        }

        List<String> orderIds = orderDetailsProjections.stream()
                .map(OrderDetailsProjection::getOrderId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        Map<String, List<TreatmentPlanDetailsProjection>> treatmentPlansByOrderId;

        if (!orderIds.isEmpty()) {
            List<TreatmentPlanDetailsProjection> treatmentPlans =
                    treatmentPlanRepository.findTreatmentPlanDetailsByOrderIds(orderIds);

            treatmentPlansByOrderId =
                    treatmentPlans.stream().collect(Collectors.groupingBy(TreatmentPlanDetailsProjection::getOrderId));
        } else {
            treatmentPlansByOrderId = new HashMap<>();
        }

        return orderDetailsProjections.stream()
                .map(order -> {
                    boolean isPurchaseOrder = Objects.equals(profileId, order.getOwnerProfileId());
                    String purchaseOrderId = isPurchaseOrder ? order.getParentOrderId() : order.getChildOrderId();

                    ZonedDateTime orderCreationDate = order.getCreatedAt() != null
                            ? order.getCreatedAt().atZone(TimezoneConfig.DEFAULT_ZONE_ID)
                            : null;

                    ObjectMapper objectMapper = new ObjectMapper();

                    JsonNode serviceProducts = null;
                    String serviceProductsJson = order.getServiceProducts();

                    if (serviceProductsJson != null) {
                        try {
                            serviceProducts = objectMapper.readTree(serviceProductsJson);
                        } catch (Exception ignored) {
                        }
                    }

                    List<PatientOrderDetails.TreatmentPlanInfo> treatmentPlanInfos =
                            treatmentPlansByOrderId.getOrDefault(order.getOrderId(), Collections.emptyList()).stream()
                                    .map(tp -> PatientOrderDetails.TreatmentPlanInfo.builder()
                                            .treatmentPlanId(tp.getId())
                                            .approverStatus(tp.getApproverStatus())
                                            .initiatorStatus(tp.getInitiatorStatus())
                                            .status(tp.getStatus())
                                            .build())
                                    .toList();

                    return PatientOrderDetails.builder()
                            .orderId(order.getOrderId())
                            .caseSubmitted(order.getCaseSubmitted())
                            .patientId(order.getPatientId())
                            .orderCreationDate(orderCreationDate)
                            .orderType(order.getOrderType())
                            .orderStatus(order.getStatus())
                            .linkedOrderId(purchaseOrderId)
                            .serviceProducts(serviceProducts)
                            .treatmentPlans(treatmentPlanInfos)
                            .age(order.getPatientAge())
                            .productImage(order.getServiceProductImage())
                            .productType(order.getServiceProductType())
                            .productName(order.getServiceProductName())
                            .productDescription(order.getServiceProductDescription())
                            .patientName(
                                    UserProfileUtil.fullName(order.getPatientFirstName(), order.getPatientLastName()))
                            .gender(order.getPatientGender())
                            .isClonedOrder(order.getIsClonedOrder())
                            .build();
                })
                .toList();
    }

    @Transactional
    @Override
    public PatientOrderDetailsWithPagination getOrderDetailsWithPagination(PatientOrderRequest request) {
        var requestProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

        var isAdminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());

        if (isAdminWithDefaultTag && requestProfile.getInviterProfile() != null) {
            requestProfile = requestProfile.getInviterProfile();
            updateToOwnerProfile(requestProfile, request);
        }

        List<Long> internalUserProfileIds = new ArrayList<>(
                InternalUserProfileUtil.getInternalUserProfileIds(requestProfile, userProfileRepository));

        if (requestProfile.getSubRole() != null
                && requestProfile.isEnterpriseOrDesignLab()
                && request.getPatientId() == null) {
            internalUserProfileIds =
                    userProfileRepository.findInvitedInternalUserProfileIdsByInviter(requestProfile.getId());
            internalUserProfileIds.add(requestProfile.getId());
        }
        var profileId = requestProfile.getId();

        List<OrderDetailsProjection> orderDetailsProjections;
        Set<String> userRoles =
                requestProfile.getRoles().stream().map(Role::getName).collect(Collectors.toSet());

        Set<String> LAB_ROLES =
                Set.of("IN_OFFICE_MANUFACTURER", "ALIGNER_COMPANY_OR_LAB", "ENTERPRISE_COMPANY_LAB", "INTERNAL_USER");

        ManufacturingStatus updatedManufacturingStatus =
                mapOrderStatusToManufacturingStatus(request.getFilterByStatus());

        final OrderStatus statusForOrderFilter =
                (updatedManufacturingStatus != null) ? null : request.getFilterByStatus();

        boolean isLabRole = userRoles.stream().anyMatch(LAB_ROLES::contains);
        String statusName = updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null;

        internalUserProfileIds.add(requestProfile.getId());

        orderDetailsProjections = new ArrayList<>();
        int page = request.getPage() != null ? request.getPage() : 0;
        int size = request.getSize() != null ? request.getSize() : 10;
        long totalOrderCount;
        if (isLabRole) {
            if (userRoles.contains("IN_OFFICE_MANUFACTURER")
                    || userRoles.contains("ALIGNER_COMPANY_OR_LAB")
                    || userRoles.contains("ENTERPRISE_COMPANY_LAB")
                    || requestProfile.isInternalUser()) {
                if (requestProfile.isInternalUser()) {
                    if (requestProfile.getInviterProfile() != null) {
                        var inviterProfileId =
                                requestProfile.getInviterProfile().getId();
                        if (!internalUserProfileIds.contains(inviterProfileId)) {
                            internalUserProfileIds.add(inviterProfileId);
                        }
                    }
                }

                List<OrderDetailsProjection> sentOrder =
                        patientsOrderDetailsRepository.findSentOrdersByProfileIdWithPagination(
                                profileId,
                                internalUserProfileIds,
                                updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                                statusName,
                                statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                                request.getFilterByDueBy() != null
                                        ? request.getFilterByDueBy().name()
                                        : null,
                                request.getFilterByAssignedUser() != null
                                        ? request.getFilterByAssignedUser().name()
                                        : null,
                                request.getPatientId(),
                                request.getSearch(),
                                request.getSortCriteria().getType(),
                                request.getSortCriteria().getSort(),
                                request.getCustomerProfileId(),
                                page,
                                size);

                Long sentOrderCount = patientsOrderDetailsRepository.countSentOrdersByProfileIdForCustomer(
                        profileId,
                        internalUserProfileIds,
                        updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                        statusName,
                        statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                        request.getFilterByDueBy() != null
                                ? request.getFilterByDueBy().name()
                                : null,
                        request.getFilterByAssignedUser() != null
                                ? request.getFilterByAssignedUser().name()
                                : null,
                        request.getPatientId(),
                        request.getSearch(),
                        request.getCustomerProfileId());

                List<OrderDetailsProjection> receivedOrders =
                        patientsOrderDetailsRepository.findReceivedOrdersByProfileIdAndPatientIdWithPagination(
                                profileId,
                                internalUserProfileIds,
                                updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                                statusName,
                                statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                                request.getFilterByDueBy() != null
                                        ? request.getFilterByDueBy().name()
                                        : null,
                                request.getFilterByAssignedUser() != null
                                        ? request.getFilterByAssignedUser().name()
                                        : null,
                                request.getPatientId(),
                                request.getSearch(),
                                request.getSortCriteria().getType(),
                                request.getSortCriteria().getSort(),
                                request.getCustomerProfileId(),
                                page,
                                size);

                Long receivedOrderCount = patientsOrderDetailsRepository.countReceivedOrdersByProfileIdForCustomer(
                        profileId,
                        internalUserProfileIds,
                        updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                        statusName,
                        statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                        request.getFilterByDueBy() != null
                                ? request.getFilterByDueBy().name()
                                : null,
                        request.getFilterByAssignedUser() != null
                                ? request.getFilterByAssignedUser().name()
                                : null,
                        request.getPatientId(),
                        request.getSearch(),
                        request.getCustomerProfileId());

                totalOrderCount = (sentOrderCount != null ? sentOrderCount : 0L)
                        + (receivedOrderCount != null ? receivedOrderCount : 0L);
                orderDetailsProjections = new ArrayList<>(Stream.concat(
                                sentOrder != null ? sentOrder.stream() : Stream.empty(),
                                receivedOrders != null ? receivedOrders.stream() : Stream.empty())
                        .collect(Collectors.toMap(
                                OrderDetailsProjection::getOrderId, order -> order, (existing, duplicate) -> existing))
                        .values());
            } else {
                totalOrderCount = 0L;
            }
        } else if (userRoles.contains("CONSULTING_ORTHODONTIST")) {
            List<OrderDetailsProjection> sentOrders = patientsOrderDetailsRepository.practiceSentOrder(
                    profileId,
                    internalUserProfileIds,
                    updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                    statusName,
                    statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                    request.getFilterByDueBy() != null
                            ? request.getFilterByDueBy().name()
                            : null,
                    request.getFilterByAssignedUser() != null
                            ? request.getFilterByAssignedUser().name()
                            : null,
                    request.getPatientId(),
                    request.getSearch(),
                    request.getSortCriteria().getType(),
                    request.getSortCriteria().getSort(),
                    request.getCustomerProfileId(),
                    page,
                    size);

            Long sentOrdersCount = patientsOrderDetailsRepository.practiceSentOrderCount(
                    profileId,
                    internalUserProfileIds,
                    updatedManufacturingStatus != null ? updatedManufacturingStatus.name() : null,
                    statusName,
                    statusForOrderFilter != null ? statusForOrderFilter.name() : null,
                    request.getFilterByDueBy() != null
                            ? request.getFilterByDueBy().name()
                            : null,
                    request.getFilterByAssignedUser() != null
                            ? request.getFilterByAssignedUser().name()
                            : null,
                    request.getPatientId(),
                    request.getSearch(),
                    request.getCustomerProfileId());

            totalOrderCount = (sentOrdersCount != null ? sentOrdersCount : 0L);

            if (sentOrders != null) {
                orderDetailsProjections = sentOrders;
            }

        } else {
            totalOrderCount = 0L;
            orderDetailsProjections = Collections.emptyList();
        }

        List<String> orderIds = orderDetailsProjections.stream()
                .map(OrderDetailsProjection::getOrderId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        Map<String, List<TreatmentPlanDetailsProjection>> treatmentPlansByOrderId;

        if (!orderIds.isEmpty()) {
            List<TreatmentPlanDetailsProjection> treatmentPlans =
                    treatmentPlanRepository.findTreatmentPlanDetailsByOrderIds(orderIds);

            treatmentPlansByOrderId =
                    treatmentPlans.stream().collect(Collectors.groupingBy(TreatmentPlanDetailsProjection::getOrderId));
        } else {
            treatmentPlansByOrderId = new HashMap<>();
        }

        List<PatientOrderDetails> orderDetails = orderDetailsProjections.stream()
                .map(order -> {
                    boolean isPurchaseOrder = Objects.equals(profileId, order.getOwnerProfileId());
                    String purchaseOrderId = isPurchaseOrder ? order.getParentOrderId() : order.getChildOrderId();

                    ZonedDateTime orderCreationDate = order.getCreatedAt() != null
                            ? order.getCreatedAt().atZone(TimezoneConfig.DEFAULT_ZONE_ID)
                            : null;

                    ObjectMapper objectMapper = new ObjectMapper();

                    JsonNode serviceProducts = null;
                    String serviceProductsJson = order.getServiceProducts();

                    if (serviceProductsJson != null) {
                        try {
                            serviceProducts = objectMapper.readTree(serviceProductsJson);
                        } catch (Exception ignored) {
                        }
                    }

                    List<PatientOrderDetails.TreatmentPlanInfo> treatmentPlanInfos =
                            treatmentPlansByOrderId.getOrDefault(order.getOrderId(), Collections.emptyList()).stream()
                                    .map(tp -> PatientOrderDetails.TreatmentPlanInfo.builder()
                                            .treatmentPlanId(tp.getId())
                                            .approverStatus(tp.getApproverStatus())
                                            .initiatorStatus(tp.getInitiatorStatus())
                                            .status(tp.getStatus())
                                            .build())
                                    .toList();

                    return PatientOrderDetails.builder()
                            .orderId(order.getOrderId())
                            .patientId(order.getPatientId())
                            .orderCreationDate(orderCreationDate)
                            .orderType(order.getOrderType())
                            .orderStatus(order.getStatus())
                            .linkedOrderId(purchaseOrderId)
                            .serviceProducts(serviceProducts)
                            .treatmentPlans(treatmentPlanInfos)
                            .age(order.getPatientAge())
                            .patientName(
                                    UserProfileUtil.fullName(order.getPatientFirstName(), order.getPatientLastName()))
                            .gender(order.getPatientGender())
                            .isClonedOrder(order.getIsClonedOrder())
                            .productImage(order.getServiceProductImage())
                            .productType(order.getServiceProductType())
                            .productName(order.getServiceProductName())
                            .productDescription(order.getServiceProductDescription())
                            .build();
                })
                .toList();

        PaginationDetails paginationDetails = PaginationDetails.builder()
                .pageNumber(page)
                .pageSize(size)
                .totalPatients(Math.toIntExact(totalOrderCount))
                .totalPages((int) Math.ceil((double) totalOrderCount / size))
                .hasNext(page < (Math.ceil((double) totalOrderCount / size) - 1))
                .hasPrevious(page > 0)
                .build();

        return PatientOrderDetailsWithPagination.builder()
                .orders(orderDetails)
                .paginationDetails(paginationDetails)
                .build();
    }

    private void updateToOwnerProfile(UserProfile requestProfile, PatientOrderRequest request) {
        request.setProfileId(requestProfile.getId());
        request.setDoctorId(requestProfile.getDoctor().getId());
    }

    private void updateToOwnerProfile(UserProfile requestProfile, CreateOrderRequestV2 request) {
        request.setProfileId(requestProfile.getId());
        request.setDoctorId(requestProfile.getDoctor().getId());
        request.setOrganizationId(requestProfile.getOrganization().getId());
    }

    public String fullName(String salutation, String firstName, String lastName) {
        if (lastName != null) {
            return salutation + ". " + firstName + " " + lastName;
        } else {
            return salutation + ". " + firstName;
        }
    }

    private ManufacturingStatus mapOrderStatusToManufacturingStatus(OrderStatus filterByStatus) {
        if (filterByStatus == null) {
            return null;
        }

        return switch (filterByStatus) {
            case MANUFACTURING_STARTED -> ManufacturingStatus.MANUFACTURING_STARTED;
            case SHIPPED -> ManufacturingStatus.SHIPPED;
            case DELIVERED -> ManufacturingStatus.DELIVERED;
            case MANUFACTURING_COMPLETED -> ManufacturingStatus.COMPLETED;
            case MANUFACTURING_PENDING -> ManufacturingStatus.MANUFACTURING_PENDING;
            default -> null;
        };
    }

    @Transactional
    public OrdersCountResponse getOrdersCount(Long doctorId, Long organizationId, Long profileId) {
        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(profileId);
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(profileId)
                .orElseThrow(() -> new DoctorNotFoundException(profileId));
        if (adminWithDefaultTag && userProfile.getInviterProfile() != null) {
            userProfile = userProfile.getInviterProfile();
        }

        Set<String> userRoles =
                userProfile.getRoles().stream().map(Role::getName).collect(Collectors.toSet());

        Set<String> LAB_ROLES = Set.of(
                "IN_OFFICE_MANUFACTURER",
                "ALIGNER_COMPANY_OR_LAB",
                "COMMERCIAL_ALIGNER_LAB",
                "LAB_STAFF",
                "ENTERPRISE_COMPANY_LAB");

        boolean isLabRole = userRoles.stream().anyMatch(LAB_ROLES::contains);

        ZoneId zoneId = TimezoneConfig.DEFAULT_ZONE_ID;
        ZonedDateTime today =
                LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT).atZone(zoneId);
        LocalDate currentDate = LocalDate.now();

        OrderCountSummary countSummary;

        if (isLabRole) {
            if (userRoles.contains("IN_OFFICE_MANUFACTURER")
                    || userRoles.contains("ALIGNER_COMPANY_OR_LAB")
                    || userRoles.contains("COMMERCIAL_ALIGNER_LAB")
                    || userRoles.contains("ENTERPRISE_COMPANY_LAB")) {
                countSummary = orderRepository.getReceivedOrdersCountSummary(profileId, today, currentDate);
            } else if (userRoles.contains("LAB_STAFF")) {
                countSummary = orderRepository.getLabStaffOrdersCountSummary(profileId, today, currentDate);
            } else {

                countSummary = OrderCountSummary.createEmptyCountSummary();
            }
        } else if (userRoles.contains("CONSULTING_ORTHODONTIST")
                || userRoles.contains("CLINIC_OWNER")
                || userRoles.contains("CUSTOMER")) {
            countSummary = orderRepository.getSentOrdersCountSummary(profileId, today, currentDate);
        } else if (userRoles.contains("VENDOR")) {
            countSummary = orderRepository.getReceivedOrdersCountSummary(profileId, today, currentDate);
        } else {
            countSummary = OrderCountSummary.createEmptyCountSummary();
        }

        var doctorInvitationCount = doctorService.getInvitationCountOfAllRoles(
                DoctorInvitationCountRequest.from(doctorId, organizationId, profileId, true));

        OrdersCountResponse.Count count = new OrdersCountResponse.Count();
        OrdersCountResponse.TaskDetails task = new OrdersCountResponse.TaskDetails();
        OrdersCountResponse.NeedsAttentionDetails needsAttention = new OrdersCountResponse.NeedsAttentionDetails();
        OrdersCountResponse.GettingStartedDetails gettingStartedDetails =
                new OrdersCountResponse.GettingStartedDetails();

        count.setTotal(countSummary.getTotalCount());
        count.setOrdered(countSummary.getOrderedCount());
        count.setInProgress(countSummary.getInProgressCount());
        count.setInReview(countSummary.getInReviewCount());
        count.setOnHold(countSummary.getOnHoldCount());
        count.setReplan(countSummary.getRePlanCount());
        count.setApproved(countSummary.getApprovedCount());
        count.setCompleted(countSummary.getCompletedCount());
        count.setDraft(countSummary.getDraftCount());
        count.setCancelled(countSummary.getCancelledCount());
        count.setStlFileRequested(countSummary.getStlFilesRequestedCount());
        count.setStlFileApproved(countSummary.getStlFilesUploadedCount());

        task.setNewOrder(countSummary.getNewOrdersCount());
        task.setUnassignedOrders(countSummary.getUnassignedOrdersCount());
        task.setUrgentOrders(countSummary.getUrgentOrdersCount());
        task.setInProgress(countSummary.getInProgressCount());
        task.setReviewAssignedOrdersToMe(countSummary.getAssignedToMeCount());

        needsAttention.setInReplan(countSummary.getRePlanCount());
        needsAttention.setStlFileRequested(countSummary.getStlFilesRequestedCount());
        needsAttention.setDueToday(countSummary.getDueTodayCount());
        needsAttention.setOverdue(countSummary.getOverdueCount());

        gettingStartedDetails.setBrandAndCompanyDetailsAdded(doctorInvitationCount.isBrandAndCompanyDetailsAdded());
        gettingStartedDetails.setUserCount(doctorInvitationCount.getUserCount());
        gettingStartedDetails.setInvitedLabStaffCount(doctorInvitationCount.getInvitedLabStaffCount());
        gettingStartedDetails.setActiveLabStaffCount(doctorInvitationCount.getActiveLabStaffCount());
        gettingStartedDetails.setCustomerCount(doctorInvitationCount.getCustomerCount());
        gettingStartedDetails.setInvitedCustomerCount(doctorInvitationCount.getInvitedCustomerCount());
        gettingStartedDetails.setActiveCustomerCount(doctorInvitationCount.getActiveCustomerCount());

        long userActionPending = safe(countSummary.getOrderedCount())
                + safe(countSummary.getInProgressCount())
                + safe(countSummary.getRePlanCount())
                + safe(countSummary.getStlFilesRequestedCount());

        long customerActionPending = safe(countSummary.getInReviewCount())
                + safe(countSummary.getApprovedCount())
                + safe(countSummary.getStlFilesUploadedCount());

        gettingStartedDetails.setUserActionPending(userActionPending);
        gettingStartedDetails.setCustomerActionPending(customerActionPending);

        return OrdersCountResponse.builder()
                .count(count)
                .task(task)
                .needsAttention(needsAttention)
                .gettingStarted(gettingStartedDetails)
                .build();
    }

    private boolean checkCompletedOrderCriteria(Order order) {
        ManufacturingBatch latestBatch = getLatestManufacturingBatch(order);

        if (latestBatch == null) {
            return false;
        }
        return ManufacturingStatus.DELIVERED.equals(latestBatch.getStatus())
                && BatchType.ALL_ALIGNERS.equals(latestBatch.getBatchType());
    }

    private ManufacturingBatch getLatestManufacturingBatch(Order order) {
        List<ManufacturingBatch> batches = order.getManufacturingBatches();

        if (batches == null || batches.isEmpty()) {
            return null;
        }

        return batches.stream()
                .max(Comparator.comparing(ManufacturingBatch::getCreatedAt))
                .orElse(null);
    }

    @Transactional(rollbackFor = {BusinessException.class})
    public void addComments(OrderCommentsDTO request) {

        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        if (adminWithDefaultTag && userProfile.getInviterProfile() != null) {
            userProfile = userProfile.getInviterProfile();
            request.setProfileId(userProfile.getId());
            request.setDoctorId(userProfile.getDoctor().getId());
        }
        OrderComments orderComments = new OrderComments();
        orderComments.setOrderId(request.getOrderId());
        orderComments.setDoctorId(request.getDoctorId());
        orderComments.setProfileId(request.getProfileId());
        orderComments.setNotes(request.getNotes());

        var order = orderRepository
                .findByIdWithPatientAndDoctorOrganizationAndUser(orderComments.getOrderId())
                .orElseThrow();
        var targetProfile = order.getTargetProfile();
        var ownerProfile = order.getOwnerProfile();

        var profileForNotification = userProfile.getId().equals(targetProfile.getId()) ? ownerProfile : targetProfile;

        var orgName = userProfile.getOrgName();
        if (userProfile.isPractice()) {
            orgName = userProfile.getPracticeName();
        }
        notificationService.commentAddedOnOrderTreatment(
                orgName,
                order.getPatient(),
                request.getOrderId(),
                profileForNotification.getUser().getEmail(),
                profileForNotification.getUser().getMobileNo(),
                profileForNotification.getId());

        timelineService.addEvent(
                order.getPatient().getId(),
                UserType.PATIENT,
                userProfile.getDoctor().getId(),
                UserType.DOCTOR,
                EventType.COMMENT_ADDED_ON_ORDER,
                new CommentAddedOnOrderEventMetadata(
                        order.getPatient().getId(), order.getPatient().getFirstName(), orgName, order.getId()),
                profileForNotification,
                profileForNotification.getOrganization());

        orderCommentsRepository.save(orderComments);
    }

    public List<OrderCommentsResponse> getAllComments(String orderId) {

        List<OrderComments> orderComments = orderCommentsRepository.findByOrderId(orderId);

        orderComments = orderComments.stream()
                .sorted(Comparator.comparing(OrderComments::getCreatedAt).reversed())
                .toList();

        List<Long> profileIds = orderComments.stream()
                .map(OrderComments::getProfileId)
                .distinct()
                .toList();

        Map<Long, UserProfileSummary> profileSummaryMap = userProfileRepository.findSummaryByIds(profileIds).stream()
                .collect(Collectors.toMap(UserProfileSummary::getProfileId, summary -> summary));

        return orderComments.stream()
                .map(orderComment -> {
                    UserProfileSummary profileSummary = profileSummaryMap.get(orderComment.getProfileId());
                    return OrderCommentsResponse.builder()
                            .orderId(orderComment.getOrderId())
                            .doctorId(orderComment.getDoctorId())
                            .profileId(orderComment.getProfileId())
                            .notes(orderComment.getNotes())
                            .remark(orderComment.getRemark())
                            .profileImageUrl(Optional.ofNullable(profileSummary)
                                    .map(UserProfileSummary::getProfilePicture)
                                    .orElse(null))
                            .createdAt(orderComment.getCreatedAt())
                            .displayName(Optional.ofNullable(profileSummary)
                                    .map(summary -> {
                                        String salutation = Optional.ofNullable(summary.getSalutation())
                                                .orElse("");
                                        String firstName = Optional.ofNullable(summary.getFirstName())
                                                .orElse("");
                                        String lastName = Optional.ofNullable(summary.getLastName())
                                                .orElse("");
                                        return (salutation + ". " + firstName + " " + lastName).trim();
                                    })
                                    .orElse(null))
                            .build();
                })
                .toList();
    }

    @Override
    @Transactional
    public UserOrdersCountResponseWithPagination getUserOrdersCountWithPagination(
            Long doctorId, Long organizationId, Long profileId, int pageNumber, int pageSize, DoctorRole filterByRole) {
        List<UserProfile> userProfiles;

        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(profileId);
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(profileId)
                .orElseThrow(() -> new DoctorNotFoundException(profileId));
        if (adminWithDefaultTag && userProfile.getInviterProfile() != null) {
            userProfile = userProfile.getInviterProfile();
            organizationId = userProfile.getOrganization().getId();
        }

        if (filterByRole != null) {
            userProfiles = userProfileRepository.findAllProfilesByOrganizationIdAndProfileTypeAndInviterIdAndRoles(
                    organizationId, ProfileType.INVITED, userProfile.getId(), filterByRole.name());
        } else {
            userProfiles = userProfileRepository.findAllProfilesByOrganizationIdAndProfileTypeAndInviterIdAndRoles(
                    organizationId, ProfileType.INVITED, userProfile.getId(), DoctorRole.LAB_STAFF.name());
        }

        if (userProfiles.isEmpty()) {
            PaginationDetails paginationDetails = PaginationDetails.builder()
                    .pageNumber(pageNumber)
                    .pageSize(pageSize)
                    .totalPatients(0)
                    .totalPages(0)
                    .hasNext(false)
                    .hasPrevious(false)
                    .build();

            return UserOrdersCountResponseWithPagination.builder()
                    .userOrdersCountResponse(Collections.emptyList())
                    .paginationDetails(paginationDetails)
                    .build();
        }

        List<UserOrdersCountResponse> allResponses = new ArrayList<>();
        for (UserProfile profile : userProfiles) {
            List<Order> userOrders;
            if (profile.getDoctor() == null) continue;

            if (profile.getRoles().stream()
                            .map(Role::getName)
                            .toList()
                            .contains(DoctorRole.COMMERCIAL_ALIGNER_LAB.name())
                    || profile.getRoles().stream().map(Role::getName).toList().contains(DoctorRole.VENDOR.name())) {
                userOrders = orderRepository.findByTargetProfile_IdAndOrganizationId(profile.getId(), organizationId);
            } else if (profile.getRoles().stream().map(Role::getName).toList().contains(DoctorRole.CUSTOMER.name())
                    || profile.getRoles().stream()
                            .map(Role::getName)
                            .toList()
                            .contains(DoctorRole.CONSULTING_ORTHODONTIST.name())) {
                userOrders = orderRepository.findByProfileIdAndOrganizationId(profile.getId(), organizationId);
            } else {
                userOrders = orderRepository.findByAssignedLabUserId(profile.getId());
            }

            long ongoingOrders = userOrders.stream()
                    .filter(order -> Set.of(
                                    OrderStatus.ORDERED,
                                    OrderStatus.IN_PROGRESS,
                                    OrderStatus.IN_REVIEW,
                                    OrderStatus.RE_PLAN,
                                    OrderStatus.APPROVED,
                                    OrderStatus.STL_FILES_REQUESTED,
                                    OrderStatus.STL_FILES_UPLOADED)
                            .contains(order.getStatus()))
                    .count();

            long userActionPending = userOrders.stream()
                    .filter(order -> Set.of(
                                    OrderStatus.ORDERED,
                                    OrderStatus.IN_PROGRESS,
                                    OrderStatus.RE_PLAN,
                                    OrderStatus.STL_FILES_REQUESTED)
                            .contains(order.getStatus()))
                    .count();

            long customerActionPending = userOrders.stream()
                    .filter(order -> Set.of(OrderStatus.IN_REVIEW, OrderStatus.APPROVED, OrderStatus.STL_FILES_UPLOADED)
                            .contains(order.getStatus()))
                    .count();

            UserOrdersCountResponse userResponse = UserOrdersCountResponse.builder()
                    .userName((profile.getUser().getFirstName() + " "
                                    + profile.getUser().getLastName())
                            .trim())
                    .userProfileId(profile.getId())
                    .ongoingOrderCount((int) ongoingOrders)
                    .userActionPendingCount((int) userActionPending)
                    .customerActionPendingCount((int) customerActionPending)
                    .build();

            allResponses.add(userResponse);
        }

        int totalElements = allResponses.size();
        int totalPages = (int) Math.ceil((double) totalElements / pageSize);

        if (pageNumber >= totalPages && totalPages > 0) {
            pageNumber = totalPages - 1;
        }

        int startIndex = pageNumber * pageSize;
        int endIndex = Math.min(startIndex + pageSize, totalElements);

        List<UserOrdersCountResponse> pagedResponses =
                startIndex < totalElements ? allResponses.subList(startIndex, endIndex) : Collections.emptyList();

        PaginationDetails paginationDetails = PaginationDetails.builder()
                .pageNumber(pageNumber)
                .pageSize(pageSize)
                .totalPatients(totalElements)
                .totalPages(totalPages)
                .hasNext(pageNumber < totalPages - 1)
                .hasPrevious(pageNumber > 0)
                .build();

        return UserOrdersCountResponseWithPagination.builder()
                .userOrdersCountResponse(pagedResponses)
                .paginationDetails(paginationDetails)
                .build();
    }

    @Override
    @Transactional(rollbackFor = {BusinessException.class})
    public ClonedOrderResponse cloneOrder(CloneOrderRequest request) {
        Order existingOrder = orderRepository
                .findById(request.getCustomerOrderId())
                .orElseThrow(() -> new OrderException(request.getCustomerOrderId()));

        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());
        var ownerUserProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        if (adminWithDefaultTag && ownerUserProfile.getInviterProfile() != null) {
            ownerUserProfile = ownerUserProfile.getInviterProfile();
            request.setProfileId(ownerUserProfile.getId());
            request.setDoctorId(ownerUserProfile.getDoctor().getId());
            request.setOrganizationId(ownerUserProfile.getOrganization().getId());
        }

        var clonedOrder = Order.from(existingOrder, ownerUserProfile, null, null);

        clonedOrder = orderRepository.save(clonedOrder);

        if (existingOrder.getPrescription() != null) {
            PrescriptionDetails prescriptionDetails = PrescriptionDetails.from(existingOrder.getPrescription());
            Prescription prescription = prescriptionService.addPrescription(
                    clonedOrder.getPatient(), prescriptionDetails, clonedOrder.getId());
            clonedOrder.setPrescription(prescription);
        }

        if (request.getServiceProductId() != null) {
            ServiceProduct serviceProduct = serviceProductRepository
                    .findById(request.getServiceProductId())
                    .orElseThrow(() -> new ServiceProductNotFoundException(request.getServiceProductId()));
            clonedOrder.setServiceProduct(serviceProduct);
        }
        clonedOrder = orderRepository.save(clonedOrder);
        existingOrder.setChildOrder(clonedOrder);
        orderRepository.save(existingOrder);

        createOrderFolderStructure(request.getDoctorId(), clonedOrder);

        List<File> existingFiles = getFilesForCloning(existingOrder);

        PatientDoctorOrganization patientDoctorOrganization = patientDoctorOrganizationRepository
                .findPatientDoctorOrganizationsWithPatientByPatientId(
                        clonedOrder.getPatient().getId())
                .orElseThrow(() -> new BusinessException(
                        BusinessErrorCode.FAILED_TO_MOVE, "Patient-Doctor organization not found"));

        cloneFilesToNewOrder(
                existingFiles, clonedOrder, request.getDoctorId(), patientDoctorOrganization, existingOrder);

        return ClonedOrderResponse.from(clonedOrder);
    }

    @Transactional(rollbackFor = {BusinessException.class})
    @Override
    public ClonedOrderResponse cloneOrderV2(CloneOrderRequestV2 request) {
        Order existingOrder = orderRepository
                .findById(request.getCustomerOrderId())
                .orElseThrow(() -> new OrderException(request.getCustomerOrderId()));

        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());
        var requestUserProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

        UserProfile receiverUserProfile = getReceiverProfile(request.getReceiverProfileId());

        if (adminWithDefaultTag && requestUserProfile.getInviterProfile() != null) {
            return adminCloneOrder(request, existingOrder, requestUserProfile, receiverUserProfile);
        }

        var clonedOrder = Order.cloneOrder(
                existingOrder, requestUserProfile, receiverUserProfile, request.getOrderType(), request);

        if (existingOrder.getPrescription() != null) {
            clonedOrder.setPrescription(existingOrder.getPrescription());
        }
        if (existingOrder.getCaseRecordId() != null) {
            clonedOrder.setCaseRecordId(existingOrder.getCaseRecordId());
        }
        if (request.getServiceProductId() != null) {
            ServiceProduct serviceProduct = serviceProductRepository
                    .findById(request.getServiceProductId())
                    .orElseThrow(() -> new ServiceProductNotFoundException(request.getServiceProductId()));
            clonedOrder.setServiceProduct(serviceProduct);
        }

        clonedOrder = orderRepository.save(clonedOrder);
        existingOrder.setChildOrder(clonedOrder);
        var finalOrder = orderRepository.save(existingOrder);

        patientTaskTrackerService.createCloneOrderTasks(
                clonedOrder.getOwnerProfile(), clonedOrder.getTargetProfile(), finalOrder, clonedOrder);

        createOrderFolderStructure(request.getDoctorId(), clonedOrder);

        List<File> existingFiles = getFilesForCloning(existingOrder);

        PatientDoctorOrganization patientDoctorOrganization = patientDoctorOrganizationRepository
                .findPatientDoctorOrganizationsWithPatientByPatientId(
                        clonedOrder.getPatient().getId())
                .orElseThrow(PatientNotFoundException::new);

        cloneFilesToNewOrder(
                existingFiles, clonedOrder, request.getDoctorId(), patientDoctorOrganization, existingOrder);

        return ClonedOrderResponse.from(clonedOrder);
    }

    private ClonedOrderResponse adminCloneOrder(
            CloneOrderRequestV2 request,
            Order existingOrder,
            UserProfile ownerUserProfile,
            UserProfile receiverUserProfile) {

        ownerUserProfile = ownerUserProfile.getInviterProfile();
        assert ownerUserProfile != null;
        request.setProfileId(ownerUserProfile.getId());
        request.setDoctorId(ownerUserProfile.getDoctor().getId());
        request.setOrganizationId(ownerUserProfile.getOrganization().getId());

        var clonedOrder =
                Order.cloneOrder(existingOrder, ownerUserProfile, receiverUserProfile, request.getOrderType(), request);

        if (existingOrder.getPrescription() != null) {
            clonedOrder.setPrescription(existingOrder.getPrescription());
        }
        if (request.getServiceProductId() != null) {
            ServiceProduct serviceProduct = serviceProductRepository
                    .findById(request.getServiceProductId())
                    .orElseThrow(() -> new ServiceProductNotFoundException(request.getServiceProductId()));
            clonedOrder.setServiceProduct(serviceProduct);
        }

        clonedOrder = orderRepository.save(clonedOrder);
        existingOrder.setChildOrder(clonedOrder);
        var finalOrder = orderRepository.save(existingOrder);

        patientTaskTrackerService.createCloneOrderTasks(
                clonedOrder.getOwnerProfile(), clonedOrder.getTargetProfile(), finalOrder, clonedOrder);

        createOrderFolderStructure(request.getDoctorId(), clonedOrder);

        List<File> existingFiles = getFilesForCloning(existingOrder);

        PatientDoctorOrganization patientDoctorOrganization = patientDoctorOrganizationRepository
                .findPatientDoctorOrganizationsWithPatientByPatientId(
                        clonedOrder.getPatient().getId())
                .orElseThrow(PatientNotFoundException::new);

        cloneFilesToNewOrder(
                existingFiles, clonedOrder, request.getDoctorId(), patientDoctorOrganization, existingOrder);

        return ClonedOrderResponse.from(clonedOrder);
    }

    @Override
    public EnterpriseDashboardOrdersResponse getEnterpriseOrderDashboardResponse(BaseRequest request) {
        Long doctorId = request.getDoctorId();
        Long organizationId = request.getOrganizationId();
        Long profileId = request.getProfileId();
        OrdersCountResponse practiceOrders;
        OrdersCountResponse customerOrders;

        if (DoctorRole.LAB_STAFF.equals(request.getRole())) {
            practiceOrders = orderResponseService.getPracticeLabAndCustomerOrders(
                    doctorId, organizationId, profileId, DoctorRole.LAB_STAFF, DoctorRole.CONSULTING_ORTHODONTIST);
            customerOrders = orderResponseService.getPracticeLabAndCustomerOrders(
                    doctorId, organizationId, profileId, DoctorRole.LAB_STAFF, DoctorRole.CUSTOMER);
        } else {
            practiceOrders = orderResponseService.getPracticeLabAndCustomerOrders(
                    doctorId, organizationId, profileId, DoctorRole.CONSULTING_ORTHODONTIST, null);
            customerOrders = orderResponseService.getPracticeLabAndCustomerOrders(
                    doctorId, organizationId, profileId, DoctorRole.CUSTOMER, null);
        }

        OrdersCountResponse labOrders = orderResponseService.getPracticeLabAndCustomerOrders(
                doctorId, organizationId, profileId, DoctorRole.COMMERCIAL_ALIGNER_LAB, null);

        return EnterpriseDashboardOrdersResponse.from(practiceOrders, customerOrders, labOrders);
    }

    @Override
    public void dismissZipFile(String orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new OrderException(orderId));
        order.setShowZipFile(false);
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public OrderResponse updateToCancelledOrNeedMoreInfo(UpdateToCancelledOrNeedMoreInfoRequest request) {

        var orderId = request.getOrderId();
        Order order = orderRepository
                .findByIdWithPatientAndDoctorOrganizationAndUser(orderId)
                .orElseThrow(() -> new OrderException(orderId));
        var practiceProfile = order.getOwnerProfile();
        var orgProfile = order.getTargetProfile();

        if (request.getOrderStatus().equals(OrderStatus.CANCELLED) && request.getCancelOrder() != null) {
            order.setCancelOrderRemark(request.getCancelOrder().getRemark());
            order.setCancelledOn(ZonedDateTime.now());
            order.setAssignedLabUserId(null);
            order.setAssignedLabUserName(null);

            orderCommentsRepository.save(OrderComments.orderCancelled(order));
            order.setStatus(request.getOrderStatus());

            timelineService.addEvent(
                    order.getPatient().getId(),
                    UserType.PATIENT,
                    practiceProfile.getDoctor().getId(),
                    UserType.DOCTOR,
                    EventType.ORDER_CANCELLED,
                    new OrderCancelledEventMetadata(
                            order.getPatient().getId(),
                            order.getPatient().getFirstName(),
                            orgProfile.getOrgName(),
                            order.getId()),
                    practiceProfile,
                    practiceProfile.getOrganization());

            orderManagementNotificationService.notificationForOrderCancelled(
                    orgProfile.getOrgName(),
                    practiceProfile.getUser().getEmail(),
                    order.getId(),
                    order.getPatient().getFirstName(),
                    order.getPatient().getId());

        } else if (request.getOrderStatus().equals(OrderStatus.NEED_MORE_INFO) && request.getNeedMoreInfo() != null) {
            order.setStatus(request.getOrderStatus());
            order.setNeedMoreInfoRemark(request.getNeedMoreInfo().getRemark());
            order.setNeedMoreInfoUpdatedOn(ZonedDateTime.now());
            order.setAssignedLabUserId(null);
            order.setAssignedLabUserName(null);

            orderCommentsRepository.save(OrderComments.requestedNeedMoreInfo(order));
            timelineService.addEvent(
                    order.getPatient().getId(),
                    UserType.PATIENT,
                    practiceProfile.getDoctor().getId(),
                    UserType.DOCTOR,
                    EventType.NEED_MORE_INFO_REQUESTED,
                    new OrgRequestedNeedMoreInfoMetadata(order.getId()),
                    practiceProfile,
                    practiceProfile.getOrganization());

            orderManagementNotificationService.orgRequestedNeedMoreInfo(
                    practiceProfile.getUser().getEmail(),
                    order.getId(),
                    order.getPatient().getFirstName(),
                    order.getPatient().getId());

            var senderProfile = order.getOwnerProfile();
            var receiverProfile = order.getTargetProfile();

            chatService.requestedNeedMoreInfo(OrderManagementEmailRequest.builder()
                    .orderSenderName(senderProfile.getUser().fullName())
                    .orderReceiverName(receiverProfile.getOrgName())
                    .patientName(order.getPatient().getFirstName())
                    .orderSenderEmail(senderProfile.getUser().getEmail())
                    .orderId(order.getId())
                    .remarks(request.getNeedMoreInfo().getRemark())
                    .orgName(senderProfile.getOrganizationBrandName())
                    .build());
        }
        return OrderResponse.from(orderRepository.save(order));
    }

    @Override
    public MinimumOrderDetailResponse getMinimumOrderDetails(Long patientId) {
        List<String> orderIds = orderRepository.findAllOrderIds(patientId);
        return MinimumOrderDetailResponse.builder()
                .orderIds(orderIds)
                .patientId(patientId)
                .build();
    }

    private void createOrderFolderStructure(Long doctorId, Order order) {
        UserId doctorUserId =
                UserId.builder().userId(doctorId).userType(UserType.DOCTOR).build();
        UserId patientUserId = UserId.builder()
                .userId(order.getPatient().getId())
                .userType(UserType.PATIENT)
                .build();

        String orderFolderPath = "/Orders/Order " + order.getId() + "/";

        if (!folderExists(doctorId, order.getPatient().getId(), "/Orders/")) {
            filesService.createFolderIfNotExists(CreateFolderRequest.builder()
                    .folderName("Orders")
                    .parentPath("/")
                    .uploader(patientUserId)
                    .owners(Set.of(doctorUserId, patientUserId))
                    .isDefaultFolder(true)
                    .isPatientFolder(false)
                    .isPurchaseOrderFile(true)
                    .build());
        }

        if (!folderExists(doctorId, order.getPatient().getId(), orderFolderPath)) {
            filesService.createFolderIfNotExists(CreateFolderRequest.builder()
                    .folderName("Order " + order.getId())
                    .parentPath("/Orders/")
                    .uploader(patientUserId)
                    .owners(Set.of(doctorUserId, patientUserId))
                    .isDefaultFolder(false)
                    .isPatientFolder(true)
                    .isPurchaseOrderFile(true)
                    .build());
        }

        createSubfolderIfNotExists(doctorId, order, DOCUMENTS_FOLDER_NAME);
        createSubfolderIfNotExists(doctorId, order, SCAN_FILE_FOLDER_NAME);
        createSubfolderIfNotExists(doctorId, order, IMAGE_FOLDER_NAME);
    }

    private boolean folderExists(Long doctorId, Long patientId, String folderPath) {
        return fileRepository
                .findFolderByFullPathAndStatus(folderPath, Status.ACTIVE)
                .isPresent();
    }

    private void createSubfolderIfNotExists(Long doctorId, Order order, String folderName) {
        String fullPath = "/Orders/Order " + order.getId() + "/" + folderName + "/";
        if (!folderExists(doctorId, order.getPatient().getId(), fullPath)) {
            UserId doctorUserId =
                    UserId.builder().userId(doctorId).userType(UserType.DOCTOR).build();
            UserId patientUserId = UserId.builder()
                    .userId(order.getPatient().getId())
                    .userType(UserType.PATIENT)
                    .build();

            filesService.createFolderIfNotExists(CreateFolderRequest.builder()
                    .folderName(folderName)
                    .parentPath("/Orders/Order " + order.getId() + "/")
                    .uploader(patientUserId)
                    .owners(Set.of(doctorUserId, patientUserId))
                    .isDefaultFolder(false)
                    .isPatientFolder(true)
                    .isPurchaseOrderFile(true)
                    .build());
        }
    }

    private List<File> getFilesForCloning(Order order) {
        String rootPath = filesService.rootPath(order.getPatient().getId(), UserType.PATIENT);
        String orderPath = rootPath + "/Orders/Order " + order.getId() + "/";

        List<File> allFiles = fileRepository.findByFullPathStartingWithAndStatus(orderPath, Status.ACTIVE);

        return allFiles.stream()
                .filter(file -> {
                    String relativePath = file.getFullPath().substring(orderPath.length());
                    return !relativePath.contains("/")
                            || relativePath.startsWith(DOCUMENTS_FOLDER_NAME + "/")
                            || relativePath.startsWith(IMAGE_FOLDER_NAME + "/")
                            || relativePath.startsWith(SCAN_FILE_FOLDER_NAME + "/");
                })
                .collect(Collectors.toList());
    }

    private void cloneFilesToNewOrder(
            List<File> existingFiles,
            Order clonedOrder,
            Long doctorId,
            PatientDoctorOrganization patientDoctorOrganization,
            Order existingOrder) {
        if (existingFiles == null || existingFiles.isEmpty()) {
            return;
        }

        UserId doctorUserId =
                UserId.builder().userId(doctorId).userType(UserType.DOCTOR).build();
        UserId patientUserId = UserId.builder()
                .userId(clonedOrder.getPatient().getId())
                .userType(UserType.PATIENT)
                .build();

        Set<UserId> owners = Set.of(doctorUserId, patientUserId);
        Map<String, File> createdFolders = new HashMap<>();

        existingFiles.stream()
                .filter(File::isFolder)
                .filter(f -> !isStandardSubfolder(f, existingOrder))
                .forEach(existingFolder -> {
                    String newPath = existingFolder
                            .getFullPath()
                            .replace("/Orders/Order " + existingOrder.getId(), "/Orders/Order " + clonedOrder.getId());

                    if (fileRepository
                            .findFolderByFullPathAndStatus(newPath, Status.ACTIVE)
                            .isPresent()) {
                        return;
                    }

                    File parentFile =
                            getParentFolderForClone(existingFolder, clonedOrder, createdFolders, existingOrder);
                    File newFolder = File.newFolder(
                            patientUserId,
                            owners,
                            existingFolder.getName(),
                            parentFile,
                            newPath,
                            patientDoctorOrganization);
                    newFolder.setFilesFromTreatmentPlan(existingFolder.isFilesFromTreatmentPlan());
                    newFolder.setFileDisplayToPatient(existingFolder.isFileDisplayToPatient());

                    createdFolders.put(newPath, newFolder);
                });

        List<File> filesToCreate = existingFiles.stream()
                .filter(file -> !file.isFolder())
                .map(existingFile -> {
                    String newPath = existingFile
                            .getFullPath()
                            .replace("/Orders/Order " + existingOrder.getId(), "/Orders/Order " + clonedOrder.getId());

                    if (fileRepository
                            .findByFullPathAndStatus(newPath, Status.ACTIVE)
                            .isPresent()) {
                        return null;
                    }

                    File parentFile = getParentFolderForClone(existingFile, clonedOrder, createdFolders, existingOrder);
                    File newFile = File.newFile(
                            patientUserId,
                            owners,
                            existingFile.getName(),
                            newPath,
                            existingFile.getUrl(),
                            parentFile,
                            existingFile.getSize(),
                            patientDoctorOrganization);
                    newFile.setFilesFromTreatmentPlan(existingFile.isFilesFromTreatmentPlan());
                    newFile.setFileDisplayToPatient(existingFile.isFileDisplayToPatient());
                    newFile.setCloneFromFileId(existingFile.getId());

                    return newFile;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (!createdFolders.isEmpty()) {
            fileRepository.saveAll(createdFolders.values());
        }
        if (!filesToCreate.isEmpty()) {
            fileRepository.saveAll(filesToCreate);
        }

        createdFolders.values().forEach(folder -> {
            if (folder.getParentFile() != null
                    && !folder.getParentFile().getChildrenFiles().contains(folder)) {
                folder.getParentFile().addChildFile(folder);
                fileRepository.save(folder.getParentFile());
            }
        });
    }

    private boolean isStandardSubfolder(File folder, Order order) {
        String path = folder.getFullPath();
        return path.equals("/Orders/Order " + order.getId() + "/Documents/")
                || path.equals("/Orders/Order " + order.getId() + "/Scan files/")
                || path.equals("/Orders/Order " + order.getId() + "/Images/");
    }

    private File getParentFolderForClone(
            File existingFile, Order clonedOrder, Map<String, File> createdFolders, Order existingOrder) {
        if (existingFile.getParentFile() == null) {
            return null;
        }

        String parentPath = existingFile
                .getParentFile()
                .getFullPath()
                .replace("/Orders/Order " + existingOrder.getId(), "/Orders/Order " + clonedOrder.getId());

        if (createdFolders.containsKey(parentPath)) {
            return createdFolders.get(parentPath);
        }

        return fileRepository
                .findFolderByFullPathAndStatus(parentPath, Status.ACTIVE)
                .orElseThrow(() -> new BusinessException(
                        BusinessErrorCode.FILE_NOT_FOUND, "Parent folder not found: " + parentPath));
    }

    private void createOrderAndChildFolder(Long drId, Order order) {
        var doctorId = UserId.builder().userId(drId).userType(UserType.DOCTOR).build();
        var patientId = UserId.builder()
                .userId(order.getPatient().getId())
                .userType(UserType.PATIENT)
                .build();

        UserFilesDetails userFilesDetails = filesService.getFiles(
                drId,
                UserType.DOCTOR,
                order.getPatient().getId(),
                UserType.PATIENT,
                "/Orders/Order " + order.getId() + "/");

        if (userFilesDetails.getFiles().isEmpty()) {
            filesService.createFolderIfNotExists(CreateFolderRequest.builder()
                    .folderName("Order" + " " + order.getId())
                    .parentPath("/Orders/")
                    .uploader(patientId)
                    .owners(Set.of(doctorId, patientId))
                    .isDefaultFolder(false)
                    .isPatientFolder(true)
                    .build());
            filesService.getFiles(
                    drId,
                    UserType.DOCTOR,
                    order.getPatient().getId(),
                    UserType.PATIENT,
                    "/Orders/Order " + order.getId() + "/");
        }
    }

    private OrderFileDetailsDTO orderFilesDetails(Order order, OrderRequest orderRequest) {
        List<FileDetails> documentFileDetails = filesService
                .getFiles(
                        orderRequest.getDoctorId(),
                        UserType.DOCTOR,
                        order.getPatient().getId(),
                        UserType.PATIENT,
                        "/Orders/Order " + order.getId() + "/" + DOCUMENTS_FOLDER_NAME + "/")
                .getFiles();

        List<FileDetails> imagesFileDetails = filesService
                .getFiles(
                        orderRequest.getDoctorId(),
                        UserType.DOCTOR,
                        order.getPatient().getId(),
                        UserType.PATIENT,
                        "/Orders/Order " + order.getId() + "/" + IMAGE_FOLDER_NAME + "/")
                .getFiles();

        List<FileDetails> scanFileDetails = filesService
                .getFiles(
                        orderRequest.getDoctorId(),
                        UserType.DOCTOR,
                        order.getPatient().getId(),
                        UserType.PATIENT,
                        "/Orders/Order " + order.getId() + "/" + SCAN_FILE_FOLDER_NAME + "/")
                .getFiles();

        Long fileId = filesService
                .getFiles(
                        orderRequest.getDoctorId(),
                        UserType.DOCTOR,
                        order.getPatient().getId(),
                        UserType.PATIENT,
                        "/Orders")
                .getFiles()
                .stream()
                .filter(fileDetails -> fileDetails.getName().equals("Order " + order.getId()))
                .map(FileDetails::getFileId)
                .findFirst()
                .orElse(null);

        return OrderFileDetailsDTO.builder()
                .documents(documentFileDetails)
                .images(imagesFileDetails)
                .scanFiles(scanFileDetails)
                .parentOrderId(fileId)
                .build();
    }

    private long safe(Long value) {
        return Optional.ofNullable(value).orElse(0L);
    }
}
