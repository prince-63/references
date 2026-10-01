package com.dentalstack.patient.feature.vsp.service.impl;

import static com.dentalstack.patient.feature.storage.files.service.FilesService.STL_FILES;
import static com.dentalstack.patient.feature.storage.files.service.FilesService.TREATMENTS;
import static com.dentalstack.patient.feature.workflow.core.task_tracker.service.PatientTaskTrackerServiceImpl.*;

import com.dentalstack.patient.application.config.WhatsappTemplateTypeProperties;
import com.dentalstack.patient.feature.caserecord.exception.CaseRecordNotFoundException;
import com.dentalstack.patient.feature.chat.dto.request.CreateChatRequest;
import com.dentalstack.patient.feature.chat.entity.DoctorChat;
import com.dentalstack.patient.feature.chat.repository.DoctorChatRepository;
import com.dentalstack.patient.feature.chat.service.PatientChatService;
import com.dentalstack.patient.feature.doctor.entity.PatientDoctorOrganization;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.doctor.repository.CustomerAccessAndRevokeRepository;
import com.dentalstack.patient.feature.invitation.entity.Invitation;
import com.dentalstack.patient.feature.invitation.repository.InvitationRepository;
import com.dentalstack.patient.feature.invitation.repository.PatientInvitationDetailsRepository;
import com.dentalstack.patient.feature.notification.dto.vsp.*;
import com.dentalstack.patient.feature.notification.enums.OrgName;
import com.dentalstack.patient.feature.notification.service.VspNotificationService;
import com.dentalstack.patient.feature.notification.service.VspPlanningEmailService;
import com.dentalstack.patient.feature.patient.dto.PatientGetRequest;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.prescription.exception.PrescriptionNotExitsException;
import com.dentalstack.patient.feature.storage.drive.async.DriveAsyncHelper;
import com.dentalstack.patient.feature.storage.files.dto.CreateFolderHierarchyRequest;
import com.dentalstack.patient.feature.storage.files.repository.FileRepository;
import com.dentalstack.patient.feature.storage.files.service.FilesService;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.vsp.*;
import com.dentalstack.patient.feature.timeline.service.TimelineService;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.feature.user.exception.UserNotFoundException;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.vsp.dto.request.*;
import com.dentalstack.patient.feature.vsp.dto.response.*;
import com.dentalstack.patient.feature.vsp.dto.summary.VspOrderIdAndStatus;
import com.dentalstack.patient.feature.vsp.dto.summary.VspProductionIdAndStatus;
import com.dentalstack.patient.feature.vsp.entity.*;
import com.dentalstack.patient.feature.vsp.enums.*;
import com.dentalstack.patient.feature.vsp.repository.*;
import com.dentalstack.patient.feature.vsp.service.VspBillingDetailsService;
import com.dentalstack.patient.feature.vsp.service.VspService;
import com.dentalstack.patient.feature.vsp.service.VspShippingDetailsService;
import com.dentalstack.patient.feature.vsp.util.VspCaseActivityLogger;
import com.dentalstack.patient.feature.vsp.util.VspPortUrlResolver;
import com.dentalstack.patient.feature.workflow.core.task_tracker.dto.MoveSingleTaskRequest;
import com.dentalstack.patient.feature.workflow.core.task_tracker.service.PatientTaskTrackerService;
import com.dentalstack.patient.feature.workflow.product.entity.ServiceProduct;
import com.dentalstack.patient.feature.workflow.product.exception.ServiceProductNotFoundException;
import com.dentalstack.patient.feature.workflow.product.repository.ServiceProductRepository;
import com.dentalstack.patient.feature.workflow.service_configuration.repository.ServiceConfigurationRepository;
import com.dentalstack.patient.global.dto.UserId;
import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import com.dentalstack.patient.global.exception.GenericException;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import javax.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class VspServiceImpl implements VspService {

    private final VspOrderRepository vspOrderRepository;
    private final VspCaseRecordRepository vspCaseRecordRepository;
    private final VspPrescriptionRepository vspPrescriptionRepository;
    private final VspTreatmentPlanRepository vspTreatmentPlanRepository;
    private final FileRepository vspFileRepository;
    private final PatientRepository patientRepository;
    private final UserProfileRepository userProfileRepository;
    private final ServiceProductRepository serviceProductRepository;
    private final PatientTaskTrackerService patientTaskTrackerService;
    private final PatientInvitationDetailsRepository patientInvitationDetailsRepository;
    private final VspShippingDetailsRepository vspShippingDetailsRepository;
    private final VspBillingDetailsRepository vspBillingDetailsRepository;
    private final VspShippingDetailsService vspShippingDetailsService;
    private final VspBillingDetailsService vspBillingDetailsService;
    private final InvitationRepository invitationRepository;
    private final DoctorChatRepository doctorChatRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final FilesService filesService;
    private final DriveAsyncHelper driveAsyncHelper;
    private final VspProductionRepository vspProductionRepository;
    private final TimelineService timelineService;
    private final ServiceConfigurationRepository serviceConfigurationRepository;
    private final PatientChatService patientChatService;
    private final VspPlanningEmailService vspPlanningEmailService;
    private final VspCaseActivityLogger vspCaseActivityLogger;
    private final CustomerAccessAndRevokeRepository customerAccessAndRevokeRepository;
    private final VspNotificationService vspNotificationService;
    private final WhatsappTemplateTypeProperties whatsappTemplateTypeProperties;

    @Override
    @Transactional
    public VspOrderResponse createOrder(CreateVspOrderRequest request) {
        UserProfile userProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(request.getProfileId())
                .orElseThrow(() -> new UserNotFoundException(request.getProfileId()));
        PatientDoctorOrganization pdo = patientDoctorOrganizationRepository.findByPatient(request.getPatientId());

        if (pdo == null) {
            throw new PatientNotFoundException(request.getPatientId());
        }

        var serviceProduct = request.getServiceProductId() != null
                ? serviceProductRepository
                        .findById(request.getServiceProductId())
                        .orElseThrow(() -> new ServiceProductNotFoundException(request.getServiceProductId()))
                : null;

        var order = VspOrder.builder()
                .patient(pdo.getPatient())
                .createdByUserProfile(pdo.getUserProfile())
                .assignedToUserProfile(pdo.getAddedByUserProfile())
                .serviceProduct(serviceProduct)
                .oralSurgeonName(request.getOralSurgeonName())
                .orthodontistName(request.getOrthodontistName())
                .notesForLab(request.getNotesForLab())
                .status(request.getStatus())
                .build();

        order = vspOrderRepository.save(order);

        if (request.getCaseRecordId() != null) {
            var existingCaseRecord = vspCaseRecordRepository
                    .findById(request.getCaseRecordId())
                    .orElseThrow(() -> new CaseRecordNotFoundException(request.getCaseRecordId()));
            order.getCaseRecords().add(existingCaseRecord);
            existingCaseRecord.setPatient(order.getPatient());
            existingCaseRecord.setVspOrder(order);
            vspCaseRecordRepository.save(existingCaseRecord);
        } else if (request.getCaseRecord() != null) {
            var newCaseRecord = buildCaseRecord(order, request.getCaseRecord());
            order.getCaseRecords().add(newCaseRecord);
            newCaseRecord.setPatient(order.getPatient());
            newCaseRecord.setVspOrder(order);
            vspCaseRecordRepository.save(newCaseRecord);
        }

        if (request.getPrescriptionId() != null) {
            var existingPrescription = vspPrescriptionRepository
                    .findById(request.getPrescriptionId())
                    .orElseThrow(() -> new PrescriptionNotExitsException(request.getPrescriptionId()));
            existingPrescription.setPatient(order.getPatient());
            existingPrescription.setVspOrder(order);
            vspPrescriptionRepository.save(existingPrescription);
            order.getPrescriptions().add(existingPrescription);
        } else if (request.getPrescription() != null) {
            var newPrescription = buildPrescription(order, request.getPrescription(), order.getPatient());
            order.getPrescriptions().add(newPrescription);
            newPrescription.setPatient(order.getPatient());
            newPrescription.setVspOrder(order);
            vspPrescriptionRepository.save(newPrescription);
        }

        if (request.getShippingDetails() != null) {
            populateShippingProfileIds(request.getShippingDetails(), order);
            VspShippingDetails shippingDetails = createVspShippingDetails(request.getShippingDetails());
            order.setShippingDetails(shippingDetails);
        }

        if (request.getBillingDetails() != null) {
            populateBillingProfileIds(request.getBillingDetails(), order);
            VspBillingDetails billingDetails = createVspBillingDetails(request.getBillingDetails());
            order.setBillingDetails(billingDetails);
        }
        order = vspOrderRepository.save(order);

        createChatForOrderIfNeeded(
                order.getPatient().getId(),
                pdo.getUserProfile().getId(),
                pdo.getAddedByUserProfile(),
                pdo.getUserProfile());

        return VspOrderResponse.from(order);
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

                participantIds.add(requestUserProfile.getInviterProfile().getId());
            }

            Patient patient = patientRepository
                    .findById(patientId)
                    .orElseThrow(() -> new GenericException("Patient not found with ID: " + patientId));

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

    @Transactional
    public void changeWorkflow(
            Patient patient,
            UserProfile userProfile,
            VspOrder order,
            String status,
            String workflowName,
            String currentWorkflowName) {
        patientTaskTrackerService.moveSingleTaskForVsp(
                MoveSingleTaskRequest.builder()
                        .workflowStausName(status)
                        .workflowName(workflowName)
                        .patientId(patient.getId())
                        .profileId(userProfile.getId())
                        .currentWorkflowName(currentWorkflowName)
                        .build(),
                order);
    }

    @Override
    @Transactional(readOnly = true)
    public VspOrderResponse getOrder(String orderId) {
        return VspOrderResponse.from(findOrder(orderId));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VspOrderResponse> getOrdersByPatient(Long patientId, Pageable pageable) {
        return vspOrderRepository.findAllByPatientId(patientId, pageable).map(VspOrderResponse::from);
    }

    @Override
    @Transactional
    public VspOrderResponse updateOrder(String orderId, UpdateVspOrderRequest request) {
        var order = findOrder(orderId);

        if (request.getServiceProductId() != null) {
            var product = serviceProductRepository
                    .findById(request.getServiceProductId())
                    .orElseThrow(() -> new ServiceProductNotFoundException(request.getServiceProductId()));
            order.setServiceProduct(product);
        }

        if (request.getReceiverProfileId() != null) {
            var assignedTo = userProfileRepository
                    .findById(request.getReceiverProfileId())
                    .orElseThrow(() -> new DoctorNotFoundException(request.getReceiverProfileId()));
            order.setAssignedToUserProfile(assignedTo);
        }

        if (request.getOralSurgeonName() != null) order.setOralSurgeonName(request.getOralSurgeonName());
        if (request.getOrthodontistName() != null) order.setOrthodontistName(request.getOrthodontistName());
        if (request.getNotesForLab() != null) order.setNotesForLab(request.getNotesForLab());

        if (request.getCaseRecordId() != null) {
            var existingCaseRecord = vspCaseRecordRepository
                    .findById(request.getCaseRecordId())
                    .orElseThrow(() -> new CaseRecordNotFoundException(request.getCaseRecordId()));

            if (!order.getCaseRecords().contains(existingCaseRecord)) {
                order.getCaseRecords().add(existingCaseRecord);
            }
            existingCaseRecord.setPatient(order.getPatient());
            existingCaseRecord.setVspOrder(order);
            vspCaseRecordRepository.save(existingCaseRecord);
        } else if (request.getCaseRecord() != null) {
            var newCaseRecord = buildCaseRecord(order, request.getCaseRecord());

            if (!order.getCaseRecords().contains(newCaseRecord)) {
                order.getCaseRecords().add(newCaseRecord);
            }
            newCaseRecord.setPatient(order.getPatient());
            newCaseRecord.setVspOrder(order);
            vspCaseRecordRepository.save(newCaseRecord);
        }

        if (request.getPrescriptionId() != null) {
            var existingPrescription = vspPrescriptionRepository
                    .findById(request.getPrescriptionId())
                    .orElseThrow(() -> new PrescriptionNotExitsException(request.getPrescriptionId()));
            existingPrescription.setPatient(order.getPatient());
            existingPrescription.setVspOrder(order);

            vspPrescriptionRepository.save(existingPrescription);

            if (!order.getPrescriptions().contains(existingPrescription)) {
                order.getPrescriptions().clear();
                order.getPrescriptions().add(existingPrescription);
            }
        } else if (request.getPrescription() != null) {
            var newPrescription = buildPrescription(order, request.getPrescription(), order.getPatient());

            order.getPrescriptions().clear();
            order.getPrescriptions().add(newPrescription);

            newPrescription.setPatient(order.getPatient());
            newPrescription.setVspOrder(order);
            vspPrescriptionRepository.save(newPrescription);
        }

        if (request.getShippingDetails() != null) {
            populateShippingProfileIds(request.getShippingDetails(), order);
            VspShippingDetails shippingDetails = createVspShippingDetails(request.getShippingDetails());
            order.setShippingDetails(shippingDetails);
        }

        if (request.getBillingDetails() != null) {
            populateBillingProfileIds(request.getBillingDetails(), order);
            VspBillingDetails billingDetails = createVspBillingDetails(request.getBillingDetails());
            order.setBillingDetails(billingDetails);
        }

        if (request.getStatus() != null) {
            order.setStatus(request.getStatus());
            if (request.getStatus().equals(VspOrderStatus.ORDERED)) {
                changeWorkflow(
                        order.getPatient(),
                        order.getAssignedToUserProfile(),
                        order,
                        TO_DO,
                        PLANNING_IN_HOUSE_WORKFLOW,
                        NEW_CASE);
            }
        }

        return VspOrderResponse.from(vspOrderRepository.save(order));
    }

    @Override
    @Transactional
    public VspOrderResponse updateOrderStatus(String orderId, VspOrderStatus status) {
        var order = findOrder(orderId);
        order.setStatus(status);
        order = vspOrderRepository.save(order);

        Long patientId = order.getPatient().getId();
        var createdBy = order.getCreatedByUserProfile();
        var targetProfile = order.getAssignedToUserProfile();

        switch (status) {
            case ORDERED -> {
                changeWorkflow(
                        order.getPatient(),
                        order.getAssignedToUserProfile(),
                        order,
                        TO_DO,
                        PLANNING_IN_HOUSE_WORKFLOW,
                        NEW_CASE);

                PatientDoctorOrganization patientDoctorOrganization = patientDoctorOrganizationRepository.findByPatient(
                        order.getPatient().getId());

                String practiceName = patientDoctorOrganization.getUserProfile().getPracticeName();
                String labName =
                        patientDoctorOrganization.getAddedByUserProfile().getLabName();

                timelineService.addEvent(
                        order.getPatient().getId(),
                        UserType.PATIENT,
                        targetProfile.getDoctor().getId(),
                        UserType.DOCTOR,
                        EventType.VSP_CASE_SUBMITTED,
                        new VspCaseSubmitEventMetadata(
                                order.getPatient().getId(),
                                order.getPatient().fullName(),
                                order.getId(),
                                labName,
                                practiceName),
                        targetProfile,
                        targetProfile.getOrganization());

                VspPrescription latestPrescription = VspPrescription.getLatestPrescription(order);
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

                VspCaseSubmittedEmailRequest emailRequest = VspCaseSubmittedEmailRequest.builder()
                        .product(order.getServiceProduct().getProductName())
                        .surgeryDate(surgeryDate)
                        .treatmentPlanInstructions(treatmentPlan)
                        .planNeededBy(planNeededBy)
                        .orthodontist(order.getOrthodontistName())
                        .oralSurgeon(order.getOralSurgeonName())
                        .caseStatus("CASE SUBMITTED")
                        .portalUrl(VspPortUrlResolver.getPortalUrl())
                        .patientName(patientDoctorOrganization.getPatient().fullName())
                        .daysToPlan(daysToPlan)
                        .customerName(patientDoctorOrganization
                                .getUserProfile()
                                .getUser()
                                .displayName())
                        .surgeryType(surgeryType)
                        .daysToSurgery(daysToSurgery)
                        .email(targetProfile.getUser().getEmail())
                        .orgName(OrgName.ROUTETOSMILE.name())
                        .build();

                String url = String.format("vsp-profile/%s/plans?order_id=%s", patientId, order.getId());
                vspNotificationService.sendWhatsAppSafely(
                        patientDoctorOrganization.getUserProfile(),
                        patientDoctorOrganization.getUserProfile() != null
                                        && patientDoctorOrganization
                                                        .getUserProfile()
                                                        .getUser()
                                                != null
                                ? patientDoctorOrganization
                                        .getUserProfile()
                                        .getUser()
                                        .getMobileNo()
                                : " ",
                        whatsappTemplateTypeProperties != null
                                        && whatsappTemplateTypeProperties.getVSP_CUSTOMER_CASE_SUBMITTED() != null
                                ? whatsappTemplateTypeProperties.getVSP_CUSTOMER_CASE_SUBMITTED()
                                : " ",
                        List.of(
                                patientDoctorOrganization.getUserProfile() != null
                                                && patientDoctorOrganization
                                                                .getUserProfile()
                                                                .getUser()
                                                        != null
                                        ? patientDoctorOrganization
                                                .getUserProfile()
                                                .getUser()
                                                .displayName()
                                        : " ",
                                patientDoctorOrganization.getPatient() != null
                                        ? patientDoctorOrganization.getPatient().fullName()
                                        : " ",
                                order.getServiceProduct() != null
                                        ? order.getServiceProduct().getProductName()
                                        : " ",
                                surgeryDate != null ? surgeryDate : " ",
                                planNeededBy != null ? planNeededBy : " ",
                                url != null ? url : " "));

                vspNotificationService.notifySafely(
                        "vsp-case-submitted-email",
                        () -> vspPlanningEmailService.sendVspCaseSubmittedEmail(emailRequest));
                vspNotificationService.sendWhatsAppSafely(
                        patientDoctorOrganization.getOrgUserProfile(),
                        patientDoctorOrganization.getOrgUserProfile() != null
                                        && patientDoctorOrganization
                                                        .getOrgUserProfile()
                                                        .getUser()
                                                != null
                                ? patientDoctorOrganization
                                        .getOrgUserProfile()
                                        .getUser()
                                        .getMobileNo()
                                : " ",
                        whatsappTemplateTypeProperties != null
                                        && whatsappTemplateTypeProperties.getVSP_LAB_NEW_CASE_RECEIVED() != null
                                ? whatsappTemplateTypeProperties.getVSP_LAB_NEW_CASE_RECEIVED()
                                : " ",
                        List.of(
                                patientDoctorOrganization.getOrgUserProfile() != null
                                                && patientDoctorOrganization
                                                                .getOrgUserProfile()
                                                                .getUser()
                                                        != null
                                        ? patientDoctorOrganization
                                                .getOrgUserProfile()
                                                .getUser()
                                                .displayName()
                                        : " ",
                                patientDoctorOrganization.getUserProfile() != null
                                                && patientDoctorOrganization
                                                                .getUserProfile()
                                                                .getUser()
                                                        != null
                                        ? patientDoctorOrganization
                                                .getUserProfile()
                                                .getUser()
                                                .displayName()
                                        : " ",
                                patientDoctorOrganization.getPatient() != null
                                        ? patientDoctorOrganization.getPatient().fullName()
                                        : " ",
                                order.getServiceProduct() != null
                                        ? order.getServiceProduct().getProductName()
                                        : " ",
                                order.getOralSurgeonName() != null ? order.getOralSurgeonName() : " ",
                                order.getOrthodontistName() != null ? order.getOrthodontistName() : " ",
                                surgeryType != null ? surgeryType : " ",
                                surgeryDate != null ? surgeryDate : " ",
                                url != null ? url : " "));
                vspCaseActivityLogger.logCaseSubmitted(order.getPatient(), patientDoctorOrganization.getUserProfile());
            }
            case NEED_MORE_INFO -> {
                changeWorkflow(
                        order.getPatient(),
                        order.getAssignedToUserProfile(),
                        order,
                        NEED_INFORMATION,
                        PLANNING_IN_HOUSE_WORKFLOW,
                        PLANNING_IN_HOUSE_WORKFLOW);
            }
            case COMPLETED -> {
                createFolder(order);
            }
            case SHIPPED -> {
                changeWorkflow(
                        order.getPatient(),
                        order.getAssignedToUserProfile(),
                        order,
                        SHIPPED,
                        PLAN_OUTSOURCED_WORKFLOW,
                        PLAN_OUTSOURCED_WORKFLOW);
            }
            case DELIVERED -> {
                changeWorkflow(
                        order.getPatient(),
                        order.getAssignedToUserProfile(),
                        order,
                        DELIVERED,
                        PLAN_OUTSOURCED_WORKFLOW,
                        PLAN_OUTSOURCED_WORKFLOW);
            }
            case APPROVED -> {
                changeWorkflow(
                        order.getPatient(),
                        order.getAssignedToUserProfile(),
                        order,
                        APPROVED,
                        PLANNING_IN_HOUSE_WORKFLOW,
                        PLANNING_IN_HOUSE_WORKFLOW);
            }

            case REQUEST_REVISION -> {
                changeWorkflow(
                        order.getPatient(),
                        order.getAssignedToUserProfile(),
                        order,
                        IN_REVISION,
                        PLANNING_IN_HOUSE_WORKFLOW,
                        PLANNING_IN_HOUSE_WORKFLOW);
            }

            case IN_REVIEW -> {
                changeWorkflow(
                        order.getPatient(),
                        order.getAssignedToUserProfile(),
                        order,
                        IN_REVIEW,
                        PLANNING_IN_HOUSE_WORKFLOW,
                        PLANNING_IN_HOUSE_WORKFLOW);
            }
            default -> {}
        }

        return VspOrderResponse.from(order);
    }

    private void createFolder(VspOrder order) {
        var doctorId = UserId.builder()
                .userId(order.getAssignedToUserProfile().getDoctor().getId())
                .userType(UserType.DOCTOR)
                .build();
        var patientId = UserId.builder()
                .userId(order.getPatient().getId())
                .userType(UserType.PATIENT)
                .build();

        driveAsyncHelper.createFolderHierarchiesAsync(
                List.of(CreateFolderHierarchyRequest.builder()
                        .path(Paths.get("/", TREATMENTS, STL_FILES).toString())
                        .uploader(patientId)
                        .owners(Set.of(doctorId, patientId))
                        .isPatientFolder(true)
                        .isDefaultFolder(true)
                        .build()),
                "VSP STL Files folder for patient " + order.getPatient().getId());
    }

    @Override
    @Transactional
    public VspCaseRecordResponse createAndAttachCaseRecord(String orderId, CreateCaseRecordRequest request) {
        UserProfile userProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        log.info("Creating CaseRecord for orderId={}", orderId);

        VspOrder order = null;
        if (orderId != null && !orderId.isEmpty() && !"null".equalsIgnoreCase(orderId)) {
            order = findOrder(orderId);
        }

        var caseRecord = buildCaseRecord(order, request);

        if (order != null && !order.getCaseRecords().contains(caseRecord)) {
            order.getCaseRecords().add(caseRecord);
            vspOrderRepository.save(order);
        }
        if (serviceConfigurationRepository.isVspPlanningUser(request.getProfileId())) {
            PatientDoctorOrganization pdo = patientDoctorOrganizationRepository.findByPatient(request.getPatientId());
            if (pdo.getUserProfile().equals(userProfile)) {
                String practiceName = pdo.getUserProfile().getPracticeName();
                String labName = pdo.getAddedByUserProfile().getLabName();
                timelineService.addEvent(
                        caseRecord.getPatient().getId(),
                        UserType.PATIENT,
                        pdo.getAddedByUserProfile().getDoctor().getId(),
                        UserType.DOCTOR,
                        EventType.VSP_FILES_UPLOADED,
                        new VspFileUploadedEventMetadata(
                                caseRecord.getPatient().getId(),
                                caseRecord.getPatient().fullName(),
                                labName,
                                practiceName),
                        pdo.getAddedByUserProfile(),
                        pdo.getAddedByUserProfile().getOrganization());
                vspPlanningEmailService.sendVspFilesUploadedEmail(VspFilesUploadedEmailRequest.builder()
                        .portalUrl(VspPortUrlResolver.getPortalUrl())
                        .patientName(pdo.getPatient().fullName())
                        .customerName(pdo.getUserProfile().getUser().displayName())
                        .email(pdo.getAddedByUserProfile().getUser().displayName())
                        .orgName(OrgName.ROUTETOSMILE.name())
                        .build());
                int fileCount = caseRecord.getDicomFiles().size()
                        + caseRecord.getExtraoralPhotoFiles().size()
                        + caseRecord.getIntraoralPhotoFiles().size()
                        + caseRecord.getIntraoralScanFiles().size()
                        + caseRecord.getStoneCastFiles().size()
                        + caseRecord.getRadioGrapFiles().size();
                vspCaseActivityLogger.logFilesUploaded(pdo.getPatient(), userProfile, fileCount);
            } else {
                String practiceName = pdo.getUserProfile().getPracticeName();
                String labName = pdo.getAddedByUserProfile().getLabName();
                timelineService.addEvent(
                        caseRecord.getPatient().getId(),
                        UserType.PATIENT,
                        pdo.getUserProfile().getDoctor().getId(),
                        UserType.DOCTOR,
                        EventType.VSP_FILES_UPLOADED,
                        new VspFileUploadedEventMetadata(
                                caseRecord.getPatient().getId(),
                                caseRecord.getPatient().fullName(),
                                labName,
                                practiceName));
                vspPlanningEmailService.sendVspFilesUploadedEmail(VspFilesUploadedEmailRequest.builder()
                        .portalUrl(VspPortUrlResolver.getPortalUrl())
                        .patientName(pdo.getPatient().fullName())
                        .customerName(pdo.getUserProfile().getUser().displayName())
                        .email(pdo.getUserProfile().getUser().getEmail())
                        .orgName(OrgName.ROUTETOSMILE.name())
                        .build());
                int fileCount = caseRecord.getDicomFiles().size()
                        + caseRecord.getExtraoralPhotoFiles().size()
                        + caseRecord.getIntraoralPhotoFiles().size()
                        + caseRecord.getIntraoralScanFiles().size()
                        + caseRecord.getStoneCastFiles().size()
                        + caseRecord.getRadioGrapFiles().size();
                vspCaseActivityLogger.logFilesUploaded(pdo.getPatient(), userProfile, fileCount);
            }
        }
        return VspCaseRecordResponse.from(caseRecord);
    }

    @Override
    @Transactional(readOnly = true)
    public VspCaseRecordResponse getCaseRecord(Long caseRecordId) {
        return VspCaseRecordResponse.from(findCaseRecord(caseRecordId));
    }

    @Override
    @Transactional
    public VspCaseRecordResponse updateCaseRecord(Long caseRecordId, UpdateCaseRecordRequest request) {
        var caseRecord = findCaseRecord(caseRecordId);

        if (request.getExtraoralPhotoFileIds() != null
                && !request.getExtraoralPhotoFileIds().isEmpty()) {
            caseRecord
                    .getExtraoralPhotoFiles()
                    .addAll(vspFileRepository.findAllById(request.getExtraoralPhotoFileIds()));
        }
        if (request.getIntraoralPhotoFileIds() != null
                && !request.getIntraoralPhotoFileIds().isEmpty()) {
            caseRecord
                    .getIntraoralPhotoFiles()
                    .addAll(vspFileRepository.findAllById(request.getIntraoralPhotoFileIds()));
        }
        if (request.getIntraoralScanFileIds() != null
                && !request.getIntraoralScanFileIds().isEmpty()) {
            caseRecord.getIntraoralScanFiles().addAll(vspFileRepository.findAllById(request.getIntraoralScanFileIds()));
        }
        if (request.getStoneCastFileIds() != null
                && !request.getStoneCastFileIds().isEmpty()) {
            caseRecord.getStoneCastFiles().addAll(vspFileRepository.findAllById(request.getStoneCastFileIds()));
        }
        if (request.getDicomFileIds() != null && !request.getDicomFileIds().isEmpty()) {
            caseRecord.getDicomFiles().addAll(vspFileRepository.findAllById(request.getDicomFileIds()));
        }
        if (request.getRadioGrapFileIds() != null
                && !request.getRadioGrapFileIds().isEmpty()) {
            caseRecord.getRadioGrapFiles().addAll(vspFileRepository.findAllById(request.getRadioGrapFileIds()));
        }
        if (request.getRemoveFileIds() != null && !request.getRemoveFileIds().isEmpty()) {
            var toRemove = vspFileRepository.findAllById(request.getRemoveFileIds());
            toRemove.forEach(caseRecord.getExtraoralPhotoFiles()::remove);
            toRemove.forEach(caseRecord.getIntraoralPhotoFiles()::remove);
            toRemove.forEach(caseRecord.getIntraoralScanFiles()::remove);
            toRemove.forEach(caseRecord.getStoneCastFiles()::remove);
            toRemove.forEach(caseRecord.getDicomFiles()::remove);
            toRemove.forEach(caseRecord.getRadioGrapFiles()::remove);
        }

        if (request.getExternalLinks() != null && !request.getExternalLinks().isEmpty()) {
            caseRecord.getExternalLinks().addAll(request.getExternalLinks());
        }

        var saved = vspCaseRecordRepository.save(caseRecord);

        return VspCaseRecordResponse.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VspCaseRecordResponse> getCaseRecordsByPatientId(Long patientId) {
        return vspCaseRecordRepository.findAllByPatientId(patientId).stream()
                .map(VspCaseRecordResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VspCaseRecordResponse> getCaseRecordsByOrderId(String orderId) {
        return vspCaseRecordRepository.findAllByVspOrderId(orderId).stream()
                .map(VspCaseRecordResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VspOrderStatusResponse getOrderStatus(String orderId) {
        if (orderId == null) {
            return VspOrderStatusResponse.builder().orderStatus(null).build();
        }

        VspOrderStatus status = vspOrderRepository
                .findById(orderId)
                .map(VspOrder::getStatus)
                .orElseThrow(() -> new GenericException("Order Status Not Found"));

        return VspOrderStatusResponse.builder().orderStatus(status).build();
    }

    @Override
    @Transactional
    public VspPrescriptionResponse createAndAttachPrescription(CreatePrescriptionRequest request) {
        log.info("Creating Prescription for orderId={}", request.getOrderId());
        var patient = patientRepository
                .findById(request.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException(request.getPatientId()));
        var prescription = buildPrescription(null, request, patient);
        return VspPrescriptionResponse.from(prescription);
    }

    @Override
    @Transactional(readOnly = true)
    public VspPrescriptionResponse getPrescription(Long prescriptionId) {
        return VspPrescriptionResponse.from(findPrescription(prescriptionId));
    }

    @Override
    @Transactional
    public VspPrescriptionResponse updatePrescription(CreatePrescriptionRequest request) {
        var prescription = findPrescription(request.getPrescriptionId());

        if (request.getPrescriptionMode() != null) prescription.setPrescriptionMode(request.getPrescriptionMode());
        if (request.getIsSingleJaw() != null) prescription.setIsSingleJaw(request.getIsSingleJaw());
        if (request.getIsBiJaw() != null) prescription.setIsBiJaw(request.getIsBiJaw());
        if (request.getIsUndecided() != null) prescription.setIsUndecided(request.getIsUndecided());
        if (request.getIsGenioplasty() != null) prescription.setIsGenioplasty(request.getIsGenioplasty());
        if (request.getIsOthers() != null) prescription.setIsOthers(request.getIsOthers());
        if (request.getOthersDescription() != null) prescription.setOthersDescription(request.getOthersDescription());
        if (request.getTreatmentPlan() != null) prescription.setTreatmentPlan(request.getTreatmentPlan());
        if (request.getTentativeSurgeryDate() != null)
            prescription.setTentativeSurgeryDate(request.getTentativeSurgeryDate());
        if (request.getEarliestTreatmentPlanByDate() != null)
            prescription.setEarliestTreatmentPlanByDate(request.getEarliestTreatmentPlanByDate());
        prescription.setStatus(VspPrescriptionStatus.SAVED);

        return VspPrescriptionResponse.from(vspPrescriptionRepository.save(prescription));
    }

    @Override
    @Transactional(readOnly = true)
    public List<VspPrescriptionResponse> getPrescriptionsByPatientId(Long patientId) {
        return vspPrescriptionRepository.findAllByPatientId(patientId).stream()
                .map(VspPrescriptionResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VspPrescriptionResponse> getPrescriptionsByOrderId(String orderId) {
        return vspPrescriptionRepository.findAllByVspOrderId(orderId).stream()
                .map(VspPrescriptionResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public VspTreatmentPlanResponse createTreatmentPlan(CreateTreatmentPlanRequest request) {
        log.info("Creating TreatmentPlan for orderId={}", request.getOrderId());
        var order = findOrder(request.getOrderId());

        var plan = VspTreatmentPlan.builder()
                .vspOrder(order)
                .planName(request.getPlanName())
                .planType(request.getPlanType())
                .planIndex(request.getPlanIndex())
                .labComments(request.getLabComments())
                .status(request.getStatus())
                .build();

        if (request.getPlanType() == VspTreatmentPlanType.SINGLE_PLAN
                && request.getSubPlans() != null
                && !request.getSubPlans().isEmpty()) {

            for (var subPlanReq : request.getSubPlans()) {
                var subPlan = VspTreatmentSubPlan.builder()
                        .treatmentPlan(plan)
                        .subPlanName(subPlanReq.getSubPlanName())
                        .subPlanIndex(subPlanReq.getSubPlanIndex())
                        .status(request.getStatus())
                        .build();
                plan.getSubPlans().add(subPlan);
            }
        }

        if (request.getAttachmentFileIds() != null
                && !request.getAttachmentFileIds().isEmpty()) {
            plan.getAttachmentFiles().addAll(vspFileRepository.findAllById(request.getAttachmentFileIds()));
        }

        plan = vspTreatmentPlanRepository.save(plan);
        order.getTreatmentPlans().add(plan);
        vspOrderRepository.save(order);

        if (request.getStatus().equals(VspTreatmentPlanStatus.SUBMITTED_TO_DOCTOR)
                && serviceConfigurationRepository.isVspPlanningUser(request.getProfileId())) {
            PatientDoctorOrganization pdo = patientDoctorOrganizationRepository.findByPatient(
                    order.getPatient().getId());
            String practiceName = pdo.getUserProfile().getPracticeName();
            String labName = pdo.getAddedByUserProfile().getLabName();
            String version = String.format("V%s", plan.getPlanIndex() + 1);
            timelineService.addEvent(
                    pdo.getPatient().getId(),
                    UserType.PATIENT,
                    pdo.getUserProfile().getDoctor().getId(),
                    UserType.DOCTOR,
                    EventType.VSP_PLAN_READY_FOR_REVIEW,
                    new VspPlanReadyForReviewEventMetadata(
                            pdo.getPatient().getId(),
                            pdo.getPatient().fullName(),
                            plan.getId(),
                            plan.getPlanName(),
                            version,
                            labName,
                            practiceName));

            VspPrescription latestPrescription = VspPrescription.getLatestPrescription(order);
            String surgeryDate = VspPrescription.formatDate(
                    latestPrescription != null ? latestPrescription.getTentativeSurgeryDate() : null);
            String daysToSurgery = VspPrescription.calculateDays(
                    latestPrescription != null ? latestPrescription.getTentativeSurgeryDate() : null);
            String surgeryType = VspPrescription.buildSurgeryType(latestPrescription);

            String options = plan.getPlanType() == VspTreatmentPlanType.SINGLE_PLAN
                    ? plan.getSubPlans().stream()
                            .map(VspTreatmentSubPlan::getSubPlanName)
                            .collect(Collectors.joining(", "))
                    : plan.getPlanName();

            VspPlanReadyEmailRequest emailRequest = VspPlanReadyEmailRequest.builder()
                    .product(order.getServiceProduct().getProductName())
                    .surgeryDate(surgeryDate)
                    .orthodontist(order.getOrthodontistName())
                    .planOptions(options)
                    .planName(plan.getPlanName())
                    .userEmailId(pdo.getUserProfile().getUser().getEmail())
                    .orthodontist(order.getOrthodontistName())
                    .oralSurgeon(order.getOralSurgeonName())
                    .caseStatus("SUBMITTED TO DOCTOR")
                    .portalUrl(VspPortUrlResolver.getPortalUrl())
                    .patientName(pdo.getPatient().fullName())
                    .customerName(pdo.getUserProfile().getUser().displayName())
                    .surgeryType(surgeryType)
                    .daysToSurgery(daysToSurgery)
                    .email(pdo.getUserProfile().getUser().getEmail())
                    .labRemarks(plan.getLabComments() != null ? plan.getLabComments() : null)
                    .planStatus("PLAN READY")
                    .orgName(OrgName.ROUTETOSMILE.name())
                    .build();

            vspCaseActivityLogger.logPlanReady(
                    pdo.getPatient(), pdo.getAddedByUserProfile(), plan.getPlanName(), version);

            vspNotificationService.notifySafely(
                    "vsp-plan-ready-email", () -> vspPlanningEmailService.sendVspPlanReadyEmail(emailRequest));
            String url = String.format(
                    "vsp-profile/%s/plans?order_id=%s", pdo.getPatient().getId(), order.getId());
            vspNotificationService.sendWhatsAppSafely(
                    pdo.getUserProfile(),
                    pdo.getUserProfile() != null && pdo.getUserProfile().getUser() != null
                            ? pdo.getUserProfile().getUser().getMobileNo()
                            : " ",
                    whatsappTemplateTypeProperties != null
                                    && whatsappTemplateTypeProperties.getVSP_CUSTOMER_PLAN_READY_FOR_REVIEW() != null
                            ? whatsappTemplateTypeProperties.getVSP_CUSTOMER_PLAN_READY_FOR_REVIEW()
                            : " ",
                    List.of(
                            pdo.getPatient() != null ? pdo.getPatient().fullName() : " ",
                            plan.getPlanName() != null ? plan.getPlanName() : " ",
                            options != null ? options : " ",
                            plan.getLabComments() != null ? plan.getLabComments() : " ",
                            "PLAN READY",
                            url != null ? url : " "));
        }
        return VspTreatmentPlanResponse.from(plan);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VspTreatmentPlanResponse> getTreatmentPlansByOrder(String orderId) {
        return vspTreatmentPlanRepository.findAllByVspOrderIdOrderByPlanIndexDesc(orderId).stream()
                .map(VspTreatmentPlanResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public VspTreatmentPlanResponse updateTreatmentPlan(Long planId, UpdateTreatmentPlanRequest request) {
        var plan = findTreatmentPlan(planId);

        if (request.getPlanName() != null) plan.setPlanName(request.getPlanName());
        if (request.getLabComments() != null) plan.setLabComments(request.getLabComments());
        if (request.getStatus() != null) plan.setStatus(request.getStatus());

        if (request.getAttachmentFileIds() != null
                && !request.getAttachmentFileIds().isEmpty()) {
            plan.getAttachmentFiles().addAll(vspFileRepository.findAllById(request.getAttachmentFileIds()));
        }

        if (request.getRemoveAttachmentFileIds() != null
                && !request.getRemoveAttachmentFileIds().isEmpty()) {
            var toRemove = vspFileRepository.findAllById(request.getRemoveAttachmentFileIds());
            toRemove.forEach(plan.getAttachmentFiles()::remove);
        }

        if (request.getSubPlanStatusUpdates() != null
                && !request.getSubPlanStatusUpdates().isEmpty()) {
            var statusUpdateMap = request.getSubPlanStatusUpdates().stream()
                    .collect(Collectors.toMap(
                            UpdateTreatmentPlanRequest.SubPlanStatusUpdate::getSubPlanId,
                            UpdateTreatmentPlanRequest.SubPlanStatusUpdate::getStatus));

            plan.getSubPlans().forEach(subPlan -> {
                var newStatus = statusUpdateMap.get(subPlan.getId());
                if (newStatus != null) {
                    subPlan.setStatus(newStatus);
                }
            });
        }

        plan = vspTreatmentPlanRepository.save(plan);

        if (request.getStatus() != null) {
            var order = plan.getVspOrder();
            String version = String.format("V%s", plan.getPlanIndex() + 1);

            if (request.getStatus().equals(VspTreatmentPlanStatus.DOCTOR_REVISION_REQUESTED)) {
                String note = request.getLabComments() != null ? request.getLabComments() : "";
                if (serviceConfigurationRepository.isVspPlanningUser(request.getProfileId())) {
                    PatientDoctorOrganization pdo = patientDoctorOrganizationRepository.findByPatient(
                            plan.getVspOrder().getPatient().getId());
                    String practiceName = pdo.getUserProfile().getPracticeName();
                    String labName = pdo.getAddedByUserProfile().getLabName();
                    timelineService.addEvent(
                            pdo.getPatient().getId(),
                            UserType.PATIENT,
                            pdo.getAddedByUserProfile().getDoctor().getId(),
                            UserType.DOCTOR,
                            EventType.VSP_REVISION_REQUESTED,
                            new VspRevisionRequestedEventMetadata(
                                    pdo.getPatient().getId(),
                                    pdo.getPatient().fullName(),
                                    plan.getId(),
                                    plan.getPlanName(),
                                    version,
                                    labName,
                                    practiceName),
                            pdo.getAddedByUserProfile(),
                            pdo.getAddedByUserProfile().getOrganization());

                    VspPrescription latestPrescription = VspPrescription.getLatestPrescription(order);
                    String surgeryDate = VspPrescription.formatDate(
                            latestPrescription != null ? latestPrescription.getTentativeSurgeryDate() : null);
                    String daysToSurgery = VspPrescription.calculateDays(
                            latestPrescription != null ? latestPrescription.getTentativeSurgeryDate() : null);
                    String surgeryType = VspPrescription.buildSurgeryType(latestPrescription);

                    String revisionRequestTarget = plan.getPlanType() == VspTreatmentPlanType.SINGLE_PLAN
                            ? plan.getSubPlans().stream()
                                    .filter(sp -> sp.getStatus() == VspTreatmentPlanStatus.DOCTOR_REVISION_REQUESTED)
                                    .map(VspTreatmentSubPlan::getSubPlanName)
                                    .collect(Collectors.joining(", "))
                            : plan.getPlanName();

                    VspRevisionRequestedEmailRequest emailRequest = VspRevisionRequestedEmailRequest.builder()
                            .product(order.getServiceProduct().getProductName())
                            .surgeryDate(surgeryDate)
                            .orthodontist(order.getOrthodontistName())
                            .planName(plan.getPlanName())
                            .userEmailId(pdo.getAddedByUserProfile().getUser().getEmail())
                            .orthodontist(order.getOrthodontistName())
                            .oralSurgeon(order.getOralSurgeonName())
                            .caseStatus("DOCTOR REVISION REQUESTED")
                            .portalUrl(VspPortUrlResolver.getPortalUrl())
                            .patientName(pdo.getPatient().fullName())
                            .customerName(pdo.getUserProfile().getUser().displayName())
                            .surgeryType(surgeryType)
                            .daysToSurgery(daysToSurgery)
                            .email(pdo.getAddedByUserProfile().getUser().getEmail())
                            .planStatus("REVISION REQUESTED")
                            .orgName(OrgName.ROUTETOSMILE.name())
                            .revisionRequestTarget(revisionRequestTarget)
                            .customerRemarks(plan.getLabComments() != null ? plan.getLabComments() : null)
                            .build();

                    vspNotificationService.notifySafely(
                            "vsp-revision-requested-email",
                            () -> vspPlanningEmailService.sendVspRevisionRequestedEmail(emailRequest));
                    String url = String.format(
                            "vsp-profile/%s/plans?order_id=%s", pdo.getPatient().getId(), order.getId());
                    vspNotificationService.sendWhatsAppSafely(
                            pdo.getOrgUserProfile(),
                            pdo.getOrgUserProfile() != null
                                            && pdo.getOrgUserProfile().getUser() != null
                                    ? pdo.getOrgUserProfile().getUser().getMobileNo()
                                    : " ",
                            whatsappTemplateTypeProperties != null
                                            && whatsappTemplateTypeProperties.getVSP_LAB_REVISION_REQUESTED() != null
                                    ? whatsappTemplateTypeProperties.getVSP_LAB_REVISION_REQUESTED()
                                    : " ",
                            List.of(
                                    pdo.getOrgUserProfile() != null
                                                    && pdo.getOrgUserProfile().getUser() != null
                                            ? pdo.getOrgUserProfile().getUser().displayName()
                                            : " ",
                                    pdo.getUserProfile() != null
                                                    && pdo.getUserProfile().getUser() != null
                                            ? pdo.getUserProfile().getUser().displayName()
                                            : " ",
                                    pdo.getPatient() != null ? pdo.getPatient().fullName() : " ",
                                    order.getServiceProduct() != null
                                            ? order.getServiceProduct().getProductName()
                                            : " ",
                                    order.getOralSurgeonName() != null ? order.getOralSurgeonName() : " ",
                                    order.getOrthodontistName() != null ? order.getOrthodontistName() : " ",
                                    surgeryType != null ? surgeryType : " ",
                                    surgeryDate != null ? surgeryDate : " ",
                                    url != null ? url : " "));
                    vspCaseActivityLogger.logRevisionRequested(
                            pdo.getPatient(), pdo.getUserProfile(), plan.getPlanName(), version, note);
                }
            } else if (request.getStatus() == VspTreatmentPlanStatus.DOCTOR_APPROVED) {
                if (serviceConfigurationRepository.isVspPlanningUser(request.getProfileId())) {
                    PatientDoctorOrganization pdo = patientDoctorOrganizationRepository.findByPatient(
                            plan.getVspOrder().getPatient().getId());
                    String practiceName = pdo.getUserProfile().getPracticeName();
                    String labName = pdo.getAddedByUserProfile().getLabName();
                    timelineService.addEvent(
                            pdo.getPatient().getId(),
                            UserType.PATIENT,
                            pdo.getAddedByUserProfile().getDoctor().getId(),
                            UserType.DOCTOR,
                            EventType.VSP_PLAN_APPROVED,
                            new VspPlanApprovedEventMetadata(
                                    pdo.getPatient().getId(),
                                    pdo.getPatient().fullName(),
                                    plan.getId(),
                                    plan.getPlanName(),
                                    version,
                                    labName,
                                    practiceName),
                            pdo.getAddedByUserProfile(),
                            pdo.getAddedByUserProfile().getOrganization());

                    VspPrescription latestPrescription = VspPrescription.getLatestPrescription(order);
                    String surgeryDate = VspPrescription.formatDate(
                            latestPrescription != null ? latestPrescription.getTentativeSurgeryDate() : null);
                    String daysToSurgery = VspPrescription.calculateDays(
                            latestPrescription != null ? latestPrescription.getTentativeSurgeryDate() : null);
                    String surgeryType = VspPrescription.buildSurgeryType(latestPrescription);

                    String options = plan.getPlanType() == VspTreatmentPlanType.SINGLE_PLAN
                            ? plan.getSubPlans().stream()
                                    .filter(sp -> sp.getStatus() == VspTreatmentPlanStatus.DOCTOR_APPROVED)
                                    .map(VspTreatmentSubPlan::getSubPlanName)
                                    .collect(Collectors.joining(", "))
                            : plan.getPlanName();

                    VspPlanApprovedEmailRequest emailRequest = VspPlanApprovedEmailRequest.builder()
                            .product(order.getServiceProduct().getProductName())
                            .surgeryDate(surgeryDate)
                            .orthodontist(order.getOrthodontistName())
                            .planName(plan.getPlanName())
                            .userEmailId(pdo.getAddedByUserProfile().getUser().getEmail())
                            .approvedOption(options)
                            .orthodontist(order.getOrthodontistName())
                            .oralSurgeon(order.getOralSurgeonName())
                            .caseStatus("DOCTOR APPROVED")
                            .portalUrl(VspPortUrlResolver.getPortalUrl())
                            .patientName(pdo.getPatient().fullName())
                            .customerName(pdo.getUserProfile().getUser().displayName())
                            .surgeryType(surgeryType)
                            .daysToSurgery(daysToSurgery)
                            .email(pdo.getAddedByUserProfile().getUser().getEmail())
                            .planStatus("PLAN APPROVED")
                            .orgName(OrgName.ROUTETOSMILE.name())
                            .build();

                    vspNotificationService.notifySafely(
                            "vsp-plan-approved-email",
                            () -> vspPlanningEmailService.sendVspPlanApprovedEmail(emailRequest));
                    String url = String.format(
                            "vsp-profile/%s/plans?order_id=%s", pdo.getPatient().getId(), order.getId());
                    vspNotificationService.sendWhatsAppSafely(
                            pdo.getOrgUserProfile(),
                            pdo.getOrgUserProfile() != null
                                            && pdo.getOrgUserProfile().getUser() != null
                                    ? pdo.getOrgUserProfile().getUser().getMobileNo()
                                    : " ",
                            whatsappTemplateTypeProperties != null
                                            && whatsappTemplateTypeProperties.getVSP_LAB_PLAN_APPROVED() != null
                                    ? whatsappTemplateTypeProperties.getVSP_LAB_PLAN_APPROVED()
                                    : " ",
                            List.of(
                                    pdo.getOrgUserProfile() != null
                                                    && pdo.getOrgUserProfile().getUser() != null
                                            ? pdo.getOrgUserProfile().getUser().displayName()
                                            : " ",
                                    pdo.getUserProfile() != null
                                                    && pdo.getUserProfile().getUser() != null
                                            ? pdo.getUserProfile().getUser().displayName()
                                            : " ",
                                    pdo.getPatient() != null ? pdo.getPatient().fullName() : " ",
                                    order.getServiceProduct() != null
                                            ? order.getServiceProduct().getProductName()
                                            : " ",
                                    order.getOralSurgeonName() != null ? order.getOralSurgeonName() : " ",
                                    order.getOrthodontistName() != null ? order.getOrthodontistName() : " ",
                                    surgeryType != null ? surgeryType : " ",
                                    surgeryDate != null ? surgeryDate : " ",
                                    url != null ? url : " "));

                    vspNotificationService.sendWhatsAppSafely(
                            pdo.getUserProfile(),
                            pdo.getUserProfile() != null && pdo.getUserProfile().getUser() != null
                                    ? pdo.getUserProfile().getUser().getMobileNo()
                                    : " ",
                            whatsappTemplateTypeProperties != null
                                            && whatsappTemplateTypeProperties.getVSP_CUSTOMER_PLAN_APPROVED() != null
                                    ? whatsappTemplateTypeProperties.getVSP_CUSTOMER_PLAN_APPROVED()
                                    : " ",
                            List.of(
                                    pdo.getUserProfile() != null
                                                    && pdo.getUserProfile().getUser() != null
                                            ? pdo.getUserProfile().getUser().displayName()
                                            : " ",
                                    pdo.getPatient() != null ? pdo.getPatient().fullName() : " ",
                                    plan.getPlanName() != null ? plan.getPlanName() : " ",
                                    options != null ? options : " ",
                                    "PLAN APPROVED",
                                    url != null ? url : " "));
                    vspCaseActivityLogger.logPlanApproved(
                            pdo.getPatient(), pdo.getUserProfile(), plan.getPlanName(), version);
                } else if (request.getStatus().equals(VspTreatmentPlanStatus.SUBMITTED_TO_DOCTOR)) {
                    PatientDoctorOrganization pdo = patientDoctorOrganizationRepository.findByPatient(
                            order.getPatient().getId());
                    String practiceName = pdo.getUserProfile().getPracticeName();
                    String labName = pdo.getUserProfile().getLabName();
                    timelineService.addEvent(
                            pdo.getPatient().getId(),
                            UserType.PATIENT,
                            pdo.getUserProfile().getDoctor().getId(),
                            UserType.DOCTOR,
                            EventType.VSP_PLAN_READY_FOR_REVIEW,
                            new VspPlanReadyForReviewEventMetadata(
                                    pdo.getPatient().getId(),
                                    pdo.getPatient().fullName(),
                                    plan.getId(),
                                    plan.getPlanName(),
                                    version,
                                    labName,
                                    practiceName));

                    VspPrescription latestPrescription = VspPrescription.getLatestPrescription(order);
                    String surgeryDate = VspPrescription.formatDate(
                            latestPrescription != null ? latestPrescription.getTentativeSurgeryDate() : null);
                    String daysToSurgery = VspPrescription.calculateDays(
                            latestPrescription != null ? latestPrescription.getTentativeSurgeryDate() : null);
                    String surgeryType = VspPrescription.buildSurgeryType(latestPrescription);

                    String options = plan.getPlanType() == VspTreatmentPlanType.SINGLE_PLAN
                            ? plan.getSubPlans().stream()
                                    .map(VspTreatmentSubPlan::getSubPlanName)
                                    .collect(Collectors.joining(", "))
                            : plan.getPlanName();

                    VspPlanReadyEmailRequest emailRequest = VspPlanReadyEmailRequest.builder()
                            .product(order.getServiceProduct().getProductName())
                            .surgeryDate(surgeryDate)
                            .orthodontist(order.getOrthodontistName())
                            .planOptions(options)
                            .planName(plan.getPlanName())
                            .userEmailId(pdo.getUserProfile().getUser().getEmail())
                            .orthodontist(order.getOrthodontistName())
                            .oralSurgeon(order.getOralSurgeonName())
                            .caseStatus("SUBMITTED TO DOCTOR")
                            .portalUrl(VspPortUrlResolver.getPortalUrl())
                            .patientName(pdo.getPatient().fullName())
                            .customerName(pdo.getUserProfile().getUser().displayName())
                            .surgeryType(surgeryType)
                            .daysToSurgery(daysToSurgery)
                            .email(pdo.getUserProfile().getUser().getEmail())
                            .labRemarks(plan.getLabComments() != null ? plan.getLabComments() : null)
                            .planStatus("PLAN READY")
                            .orgName(OrgName.ROUTETOSMILE.name())
                            .build();

                    vspCaseActivityLogger.logPlanReady(
                            pdo.getPatient(), pdo.getOrgUserProfile(), plan.getPlanName(), version);

                    vspNotificationService.notifySafely(
                            "vsp-plan-ready-email", () -> vspPlanningEmailService.sendVspPlanReadyEmail(emailRequest));
                    String url = String.format(
                            "vsp-profile/%s/plans?order_id=%s", pdo.getPatient().getId(), order.getId());
                    vspNotificationService.sendWhatsAppSafely(
                            pdo.getUserProfile(),
                            pdo.getUserProfile() != null && pdo.getUserProfile().getUser() != null
                                    ? pdo.getUserProfile().getUser().getMobileNo()
                                    : " ",
                            whatsappTemplateTypeProperties != null
                                            && whatsappTemplateTypeProperties.getVSP_CUSTOMER_PLAN_READY_FOR_REVIEW()
                                                    != null
                                    ? whatsappTemplateTypeProperties.getVSP_CUSTOMER_PLAN_READY_FOR_REVIEW()
                                    : " ",
                            List.of(
                                    pdo.getPatient() != null ? pdo.getPatient().fullName() : " ",
                                    plan.getPlanName() != null ? plan.getPlanName() : " ",
                                    options != null ? options : " ",
                                    plan.getLabComments() != null ? plan.getLabComments() : " ",
                                    "PLAN READY",
                                    url != null ? url : " "));
                }
            }
        }

        return VspTreatmentPlanResponse.from(plan);
    }

    @Override
    @Transactional
    public VspTreatmentPlanResponse submitTreatmentPlanToDoctor(Long planId) {
        var plan = findTreatmentPlan(planId);
        plan.setStatus(VspTreatmentPlanStatus.SUBMITTED_TO_DOCTOR);
        plan = vspTreatmentPlanRepository.save(plan);
        return VspTreatmentPlanResponse.from(plan);
    }

    @Override
    @Transactional
    public void deleteTreatmentPlan(Long planId) {
        var plan = findTreatmentPlan(planId);
        vspTreatmentPlanRepository.delete(plan);
    }

    @Override
    @Transactional(readOnly = true)
    public VspPatientDetailsV3 getPatientDetailsV3(PatientGetRequest request) {
        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());
        var requestUserProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

        if (adminWithDefaultTag && requestUserProfile.getInviterProfile() != null) {
            var inviterProfile = requestUserProfile.getInviterProfile();
            request.setProfileId(inviterProfile.getId());
            request.setDoctorId(inviterProfile.getId());
            request.setOrganizationId(inviterProfile.getId());
        }

        var patient = patientDoctorOrganizationRepository
                .getPatientByProfileId(request.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException(request.getProfileId()));

        Optional<VspOrderIdAndStatus> activeOrderOptional;
        if (requestUserProfile.isEnterprise()) {
            activeOrderOptional =
                    vspOrderRepository.findLatestActiveVspOrderByPatientExcludingDraft(request.getPatientId());
        } else {
            activeOrderOptional =
                    vspOrderRepository.findLatestActiveVspOrderByPatientIncludingDraft(request.getPatientId());
        }

        var archivedOrderIds = vspOrderRepository.findArchivedVspOrderIdsByPatient(request.getPatientId());

        Optional<Long> invitationId =
                patientInvitationDetailsRepository.findInvitationIdByPatientId(request.getDoctorId());

        Invitation invitation =
                invitationId.flatMap(invitationRepository::findById).orElse(null);

        var chatIds = doctorChatRepository.findChatIdsByPatientId(request.getPatientId());

        String orderId = activeOrderOptional.map(VspOrderIdAndStatus::getId).orElse(null);

        VspOrderStatus orderStatus =
                activeOrderOptional.map(VspOrderIdAndStatus::getStatus).orElse(null);

        VspProductionIdAndStatus productionResult = orderId != null
                ? vspProductionRepository
                        .findLatestIdAndStatusByOrderId(orderId)
                        .orElse(null)
                : null;

        String productionId = productionResult != null ? productionResult.getId() : null;
        VspProductionStatus productionStatus = productionResult != null ? productionResult.getStatus() : null;
        return VspPatientDetailsV3.newPatientList(
                patient, invitation, orderId, orderStatus, archivedOrderIds, chatIds, productionStatus, productionId);
    }

    @Override
    @Transactional(readOnly = true)
    public VspMiniDashboardDetailsResponse getMiniDashboardDetails(VspMiniDashboardRequest request) {
        Long profileId = request.getProfileId();
        Long customerProfileId = request.getCustomerProfileId();
        var ownerProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                .orElseThrow(() -> new UserNotFoundException(request.getProfileId()));

        var isAdminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());

        if (isAdminWithDefaultTag && ownerProfile.getInviterProfile() != null) {
            ownerProfile = ownerProfile.getInviterProfile();
            profileId = ownerProfile.getId();
            updateToOwnerProfile(ownerProfile, request);
        }

        VspMiniDashboardDetailsResponse response =
                VspMiniDashboardDetailsResponse.builder().build();

        customerAccessAndRevokeRepository
                .findByProfileIdAndOrganizationId(
                        request.getCustomerProfileId(),
                        ownerProfile.getOrganization().getId())
                .ifPresent(c -> {
                    response.setCustomerTrackingEnabled(c.getIsTrackingEnabled());
                    response.setCustomerStlFileViewEnabled(c.getIsStlFileViewEnabled());
                    response.setCustomerPrintFileViewEnabled(c.getIsPrintFileViewEnabled());
                    response.setCustomerScanFileViewEnabled(c.getIsScanFileViewEnabled());
                });

        Long totalPatients = patientDoctorOrganizationRepository.countDistinctPatients(
                customerProfileId, profileId, ownerProfile.getOrganization().getId());

        Long totalOrders = vspOrderRepository.countByAssignedToUserProfileId(customerProfileId, profileId);

        LocalDateTime lastOrderAt = vspOrderRepository.findLastOrderDate(customerProfileId, profileId);

        response.setTotalPatients(totalPatients);
        response.setTotalCustomerOrders(totalOrders);
        response.setLastOrderAt(lastOrderAt);

        var patientPagination = request.getPagination().getPatientPagination();

        Pageable patientPageable = PageRequest.of(
                patientPagination.getPageNo().intValue(),
                patientPagination.getPageSize().intValue(),
                getPatientSort(request));

        Page<PatientDoctorOrganization> patientPage = patientDoctorOrganizationRepository.findPatientsForDashboard(
                customerProfileId, profileId, ownerProfile.getOrganization().getId(), patientPageable);

        List<VspMiniDashboardDetailsResponse.PatientInfo> patientInfoList = patientPage.getContent().stream()
                .map(pdo -> VspMiniDashboardDetailsResponse.PatientInfo.builder()
                        .patientId(pdo.getPatient().getId())
                        .patientUUID(pdo.getPatient().getCustomerMappedId())
                        .patientName(pdo.getPatient().fullName())
                        .createdBy(pdo.getAddedByUserProfile().getUser().displayName())
                        .build())
                .toList();

        response.setVspPatientDetails(VspMiniDashboardDetailsResponse.VspPatientDetails.builder()
                .patientInfoList(patientInfoList)
                .paginationDetails(PaginationDetails.builder()
                        .pageNumber(patientPage.getNumber())
                        .pageSize(patientPage.getSize())
                        .totalPatients(Math.toIntExact(patientPage.getTotalElements()))
                        .totalPages(patientPage.getTotalPages())
                        .hasNext(patientPage.hasNext())
                        .hasPrevious(patientPage.hasPrevious())
                        .build())
                .build());

        var orderPagination = request.getPagination().getOrderPagination();

        Pageable orderPageable = PageRequest.of(
                orderPagination.getPageNo().intValue(),
                orderPagination.getPageSize().intValue(),
                getOrderSort(request));

        Page<VspOrder> orderPage =
                vspOrderRepository.findOrdersForDashboard(customerProfileId, profileId, orderPageable);

        List<VspMiniDashboardDetailsResponse.OrderInfo> orderInfoList = orderPage.getContent().stream()
                .map(order -> VspMiniDashboardDetailsResponse.OrderInfo.builder()
                        .patientId(order.getPatient().getId())
                        .patientUUID(order.getPatient().getCustomerMappedId())
                        .patientName(order.getPatient().fullName())
                        .orderId(order.getId())
                        .serviceProductName(Optional.ofNullable(order.getServiceProduct())
                                .map(ServiceProduct::getProductName)
                                .orElse(null))
                        .orderType("VSP ORDER")
                        .createdOn(order.getCreatedAt())
                        .build())
                .toList();

        response.setVspOrderDetails(VspMiniDashboardDetailsResponse.VspOrderDetails.builder()
                .orderInfoList(orderInfoList)
                .paginationDetails(PaginationDetails.builder()
                        .pageNumber(orderPage.getNumber())
                        .pageSize(orderPage.getSize())
                        .totalPatients(Math.toIntExact(orderPage.getTotalElements()))
                        .totalPages(orderPage.getTotalPages())
                        .hasNext(orderPage.hasNext())
                        .hasPrevious(orderPage.hasPrevious())
                        .build())
                .build());

        return response;
    }

    private void updateToOwnerProfile(UserProfile requestProfile, VspMiniDashboardRequest request) {
        request.setProfileId(requestProfile.getId());
    }

    private Sort getOrderSort(VspMiniDashboardRequest request) {
        String field =
                switch (request.getOrderSortBy()) {
                    case ORDER_ID -> "id";
                    case PRODUCT_NAME -> "serviceProduct.productName";
                    case DATE -> "createdAt";
                    default -> "createdAt";
                };

        return request.getOrderBy() == VspMiniDashboardRequest.OrderBy.ASC
                ? Sort.by(field).ascending()
                : Sort.by(field).descending();
    }

    private Sort getPatientSort(VspMiniDashboardRequest request) {
        String field =
                switch (request.getPatientSortBy()) {
                    case PATIENT_NAME -> "patient.firstName";
                    case CREATED_BY -> "addedByUserProfile.user.firstName";
                    default -> "patient.firstName";
                };

        return request.getOrderBy() == VspMiniDashboardRequest.OrderBy.ASC
                ? Sort.by(field).ascending()
                : Sort.by(field).descending();
    }

    private VspOrder findOrder(String orderId) {
        return vspOrderRepository
                .findById(orderId)
                .orElseThrow(() -> new GenericException("VspOrder not found: " + orderId));
    }

    private VspCaseRecord findCaseRecord(Long id) {
        return vspCaseRecordRepository
                .findById(id)
                .orElseThrow(() -> new GenericException("VspCaseRecord not found: " + id));
    }

    private VspPrescription findPrescription(Long id) {
        return vspPrescriptionRepository
                .findById(id)
                .orElseThrow(() -> new GenericException("VspPrescription not found: " + id));
    }

    private VspTreatmentPlan findTreatmentPlan(Long id) {
        return vspTreatmentPlanRepository
                .findById(id)
                .orElseThrow(() -> new GenericException("VspTreatmentPlan not found: " + id));
    }

    private VspCaseRecord buildCaseRecord(@Nullable VspOrder order, CreateCaseRecordRequest request) {
        var caseRecord = VspCaseRecord.builder()
                .vspOrder(order)
                .recordSelectionMode(request.getRecordSelectionMode())
                .status(VspCaseRecordStatus.DRAFT)
                .build();

        var patient = patientRepository
                .findById(request.getPatientId())
                .orElseThrow(() -> new GenericException("Patient not found with ID: " + request.getPatientId()));

        if (request.getExtraoralPhotoFileIds() != null
                && !request.getExtraoralPhotoFileIds().isEmpty()) {
            caseRecord
                    .getExtraoralPhotoFiles()
                    .addAll(vspFileRepository.findAllById(request.getExtraoralPhotoFileIds()));
        }
        if (request.getIntraoralPhotoFileIds() != null
                && !request.getIntraoralPhotoFileIds().isEmpty()) {
            caseRecord
                    .getIntraoralPhotoFiles()
                    .addAll(vspFileRepository.findAllById(request.getIntraoralPhotoFileIds()));
        }
        if (request.getIntraoralScanFileIds() != null
                && !request.getIntraoralScanFileIds().isEmpty()) {
            caseRecord.getIntraoralScanFiles().addAll(vspFileRepository.findAllById(request.getIntraoralScanFileIds()));
        }
        if (request.getStoneCastFileIds() != null
                && !request.getStoneCastFileIds().isEmpty()) {
            caseRecord.getStoneCastFiles().addAll(vspFileRepository.findAllById(request.getStoneCastFileIds()));
        }
        if (request.getDicomFileIds() != null && !request.getDicomFileIds().isEmpty()) {
            caseRecord.getDicomFiles().addAll(vspFileRepository.findAllById(request.getDicomFileIds()));
        }
        if (request.getRadioGrapFileIds() != null
                && !request.getRadioGrapFileIds().isEmpty()) {
            caseRecord.getRadioGrapFiles().addAll(vspFileRepository.findAllById(request.getRadioGrapFileIds()));
        }
        if (request.getExternalLinks() != null && !request.getExternalLinks().isEmpty()) {
            caseRecord.getExternalLinks().addAll(request.getExternalLinks());
        }
        caseRecord.setPatient(patient);

        return vspCaseRecordRepository.save(caseRecord);
    }

    private VspPrescription buildPrescription(
            @Nullable VspOrder order, CreatePrescriptionRequest request, Patient patient) {
        var prescription = VspPrescription.builder()
                .vspOrder(order)
                .prescriptionMode(request.getPrescriptionMode())
                .isSingleJaw(request.getIsSingleJaw())
                .isBiJaw(request.getIsBiJaw())
                .isUndecided(request.getIsUndecided())
                .isGenioplasty(request.getIsGenioplasty())
                .isOthers(request.getIsOthers())
                .othersDescription(request.getOthersDescription())
                .treatmentPlan(request.getTreatmentPlan())
                .tentativeSurgeryDate(request.getTentativeSurgeryDate())
                .earliestTreatmentPlanByDate(request.getEarliestTreatmentPlanByDate())
                .status(VspPrescriptionStatus.DRAFT)
                .patient(patient)
                .build();

        return vspPrescriptionRepository.save(prescription);
    }

    private void populateShippingProfileIds(CreateVspShippingDetailsRequest req, VspOrder order) {
        if (req.getProfileId() == null && order.getAssignedToUserProfile() != null) {
            req.setProfileId(order.getAssignedToUserProfile().getId());
        }
        if (req.getCustomerProfileId() == null && order.getCreatedByUserProfile() != null) {
            req.setCustomerProfileId(order.getCreatedByUserProfile().getId());
        }
    }

    private void populateBillingProfileIds(CreateVspBillingDetailsRequest req, VspOrder order) {
        if (req.getProfileId() == null && order.getAssignedToUserProfile() != null) {
            req.setProfileId(order.getAssignedToUserProfile().getId());
        }
        if (req.getCustomerProfileId() == null && order.getCreatedByUserProfile() != null) {
            req.setCustomerProfileId(order.getCreatedByUserProfile().getId());
        }
    }

    private VspShippingDetails createVspShippingDetails(CreateVspShippingDetailsRequest request) {
        VspShippingDetailsResponse response = vspShippingDetailsService.createShippingDetails(request);
        return vspShippingDetailsRepository
                .findById(response.getShippingId())
                .orElseThrow(() -> new RuntimeException("Shipping details not found after creation"));
    }

    private VspBillingDetails createVspBillingDetails(CreateVspBillingDetailsRequest request) {
        VspBillingDetailsResponse response = vspBillingDetailsService.createBillingDetails(request);
        return vspBillingDetailsRepository
                .findById(response.getBillingId())
                .orElseThrow(() -> new RuntimeException("Billing details not found after creation"));
    }
}
