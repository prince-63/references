package com.dentalstack.patient.feature.workflow.core.task_tracker.service;

import com.dentalstack.patient.application.config.WhatsappTemplateTypeProperties;
import com.dentalstack.patient.feature.aligner.dto.AlignerInfo;
import com.dentalstack.patient.feature.aligner.dto.UnprocessedAlignerResponse;
import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.aligner.service.UnprocessedAlignerService;
import com.dentalstack.patient.feature.doctor.entity.PatientDoctorOrganization;
import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.doctor.enums.ProfileType;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.flag.dto.FlagDetailsResponse;
import com.dentalstack.patient.feature.flag.entity.Flag;
import com.dentalstack.patient.feature.flag.repository.FlagRepository;
import com.dentalstack.patient.feature.mcp.PatientTaskTrackerResponseForMcp;
import com.dentalstack.patient.feature.notification.dto.SendNotificationRequest;
import com.dentalstack.patient.feature.notification.dto.WhatsAppRequestBuilder;
import com.dentalstack.patient.feature.notification.dto.vsp.VspCaseAssignedEmailRequest;
import com.dentalstack.patient.feature.notification.enums.MessageSendTo;
import com.dentalstack.patient.feature.notification.enums.OrgName;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.notification.service.VspNotificationService;
import com.dentalstack.patient.feature.notification.service.VspPlanningEmailService;
import com.dentalstack.patient.feature.notification.util.WhatsAppUtilities;
import com.dentalstack.patient.feature.notification.util.XOrganizationNameResolver;
import com.dentalstack.patient.feature.order.dto.CreateManufacturingRequest;
import com.dentalstack.patient.feature.order.dto.OrderCommentsResponse;
import com.dentalstack.patient.feature.order.entity.ManufacturingBatch;
import com.dentalstack.patient.feature.order.entity.Order;
import com.dentalstack.patient.feature.order.entity.OrderComments;
import com.dentalstack.patient.feature.order.enums.OrderStatus;
import com.dentalstack.patient.feature.order.enums.OrderTreatmentPlanStatus;
import com.dentalstack.patient.feature.order.enums.OrderType;
import com.dentalstack.patient.feature.order.exception.ManufacturingNotFoundException;
import com.dentalstack.patient.feature.order.exception.OrderException;
import com.dentalstack.patient.feature.order.projection.ManufacturingBatchSummary;
import com.dentalstack.patient.feature.order.repository.ManufacturingRepository;
import com.dentalstack.patient.feature.order.repository.OrderCommentsRepository;
import com.dentalstack.patient.feature.order.repository.OrderRepository;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.exception.ForbiddenException;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.storage.drive.GDrivePlatformProvider;
import com.dentalstack.patient.feature.storage.drive.service.GoogleDriveService;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.storage.files.enums.HasShared;
import com.dentalstack.patient.feature.storage.files.repository.FileRepository;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.CaseAssignedToYouEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.vsp.VspCaseAssignedEventMetadata;
import com.dentalstack.patient.feature.timeline.service.TimelineService;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.dentalstack.patient.feature.treatment.projection.TreatmentPlanSummary;
import com.dentalstack.patient.feature.treatment.repository.TreatmentPlanRepository;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.vsp.dto.summary.VspOrderIdAndStatus;
import com.dentalstack.patient.feature.vsp.entity.VspOrder;
import com.dentalstack.patient.feature.vsp.entity.VspPrescription;
import com.dentalstack.patient.feature.vsp.repository.VspOrderRepository;
import com.dentalstack.patient.feature.vsp.util.VspPortUrlResolver;
import com.dentalstack.patient.feature.workflow.activity.dto.ActivityRequest;
import com.dentalstack.patient.feature.workflow.activity.enums.ActivityType;
import com.dentalstack.patient.feature.workflow.activity.enums.VisibilityScope;
import com.dentalstack.patient.feature.workflow.activity.mapper.ActivityStatusMapper;
import com.dentalstack.patient.feature.workflow.activity.service.ActivityLogService;
import com.dentalstack.patient.feature.workflow.core.task_tracker.dto.*;
import com.dentalstack.patient.feature.workflow.core.task_tracker.entity.PatientTaskTracker;
import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.*;
import com.dentalstack.patient.feature.workflow.core.task_tracker.exception.*;
import com.dentalstack.patient.feature.workflow.core.task_tracker.mapper.PatientTaskTrackerCreate;
import com.dentalstack.patient.feature.workflow.core.task_tracker.projection.CancelledPatientTaskTrackerProjection;
import com.dentalstack.patient.feature.workflow.core.task_tracker.projection.PatientTaskTrackerProjection;
import com.dentalstack.patient.feature.workflow.core.task_tracker.repository.PatientTaskTrackerRepository;
import com.dentalstack.patient.feature.workflow.core.workflows.dto.WorkflowCountResponse;
import com.dentalstack.patient.feature.workflow.core.workflows.entity.Workflow;
import com.dentalstack.patient.feature.workflow.core.workflows.entity.WorkflowStatus;
import com.dentalstack.patient.feature.workflow.core.workflows.exception.WorkStatusFlowNotFoundException;
import com.dentalstack.patient.feature.workflow.core.workflows.exception.WorkflowNotFoundException;
import com.dentalstack.patient.feature.workflow.core.workflows.projection.LabelCountProjection;
import com.dentalstack.patient.feature.workflow.core.workflows.projection.OngoingTaskCountProjection;
import com.dentalstack.patient.feature.workflow.core.workflows.projection.WorkflowCountProjection;
import com.dentalstack.patient.feature.workflow.core.workflows.repository.WorkflowRepository;
import com.dentalstack.patient.feature.workflow.core.workflows.repository.WorkflowStatusRepository;
import com.dentalstack.patient.feature.workflow.core.workflows.service.notification.WorkflowManagementNotificationService;
import com.dentalstack.patient.feature.workflow.product.entity.ServiceProduct;
import com.dentalstack.patient.feature.workflow.product.exception.ServiceProductNotFoundException;
import com.dentalstack.patient.feature.workflow.product.repository.ServiceProductRepository;
import com.dentalstack.patient.feature.workflow.service_configuration.repository.ServiceConfigurationRepository;
import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import com.dentalstack.patient.global.enums.ProductTypeName;
import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.GenericException;
import com.dentalstack.patient.global.utils.InternalUserProfileUtil;
import com.dentalstack.patient.global.utils.StringUtil;
import com.dentalstack.patient.global.utils.UserProfileUtil;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientTaskTrackerServiceImpl implements PatientTaskTrackerService {
    private final PatientTaskTrackerRepository patientTaskTrackerRepository;
    private final PatientRepository patientRepository;
    private final UserProfileRepository userProfileRepository;
    private final WorkflowRepository workflowRepository;
    private final WorkflowStatusRepository workflowStatusRepository;
    private final OrderRepository orderRepository;
    private final TreatmentPlanRepository treatmentPlanRepository;
    private final ManufacturingRepository manufacturingRepository;
    private final UnprocessedAlignerService unprocessedAlignerService;
    private final ActivityLogService activityLogService;
    private final ChatService chatService;
    private final TimelineService timelineService;
    private final FlagRepository flagRepository;
    private final WorkflowManagementNotificationService notificationService;
    private final UserProfileUtil userProfileUtil;
    private final OrderCommentsRepository orderCommentsRepository;
    private final WhatsappTemplateTypeProperties whatsappTemplateTypeProperties;
    private final GDrivePlatformProvider gDrivePlatformProvider;
    private final FileRepository fileRepository;
    private final GoogleDriveService googleDriveService;
    private final ServiceProductRepository serviceProductRepository;
    private final WhatsAppUtilities whatsAppUtilities;
    private final WhatsAppRequestBuilder whatsAppRequestBuilder;
    private final ServiceConfigurationRepository serviceConfigurationRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final VspPlanningEmailService vspPlanningEmailService;
    private final VspNotificationService vspNotificationService;
    private final VspOrderRepository vspOrderRepository;
    private final XOrganizationNameResolver xOrganizationNameResolver;

    public static final String PRODUCTION_IN_HOUSE_WORKFLOW = "Production In House";
    public static final String PRODUCTION_OUTSOURCE_WORKFLOW = "Production Outsource";
    public static final String PACKAGED = "Packaged";
    private static final String COMPLETED = "COMPLETED";

    public static final String NEW_CASE = "New Case";
    public static final String ONGOING_PRODUCT_LIST = "ONGOING PRODUCT LIST";
    public static final String CANCELLED = "CANCELLED";

    public static final String IN_PROGRESS = "In Progress";
    public static final String ALIGNER_ORDER_TYPE = "ALIGNER";
    public static final String PLAN_OUTSOURCED_WORKFLOW = "Plan Outsourced";
    public static final String PLANNING_IN_HOUSE_WORKFLOW = "Planning In House";
    public static final String NEED_INFORMATION = "Need Information";
    public static final String IN_REVISION = "In Revision";
    public static final String TO_DO = "TO DO";
    public static final String APPROVED = "Approved";
    public static final String IN_REVIEW = "In Review";

    public static final String DELIVERED = "Delivered";
    public static final String SHIPPED = "Shipped";

    @Override
    @Transactional
    public PatientTaskTrackerResponse createPatientTaskTracker(CreatePatientTaskTrackerRequestDto request) {

        Patient patient = patientRepository
                .findById(request.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException(request.getPatientId()));

        UserProfile createdByProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

        Workflow workflow = workflowRepository
                .findById(request.getWorkflowId())
                .orElseThrow(() -> new WorkflowNotFoundException(request.getWorkflowId()));

        WorkflowStatus initialStatus = workflowStatusRepository
                .findById(request.getInitialWorkflowStatusId())
                .orElseThrow(() -> new WorkStatusFlowNotFoundException(request.getInitialWorkflowStatusId()));

        UserProfile assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userProfileRepository
                    .findByIdWithOrgAndDoctor(request.getAssigneeId())
                    .orElseThrow(() -> new DoctorNotFoundException(request.getAssigneeId()));
        }

        PatientTaskTracker patientTaskTracker = PatientTaskTracker.createPatientTask(
                patient, createdByProfile, workflow, initialStatus, request, assignee);
        if (request.getParentTaskTrackerId() != null) {
            var parentTask = patientTaskTrackerRepository
                    .findById(request.getParentTaskTrackerId())
                    .orElseThrow(() -> new PatientTaskNotFoundException(request.getParentTaskTrackerId()));
            patientTaskTracker.setParentTask(parentTask);
        }

        PatientTaskTracker saved = patientTaskTrackerRepository.save(patientTaskTracker);

        return PatientTaskTracker.buildPatientTaskResponse(saved);
    }

    @Override
    @Transactional
    public PatientTaskTrackerResponse updatePatientTaskTracker(UpdatePatientTaskTrackerRequestDto request) {

        PatientTaskTracker existing = patientTaskTrackerRepository
                .findByIdWithUserProfilesAndUsers(request.getTaskId())
                .orElseThrow(() -> new PatientTaskNotFoundException(request.getOrganizationId()));

        if (request.getAssigneeId() != null) {
            UserProfile assignee = userProfileRepository
                    .findByIdWithOrgAndDoctor(request.getAssigneeId())
                    .orElseThrow(() -> new DoctorNotFoundException(request.getAssigneeId()));
            existing.setAssignee(assignee);

            chatService.sendNotification(SendNotificationRequest.builder()
                    .title("Case assigned")
                    .message(String.format(
                            "%s has been assigned to you.",
                            existing.getPatient().getFirstName()))
                    .notificationIndex(142)
                    .email(assignee.getUser().getEmail())
                    .mobile(assignee.getUser().getMobileNo())
                    .isDoctorApp(true)
                    .patientId(existing.getPatient().getId())
                    .xOrgName(xOrganizationNameResolver
                            .resolveFromUser(assignee.getUser())
                            .getXOrgName())
                    .organizationId(xOrganizationNameResolver
                            .resolveFromUser(assignee.getUser())
                            .getOrganizationId())
                    .build());

            if (serviceConfigurationRepository.isVspPlanningUser(assignee.getId())) {
                PatientDoctorOrganization patientDoctorOrganization = patientDoctorOrganizationRepository.findByPatient(
                        existing.getPatient().getId());
                String practiceName = patientDoctorOrganization.getUserProfile().getPracticeName();
                String labName =
                        patientDoctorOrganization.getAddedByUserProfile().getLabName();
                timelineService.addEvent(
                        existing.getPatient().getId(),
                        UserType.PATIENT,
                        assignee.getDoctor().getId(),
                        UserType.DOCTOR,
                        EventType.VSP_CASE_ASSIGNED,
                        new VspCaseAssignedEventMetadata(
                                existing.getPatient().getId(),
                                existing.getPatient().fullName(),
                                labName,
                                practiceName),
                        assignee,
                        assignee.getOrganization());

                Optional<VspOrderIdAndStatus> VspOrderIdAndStatus =
                        vspOrderRepository.findLatestActiveVspOrderByPatientExcludingDraft(
                                existing.getPatient().getId());

                VspOrderIdAndStatus.flatMap(vos -> vspOrderRepository.findById(vos.getId()))
                        .ifPresent(vspOrder -> {
                            VspPrescription latestPrescription = VspPrescription.getLatestPrescription(vspOrder);
                            String surgeryDate = VspPrescription.formatDate(
                                    latestPrescription != null ? latestPrescription.getTentativeSurgeryDate() : null);
                            String planNeededBy = VspPrescription.formatDate(
                                    latestPrescription != null
                                            ? latestPrescription.getEarliestTreatmentPlanByDate()
                                            : null);
                            String daysToSurgery = VspPrescription.calculateDays(
                                    latestPrescription != null ? latestPrescription.getTentativeSurgeryDate() : null);
                            String daysToPlan = VspPrescription.calculateDays(
                                    latestPrescription != null
                                            ? latestPrescription.getEarliestTreatmentPlanByDate()
                                            : null);
                            String surgeryType = VspPrescription.buildSurgeryType(latestPrescription);
                            String treatmentPlan =
                                    latestPrescription != null ? latestPrescription.getTreatmentPlan() : null;

                            VspCaseAssignedEmailRequest emailRequest = VspCaseAssignedEmailRequest.builder()
                                    .product(vspOrder.getServiceProduct().getProductName())
                                    .assignedUserName(assignee.getUser().displayName())
                                    .surgeryDate(surgeryDate)
                                    .treatmentPlanInstructions(treatmentPlan)
                                    .planNeededBy(planNeededBy)
                                    .orthodontist(vspOrder.getOrthodontistName())
                                    .oralSurgeon(vspOrder.getOralSurgeonName())
                                    .caseStatus(StringUtil.toReadable(
                                            vspOrder.getStatus().name()))
                                    .portalUrl(VspPortUrlResolver.getPortalUrl())
                                    .patientName(existing.getPatient().fullName())
                                    .daysToPlan(daysToPlan)
                                    .customerName(patientDoctorOrganization
                                            .getUserProfile()
                                            .getUser()
                                            .displayName())
                                    .surgeryType(surgeryType)
                                    .daysToSurgery(daysToSurgery)
                                    .email(assignee.getUser().getEmail())
                                    .orgName(OrgName.ROUTETOSMILE.name())
                                    .build();

                            vspNotificationService.notifySafely(
                                    "vsp-case-assigned-email",
                                    () -> vspPlanningEmailService.sendVspCaseAssignedEmail(emailRequest));

                            String url = String.format(
                                    "vsp-profile/%s/plans?order_id=%s",
                                    existing.getPatient().getId(), vspOrder.getId());
                            vspNotificationService.sendWhatsAppSafely(
                                    assignee,
                                    assignee != null && assignee.getUser() != null
                                            ? assignee.getUser().getMobileNo()
                                            : " ",
                                    whatsappTemplateTypeProperties != null
                                                    && whatsappTemplateTypeProperties.getVSP_LAB_CASE_ASSIGNED() != null
                                            ? whatsappTemplateTypeProperties.getVSP_LAB_CASE_ASSIGNED()
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
                                            existing.getPatient() != null
                                                    ? existing.getPatient().fullName()
                                                    : " ",
                                            vspOrder.getServiceProduct() != null
                                                    ? vspOrder.getServiceProduct()
                                                            .getProductName()
                                                    : " ",
                                            vspOrder.getOralSurgeonName() != null ? vspOrder.getOralSurgeonName() : " ",
                                            vspOrder.getOrthodontistName() != null
                                                    ? vspOrder.getOrthodontistName()
                                                    : " ",
                                            surgeryType != null ? surgeryType : " ",
                                            surgeryDate != null ? surgeryDate : " ",
                                            url != null ? url : " "));
                        });
            } else {
                timelineService.addEvent(
                        existing.getPatient().getId(),
                        UserType.PATIENT,
                        assignee.getDoctor().getId(),
                        UserType.DOCTOR,
                        EventType.CASE_ASSIGNED_TO_YOU,
                        new CaseAssignedToYouEventMetadata(
                                existing.getPatient().getId(),
                                existing.getPatient().fullName()),
                        assignee,
                        assignee.getOrganization());
            }

            if ((whatsAppUtilities.isSupperAdmin(request.getProfileId())
                            || whatsAppUtilities.isAdmin(request.getProfileId()))
                    && !serviceConfigurationRepository.isVspPlanningUser(request.getProfileId())) {
                List<String> numbers = whatsAppUtilities.resolveMobileNumberOfSpecificUser(
                        existing.getPatient().getId(), List.of(MessageSendTo.ASSIGNED_USER), existing.getId());
                OrgName orgName = whatsAppUtilities.resolveOrgName(request.getProfileId());
                String url = "profile/" + existing.getPatient().getId();
                numbers.forEach((no) -> {
                    whatsAppRequestBuilder
                            .buildRequestIfMobileExists(
                                    true,
                                    orgName,
                                    no,
                                    whatsappTemplateTypeProperties.getCASE_ASSIGNED(),
                                    List.of(existing.getPatient().fullName(), existing.getCurrentStatusName(), url))
                            .ifPresent(chatService::sendWhatsAppMessage);
                });
            }

            if (assignee.isInternalUser()
                    && assignee.getUser().getEmail() != null
                    && assignee.getInviterProfile() != null) {
                UserProfile invitorProfile = assignee.getInviterProfile();
                boolean isEnabled = gDrivePlatformProvider.isGDrivePlatformEnabled(
                        invitorProfile.getDoctor().getId(), invitorProfile.getId());

                if (isEnabled) {
                    List<File> files =
                            gDrivePlatformProvider.findFilesForPatientOrdersOrDocumentsAndImages(existing.getPatient());
                    if (files != null && !files.isEmpty()) {
                        for (File file : files) {
                            try {
                                googleDriveService.shareFile(
                                        invitorProfile.getId(),
                                        file.getFullPath(),
                                        List.of(assignee.getUser().getEmail()),
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

        if (request.getWorkflowStatusId() != null) {
            WorkflowStatus newStatus = workflowStatusRepository
                    .findById(request.getWorkflowStatusId())
                    .orElseThrow(() -> new WorkStatusFlowNotFoundException(request.getWorkflowStatusId()));

            existing.setPreviousWorkflowStatusId(
                    existing.getCurrentWorkflowStatus().getId());
            existing.setCurrentWorkflowStatus(newStatus);
            existing.setCurrentStatusName(newStatus.getName());
            existing.setWorkflowPosition(newStatus.getPosition());
        }

        if (request.getPriorityLevel() != null) existing.setPriorityLevel(request.getPriorityLevel());
        if (request.getLabels() != null) existing.setLabels(request.getLabels());
        if (request.getEstimatedCompletionDate() != null)
            existing.setEstimatedCompletionDate(request.getEstimatedCompletionDate());
        if (request.getSequenceNumber() != null) existing.setSequenceNumber(request.getSequenceNumber());
        if (request.getIsActive() != null) existing.setIsActive(request.getIsActive());
        if (request.getIsArchived() != null) existing.setIsArchived(request.getIsArchived());
        if (request.getCompletionDate() != null) existing.setCompletionDate(request.getCompletionDate());
        if (request.getMetadata() != null) existing.setMetadata(request.getMetadata());
        if (request.getManufacturingProducts() != null) {
            existing.setManufacturingProducts(request.getManufacturingProducts());
        }
        if (request.getPlanningCaseType() != null) {
            existing.setPlanningCaseType(request.getPlanningCaseType());
        }

        patientTaskTrackerRepository.save(existing);

        return PatientTaskTracker.buildPatientTaskResponse(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientTaskTrackerResponse> getAllPatientTaskTrackers(PatientTaskTrackerRequest request) {

        var requestProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        var isAdminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());

        if (isAdminWithDefaultTag && requestProfile.getInviterProfile() != null) {
            var inviterProfile = requestProfile.getInviterProfile();
            updateToOwnerProfile(inviterProfile, request);
        }
        List<PatientTaskTracker> taskTrackers = patientTaskTrackerRepository.findByOrgIdAndProfileIdWithOptionalFilters(
                request.getOrganizationId(), request.getProfileId(), request.getWorkflowName(), request.getOrderType());

        return taskTrackers.stream()
                .map(this::getPatientTaskResponseWithManufacturing)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PatientTaskTrackerResponseWithPagination getOngoingProductionList(PatientTaskTrackerRequest request) {
        int pageNumber = request.getPageNumber() != null ? request.getPageNumber() : 0;
        int pageSize = request.getPageSize() != null ? request.getPageSize() : 20;

        Pageable pageable;
        var requestProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        var isAdminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());

        if (isAdminWithDefaultTag && requestProfile.getInviterProfile() != null) {
            var inviterProfile = requestProfile.getInviterProfile();
            updateToOwnerProfile(inviterProfile, request);
        }

        if (request.getSort().equals(PatientTaskTrackerSortFilter.DUE_DATE)) {
            pageable = PageRequest.of(
                    pageNumber, pageSize, Sort.by("estimated_completion_date").descending());
        } else if (request.getSort().equals(PatientTaskTrackerSortFilter.PATIENT_NAME)) {
            pageable =
                    PageRequest.of(pageNumber, pageSize, Sort.by("p.first_name").ascending());
        } else {
            pageable =
                    PageRequest.of(pageNumber, pageSize, Sort.by("updated_at").descending());
        }

        List<PatientTaskTracker> taskTrackers = patientTaskTrackerRepository.findOngoingProductFilters(
                request.getOrganizationId(),
                request.getProfileId(),
                request.getWorkflowName(),
                request.getOrderType(),
                request.getProductIds(),
                request.getAssigneeIds(),
                request.getFilterByLabelName(),
                request.getSearch(),
                pageable);

        long totalCount = patientTaskTrackerRepository.countByOrgIdAndProfileIdWithOptionalFilters(
                request.getOrganizationId(),
                request.getProfileId(),
                request.getWorkflowName(),
                request.getOrderType(),
                request.getProductIds(),
                request.getAssigneeIds(),
                request.getFilterByLabelName(),
                request.getSearch());

        var orgProfileId = userProfileUtil.getOrgProfileId(request.getProfileId());
        List<LabelCountProjection> labelCountProjections = orgProfileId != null
                ? patientTaskTrackerRepository.findOngoingProductLabelCountsFiltersWithOrgProfileId(
                        request.getOrganizationId(),
                        request.getProfileId(),
                        orgProfileId,
                        request.getWorkflowName(),
                        request.getOrderType(),
                        request.getProductIds(),
                        request.getAssigneeIds(),
                        request.getSearch())
                : patientTaskTrackerRepository.findOngoingProductLabelCountsFilters(
                        request.getOrganizationId(),
                        request.getProfileId(),
                        request.getWorkflowName(),
                        request.getOrderType(),
                        request.getProductIds(),
                        request.getAssigneeIds(),
                        request.getSearch());

        List<LabelCountResponse> labelCounts = labelCountProjections.stream()
                .map(projection -> LabelCountResponse.builder()
                        .labelName(projection.getLabelName())
                        .count(projection.getCount())
                        .build())
                .collect(Collectors.toList());

        int totalPages = (int) Math.ceil((double) totalCount / pageSize);

        PaginationDetails paginationDetails = PaginationDetails.builder()
                .pageNumber(pageNumber)
                .pageSize(pageSize)
                .totalPatients((int) totalCount)
                .totalPages(totalPages)
                .hasNext(pageNumber < totalPages - 1)
                .hasPrevious(pageNumber > 0)
                .build();

        List<PatientTaskTrackerResponse> taskResponses = taskTrackers.stream()
                .map(PatientTaskTracker::buildPatientTaskResponse)
                .collect(Collectors.toList());

        List<Flag> flags = flagRepository.findByUserProfileId(request.getProfileId());

        return PatientTaskTrackerResponseWithPagination.builder()
                .paginationDetails(paginationDetails)
                .tasks(taskResponses)
                .labelCounts(labelCounts)
                .flags(flags.stream().map(FlagDetailsResponse::from).collect(Collectors.toList()))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientTaskTrackerResponse> getIndividualPatientTasks(IndividualPatientTaskRequest request) {
        var requestProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        var isAdminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());

        if (isAdminWithDefaultTag && requestProfile.getInviterProfile() != null) {
            var inviterProfile = requestProfile.getInviterProfile();
            updateToOwnerProfile(inviterProfile, request);
        }
        List<PatientTaskTracker> taskTrackers =
                patientTaskTrackerRepository.findIndividualPatientTaskByProfileIdByWorkflowFilter(
                        request.getOrganizationId(),
                        request.getProfileId(),
                        request.getPatientId(),
                        request.getWorkflowName());

        List<Long> primaryTaskIds =
                taskTrackers.stream().map(PatientTaskTracker::getId).toList();
        Map<Long, List<Long>> childTaskIdsByParentTaskId = primaryTaskIds.isEmpty()
                ? Collections.emptyMap()
                : patientTaskTrackerRepository.findChildTaskIdMappingsByParentTaskIds(primaryTaskIds).stream()
                        .collect(Collectors.groupingBy(
                                row -> ((Number) row[0]).longValue(),
                                Collectors.mapping(row -> ((Number) row[1]).longValue(), Collectors.toList())));

        Set<Long> relatedTaskIds = new LinkedHashSet<>(primaryTaskIds);
        for (PatientTaskTracker task : taskTrackers) {
            if (task.getParentTask() != null) {
                relatedTaskIds.add(task.getParentTask().getId());
            }
        }
        childTaskIdsByParentTaskId.values().forEach(relatedTaskIds::addAll);

        Map<Long, List<OrderCommentsResponse>> commentsByTaskId = getCommentsByTaskIds(new ArrayList<>(relatedTaskIds));
        Map<Long, UnprocessedAlignerResponse> manufacturingResponseByTreatmentPlanId =
                getManufacturingResponsesByTreatmentPlanId(taskTrackers);
        PatientDoctorOrganization patientDoctorOrganization =
                patientDoctorOrganizationRepository.findByPatient(request.getPatientId());
        boolean customerProfileExists = !Objects.equals(
                request.getProfileId(),
                patientDoctorOrganization.getUserProfile().getId());

        return taskTrackers.stream()
                .map(task -> {
                    PatientTaskTrackerResponse response =
                            getPatientTaskResponseWithManufacturing(task, manufacturingResponseByTreatmentPlanId);

                    List<OrderCommentsResponse> allComments =
                            new ArrayList<>(commentsByTaskId.getOrDefault(task.getId(), Collections.emptyList()));

                    if (task.getParentTask() != null) {
                        allComments.addAll(commentsByTaskId.getOrDefault(
                                task.getParentTask().getId(), Collections.emptyList()));
                    }

                    List<Long> childTaskIds =
                            childTaskIdsByParentTaskId.getOrDefault(task.getId(), Collections.emptyList());
                    for (Long childTaskId : childTaskIds) {
                        allComments.addAll(commentsByTaskId.getOrDefault(childTaskId, Collections.emptyList()));
                    }

                    allComments = allComments.stream().distinct().collect(Collectors.toList());

                    response.setComments(allComments);
                    response.setCustomerProfileExists(customerProfileExists);
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientTaskTrackerResponseForMcp> getPatientTasksBySearch(IndividualPatientTaskRequest request) {
        var requestProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

        var isAdminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());

        if (isAdminWithDefaultTag && requestProfile.getInviterProfile() != null) {
            var inviterProfile = requestProfile.getInviterProfile();
            updateToOwnerProfile(inviterProfile, request);
        }
        List<PatientTaskTracker> taskTrackers =
                patientTaskTrackerRepository.findIndividualPatientTaskByProfileIdAndPatientDetails(
                        request.getOrganizationId(), request.getProfileId(), request.getQuery());

        return taskTrackers.stream()
                .map(PatientTaskTrackerResponseForMcp::buildPatientTaskResponse)
                .collect(Collectors.toList());
    }

    private Map<Long, List<OrderCommentsResponse>> getCommentsByTaskIds(List<Long> taskIds) {
        if (taskIds.isEmpty()) {
            return new HashMap<>();
        }

        List<OrderComments> comments = orderCommentsRepository.findByTaskIdIn(taskIds);

        return comments.stream()
                .map(this::convertToOrderCommentResponse)
                .collect(Collectors.groupingBy(OrderCommentsResponse::getTaskId));
    }

    private Map<Long, UnprocessedAlignerResponse> getManufacturingResponsesByTreatmentPlanId(
            List<PatientTaskTracker> taskTrackers) {
        List<Long> treatmentPlanIds = taskTrackers.stream()
                .map(task -> Optional.ofNullable(task.getManufacturingBatch())
                        .map(ManufacturingBatch::getTreatmentPlan)
                        .map(TreatmentPlan::getId)
                        .orElse(null))
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        if (treatmentPlanIds.isEmpty()) {
            return Collections.emptyMap();
        }

        List<TreatmentPlanSummary> treatmentPlanSummaries =
                treatmentPlanRepository.findTreatmentPlanSummariesByIds(treatmentPlanIds);

        Map<Long, UnprocessedAlignerResponse> manufacturingResponseByTreatmentPlanId = new HashMap<>();
        for (TreatmentPlanSummary treatmentPlanSummary : treatmentPlanSummaries) {
            try {
                manufacturingResponseByTreatmentPlanId.put(
                        treatmentPlanSummary.getId(),
                        unprocessedAlignerService.mapToUnprocessedAlignerResponse(treatmentPlanSummary));
            } catch (Exception e) {
                manufacturingResponseByTreatmentPlanId.put(treatmentPlanSummary.getId(), null);
            }
        }

        return manufacturingResponseByTreatmentPlanId;
    }

    private OrderCommentsResponse convertToOrderCommentResponse(OrderComments comment) {
        return OrderCommentsResponse.builder()
                .taskId(comment.getTaskId())
                .notes(comment.getNotes())
                .remark(comment.getRemark())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public PatientTaskTracker createNextManufacturingTask(
            UserProfile userProfile,
            ManufacturingBatch manufacturingBatch,
            CreateManufacturingRequest request,
            TaskType taskType,
            UserProfile assigneeProfile,
            PatientTaskTracker parentTask,
            ServiceProduct serviceProduct) {

        String workflowName = taskType.equals(TaskType.IN_HOUSE_MANUFACTURING)
                ? PRODUCTION_IN_HOUSE_WORKFLOW
                : PRODUCTION_OUTSOURCE_WORKFLOW;

        Workflow workflow = workflowRepository
                .findByNameAndOrderTypeAndUserIdAndNotSystemDefined(
                        workflowName, ALIGNER_ORDER_TYPE, userProfile.getId())
                .orElseThrow(() -> new WorkflowNotFoundException(workflowName));

        WorkflowStatus initialStatus;
        if (taskType.equals(TaskType.IN_HOUSE_MANUFACTURING)) {
            initialStatus = workflowStatusRepository
                    .findByWorkflowIdAndStatusNameAndCustomFalse(workflow.getId(), TO_DO)
                    .orElseThrow(() -> new WorkStatusFlowNotFoundException(TO_DO));
        } else {
            initialStatus = workflowStatusRepository
                    .findByWorkflowIdAndStatusNameAndCustomFalse(workflow.getId(), IN_PROGRESS)
                    .orElseThrow(() -> new WorkStatusFlowNotFoundException(IN_PROGRESS));
        }

        PatientTaskTracker mainTask = PatientTaskTracker.createNextManufacturingTask(
                userProfile,
                manufacturingBatch,
                request,
                workflow,
                initialStatus,
                assigneeProfile,
                parentTask,
                serviceProduct);

        PatientTaskTracker savedMainTask = patientTaskTrackerRepository.save(mainTask);

        if (!userProfile.isPractice()) {
            List<PatientTaskTracker> subtasks = createManufacturingAlignerSubtasks(
                    savedMainTask,
                    manufacturingBatch,
                    userProfile,
                    request.getServiceProductId(),
                    request.getServiceProducts(),
                    assigneeProfile,
                    serviceProduct);

            if (!subtasks.isEmpty()) {
                patientTaskTrackerRepository.saveAll(subtasks);
            }
        }

        manufacturingBatch.setPatientTaskTracker(savedMainTask);
        manufacturingRepository.save(manufacturingBatch);
        return mainTask;
    }

    @Override
    @Transactional
    public void createCloneOrderTasks(
            UserProfile userProfile, UserProfile labUserProfile, Order order, Order clonedOrder) {

        Workflow outsourcedWorkflowName = workflowRepository
                .findByNameAndOrderTypeAndUserIdAndNotSystemDefined(
                        PLAN_OUTSOURCED_WORKFLOW, ALIGNER_ORDER_TYPE, userProfile.getId())
                .orElseThrow(() -> new WorkflowNotFoundException(PLAN_OUTSOURCED_WORKFLOW));

        WorkflowStatus outsourcedWorkflowStatus = workflowStatusRepository
                .findByWorkflowIdAndStatusNameAndCustomFalse(outsourcedWorkflowName.getId(), TO_DO)
                .orElseThrow(() -> new WorkStatusFlowNotFoundException(TO_DO));
        var serviceProductId = PatientTaskTracker.getServiceProductId(order.getServiceProducts());
        ServiceProduct serviceProduct = null;
        if (serviceProductId != null) {
            serviceProduct = serviceProductRepository
                    .findById(serviceProductId)
                    .orElseThrow(() -> new ServiceProductNotFoundException(serviceProductId));
        }
        PatientTaskTracker outsourcedOrder = PatientTaskTracker.createOrderTask(
                order.getPatient(),
                order,
                userProfile,
                outsourcedWorkflowName,
                outsourcedWorkflowStatus,
                serviceProduct);

        PatientTaskTracker savedOutsourcedOrderTask = patientTaskTrackerRepository.save(outsourcedOrder);

        Workflow inHouseWorkflowName = workflowRepository
                .findByNameAndOrderTypeAndUserIdAndNotSystemDefined(
                        PLANNING_IN_HOUSE_WORKFLOW, ALIGNER_ORDER_TYPE, labUserProfile.getId())
                .orElseThrow(() -> new WorkflowNotFoundException(PLAN_OUTSOURCED_WORKFLOW));

        WorkflowStatus inHouseWorkflowStatus = workflowStatusRepository
                .findByWorkflowIdAndStatusNameAndCustomFalse(inHouseWorkflowName.getId(), TO_DO)
                .orElseThrow(() -> new WorkStatusFlowNotFoundException(TO_DO));

        var inHouseOrderTask = PatientTaskTracker.createChildTaskForOrder(
                savedOutsourcedOrderTask,
                clonedOrder,
                labUserProfile,
                labUserProfile,
                inHouseWorkflowName,
                inHouseWorkflowStatus,
                order.getServiceProducts(),
                null,
                TaskType.IN_HOUSE_PLANNING_ORDER,
                serviceProductId,
                serviceProduct);

        patientTaskTrackerRepository.save(inHouseOrderTask);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CancelledTaskTrackerDetailsResponseDTO> getAllCancelledPatientWithFilter(
            CancelledPatientTaskTrackerDetailsWithFilterRequestDTO request) {

        var requestProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

        var isAdminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());

        if (isAdminWithDefaultTag && requestProfile.getInviterProfile() != null) {
            var inviterProfile = requestProfile.getInviterProfile();
            updateToOwnerProfile(inviterProfile, request);
        }
        Sort sort = Sort.unsorted();
        if (request.getSortBy() != null && request.getOrderType() != null) {
            String sortField =
                    switch (request.getSortBy()) {
                        case PATIENT_NAME -> "patientName";
                        case CREATED_ON -> "createdOn";
                        case PATIENT_ID -> "patientId";
                    };
            sort = request.getOrderType() == OrderBy.ASC
                    ? Sort.by(sortField).ascending()
                    : Sort.by(sortField).descending();
        }

        Pageable pageable = PageRequest.of(request.getPageNumber(), request.getPageSize(), sort);

        String querySearch = request.getSearch() != null ? request.getSearch().replace(" ", "") : null;
        Page<CancelledPatientTaskTrackerProjection> projections =
                patientTaskTrackerRepository.findAllCancelledPatientWithFilter(
                        request.getProfileId(), querySearch, request.getWorkflowName(), pageable);

        return projections.map(CancelledTaskTrackerDetailsResponseDTO::from);
    }

    @Transactional
    @Override
    public void deletePatientTaskTracker(String patientId) {
        List<PatientTaskTracker> tasks = patientTaskTrackerRepository.findByPatientId(patientId);

        List<Long> taskIds = tasks.stream().map(PatientTaskTracker::getId).toList();

        patientTaskTrackerRepository.removeManufacturingBatchReference(taskIds);
        manufacturingRepository.deleteByPatientTaskTrackerIdIn(taskIds);
        patientTaskTrackerRepository.deleteAll(tasks);
    }

    @Override
    public void markPatientTaskAsArchive(Long patientId) {
        patientTaskTrackerRepository.markAllTaskArchive(patientId);
        manufacturingRepository.markManufacturingArchive(patientId);
    }

    @Override
    public void createRefinementTask(RefinementRequestDto request) {
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        var patient = patientRepository
                .findById(request.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException(request.getPatientId()));
        createKanbanTaskForPatient(request, userProfile, patient);
    }

    private void createKanbanTaskForPatient(RefinementRequestDto request, UserProfile userProfile, Patient patient) {
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
    }

    public PatientTaskTrackerResponse createPatientTaskTrackerForNewPatient(
            Patient patient, UserProfile userProfile, Long parentTaskId) {
        try {
            Workflow workflow;
            if (userProfile.isOwner()) {
                workflow = workflowRepository
                        .findByNameAndOrderTypeAndUserIdAndNotSystemDefined(
                                "Planning In House", "ALIGNER", userProfile.getId())
                        .orElse(null);
            } else {
                workflow = workflowRepository
                        .findByNameAndOrderTypeAndUserIdAndNotSystemDefined(
                                "Plan Outsourced", "ALIGNER", userProfile.getId())
                        .orElse(null);
            }

            if (workflow != null) {
                var workFlowStatus = workflowStatusRepository
                        .findByWorkflowIdAndStatusNameAndCustomFalse(workflow.getId(), "TO DO")
                        .orElseThrow();
                var task = PatientTaskTrackerCreate.createPatientTaskTrackerForRefinementPatient(
                        patient, userProfile, workflow, workFlowStatus, parentTaskId);
                if (task != null) {
                    return createPatientTaskTracker(task);
                }
            }
            return null;

        } catch (Exception e) {
            return null;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkflowCountResponse> getWorkflowCountsByProfile(Long profileId) {

        Long finalProfileId = profileId;
        var requestProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(profileId)
                .orElseThrow(() -> new DoctorNotFoundException(finalProfileId));

        var isAdminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(profileId);

        if (isAdminWithDefaultTag && requestProfile.getInviterProfile() != null) {
            var inviterProfile = requestProfile.getInviterProfile();
            profileId = inviterProfile.getId();
        }

        List<WorkflowCountProjection> projections =
                patientTaskTrackerRepository.findWorkflowCountsByProfileId(profileId);

        return projections.stream()
                .map(projection -> WorkflowCountResponse.builder()
                        .kanbanName(projection.getWorkflowName())
                        .count(projection.getCount())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PatientTaskTrackerFilterResponseWithPagination getAllPatientTaskTrackersByFilter(
            PatientTaskTrackerFilterRequestDTO request) {
        int pageNumber = request.getPageNumber() != null ? request.getPageNumber() : 0;
        int pageSize = request.getPageSize() != null ? request.getPageSize() : 10;

        String sortValue = (request.getSort() != null) ? request.getSort().name() : null;
        String orderValue = (request.getOrder() != null) ? request.getOrder().name() : null;

        int offset = pageNumber * pageSize;

        var requestProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

        var isAdminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());

        if (isAdminWithDefaultTag && requestProfile.getInviterProfile() != null) {
            var inviterProfile = requestProfile.getInviterProfile();
            updateToOwnerProfile(inviterProfile, request);
        }

        List<Long> taskIds = patientTaskTrackerRepository.findPaginatedTaskIdsByWorkflowAndProfile(
                request.getProfileId(),
                request.getSearch(),
                sortValue,
                orderValue,
                request.getServiceProductId(),
                request.getOrderType(),
                request.getWorkflowName(),
                request.getAssigneeId(),
                request.getPracticeLocationId(),
                request.getWorkflowStatusName(),
                offset,
                pageSize);

        Long totalCounts = patientTaskTrackerRepository.findTotalCountByWorkflowAndProfile(
                request.getProfileId(),
                request.getSearch(),
                request.getServiceProductId(),
                request.getOrderType(),
                request.getWorkflowName(),
                request.getAssigneeId(),
                request.getPracticeLocationId(),
                request.getWorkflowStatusName());

        List<PatientTaskTrackerFilterResponse> taskResponses;

        if (taskIds.isEmpty()) {
            taskResponses = Collections.emptyList();
        } else {
            List<PatientTaskTrackerProjection> allProjections = patientTaskTrackerRepository.findByIds(taskIds);

            Map<Long, PatientTaskTrackerProjection> projectionMap = allProjections.stream()
                    .collect(Collectors.toMap(PatientTaskTrackerProjection::getId, Function.identity()));

            List<PatientTaskTrackerProjection> orderedProjections = taskIds.stream()
                    .map(projectionMap::get)
                    .filter(Objects::nonNull)
                    .toList();

            List<Long> manufacturingBatchIds = orderedProjections.stream()
                    .map(PatientTaskTrackerProjection::getManufacturingBatchId)
                    .filter(Objects::nonNull)
                    .distinct()
                    .toList();

            Map<Long, List<OngoingTaskCountProjection>> ongoingTaskCountsMap = Collections.emptyMap();
            if (!manufacturingBatchIds.isEmpty()) {
                List<OngoingTaskCountProjection> ongoingCounts =
                        patientTaskTrackerRepository.findOngoingTaskCountsByManufacturingBatchIds(
                                manufacturingBatchIds, ONGOING_PRODUCT_LIST, request.getProfileId());

                ongoingTaskCountsMap = ongoingCounts.stream()
                        .collect(Collectors.groupingBy(OngoingTaskCountProjection::getManufacturingBatchId));
            }

            List<Long> treatmentPlanIds = orderedProjections.stream()
                    .map(PatientTaskTrackerProjection::getTreatmentPlanId)
                    .filter(Objects::nonNull)
                    .distinct()
                    .toList();

            Map<Long, TreatmentPlanSummary> treatmentPlanSummaryMap = Collections.emptyMap();
            Map<Long, List<ManufacturingBatchSummary>> manufacturingBatchesMap = Collections.emptyMap();

            if (!treatmentPlanIds.isEmpty()) {
                List<TreatmentPlanSummary> summaries =
                        treatmentPlanRepository.findTreatmentPlanSummariesByIds(treatmentPlanIds);
                treatmentPlanSummaryMap =
                        summaries.stream().collect(Collectors.toMap(TreatmentPlanSummary::getId, Function.identity()));

                List<ManufacturingBatchSummary> allManufacturingBatches =
                        manufacturingRepository.findSummariesByTreatmentPlanIds(treatmentPlanIds);

                manufacturingBatchesMap = allManufacturingBatches.stream()
                        .collect(Collectors.groupingBy(ManufacturingBatchSummary::getTreatmentPlanId));
            }

            final Map<Long, TreatmentPlanSummary> finalSummaryMap = treatmentPlanSummaryMap;
            final Map<Long, List<ManufacturingBatchSummary>> finalManufacturingMap = manufacturingBatchesMap;
            final Map<Long, List<OngoingTaskCountProjection>> finalOngoingCountsMap = ongoingTaskCountsMap;

            taskResponses = orderedProjections.stream()
                    .map(projection -> {
                        Long treatmentPlanId = projection.getTreatmentPlanId();
                        UnprocessedAlignerResponse manufacturingResponse = null;

                        if (treatmentPlanId != null) {
                            TreatmentPlanSummary treatmentPlanSummary = finalSummaryMap.get(treatmentPlanId);
                            List<ManufacturingBatchSummary> manufacturingBatches =
                                    finalManufacturingMap.getOrDefault(treatmentPlanId, Collections.emptyList());

                            if (treatmentPlanSummary != null) {
                                manufacturingResponse = getManufacturingResponse(
                                        treatmentPlanSummary,
                                        manufacturingBatches,
                                        projection.getManufacturingBatchSequenceNumber(),
                                        projection.getManufacturingBatchId(),
                                        projection.getPackagedOngoingProductListCount());
                            }
                        }

                        List<LabelCountResponse> ongoingLabelCounts = Collections.emptyList();
                        Long manufacturingBatchId = projection.getManufacturingBatchId();
                        if (manufacturingBatchId != null && finalOngoingCountsMap.containsKey(manufacturingBatchId)) {
                            ongoingLabelCounts = finalOngoingCountsMap.get(manufacturingBatchId).stream()
                                    .map(ongoingCount -> LabelCountResponse.builder()
                                            .labelName(ongoingCount.getLabelName())
                                            .count(ongoingCount.getCount())
                                            .build())
                                    .toList();
                        }

                        return PatientTaskTrackerFilterResponse.from(
                                projection, manufacturingResponse, ongoingLabelCounts, request, requestProfile);
                    })
                    .toList();
        }

        var orgProfileId = userProfileUtil.getOrgProfileId(request.getProfileId());

        List<LabelCountProjection> labelCountProjections = patientTaskTrackerRepository.findLabelCountsWithFilters(
                request.getOrganizationId(),
                request.getProfileId(),
                orgProfileId,
                request.getWorkflowName(),
                request.getOrderType(),
                request.getServiceProductId(),
                request.getAssigneeId(),
                null,
                request.getSearch());

        List<LabelCountResponse> labelCounts = labelCountProjections.stream()
                .map(projection -> LabelCountResponse.builder()
                        .labelName(projection.getLabelName())
                        .count(projection.getCount())
                        .build())
                .toList();

        Long maxLabelCount = labelCountProjections.stream()
                .map(LabelCountProjection::getCount)
                .max(Long::compareTo)
                .orElse(0L);

        int totalPages = (int) Math.ceil((double) maxLabelCount / pageSize);

        PaginationDetails paginationDetails = PaginationDetails.builder()
                .pageNumber(pageNumber)
                .pageSize(taskIds.size())
                .totalPatients(totalCounts.intValue())
                .totalPages(totalPages)
                .hasNext(pageNumber < totalPages - 1)
                .hasPrevious(pageNumber > 0)
                .build();

        return PatientTaskTrackerFilterResponseWithPagination.builder()
                .tasks(taskResponses)
                .labelCounts(labelCounts)
                .paginationDetails(paginationDetails)
                .build();
    }

    private void updateToOwnerProfile(UserProfile inviterProfile, PatientTaskTrackerFilterRequestDTO request) {
        request.setProfileId(inviterProfile.getId());
        request.setOrganizationId(inviterProfile.getOrganization().getId());
        request.setDoctorId(inviterProfile.getDoctor().getId());
    }

    private void updateToOwnerProfile(UserProfile inviterProfile, IndividualPatientTaskRequest request) {
        request.setProfileId(inviterProfile.getId());
        request.setOrganizationId(inviterProfile.getOrganization().getId());
        request.setDoctorId(inviterProfile.getDoctor().getId());
    }

    private void updateToOwnerProfile(UserProfile inviterProfile, PatientTaskTrackerRequest request) {
        request.setProfileId(inviterProfile.getId());
        request.setOrganizationId(inviterProfile.getOrganization().getId());
        request.setDoctorId(inviterProfile.getDoctor().getId());
    }

    private void updateToOwnerProfile(
            UserProfile inviterProfile, CancelledPatientTaskTrackerDetailsWithFilterRequestDTO request) {
        request.setProfileId(inviterProfile.getId());
        request.setOrganizationId(inviterProfile.getOrganization().getId());
        request.setDoctorId(inviterProfile.getDoctor().getId());
    }

    private UnprocessedAlignerResponse getManufacturingResponse(
            TreatmentPlanSummary treatmentPlan,
            List<ManufacturingBatchSummary> manufacturingBatches,
            Integer batchNumber,
            Long currentManufacturingBatchId,
            Integer ongoingTaskPackagedCount) {

        AlignerInfo totalAligners = TreatmentPlan.getTotalAlignersFromMetadata(treatmentPlan);

        ManufacturingBatchSummary latestBatch = manufacturingBatches.stream()
                .max(Comparator.comparing(ManufacturingBatchSummary::getId))
                .orElse(null);

        ManufacturingBatchSummary currentBatch = manufacturingBatches.stream()
                .filter(batch -> currentManufacturingBatchId.equals(batch.getId()))
                .findFirst()
                .orElse(null);

        AlignerInfo delivered = ManufacturingBatch.calculateDeliveredAlignersSummery(manufacturingBatches);
        AlignerInfo inInventory = ManufacturingBatch.calculateInInventoryAlignersSummery(manufacturingBatches);
        AlignerInfo transit = ManufacturingBatch.calculateTransitAlignersSummery(manufacturingBatches);
        AlignerInfo pending = ManufacturingBatch.calculatePendingAlignersSummery(totalAligners, manufacturingBatches);

        return UnprocessedAlignerResponse.builder()
                .treatmentPlanId(treatmentPlan.getId())
                .totalAligners(totalAligners)
                .delivered(delivered)
                .inInventory(inInventory)
                .transit(transit)
                .pending(pending)
                .batchNumber(batchNumber)
                .ongoingTaskPackagedCount(ongoingTaskPackagedCount)
                .latestBatchManufacturingStatus(latestBatch != null ? latestBatch.getStatus() : null)
                .currentBatchTotalAligners(currentBatch != null ? currentBatch.getTotalAligners() : null)
                .build();
    }

    @Override
    @Transactional
    public PatientTaskTrackerResponse movePatientTaskTracker(MoveTaskTrackerRequest request) {
        PatientTaskTracker existing = patientTaskTrackerRepository
                .findByIdWithUserProfilesAndUsersWithPdo(request.getTaskId())
                .orElseThrow(() -> new PatientTaskNotFoundException(request.getTaskId()));
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        var isAdminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());

        UserProfile inviterProfile;
        if (isAdminWithDefaultTag && userProfile.getInviterProfile() != null) {
            inviterProfile = userProfile.getInviterProfile();
        } else {
            inviterProfile = null;
        }

        List<Long> internalUserDoctorIds = getInternalUsersDoctorIds(userProfile);

        String oldStatusName = ActivityStatusMapper.toReadableString(
                existing.getCurrentWorkflowStatus().getLabelName());
        if (Boolean.TRUE.equals(request.getIsVspTaskMoving())) {
            return moveVspTaskTracker(request, existing, userProfile, inviterProfile, internalUserDoctorIds);
        }
        if (request.getWorkflowStatusId() != null) {
            WorkflowStatus newStatus = workflowStatusRepository
                    .findByIdAndCustomFalseWithWorkflow(request.getWorkflowStatusId())
                    .orElseThrow(() -> new WorkStatusFlowNotFoundException(request.getWorkflowStatusId()));

            boolean hasValidOrder =
                    orderRepository.existsOrdersWithNonDraftStatus(request.getPatientId(), OrderStatus.DRAFT);

            var isAlignerNewCaseKanban = newStatus.getWorkflow().getName().equals(NEW_CASE)
                    && newStatus.getWorkflow().getOrderType().equals(ALIGNER_ORDER_TYPE);

            if (!newStatus.getCustom()
                    && newStatus.getMapsTo().equals(MapToEnum.DONE)
                    && !hasValidOrder
                    && isAlignerNewCaseKanban) {
                throw new CannotMoveTaskException(request.getPatientId());
            }
            Workflow workflow = null;

            if (request.getWorkflowId() != null) {
                workflow = workflowRepository
                        .findById(request.getWorkflowId())
                        .orElseThrow(() -> new WorkflowNotFoundException(request.getWorkflowId()));
            }

            InternalWorkflowEnum target = newStatus.getInternalName();
            List<Long> internalUserProfileIds = new ArrayList<>(
                    InternalUserProfileUtil.getInternalUserProfileIds(userProfile, userProfileRepository));

            var treatmentPlans = treatmentPlanRepository.findByPatientIdOrderIdAndProfileIdWithRoleBasedFilter(
                    request.getPatientId(),
                    ProductTypeName.ALIGNERS,
                    null,
                    inviterProfile != null ? inviterProfile.getId() : request.getProfileId(),
                    internalUserProfileIds,
                    userProfile.isInHouseManufacturingLab());

            if (!newStatus.getCustom()) {
                switch (target) {
                    case IN_REVIEW -> {
                        if (treatmentPlans.isEmpty()) {
                            throw new NoTreatmentPlanAvailableException();
                        }

                        if (request.getWorkflowId() != null && workflow != null) {
                            if (PLANNING_IN_HOUSE_WORKFLOW.equals(workflow.getName())) {
                                if (request.getDoctorId() != null) {
                                    boolean doctorIdMatches;
                                    if (!internalUserDoctorIds.isEmpty()) {
                                        doctorIdMatches = treatmentPlans.stream()
                                                .anyMatch(tp -> internalUserDoctorIds.contains(tp.getDoctorId()));
                                    } else if (inviterProfile != null) {
                                        doctorIdMatches = treatmentPlans.stream()
                                                .anyMatch(tp -> Objects.equals(
                                                        tp.getDoctorId(),
                                                        inviterProfile
                                                                .getDoctor()
                                                                .getId()));
                                    } else {
                                        doctorIdMatches = treatmentPlans.stream()
                                                .anyMatch(
                                                        tp -> Objects.equals(tp.getDoctorId(), request.getDoctorId()));
                                    }

                                    if (!doctorIdMatches) {
                                        throw new NoTreatmentPlanAvailableException();
                                    }
                                }
                            }
                        }

                        boolean hasSentForApproval = treatmentPlans.stream()
                                .anyMatch(tp -> tp.getInitiatorStatus() != null
                                        && tp.getInitiatorStatus().equals(OrderTreatmentPlanStatus.SENT_FOR_APPROVAL));

                        if (!hasSentForApproval) {
                            throw new NoPlansReadyForReviewException(
                                    countsForDraftWithInProgress(treatmentPlans),
                                    countPlansByStatus(treatmentPlans, OrderTreatmentPlanStatus.IN_PROGRESS),
                                    countPlansByStatus(treatmentPlans, OrderTreatmentPlanStatus.SENT_FOR_APPROVAL),
                                    countPlansByStatus(treatmentPlans, OrderTreatmentPlanStatus.PENDING_APPROVAL),
                                    countPlansByStatus(treatmentPlans, OrderTreatmentPlanStatus.APPROVED),
                                    countPlansByStatus(treatmentPlans, AlignerTreatmentStatus.ACTIVE),
                                    countPlansByStatus(treatmentPlans, AlignerTreatmentStatus.ARCHIVED),
                                    countPlansByStatus(treatmentPlans, OrderTreatmentPlanStatus.RE_PLAN),
                                    countPlansByStatus(treatmentPlans, AlignerTreatmentStatus.DEACTIVATED));
                        }
                    }

                    case IN_REVISION -> {
                        if (treatmentPlans.isEmpty()) {
                            throw new NoTreatmentPlanAvailableException();
                        }

                        if (request.getWorkflowId() != null && workflow != null) {
                            if (PLANNING_IN_HOUSE_WORKFLOW.equals(workflow.getName())) {
                                if (request.getDoctorId() != null) {

                                    boolean doctorIdMatches;
                                    if (!internalUserDoctorIds.isEmpty()) {
                                        doctorIdMatches = treatmentPlans.stream()
                                                .anyMatch(tp -> internalUserDoctorIds.contains(tp.getDoctorId()));
                                    } else if (inviterProfile != null) {
                                        doctorIdMatches = treatmentPlans.stream()
                                                .anyMatch(tp -> Objects.equals(
                                                        tp.getDoctorId(),
                                                        inviterProfile
                                                                .getDoctor()
                                                                .getId()));
                                    } else {
                                        doctorIdMatches = treatmentPlans.stream()
                                                .anyMatch(
                                                        tp -> Objects.equals(tp.getDoctorId(), request.getDoctorId()));
                                    }

                                    if (!doctorIdMatches) {
                                        throw new NoTreatmentPlanAvailableException();
                                    }
                                }
                            }
                        }

                        boolean hasSentForApprovalOrRePlan = treatmentPlans.stream()
                                .anyMatch(tp -> tp.getInitiatorStatus() != null
                                        && (tp.getInitiatorStatus().equals(OrderTreatmentPlanStatus.SENT_FOR_APPROVAL)
                                                || tp.getInitiatorStatus().equals(OrderTreatmentPlanStatus.RE_PLAN)));

                        if (!hasSentForApprovalOrRePlan) {
                            throw new NoPlansToReviseException(
                                    countsForDraftWithInProgress(treatmentPlans),
                                    countPlansByStatus(treatmentPlans, OrderTreatmentPlanStatus.IN_PROGRESS),
                                    countPlansByStatus(treatmentPlans, OrderTreatmentPlanStatus.SENT_FOR_APPROVAL),
                                    countPlansByStatus(treatmentPlans, OrderTreatmentPlanStatus.PENDING_APPROVAL),
                                    countPlansByStatus(treatmentPlans, OrderTreatmentPlanStatus.APPROVED),
                                    countPlansByStatus(treatmentPlans, AlignerTreatmentStatus.ACTIVE),
                                    countPlansByStatus(treatmentPlans, AlignerTreatmentStatus.ARCHIVED),
                                    countPlansByStatus(treatmentPlans, OrderTreatmentPlanStatus.RE_PLAN),
                                    countPlansByStatus(treatmentPlans, AlignerTreatmentStatus.DEACTIVATED));
                        }
                    }

                    case APPROVED -> {
                        if (treatmentPlans.isEmpty()) {
                            throw new NoTreatmentPlanAvailableException();
                        }

                        if (request.getWorkflowId() != null && workflow != null) {
                            if (PLANNING_IN_HOUSE_WORKFLOW.equals(workflow.getName())) {
                                if (request.getDoctorId() != null) {
                                    boolean doctorIdMatches;
                                    if (!internalUserDoctorIds.isEmpty()) {
                                        doctorIdMatches = treatmentPlans.stream()
                                                .anyMatch(tp -> internalUserDoctorIds.contains(tp.getDoctorId()));
                                    } else if (inviterProfile != null) {
                                        doctorIdMatches = treatmentPlans.stream()
                                                .anyMatch(tp -> Objects.equals(
                                                        tp.getDoctorId(),
                                                        inviterProfile
                                                                .getDoctor()
                                                                .getId()));
                                    } else {
                                        doctorIdMatches = treatmentPlans.stream()
                                                .anyMatch(
                                                        tp -> Objects.equals(tp.getDoctorId(), request.getDoctorId()));
                                    }

                                    if (!doctorIdMatches) {
                                        throw new NoTreatmentPlanAvailableException();
                                    }
                                }
                            }
                        }

                        boolean hasSentForApprovalOrApproved = treatmentPlans.stream()
                                .anyMatch(tp -> tp.getInitiatorStatus() != null
                                        && (tp.getInitiatorStatus().equals(OrderTreatmentPlanStatus.SENT_FOR_APPROVAL)
                                                || tp.getInitiatorStatus().equals(OrderTreatmentPlanStatus.APPROVED)));

                        if (!hasSentForApprovalOrApproved) {
                            throw new NoPlansToApproveException(
                                    countsForDraftWithInProgress(treatmentPlans),
                                    countPlansByStatus(treatmentPlans, OrderTreatmentPlanStatus.IN_PROGRESS),
                                    countPlansByStatus(treatmentPlans, OrderTreatmentPlanStatus.SENT_FOR_APPROVAL),
                                    countPlansByStatus(treatmentPlans, OrderTreatmentPlanStatus.PENDING_APPROVAL),
                                    countPlansByStatus(treatmentPlans, OrderTreatmentPlanStatus.APPROVED),
                                    countPlansByStatus(treatmentPlans, AlignerTreatmentStatus.ACTIVE),
                                    countPlansByStatus(treatmentPlans, AlignerTreatmentStatus.ARCHIVED),
                                    countPlansByStatus(treatmentPlans, OrderTreatmentPlanStatus.RE_PLAN),
                                    countPlansByStatus(treatmentPlans, AlignerTreatmentStatus.DEACTIVATED));
                        }
                    }

                    case STL_FILE_REQUEST, STL_FILE_APPROVED, STL_FILE_UPLOADED -> {
                        if (treatmentPlans.isEmpty()) {
                            throw new NoTreatmentPlanAvailableException();
                        }
                    }
                    case PLANNING_DONE -> {
                        if (treatmentPlans.isEmpty()) {
                            throw new NoTreatmentPlanAvailableException();
                        }

                        if (request.getWorkflowId() != null && workflow != null) {
                            if (PLANNING_IN_HOUSE_WORKFLOW.equals(workflow.getName())) {
                                if (request.getDoctorId() != null) {
                                    boolean doctorIdMatches;
                                    if (!internalUserDoctorIds.isEmpty()) {
                                        doctorIdMatches = treatmentPlans.stream()
                                                .anyMatch(tp -> internalUserDoctorIds.contains(tp.getDoctorId()));
                                    } else if (inviterProfile != null) {
                                        doctorIdMatches = treatmentPlans.stream()
                                                .anyMatch(tp -> Objects.equals(
                                                        tp.getDoctorId(),
                                                        inviterProfile
                                                                .getDoctor()
                                                                .getId()));
                                    } else {
                                        doctorIdMatches = treatmentPlans.stream()
                                                .anyMatch(
                                                        tp -> Objects.equals(tp.getDoctorId(), request.getDoctorId()));
                                    }

                                    if (!doctorIdMatches) {
                                        throw new NoTreatmentPlanAvailableException();
                                    }
                                }
                                if (OrderType.ALIGNER_ORDER.equals(existing.getTaskOrderType())) {
                                    throw new NoActivePlanForRevisionException(BusinessErrorCode.NO_ACTIVE_PLAN);
                                }
                            }
                        }
                        boolean hasApproved = treatmentPlans.stream()
                                .anyMatch(tp -> tp.getInitiatorStatus().equals(OrderTreatmentPlanStatus.APPROVED));
                        if (!hasApproved) {
                            throw new NoTreatmentPlanApprovedException();
                        }

                        boolean hasActivePlan = treatmentPlans.stream()
                                .anyMatch(tp -> tp.getStatus().equals(AlignerTreatmentStatus.ACTIVE));

                        if (!hasActivePlan) {

                            Optional<OrderType> latestOrderType =
                                    orderRepository.findLatestOrderTypeByPatientAndProfile(
                                            request.getPatientId(), request.getProfileId());

                            boolean isPlanningOrder = latestOrderType.isPresent()
                                    && latestOrderType.get().equals(OrderType.PLANNING_ORDER);

                            if (!isPlanningOrder) {
                                throw new NoActivePlanForRevisionException(BusinessErrorCode.NO_ACTIVE_PLAN);
                            }
                        }
                    }
                    default -> {}
                }
            }

            if (request.getWorkflowId() != null && workflow != null) {
                updateParentAndChildTaskStatus(newStatus, existing);
                updateManufacturingInternalTaskStatus(newStatus, existing, userProfile);

                existing.setWorkflow(workflow);
                existing.setWorkflowName(workflow.getName());
            }

            moveTaskActivityLogs(existing, userProfile, request, oldStatusName, newStatus);
            existing.setPreviousWorkflowStatusId(
                    existing.getCurrentWorkflowStatus().getId());
            existing.setCurrentWorkflowStatus(newStatus);
            existing.setCurrentStatusName(newStatus.getName());
            existing.setWorkflowPosition(newStatus.getPosition());
        }
        existing.setSequenceNumber(request.getPosition());
        PatientTaskTracker saved = patientTaskTrackerRepository.save(existing);

        notificationService.treatmentReadyToBegin(request, existing, userProfile);
        notificationService.manufacturingCompleted(existing, userProfile);

        return PatientTaskTracker.buildPatientTaskResponse(saved);
    }

    private PatientTaskTrackerResponse moveVspTaskTracker(
            MoveTaskTrackerRequest request,
            PatientTaskTracker existing,
            UserProfile userProfile,
            UserProfile inviterProfile,
            List<Long> internalUserDoctorIds) {

        Workflow workflow = null;

        WorkflowStatus newStatus = workflowStatusRepository
                .findByIdAndCustomFalseWithWorkflow(request.getWorkflowStatusId())
                .orElseThrow(() -> new WorkStatusFlowNotFoundException(request.getWorkflowStatusId()));
        if (request.getWorkflowId() != null) {
            workflow = workflowRepository
                    .findById(request.getWorkflowId())
                    .orElseThrow(() -> new WorkflowNotFoundException(request.getWorkflowId()));
        }
        String oldStatusName = ActivityStatusMapper.toReadableString(
                existing.getCurrentWorkflowStatus().getLabelName());
        if (request.getWorkflowId() != null && workflow != null) {
            updateParentAndChildTaskStatus(newStatus, existing);
            updateManufacturingInternalTaskStatus(newStatus, existing, userProfile);

            existing.setWorkflow(workflow);
            existing.setWorkflowName(workflow.getName());
        }

        moveTaskActivityLogs(existing, userProfile, request, oldStatusName, newStatus);
        existing.setPreviousWorkflowStatusId(existing.getCurrentWorkflowStatus().getId());
        existing.setCurrentWorkflowStatus(newStatus);
        existing.setCurrentStatusName(newStatus.getName());
        existing.setWorkflowPosition(newStatus.getPosition());

        existing.setSequenceNumber(request.getPosition());
        PatientTaskTracker saved = patientTaskTrackerRepository.save(existing);

        notificationService.treatmentReadyToBegin(request, existing, userProfile);
        notificationService.manufacturingCompleted(existing, userProfile);

        return PatientTaskTracker.buildPatientTaskResponse(saved);
    }

    @Transactional
    @Override
    public void moveSingleTask(MoveSingleTaskRequest request, Order order) {

        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

        var workflow = workflowRepository
                .findByNameAndOrderTypeAndUserIdAndNotSystemDefined(
                        request.getWorkflowName(), ALIGNER_ORDER_TYPE, request.getProfileId())
                .orElseThrow(() -> new WorkflowNotFoundException(request.getWorkflowName()));

        var newStatus = workflowStatusRepository
                .findByWorkflowIdAndStatusNameAndCustomFalse(workflow.getId(), request.getWorkflowStausName())
                .orElseThrow(() -> new WorkStatusFlowNotFoundException(request.getWorkflowStausName()));

        List<PatientTaskTracker> taskTrackers =
                patientTaskTrackerRepository.findIndividualPatientTaskByProfileIdByWorkflowFilter(
                        userProfile.getOrganization().getId(),
                        request.getProfileId(),
                        request.getPatientId(),
                        request.getWorkflowName());

        List<PatientTaskTracker> updatedTaskTrackers = new ArrayList<>();

        for (PatientTaskTracker taskTracker : taskTrackers) {
            var updatedTaskTracker = PatientTaskTracker.moveTask(
                    taskTracker,
                    workflow,
                    newStatus,
                    order.getServiceProducts(),
                    null,
                    order,
                    order.getServiceProduct());
            updatedTaskTrackers.add(updatedTaskTracker);
        }

        patientTaskTrackerRepository.saveAll(updatedTaskTrackers);
    }

    @Transactional
    @Override
    public void moveSingleTaskForVsp(MoveSingleTaskRequest request, VspOrder order) {

        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

        var workflow = workflowRepository
                .findByNameAndOrderTypeAndUserIdAndNotSystemDefined(
                        request.getWorkflowName(), ALIGNER_ORDER_TYPE, request.getProfileId())
                .orElseThrow(() -> new WorkflowNotFoundException(request.getWorkflowName()));

        var newStatus = workflowStatusRepository
                .findByWorkflowIdAndStatusNameAndCustomFalse(workflow.getId(), request.getWorkflowStausName())
                .orElseThrow(() -> new WorkStatusFlowNotFoundException(request.getWorkflowStausName()));

        List<PatientTaskTracker> taskTrackers =
                patientTaskTrackerRepository.findIndividualPatientTaskByProfileIdByWorkflowFilter(
                        userProfile.getOrganization().getId(),
                        request.getProfileId(),
                        request.getPatientId(),
                        request.getCurrentWorkflowName());

        List<PatientTaskTracker> updatedTaskTrackers = new ArrayList<>();

        for (PatientTaskTracker taskTracker : taskTrackers) {
            var updatedTaskTracker =
                    PatientTaskTracker.moveTaskVsp(taskTracker, workflow, newStatus, order, order.getServiceProduct());
            updatedTaskTrackers.add(updatedTaskTracker);
        }
        patientTaskTrackerRepository.saveAll(updatedTaskTrackers);
    }

    private List<Long> getInternalUsersDoctorIds(UserProfile requestProfile) {
        boolean isInternalUser = requestProfile.getRoles().stream()
                .anyMatch(role -> role.getName().equals(DoctorRole.INTERNAL_USER.name()));

        if (requestProfile.getProfileType().equals(ProfileType.INVITED) && isInternalUser) {
            if (requestProfile.getInviterProfile() != null) {
                var userProfileId = requestProfile.getInviterProfile().getId();
                requestProfile = userProfileRepository
                        .findByIdWithOrgAndDoctor(userProfileId)
                        .orElseThrow(() -> new DoctorNotFoundException(userProfileId));

                List<Long> internalUserDoctorIds = new ArrayList<>(
                        userProfileRepository.findInvitedInternalUserDoctorIdsByInviter(requestProfile.getId()));
                internalUserDoctorIds.add(requestProfile.getDoctor().getId());
                return internalUserDoctorIds;
            } else {
                throw new ForbiddenException();
            }
        } else if (requestProfile.isEnterprise() || requestProfile.isInHouseManufacturingLab()) {
            List<Long> internalUserDoctorIds = new ArrayList<>(
                    userProfileRepository.findInvitedInternalUserDoctorIdsByInviter(requestProfile.getId()));
            internalUserDoctorIds.add(requestProfile.getDoctor().getId());
            return internalUserDoctorIds;
        }
        return new ArrayList<>();
    }

    private long countPlansByStatus(List<TreatmentPlan> treatmentPlans, OrderTreatmentPlanStatus status) {
        return treatmentPlans.stream()
                .filter(tp -> tp.getInitiatorStatus() == status)
                .count();
    }

    private long countPlansByStatus(List<TreatmentPlan> treatmentPlans, AlignerTreatmentStatus status) {
        return treatmentPlans.stream().filter(tp -> tp.getStatus() == status).count();
    }

    private long countsForDraftWithInProgress(List<TreatmentPlan> treatmentPlans) {
        return treatmentPlans.stream()
                .filter(tp -> tp.getStatus() == AlignerTreatmentStatus.DRAFT)
                .filter(tp -> tp.getInitiatorStatus() == OrderTreatmentPlanStatus.IN_PROGRESS)
                .count();
    }

    private void moveTaskActivityLogs(
            PatientTaskTracker existing,
            UserProfile userProfile,
            MoveTaskTrackerRequest request,
            String oldStatusName,
            WorkflowStatus newStatus) {

        boolean isCustomActivity = false;
        if (userProfile.isInHouseManufacturingLab()) {
            isCustomActivity = NEW_CASE.equals(existing.getWorkflow().getName())
                    || PLANNING_IN_HOUSE_WORKFLOW.equals(existing.getWorkflow().getName())
                    || PRODUCTION_IN_HOUSE_WORKFLOW.equals(
                            existing.getWorkflow().getName());
        }
        if (!oldStatusName.equals(ActivityStatusMapper.toReadableString(newStatus.getLabelName()))) {
            String activityDescription = String.format(
                    "Changed status from %s to %s.",
                    oldStatusName, ActivityStatusMapper.toReadableString(newStatus.getLabelName()));

            Set<UserProfile> userProfiles = getUserProfilesForActivityLogs(userProfile, existing, request);

            ActivityRequest activityRequest;
            Set<UserProfile> specificProfiles = new HashSet<>();
            specificProfiles.add(userProfile);
            specificProfiles.addAll(userProfiles);
            if (newStatus.getCustom()) {
                activityRequest = ActivityRequest.builder()
                        .patientId(request.getPatientId())
                        .activityBy(request.getProfileId())
                        .activityType(ActivityType.MOVE)
                        .activity(activityDescription)
                        .isCustomActivity(true)
                        .visibilityScope(VisibilityScope.SPECIFIC)
                        .visibleToProfiles(specificProfiles)
                        .build();
            } else {
                activityRequest = ActivityRequest.builder()
                        .patientId(request.getPatientId())
                        .activityBy(request.getProfileId())
                        .activityType(ActivityType.MOVE)
                        .activity(activityDescription)
                        .visibilityScope(VisibilityScope.SPECIFIC)
                        .visibleToProfiles(specificProfiles)
                        .isCustomActivity(isCustomActivity)
                        .build();
            }
            activityLogService.createActivityLog(activityRequest);
            notificationService.moveTaskNotification(
                    request,
                    existing,
                    userProfile,
                    oldStatusName,
                    ActivityStatusMapper.toReadableString(newStatus.getLabelName()));
        }
    }

    private Set<UserProfile> getUserProfilesForActivityLogs(
            UserProfile userProfile, PatientTaskTracker existing, MoveTaskTrackerRequest request) {
        Set<UserProfile> profiles = new HashSet<>();
        UserProfile profileToCheck = userProfile;

        if (userProfile.isPractice() && userProfile.getInviterProfile() != null) {
            profiles.add(userProfile.getInviterProfile());
            return profiles;
        }

        if (userProfile.isInHouseManufacturingLab()) {
            String workflowName = existing.getWorkflow().getName();

            if (workflowName.equalsIgnoreCase(PLAN_OUTSOURCED_WORKFLOW)) {
                addParentTaskProfiles(profiles, existing.getId(), PLANNING_IN_HOUSE_WORKFLOW);
            } else if (workflowName.equalsIgnoreCase(PRODUCTION_OUTSOURCE_WORKFLOW)) {
                addParentTaskProfiles(profiles, existing.getId(), PRODUCTION_IN_HOUSE_WORKFLOW);
            }

            profiles.add(userProfile);
            return profiles;
        }

        if (userProfile.isInternalUser() && userProfile.getInviterProfile() != null) {
            profiles.add(userProfile.getInviterProfile());
            profileToCheck = userProfile.getInviterProfile();
        }

        if (profileToCheck.isEnterprise()) {
            addProfilesForEnterpriseUser(profiles, existing, request);
        }

        return profiles;
    }

    private Set<UserProfile> getUserProfilesForActivityLogsChangeWorkflow(
            UserProfile userProfile, PatientTaskTracker existing, SelectCaseForPatientTaskRequest request) {
        Set<UserProfile> profiles = new HashSet<>();
        UserProfile profileToCheck = userProfile;

        if (userProfile.isPractice() && userProfile.getInviterProfile() != null) {
            profiles.add(userProfile.getInviterProfile());
            return profiles;
        }

        if (userProfile.isInHouseManufacturingLab()) {
            String workflowName = existing.getWorkflow().getName();

            if (workflowName.equalsIgnoreCase(PLAN_OUTSOURCED_WORKFLOW)) {
                addParentTaskProfiles(profiles, existing.getId(), PLANNING_IN_HOUSE_WORKFLOW);
            } else if (workflowName.equalsIgnoreCase(PRODUCTION_OUTSOURCE_WORKFLOW)) {
                addParentTaskProfiles(profiles, existing.getId(), PRODUCTION_IN_HOUSE_WORKFLOW);
            }

            profiles.add(userProfile);
            return profiles;
        }

        if (userProfile.isInternalUser() && userProfile.getInviterProfile() != null) {
            profiles.add(userProfile.getInviterProfile());
            profileToCheck = userProfile.getInviterProfile();
        }

        if (profileToCheck.isEnterprise()) {
            addProfilesForEnterpriseUser(profiles, existing, request);
        }

        return profiles;
    }

    private void addProfilesForEnterpriseUser(
            Set<UserProfile> profiles, PatientTaskTracker existing, MoveTaskTrackerRequest request) {
        List<String> enabledItems = serviceConfigurationRepository.findEnabledItemNames(request.getProfileId());

        if (enabledItems.contains("MANUFACTURING") || enabledItems.contains("PLANNING")) {
            Optional.ofNullable(existing.getParentTask())
                    .map(PatientTaskTracker::getCreatedByProfile)
                    .ifPresent(profiles::add);
            return;
        }

        String workflowName = existing.getWorkflow().getName();

        if (workflowName.equalsIgnoreCase(PRODUCTION_IN_HOUSE_WORKFLOW)
                || workflowName.equalsIgnoreCase(PLANNING_IN_HOUSE_WORKFLOW)
                || workflowName.equalsIgnoreCase(NEW_CASE)) {
            profiles.add(existing.getPatient().getDoctorOrganization().getUserProfile());
        } else if (workflowName.equalsIgnoreCase(PLAN_OUTSOURCED_WORKFLOW)) {
            addParentTaskProfiles(profiles, existing.getId(), PLANNING_IN_HOUSE_WORKFLOW);
        } else if (workflowName.equalsIgnoreCase(PRODUCTION_OUTSOURCE_WORKFLOW)) {
            addParentTaskProfiles(profiles, existing.getId(), PRODUCTION_IN_HOUSE_WORKFLOW);
        }
    }

    private void addProfilesForEnterpriseUser(
            Set<UserProfile> profiles, PatientTaskTracker existing, SelectCaseForPatientTaskRequest request) {
        List<String> enabledItems = serviceConfigurationRepository.findEnabledItemNames(request.getProfileId());

        if (enabledItems.contains("MANUFACTURING") || enabledItems.contains("PLANNING")) {
            Optional.ofNullable(existing.getParentTask())
                    .map(PatientTaskTracker::getCreatedByProfile)
                    .ifPresent(profiles::add);
            return;
        }

        String workflowName = existing.getWorkflow().getName();

        if (workflowName.equalsIgnoreCase(PRODUCTION_IN_HOUSE_WORKFLOW)
                || workflowName.equalsIgnoreCase(PLANNING_IN_HOUSE_WORKFLOW)
                || workflowName.equalsIgnoreCase(NEW_CASE)) {
            profiles.add(existing.getPatient().getDoctorOrganization().getUserProfile());
        } else if (workflowName.equalsIgnoreCase(PLAN_OUTSOURCED_WORKFLOW)) {
            addParentTaskProfiles(profiles, existing.getId(), PLANNING_IN_HOUSE_WORKFLOW);
        } else if (workflowName.equalsIgnoreCase(PRODUCTION_OUTSOURCE_WORKFLOW)) {
            addParentTaskProfiles(profiles, existing.getId(), PRODUCTION_IN_HOUSE_WORKFLOW);
        }
    }

    private void addParentTaskProfiles(Set<UserProfile> profiles, Long existingTaskId, String workflowName) {
        var parentTasks = patientTaskTrackerRepository.findByWorkflowNameAndParentTaskId(workflowName, existingTaskId);
        var parentTasksWithChild =
                patientTaskTrackerRepository.findByWorkflowNameAndChildTaskId(workflowName, existingTaskId);

        Stream.of(parentTasks, parentTasksWithChild)
                .filter(Objects::nonNull)
                .flatMap(Collection::stream)
                .map(PatientTaskTracker::getCreatedByProfile)
                .filter(Objects::nonNull)
                .distinct()
                .forEach(profiles::add);
    }

    @Override
    @Transactional
    public List<PatientTaskTrackerResponse> moveMultiplePatientTaskTracker(MoveMultiTaskTrackerRequest request) {
        List<PatientTaskTrackerResponse> responses = new ArrayList<>();

        if (request.getTaskInfo() == null) {
            return responses;
        }

        for (TaskInfo taskInfo : request.getTaskInfo()) {
            Long taskId = taskInfo.getTaskId();
            Long patientId = taskInfo.getPatientId();

            try {
                MoveTaskTrackerRequest singleRequest = MoveTaskTrackerRequest.builder()
                        .profileId(request.getProfileId())
                        .organizationId(request.getOrganizationId())
                        .taskId(taskId)
                        .doctorId(request.getDoctorId())
                        .workflowStatusId(request.getWorkflowStatusId())
                        .patientId(patientId)
                        .workflowId(request.getWorkflowId())
                        .build();

                PatientTaskTracker existing = patientTaskTrackerRepository
                        .findByIdWithUserProfilesAndUsers(singleRequest.getTaskId())
                        .orElseThrow(() -> new PatientTaskNotFoundException(singleRequest.getTaskId()));

                String oldStatusName = ActivityStatusMapper.toReadableString(
                        existing.getCurrentWorkflowStatus().getLabelName());

                if (singleRequest.getWorkflowStatusId() != null) {
                    WorkflowStatus newStatus = workflowStatusRepository
                            .findByIdAndCustomFalseWithWorkflow(singleRequest.getWorkflowStatusId())
                            .orElseThrow(
                                    () -> new WorkStatusFlowNotFoundException(singleRequest.getWorkflowStatusId()));

                    if (newStatus.getName().equals(PACKAGED)) {
                        updateParentTaskStatusToPackaged(existing);
                    }

                    boolean hasValidOrder = orderRepository.existsOrdersWithNonDraftStatus(
                            singleRequest.getPatientId(), OrderStatus.DRAFT);

                    boolean isAlignerNewCaseKanban =
                            newStatus.getWorkflow().getName().equals(NEW_CASE)
                                    && newStatus.getWorkflow().getOrderType().equals(ALIGNER_ORDER_TYPE);

                    if (!newStatus.getCustom()
                            && newStatus.getMapsTo().equals(MapToEnum.DONE)
                            && !hasValidOrder
                            && isAlignerNewCaseKanban) {
                        throw new CannotMoveTaskException(singleRequest.getPatientId(), request.getWorkflowId());
                    }

                    InternalWorkflowEnum target = newStatus.getInternalName();
                    var treatmentPlans =
                            treatmentPlanRepository.findTreatmentPlansByPatientId(singleRequest.getPatientId());

                    if (!newStatus.getCustom()) {
                        switch (target) {
                            case IN_REVIEW,
                                    IN_REVISION,
                                    APPROVED,
                                    STL_FILE_REQUEST,
                                    STL_FILE_APPROVED,
                                    STL_FILE_UPLOADED -> {
                                if (treatmentPlans.isEmpty()) {
                                    throw new NoTreatmentPlanAvailableException();
                                }
                            }
                            case PLANNING_DONE -> {
                                if (treatmentPlans.isEmpty()) {
                                    throw new NoTreatmentPlanAvailableException();
                                }
                                boolean hasApproved = treatmentPlans.stream().anyMatch(tp -> tp.getInitiatorStatus()
                                        .equals(OrderTreatmentPlanStatus.APPROVED));
                                if (!hasApproved) {
                                    throw new NoTreatmentPlanApprovedException();
                                }

                                boolean hasActivePlan = treatmentPlans.stream()
                                        .anyMatch(tp -> tp.getStatus().equals(AlignerTreatmentStatus.ACTIVE));
                                if (!hasActivePlan) {
                                    throw new NoActivePlanForRevisionException(BusinessErrorCode.NO_ACTIVE_PLAN);
                                }
                            }
                            default -> {}
                        }
                    }

                    var userProfile = userProfileRepository
                            .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                            .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
                    if (singleRequest.getWorkflowId() != null) {
                        Workflow workflow = workflowRepository
                                .findById(singleRequest.getWorkflowId())
                                .orElseThrow(() -> new WorkflowNotFoundException(singleRequest.getWorkflowId()));

                        if (request.getIsParentTaskToUpdate() != null && request.getIsParentTaskToUpdate()) {
                            updateParentAndChildTaskStatus(newStatus, existing);
                            updateManufacturingInternalTaskStatus(newStatus, existing, userProfile);
                        }

                        existing.setWorkflow(workflow);
                        existing.setWorkflowName(workflow.getName());
                    }

                    movePatientTaskTrackerActivity(singleRequest, existing, oldStatusName, newStatus, userProfile);
                }

                if (request.getAssigneeId() != null) {
                    UserProfile assignee = userProfileRepository
                            .findByIdWithOrgAndDoctor(request.getAssigneeId())
                            .orElseThrow(() -> new DoctorNotFoundException(request.getAssigneeId()));
                    if (request.getParentTaskId() != null) {
                        patientTaskTrackerRepository
                                .findByWorkflowNameAndParentTaskId(ONGOING_PRODUCT_LIST, request.getParentTaskId())
                                .forEach(childTask -> {
                                    childTask.setAssignee(assignee);
                                    patientTaskTrackerRepository.save(childTask);
                                });
                    }
                    existing.setAssignee(assignee);
                }

                if (request.getEstimatedCompletionDate() != null) {
                    existing.setEstimatedCompletionDate(request.getEstimatedCompletionDate());
                }

                PatientTaskTracker saved = patientTaskTrackerRepository.save(existing);
                responses.add(PatientTaskTracker.buildPatientTaskResponse(saved));

            } catch (Exception e) {
                throw new GenericException("Error moving task with ID: " + taskId + ". " + e.getMessage());
            }
        }

        return responses;
    }

    private void movePatientTaskTrackerActivity(
            MoveTaskTrackerRequest request,
            PatientTaskTracker existing,
            String oldStatusName,
            WorkflowStatus newStatus,
            UserProfile userProfile) {
        if (!oldStatusName.equals(ActivityStatusMapper.toReadableString(newStatus.getLabelName()))
                && !existing.getWorkflowName().equals(ONGOING_PRODUCT_LIST)) {
            String activityDescription = String.format(
                    "Changed status from %s to %s.",
                    oldStatusName, ActivityStatusMapper.toReadableString(newStatus.getLabelName()));

            boolean isCustomActivity = false;
            if (userProfile.isInHouseManufacturingLab()) {
                isCustomActivity = NEW_CASE.equals(existing.getWorkflow().getName())
                        || PLANNING_IN_HOUSE_WORKFLOW.equals(
                                existing.getWorkflow().getName())
                        || PRODUCTION_IN_HOUSE_WORKFLOW.equals(
                                existing.getWorkflow().getName());
            }
            ActivityRequest activityRequest;
            if (newStatus.getCustom()) {
                activityRequest = ActivityRequest.builder()
                        .patientId(request.getPatientId())
                        .activityBy(request.getProfileId())
                        .activityType(ActivityType.MOVE)
                        .activity(activityDescription)
                        .isCustomActivity(true)
                        .build();
            } else {
                activityRequest = ActivityRequest.builder()
                        .patientId(request.getPatientId())
                        .activityBy(request.getProfileId())
                        .activityType(ActivityType.MOVE)
                        .activity(activityDescription)
                        .isCustomActivity(isCustomActivity)
                        .build();
            }

            activityLogService.createActivityLog(activityRequest);
        }

        existing.setPreviousWorkflowStatusId(existing.getCurrentWorkflowStatus().getId());
        existing.setCurrentWorkflowStatus(newStatus);
        existing.setCurrentStatusName(newStatus.getName());
        existing.setWorkflowPosition(newStatus.getPosition());
    }

    private void updateParentTaskStatusToPackaged(PatientTaskTracker existing) {
        if (existing.getParentTask() != null) {
            var parentTask = existing.getParentTask();
            boolean areAllChildTasksPackaged =
                    patientTaskTrackerRepository.areAllChildTasksPackaged(parentTask.getId());

            if (areAllChildTasksPackaged) {
                try {
                    var workflowStatus =
                            getWorkflowStatusByName(parentTask.getWorkflow().getId(), PACKAGED);
                    parentTask.setPreviousWorkflowStatusId(
                            parentTask.getCurrentWorkflowStatus().getId());
                    parentTask.setCurrentWorkflowStatus(workflowStatus);
                    parentTask.setCurrentStatusName(workflowStatus.getName());
                    patientTaskTrackerRepository.save(parentTask);
                } catch (Exception e) {
                    log.error("Error updating parent task status for task ID: {}", parentTask.getId(), e);
                }
            }
        }
    }

    private Workflow getWorkflowByName(String workflowName, String orderType, Long userId) {
        return workflowRepository
                .findByNameAndOrderTypeAndUserIdAndNotSystemDefined(workflowName, orderType, userId)
                .orElseThrow(() -> new WorkflowNotFoundException(workflowName));
    }

    private WorkflowStatus getWorkflowStatusByName(Long workflowId, String statusName) {
        return workflowStatusRepository
                .findByWorkflowIdAndStatusNameAndCustomFalse(workflowId, statusName)
                .orElseThrow(() -> new WorkStatusFlowNotFoundException(statusName));
    }

    private void updateManufacturingInternalTaskStatus(
            WorkflowStatus newStatus, PatientTaskTracker parentTask, UserProfile userProfile) {
        if (newStatus == null || parentTask == null || Boolean.TRUE.equals(newStatus.getCustom())) return;

        boolean shouldProceed = isAlignerPackagedInHouse(newStatus) || isAlignerDeliveredOrShipped(newStatus);
        if (!shouldProceed) return;

        try {
            Long workflowId = null;
            if (userProfile.isPractice()) {
                var inviterProfile = userProfile.getInviterProfile();
                if (inviterProfile != null) {
                    userProfile = inviterProfile;
                    workflowId = workflowRepository
                            .findWorkflowIdByNameAndSystemDefinedAndProfileId(ONGOING_PRODUCT_LIST, userProfile.getId())
                            .orElseThrow(() -> new WorkflowNotFoundException(ONGOING_PRODUCT_LIST));
                }
            }

            var internalTasks = patientTaskTrackerRepository.findByParentTaskId(parentTask.getId());
            if (internalTasks == null || internalTasks.isEmpty()) return;

            var ongoingProductTask = internalTasks.stream()
                    .filter(task -> task.getWorkflow() != null
                            && ONGOING_PRODUCT_LIST.equals(task.getWorkflow().getName()))
                    .findFirst()
                    .orElse(null);

            if (ongoingProductTask == null) return;

            var internalWorkflowId = workflowId != null
                    ? workflowId
                    : ongoingProductTask.getWorkflow().getId();

            String newStatusName = PACKAGED;

            if (isAlignerDeliveredOrShipped(newStatus)) {
                newStatusName = COMPLETED;
            }
            var packagedStatusOpt = workflowStatusRepository.findByWorkflowIdAndStatusNameAndCustomFalse(
                    internalWorkflowId, newStatusName);

            if (packagedStatusOpt.isEmpty()) {
                return;
            }

            var packagedStatus = packagedStatusOpt.get();

            internalTasks.stream()
                    .filter(child -> child.getWorkflow().getName().equals(ONGOING_PRODUCT_LIST))
                    .forEach(child -> {
                        var current = child.getCurrentWorkflowStatus();
                        if (current != null) {
                            child.setPreviousWorkflowStatusId(current.getId());
                        }
                        child.setCurrentWorkflowStatus(packagedStatus);
                        child.setCurrentStatusName(packagedStatus.getName());
                        child.setWorkflowPosition(parentTask.getWorkflowPosition());
                    });

            patientTaskTrackerRepository.saveAll(internalTasks);
        } catch (Exception ignored) {
        }
    }

    private boolean isAlignerPackagedInHouse(WorkflowStatus status) {
        var workflow = status.getWorkflow();
        return workflow != null
                && PRODUCTION_IN_HOUSE_WORKFLOW.equals(workflow.getName())
                && ALIGNER_ORDER_TYPE.equals(workflow.getOrderType())
                && PACKAGED.equals(status.getName());
    }

    private boolean isAlignerDeliveredOrShipped(WorkflowStatus status) {
        var workflow = status.getWorkflow();
        return workflow != null
                        && ONGOING_PRODUCT_LIST.equals(workflow.getName())
                        && ALIGNER_ORDER_TYPE.equals(workflow.getOrderType())
                        && DELIVERED.equals(status.getName())
                || SHIPPED.equals(status.getName());
    }

    private void updateParentAndChildTaskStatus(WorkflowStatus newStatus, PatientTaskTracker existing) {
        if (newStatus.getCustom()) {
            return;
        }

        Optional.ofNullable(existing.getParentTask()).ifPresent(parentTask -> {
            try {
                updateParentTaskWorkflowStatus(parentTask, newStatus);
            } catch (Exception ignored) {
            }
        });

        Optional.ofNullable(existing.getChildTasks())
                .filter(childTasks -> !childTasks.isEmpty())
                .ifPresent(childTasks -> {
                    try {
                        updateChildTasksWorkflowStatus(childTasks, newStatus);
                    } catch (Exception ignored) {
                    }
                });
    }

    private void updateChildTasksWorkflowStatus(List<PatientTaskTracker> childTasks, WorkflowStatus newStatus) {
        for (PatientTaskTracker childTask : childTasks) {
            try {
                if (Boolean.FALSE.equals(childTask.getIsActive()) || Boolean.TRUE.equals(childTask.getIsArchived())) {
                    continue;
                }

                Long childWorkflowId = childTask.getWorkflow().getId();
                WorkflowStatus childNewStatus = workflowStatusRepository
                        .findByWorkflowIdAndStatusNameAndCustomFalse(childWorkflowId, newStatus.getName())
                        .orElse(null);

                if (childNewStatus != null) {
                    childTask.setPreviousWorkflowStatusId(
                            childTask.getCurrentWorkflowStatus().getId());
                    childTask.setCurrentWorkflowStatus(childNewStatus);
                    childTask.setCurrentStatusName(childNewStatus.getName());

                    patientTaskTrackerRepository.save(childTask);
                }
            } catch (Exception ignored) {
            }
        }
    }

    private void updateParentTaskWorkflowStatus(PatientTaskTracker parentTask, WorkflowStatus newStatus) {
        Long parentWorkflowId = parentTask.getWorkflow().getId();
        WorkflowStatus parentNewStatus = workflowStatusRepository
                .findByWorkflowIdAndStatusNameAndCustomFalse(parentWorkflowId, newStatus.getName())
                .orElseThrow(() -> new WorkStatusFlowNotFoundException(newStatus.getName()));

        parentTask.setPreviousWorkflowStatusId(
                parentTask.getCurrentWorkflowStatus().getId());
        parentTask.setCurrentWorkflowStatus(parentNewStatus);
        parentTask.setCurrentStatusName(parentNewStatus.getName());
        parentTask.setWorkflowPosition(parentTask.getWorkflowPosition());
        patientTaskTrackerRepository.save(parentTask);
    }

    @Override
    @Transactional
    public PatientTaskTrackerResponse changeWorkflow(SelectCaseForPatientTaskRequest request) {

        var requestProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        var isAdminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());

        if (isAdminWithDefaultTag && requestProfile.getInviterProfile() != null) {
            var inviterProfile = requestProfile.getInviterProfile();
            request.setProfileId(inviterProfile.getId());
            request.setOrganizationId(inviterProfile.getOrganization().getId());
            request.setDoctorId(inviterProfile.getDoctor().getId());
        }
        ServiceProduct serviceProduct = null;
        if (request.getServiceProductId() != null) {
            serviceProduct = serviceProductRepository
                    .findById(request.getServiceProductId())
                    .orElseThrow(() -> new ServiceProductNotFoundException(request.getServiceProductId()));
        }

        if (requestProfile.isPractice()) {
            if (request.getCaseType().equals(TaskType.OUTSOURCED_MANUFACTURING)) {
                return movePracticePlanToManufacturingOutsource(request, requestProfile, serviceProduct);
            }
            return changeWorkflowByPractice(request, requestProfile);
        }

        if (requestProfile.isInHouseManufacturingLab()
                && request.getCaseType().equals(TaskType.OUTSOURCED_PLANNING_ORDER)) {
            return moveGrowthPlanToPlanningOutsource(request, requestProfile, serviceProduct);
        }

        if (requestProfile.isInHouseManufacturingLab()
                && request.getCaseType().equals(TaskType.OUTSOURCED_MANUFACTURING)) {
            return moveGrowthPlanToManufacturingOutsource(request, requestProfile, serviceProduct);
        }
        PatientTaskTracker existing = patientTaskTrackerRepository
                .findByIdWithUserProfilesAndUsersWithPdo(request.getTaskId())
                .orElseThrow(() -> new PatientTaskNotFoundException(request.getTaskId()));
        String oldWorkflowName = existing.getWorkflowName();
        Long productId = request.getServiceProductId();
        var workflow = workflowRepository
                .findByNameAndOrderTypeAndUserIdAndNotSystemDefined(
                        request.getWorkflowName(), request.getOrderType(), request.getProfileId())
                .orElseThrow(() -> new WorkflowNotFoundException(request.getWorkflowName()));

        var newStatus = workflowStatusRepository
                .findByWorkflowIdAndStatusNameAndCustomFalse(workflow.getId(), request.getWorkflowStatusName())
                .orElseThrow(() -> new WorkStatusFlowNotFoundException(request.getWorkflowStatusName()));

        ManufacturingBatch manufacturing = null;
        if (request.getManufacturingId() != null) {
            manufacturing = manufacturingRepository
                    .getManufacturingById(request.getManufacturingId())
                    .orElseThrow(() -> new ManufacturingNotFoundException(request.getManufacturingId()));

            List<PatientTaskTracker> subtasks = createManufacturingAlignerSubtasks(
                    existing,
                    manufacturing,
                    existing.getCreatedByProfile(),
                    productId,
                    request.getServiceProducts(),
                    existing.getCreatedByProfile(),
                    serviceProduct);
            patientTaskTrackerRepository.saveAll(subtasks);
        }

        Order order = null;
        if (request.getOrderId() != null) {
            order = orderRepository
                    .findById(request.getOrderId())
                    .orElseThrow(() -> new OrderException(request.getOrderId()));
        }

        var patientTaskTracker = PatientTaskTracker.moveTask(
                existing, workflow, newStatus, request.getServiceProducts(), manufacturing, order, serviceProduct);
        if (manufacturing != null) {
            manufacturing.setPatientTaskTracker(patientTaskTracker);
            manufacturingRepository.save(manufacturing);
        }
        movePracticeOrEnterpriseTaskToProduction(request, manufacturing, order, serviceProduct);
        patientTaskTrackerRepository.save(patientTaskTracker);
        if (request.getCaseType().equals(TaskType.OUTSOURCED_PLANNING_ORDER)
                || request.getCaseType().equals(TaskType.OUTSOURCED_MANUFACTURING)) {

            var labUserProfile = userProfileRepository
                    .findByIdWithOrgAndDoctor(request.getLabProfileId())
                    .orElseThrow(() -> new DoctorNotFoundException(request.getLabProfileId()));
            var workflowForLab = workflowRepository
                    .findByNameAndOrderTypeAndUserIdAndNotSystemDefined(
                            request.getLabWorkflowName(), request.getLabOrderType(), request.getLabProfileId())
                    .orElseThrow(() -> new WorkflowNotFoundException(request.getWorkflowName()));

            var newStatusOfLab = workflowStatusRepository
                    .findByWorkflowIdAndStatusNameAndCustomFalse(
                            workflowForLab.getId(), request.getLabWorkflowStatusName())
                    .orElseThrow(() -> new WorkStatusFlowNotFoundException(request.getLabWorkflowStatusName()));

            var labOrderChildTask = PatientTaskTracker.createChildTaskForOrder(
                    existing,
                    order,
                    labUserProfile,
                    labUserProfile,
                    workflowForLab,
                    newStatusOfLab,
                    request.getServiceProducts(),
                    manufacturing,
                    request.getCaseType(),
                    productId,
                    serviceProduct);
            if (manufacturing != null) {
                manufacturing.setPatientTaskTracker(patientTaskTracker);
                manufacturingRepository.save(manufacturing);
            }
            patientTaskTrackerRepository.save(labOrderChildTask);
        }
        patientTaskTrackerRepository.save(existing);
        changeWorkflowActivityLog(request, oldWorkflowName, workflow, newStatus, requestProfile, existing);
        notificationService.workflowChangeNotifications(request, existing, requestProfile);

        return PatientTaskTracker.buildPatientTaskResponse(existing);
    }

    private PatientTaskTrackerResponse moveGrowthPlanToManufacturingOutsource(
            SelectCaseForPatientTaskRequest request, UserProfile requestProfile, ServiceProduct serviceProduct) {
        PatientTaskTracker existing = patientTaskTrackerRepository
                .findByIdWithUserProfilesAndUsersWithPdo(request.getTaskId())
                .orElseThrow(() -> new PatientTaskNotFoundException(request.getTaskId()));
        String oldWorkflowName = existing.getWorkflowName();
        Long productId = request.getServiceProductId();
        var workflow = workflowRepository
                .findByNameAndOrderTypeAndUserIdAndNotSystemDefined(
                        request.getWorkflowName(), request.getOrderType(), request.getProfileId())
                .orElseThrow(() -> new WorkflowNotFoundException(request.getWorkflowName()));

        var newStatus = workflowStatusRepository
                .findByWorkflowIdAndStatusNameAndCustomFalse(workflow.getId(), request.getWorkflowStatusName())
                .orElseThrow(() -> new WorkStatusFlowNotFoundException(request.getWorkflowStatusName()));

        ManufacturingBatch manufacturing = null;
        if (request.getManufacturingId() != null) {
            manufacturing = manufacturingRepository
                    .getManufacturingById(request.getManufacturingId())
                    .orElseThrow(() -> new ManufacturingNotFoundException(request.getManufacturingId()));
        }

        Order order = null;
        if (request.getOrderId() != null) {
            order = orderRepository
                    .findById(request.getOrderId())
                    .orElseThrow(() -> new OrderException(request.getOrderId()));
        }

        var patientTaskTracker = PatientTaskTracker.moveTask(
                existing, workflow, newStatus, request.getServiceProducts(), manufacturing, order, serviceProduct);
        if (manufacturing != null) {
            manufacturing.setPatientTaskTracker(patientTaskTracker);
            manufacturingRepository.save(manufacturing);
        }
        movePracticeOrEnterpriseTaskToProduction(request, manufacturing, order, serviceProduct);
        patientTaskTrackerRepository.save(patientTaskTracker);
        if (request.getCaseType().equals(TaskType.OUTSOURCED_MANUFACTURING)) {

            var labUserProfile = userProfileRepository
                    .findByIdWithOrgAndDoctor(request.getLabProfileId())
                    .orElseThrow(() -> new DoctorNotFoundException(request.getLabProfileId()));
            var workflowForLab = workflowRepository
                    .findByNameAndOrderTypeAndUserIdAndNotSystemDefined(
                            request.getLabWorkflowName(), request.getLabOrderType(), request.getLabProfileId())
                    .orElseThrow(() -> new WorkflowNotFoundException(request.getWorkflowName()));

            var newStatusOfLab = workflowStatusRepository
                    .findByWorkflowIdAndStatusNameAndCustomFalse(
                            workflowForLab.getId(), request.getLabWorkflowStatusName())
                    .orElseThrow(() -> new WorkStatusFlowNotFoundException(request.getLabWorkflowStatusName()));

            var labOrderChildTask = PatientTaskTracker.createChildTaskForOrder(
                    existing,
                    order,
                    labUserProfile,
                    labUserProfile,
                    workflowForLab,
                    newStatusOfLab,
                    request.getServiceProducts(),
                    manufacturing,
                    request.getCaseType(),
                    productId,
                    serviceProduct);
            if (manufacturing != null) {
                manufacturing.setPatientTaskTracker(patientTaskTracker);
                manufacturingRepository.save(manufacturing);
            }

            patientTaskTrackerRepository.save(labOrderChildTask);
            if (manufacturing != null) {
                List<PatientTaskTracker> subtasks = createManufacturingAlignerSubtasks(
                        labOrderChildTask,
                        manufacturing,
                        labOrderChildTask.getCreatedByProfile(),
                        productId,
                        request.getServiceProducts(),
                        labOrderChildTask.getCreatedByProfile(),
                        serviceProduct);
                patientTaskTrackerRepository.saveAll(subtasks);
            }
        }
        patientTaskTrackerRepository.save(existing);
        changeWorkflowActivityLog(request, oldWorkflowName, workflow, newStatus, requestProfile, existing);
        notificationService.workflowChangeNotifications(request, existing, requestProfile);

        return PatientTaskTracker.buildPatientTaskResponse(existing);
    }

    private PatientTaskTrackerResponse movePracticePlanToManufacturingOutsource(
            SelectCaseForPatientTaskRequest request, UserProfile requestProfile, ServiceProduct serviceProduct) {
        PatientTaskTracker existing = patientTaskTrackerRepository
                .findByIdWithUserProfilesAndUsersWithPdo(request.getTaskId())
                .orElseThrow(() -> new PatientTaskNotFoundException(request.getTaskId()));
        String oldWorkflowName = existing.getWorkflowName();
        Long productId = request.getServiceProductId();
        var workflow = workflowRepository
                .findByNameAndOrderTypeAndUserIdAndNotSystemDefined(
                        request.getWorkflowName(), request.getOrderType(), request.getProfileId())
                .orElseThrow(() -> new WorkflowNotFoundException(request.getWorkflowName()));

        var newStatus = workflowStatusRepository
                .findByWorkflowIdAndStatusNameAndCustomFalse(workflow.getId(), request.getWorkflowStatusName())
                .orElseThrow(() -> new WorkStatusFlowNotFoundException(request.getWorkflowStatusName()));

        ManufacturingBatch manufacturing = null;
        if (request.getManufacturingId() != null) {
            manufacturing = manufacturingRepository
                    .getManufacturingById(request.getManufacturingId())
                    .orElseThrow(() -> new ManufacturingNotFoundException(request.getManufacturingId()));
        }

        Order order = null;
        if (request.getOrderId() != null) {
            order = orderRepository
                    .findById(request.getOrderId())
                    .orElseThrow(() -> new OrderException(request.getOrderId()));
        }

        if (TaskType.OUTSOURCED_MANUFACTURING.equals(request.getCaseType())
                && manufacturing != null
                && manufacturing.getBatchNumber() != null
                && manufacturing.getBatchNumber() > 1) {
            var labUserProfile = userProfileRepository
                    .findByIdWithOrgAndDoctor(request.getLabProfileId())
                    .orElseThrow(() -> new DoctorNotFoundException(request.getLabProfileId()));
            var workflowForLab = workflowRepository
                    .findByNameAndOrderTypeAndUserIdAndNotSystemDefined(
                            request.getLabWorkflowName(), request.getLabOrderType(), request.getLabProfileId())
                    .orElseThrow(() -> new WorkflowNotFoundException(request.getWorkflowName()));

            var newStatusOfLab = workflowStatusRepository
                    .findByWorkflowIdAndStatusNameAndCustomFalse(
                            workflowForLab.getId(), request.getLabWorkflowStatusName())
                    .orElseThrow(() -> new WorkStatusFlowNotFoundException(request.getLabWorkflowStatusName()));

            var labOrderChildTask = PatientTaskTracker.createChildTaskForOrder(
                    existing,
                    order,
                    labUserProfile,
                    labUserProfile,
                    workflowForLab,
                    newStatusOfLab,
                    request.getServiceProducts(),
                    manufacturing,
                    request.getCaseType(),
                    productId,
                    serviceProduct);

            patientTaskTrackerRepository.save(labOrderChildTask);
            List<PatientTaskTracker> subtasks = createManufacturingAlignerSubtasks(
                    labOrderChildTask,
                    manufacturing,
                    labOrderChildTask.getCreatedByProfile(),
                    productId,
                    request.getServiceProducts(),
                    labOrderChildTask.getCreatedByProfile(),
                    serviceProduct);
            patientTaskTrackerRepository.saveAll(subtasks);
        } else {
            if (request.getManufacturingId() != null
                    && request.getLabProfileId() != null
                    && TaskType.OUTSOURCED_MANUFACTURING.equals(request.getCaseType())) {
                var labProfileId = userProfileRepository
                        .findByIdWithOrgAndDoctor(request.getLabProfileId())
                        .orElseThrow(() -> new DoctorNotFoundException(request.getLabProfileId()));
                List<PatientTaskTracker> patientTasks =
                        patientTaskTrackerRepository.findIndividualPatientTaskByProfileId(
                                labProfileId.getOrganization().getId(), labProfileId.getId(), request.getPatientId());

                ManufacturingBatch finalManufacturing = manufacturingRepository
                        .getManufacturingById(request.getManufacturingId())
                        .orElseThrow(() -> new ManufacturingNotFoundException(request.getManufacturingId()));

                var planningTasks = patientTasks.stream()
                        .filter(task -> PLANNING_IN_HOUSE_WORKFLOW.equalsIgnoreCase(
                                task.getWorkflow().getName()))
                        .toList();

                if (planningTasks.isEmpty()) {
                    var workflowForLab = workflowRepository
                            .findByNameAndOrderTypeAndUserIdAndNotSystemDefined(
                                    request.getLabWorkflowName(), request.getLabOrderType(), request.getLabProfileId())
                            .orElseThrow(() -> new WorkflowNotFoundException(request.getLabWorkflowName()));

                    var newStatusOfLab = workflowStatusRepository
                            .findByWorkflowIdAndStatusNameAndCustomFalse(
                                    workflowForLab.getId(), request.getLabWorkflowStatusName())
                            .orElseThrow(() -> new WorkStatusFlowNotFoundException(request.getLabWorkflowStatusName()));

                    var labOrderChildTask = PatientTaskTracker.createChildTaskForOrder(
                            existing,
                            order,
                            labProfileId,
                            labProfileId,
                            workflowForLab,
                            newStatusOfLab,
                            request.getServiceProducts(),
                            finalManufacturing,
                            request.getCaseType(),
                            productId,
                            serviceProduct);

                    patientTaskTrackerRepository.save(labOrderChildTask);

                    List<PatientTaskTracker> subtasks = createManufacturingAlignerSubtasks(
                            labOrderChildTask,
                            finalManufacturing,
                            labOrderChildTask.getCreatedByProfile(),
                            productId,
                            request.getServiceProducts(),
                            labOrderChildTask.getCreatedByProfile(),
                            serviceProduct);
                    patientTaskTrackerRepository.saveAll(subtasks);
                } else {
                    planningTasks.forEach(task -> {
                        List<PatientTaskTracker> subtasks = createManufacturingAlignerSubtasks(
                                task,
                                finalManufacturing,
                                task.getCreatedByProfile(),
                                productId,
                                request.getServiceProducts(),
                                task.getCreatedByProfile(),
                                serviceProduct);
                        patientTaskTrackerRepository.saveAll(subtasks);
                    });
                }
            }
        }
        var patientTaskTracker = PatientTaskTracker.moveTask(
                existing, workflow, newStatus, request.getServiceProducts(), manufacturing, order, serviceProduct);
        if (manufacturing != null) {
            manufacturing.setPatientTaskTracker(patientTaskTracker);
            manufacturingRepository.save(manufacturing);
        }
        movePracticeOrEnterpriseTaskToProduction(request, manufacturing, order, serviceProduct);
        patientTaskTrackerRepository.save(patientTaskTracker);
        patientTaskTrackerRepository.save(existing);
        changeWorkflowActivityLog(request, oldWorkflowName, workflow, newStatus, requestProfile, existing);
        notificationService.workflowChangeNotifications(request, existing, requestProfile);

        return PatientTaskTracker.buildPatientTaskResponse(existing);
    }

    private PatientTaskTrackerResponse changeWorkflowByPractice(
            SelectCaseForPatientTaskRequest request, UserProfile userProfile) {
        PatientTaskTracker existing = patientTaskTrackerRepository
                .findByIdWithUserProfilesAndUsersWithPdo(request.getTaskId())
                .orElseThrow(() -> new PatientTaskNotFoundException(request.getTaskId()));
        String oldWorkflowName = existing.getWorkflowName();
        Long productId = request.getServiceProductId();
        var workflow = workflowRepository
                .findByNameAndOrderTypeAndUserIdAndNotSystemDefined(
                        request.getWorkflowName(), request.getOrderType(), request.getProfileId())
                .orElseThrow(() -> new WorkflowNotFoundException(request.getWorkflowName()));

        var newStatus = workflowStatusRepository
                .findByWorkflowIdAndStatusNameAndCustomFalse(workflow.getId(), request.getWorkflowStatusName())
                .orElseThrow(() -> new WorkStatusFlowNotFoundException(request.getWorkflowStatusName()));

        Order order = null;
        if (request.getOrderId() != null) {
            order = orderRepository
                    .findById(request.getOrderId())
                    .orElseThrow(() -> new OrderException(request.getOrderId()));
        }
        ServiceProduct serviceProduct;
        if (request.getServiceProductId() != null) {
            serviceProduct = serviceProductRepository
                    .findById(request.getServiceProductId())
                    .orElseThrow(() -> new ServiceProductNotFoundException(request.getServiceProductId()));
        } else {
            serviceProduct = null;
        }

        ManufacturingBatch manufacturing = null;
        if (request.getManufacturingId() != null && userProfile.getInviterProfile() != null) {
            var inviterProfile = userProfile.getInviterProfile();
            List<PatientTaskTracker> patientTasks = patientTaskTrackerRepository.findIndividualPatientTaskByProfileId(
                    inviterProfile.getOrganization().getId(), inviterProfile.getId(), request.getPatientId());

            ManufacturingBatch finalManufacturing = manufacturingRepository
                    .getManufacturingById(request.getManufacturingId())
                    .orElseThrow(() -> new ManufacturingNotFoundException(request.getManufacturingId()));

            patientTasks.stream()
                    .filter(task -> PLANNING_IN_HOUSE_WORKFLOW.equalsIgnoreCase(
                            task.getWorkflow().getName()))
                    .forEach(task -> {
                        List<PatientTaskTracker> subtasks = createManufacturingAlignerSubtasks(
                                task,
                                finalManufacturing,
                                task.getCreatedByProfile(),
                                productId,
                                request.getServiceProducts(),
                                task.getCreatedByProfile(),
                                serviceProduct);
                        patientTaskTrackerRepository.saveAll(subtasks);
                    });

            manufacturing = finalManufacturing;
        }

        var patientTaskTracker = PatientTaskTracker.moveTask(
                existing, workflow, newStatus, request.getServiceProducts(), manufacturing, order, serviceProduct);
        if (manufacturing != null) {
            manufacturing.setPatientTaskTracker(patientTaskTracker);
            manufacturingRepository.save(manufacturing);
        }
        movePracticeOrEnterpriseTaskToProduction(request, manufacturing, order, serviceProduct);
        patientTaskTrackerRepository.save(patientTaskTracker);

        patientTaskTrackerRepository.save(existing);
        changeWorkflowActivityLog(request, oldWorkflowName, workflow, newStatus, userProfile, existing);
        notificationService.workflowChangeNotifications(request, existing, userProfile);

        return PatientTaskTracker.buildPatientTaskResponse(existing);
    }

    private PatientTaskTrackerResponse moveGrowthPlanToPlanningOutsource(
            SelectCaseForPatientTaskRequest request, UserProfile userProfile, ServiceProduct serviceProduct) {
        PatientTaskTracker existing = patientTaskTrackerRepository
                .findByIdWithUserProfilesAndUsersWithPdo(request.getTaskId())
                .orElseThrow(() -> new PatientTaskNotFoundException(request.getTaskId()));
        String oldWorkflowName = existing.getWorkflowName();
        var workflow = workflowRepository
                .findByNameAndOrderTypeAndUserIdAndNotSystemDefined(
                        request.getWorkflowName(), request.getOrderType(), request.getProfileId())
                .orElseThrow(() -> new WorkflowNotFoundException(request.getWorkflowName()));

        var newStatus = workflowStatusRepository
                .findByWorkflowIdAndStatusNameAndCustomFalse(workflow.getId(), request.getWorkflowStatusName())
                .orElseThrow(() -> new WorkStatusFlowNotFoundException(request.getWorkflowStatusName()));
        Order order = null;
        if (request.getOrderId() != null) {
            order = orderRepository
                    .findById(request.getOrderId())
                    .orElseThrow(() -> new OrderException(request.getOrderId()));
        }
        var patientTaskTracker = PatientTaskTracker.moveTask(
                existing, workflow, newStatus, request.getServiceProducts(), null, order, serviceProduct);

        patientTaskTrackerRepository.save(patientTaskTracker);

        patientTaskTrackerRepository.save(existing);
        createPlanningOrderTaskForGrowthLab(request, existing, serviceProduct);
        changeWorkflowActivityLog(request, oldWorkflowName, workflow, newStatus, userProfile, existing);
        notificationService.workflowChangeNotifications(request, existing, userProfile);

        return PatientTaskTracker.buildPatientTaskResponse(existing);
    }

    private void changeWorkflowActivityLog(
            SelectCaseForPatientTaskRequest request,
            String oldWorkflowName,
            Workflow workflow,
            WorkflowStatus newStatus,
            UserProfile userProfile,
            PatientTaskTracker existing) {
        String activityDescription = String.format(
                "Case moved from %s to %s workflow. New status: %s.",
                ActivityStatusMapper.toReadableString(oldWorkflowName),
                ActivityStatusMapper.toReadableString(workflow.getName()),
                ActivityStatusMapper.toReadableString(newStatus.getInternalName()));

        boolean isCustomActivity = false;
        if (userProfile.isInHouseManufacturingLab()) {
            isCustomActivity = NEW_CASE.equals(workflow.getName())
                    || PLANNING_IN_HOUSE_WORKFLOW.equals(workflow.getName())
                    || PRODUCTION_IN_HOUSE_WORKFLOW.equals(workflow.getName());
        }
        Set<UserProfile> userProfiles = getUserProfilesForActivityLogsChangeWorkflow(userProfile, existing, request);

        ActivityRequest activityRequest;
        Set<UserProfile> specificProfiles = new HashSet<>();
        specificProfiles.add(userProfile);
        specificProfiles.addAll(userProfiles);
        if (newStatus.getCustom()) {
            activityRequest = ActivityRequest.builder()
                    .patientId(request.getPatientId())
                    .activityBy(request.getProfileId())
                    .activityType(ActivityType.CHANGE_WORKFLOW)
                    .activity(activityDescription)
                    .isCustomActivity(true)
                    .visibilityScope(VisibilityScope.SPECIFIC)
                    .visibleToProfiles(specificProfiles)
                    .build();
        } else {
            activityRequest = ActivityRequest.builder()
                    .patientId(request.getPatientId())
                    .activityBy(request.getProfileId())
                    .activityType(ActivityType.CHANGE_WORKFLOW)
                    .activity(activityDescription)
                    .isCustomActivity(isCustomActivity)
                    .visibilityScope(VisibilityScope.SPECIFIC)
                    .visibleToProfiles(specificProfiles)
                    .build();
        }

        activityLogService.createActivityLog(activityRequest);
    }

    private void movePracticeOrEnterpriseTaskToProduction(
            SelectCaseForPatientTaskRequest request,
            ManufacturingBatch manufacturingBatch,
            Order order,
            ServiceProduct serviceProduct) {

        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(request.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException(request.getPatientId()));

        var labProfileId = request.getLabProfileId();
        UserProfile labUserProfile = null;
        if (labProfileId != null) {
            labUserProfile = userProfileRepository
                    .findByIdWithOrgAndDoctorAndUseWithInviterRoles(labProfileId)
                    .orElseThrow(() -> new DoctorNotFoundException(labProfileId));
        }

        UserProfile userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

        if (request.getCaseType().equals(TaskType.IN_HOUSE_PLANNING_ORDER)
                && UserProfile.isEnterpriseCompanyLab(userProfile.getRoles())) {
            UserProfile practiceProfile = patient.getDoctorOrganization().getUserProfile();
            List<PatientTaskTracker> practicePatientTasks =
                    patientTaskTrackerRepository.findIndividualPatientTaskByProfileId(
                            practiceProfile.getOrganization().getId(), practiceProfile.getId(), patient.getId());
            practicePatientTasks.stream()
                    .filter(task -> NEW_CASE.equalsIgnoreCase(task.getWorkflow().getName()))
                    .forEach(task -> {
                        Workflow newWorkflow = workflowRepository
                                .findByNameAndOrderTypeAndUserIdAndNotSystemDefined(
                                        PLAN_OUTSOURCED_WORKFLOW, request.getOrderType(), practiceProfile.getId())
                                .orElseThrow(() -> new WorkflowNotFoundException(PLAN_OUTSOURCED_WORKFLOW));

                        WorkflowStatus newStatus = workflowStatusRepository
                                .findByWorkflowIdAndStatusNameAndCustomFalse(newWorkflow.getId(), TO_DO)
                                .orElseThrow(() -> new WorkStatusFlowNotFoundException(TO_DO));

                        PatientTaskTracker migratedTask = PatientTaskTracker.moveTask(
                                task,
                                newWorkflow,
                                newStatus,
                                request.getServiceProducts(),
                                manufacturingBatch,
                                order,
                                serviceProduct);

                        patientTaskTrackerRepository.save(migratedTask);
                    });
        }

        if (request.getCaseType().equals(TaskType.OUTSOURCED_PLANNING_ORDER)) {
            UserProfile enterpriseProfile = getUserProfile(userProfile, patient, labUserProfile);

            if (enterpriseProfile != null) {
                List<PatientTaskTracker> practicePatientTasks =
                        patientTaskTrackerRepository.findIndividualPatientTaskByProfileId(
                                enterpriseProfile.getOrganization().getId(),
                                enterpriseProfile.getId(),
                                patient.getId());

                practicePatientTasks.stream()
                        .filter(task ->
                                NEW_CASE.equalsIgnoreCase(task.getWorkflow().getName()))
                        .forEach(task -> {
                            Workflow newWorkflow = workflowRepository
                                    .findByNameAndOrderTypeAndUserIdAndNotSystemDefined(
                                            PLANNING_IN_HOUSE_WORKFLOW,
                                            request.getOrderType(),
                                            enterpriseProfile.getId())
                                    .orElseThrow(() -> new WorkflowNotFoundException(PLANNING_IN_HOUSE_WORKFLOW));

                            WorkflowStatus newStatus = workflowStatusRepository
                                    .findByWorkflowIdAndStatusNameAndCustomFalse(newWorkflow.getId(), TO_DO)
                                    .orElseThrow(() -> new WorkStatusFlowNotFoundException(TO_DO));

                            PatientTaskTracker migratedTask = PatientTaskTracker.moveTask(
                                    task,
                                    newWorkflow,
                                    newStatus,
                                    request.getServiceProducts(),
                                    manufacturingBatch,
                                    order,
                                    serviceProduct);

                            patientTaskTrackerRepository.save(migratedTask);
                        });
            }
        }
        record MigrationConfig(UserProfile targetProfile, String targetWorkflowName, String targetStatusName) {}

        Optional<MigrationConfig> migrationConfig = Optional.empty();

        if (request.getCaseType().equals(TaskType.IN_HOUSE_MANUFACTURING)
                && UserProfile.isEnterpriseCompanyLab(userProfile.getRoles())) {

            UserProfile practiceProfile = patient.getDoctorOrganization().getUserProfile();
            migrationConfig =
                    Optional.of(new MigrationConfig(practiceProfile, PRODUCTION_OUTSOURCE_WORKFLOW, IN_PROGRESS));
        } else if (request.getCaseType().equals(TaskType.OUTSOURCED_MANUFACTURING)
                && userProfile.isPractice()
                && userProfile.getInviterProfile() != null) {

            var inviterProfile = userProfile.getInviterProfile();
            var targetProfile =
                    (labUserProfile != null && !Objects.equals(inviterProfile.getId(), labUserProfile.getId()))
                            ? labUserProfile
                            : inviterProfile;

            migrationConfig = Optional.of(new MigrationConfig(targetProfile, PRODUCTION_IN_HOUSE_WORKFLOW, TO_DO));
        }

        migrationConfig.ifPresent(config -> {
            List<PatientTaskTracker> patientTasks = patientTaskTrackerRepository.findIndividualPatientTaskByProfileId(
                    config.targetProfile.getOrganization().getId(), config.targetProfile.getId(), patient.getId());

            boolean isOutsourcedManufacturing = request.getCaseType().equals(TaskType.OUTSOURCED_MANUFACTURING);

            patientTasks.stream()
                    .filter(task -> PLAN_OUTSOURCED_WORKFLOW.equalsIgnoreCase(
                                    task.getWorkflow().getName())
                            || PLANNING_IN_HOUSE_WORKFLOW.equalsIgnoreCase(
                                    task.getWorkflow().getName()))
                    .filter(task -> !isOutsourcedManufacturing
                            || !task.getWorkflow().getName().equals(PLAN_OUTSOURCED_WORKFLOW))
                    .forEach(task -> {
                        Workflow newWorkflow = workflowRepository
                                .findByNameAndOrderTypeAndUserIdAndNotSystemDefined(
                                        config.targetWorkflowName, request.getOrderType(), config.targetProfile.getId())
                                .orElseThrow(() -> new WorkflowNotFoundException(config.targetWorkflowName));

                        WorkflowStatus newStatus = workflowStatusRepository
                                .findByWorkflowIdAndStatusNameAndCustomFalse(
                                        newWorkflow.getId(), config.targetStatusName)
                                .orElseThrow(() -> new WorkStatusFlowNotFoundException(config.targetStatusName));

                        PatientTaskTracker migratedTask = PatientTaskTracker.moveTask(
                                task,
                                newWorkflow,
                                newStatus,
                                request.getServiceProducts(),
                                manufacturingBatch,
                                order,
                                serviceProduct);

                        patientTaskTrackerRepository.save(migratedTask);
                    });
        });
    }

    private void createPlanningOrderTaskForGrowthLab(
            SelectCaseForPatientTaskRequest request, PatientTaskTracker parentTask, ServiceProduct serviceProduct) {

        Order order = null;
        if (request.getOrderId() != null) {
            order = orderRepository
                    .findById(request.getOrderId())
                    .orElseThrow(() -> new OrderException(request.getOrderId()));
        }

        var labUserProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(request.getLabProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getLabProfileId()));

        var workflowForLab = workflowRepository
                .findByNameAndOrderTypeAndUserIdAndNotSystemDefined(
                        request.getLabWorkflowName(), request.getLabOrderType(), request.getLabProfileId())
                .orElseThrow(() -> new WorkflowNotFoundException(request.getWorkflowName()));

        var newStatusOfLab = workflowStatusRepository
                .findByWorkflowIdAndStatusNameAndCustomFalse(workflowForLab.getId(), request.getLabWorkflowStatusName())
                .orElseThrow(() -> new WorkStatusFlowNotFoundException(request.getLabWorkflowStatusName()));

        List<PatientTaskTracker> existingLabTasks = patientTaskTrackerRepository.findIndividualPatientTaskByProfileId(
                labUserProfile.getOrganization().getId(),
                labUserProfile.getId(),
                parentTask.getPatient().getId());

        Optional<PatientTaskTracker> existingTask = existingLabTasks.stream()
                .filter(task -> NEW_CASE.equalsIgnoreCase(task.getWorkflow().getName()))
                .findFirst();

        if (existingTask.isPresent()) {

            PatientTaskTracker taskToUpdate = existingTask.get();

            PatientTaskTracker migratedTask = PatientTaskTracker.moveTask(
                    taskToUpdate,
                    workflowForLab,
                    newStatusOfLab,
                    request.getServiceProducts(),
                    null,
                    order,
                    serviceProduct);

            patientTaskTrackerRepository.save(migratedTask);
        } else {

            var labOrderChildTask = PatientTaskTracker.createChildTaskForOrder(
                    parentTask,
                    order,
                    labUserProfile,
                    labUserProfile,
                    workflowForLab,
                    newStatusOfLab,
                    request.getServiceProducts(),
                    null,
                    request.getCaseType(),
                    request.getServiceProductId(),
                    serviceProduct);
            patientTaskTrackerRepository.save(labOrderChildTask);
        }
    }

    @Nullable
    private static UserProfile getUserProfile(UserProfile userProfile, Patient patient, UserProfile labUserProfile) {
        UserProfile enterpriseProfile;

        if (userProfile.isPractice() && userProfile.getInviterProfile() != null) {
            enterpriseProfile = userProfile.getInviterProfile();
            if (labUserProfile != null && !Objects.equals(enterpriseProfile.getId(), labUserProfile.getId())) {
                enterpriseProfile = labUserProfile;
            }
        } else if (userProfile.isInHouseManufacturingLab()
                && patient.getDoctorOrganization().getOrgUserProfile() != null) {
            enterpriseProfile = patient.getDoctorOrganization().getOrgUserProfile();
        } else {
            enterpriseProfile = null;
        }
        return enterpriseProfile;
    }

    @Transactional
    public List<PatientTaskTracker> createManufacturingAlignerSubtasks(
            PatientTaskTracker parentTask,
            ManufacturingBatch manufacturingBatch,
            UserProfile createdByProfile,
            Long productId,
            JsonNode serviceProducts,
            UserProfile assigneeProfile,
            ServiceProduct serviceProduct) {

        List<PatientTaskTracker> subtasks = new ArrayList<>();

        Integer batchNumber =
                calculateBatchNumber(manufacturingBatch.getTreatmentPlan().getId(), manufacturingBatch.getId());
        var workflow = workflowRepository
                .findByNameAndOrderTypeAndUserIdAndNotSystemDefined(
                        ONGOING_PRODUCT_LIST, ALIGNER_ORDER_TYPE, createdByProfile.getId())
                .orElseThrow(() -> new WorkflowNotFoundException(ONGOING_PRODUCT_LIST));
        var initialStatus = workflowStatusRepository
                .findByWorkflowIdAndStatusNameAndCustomFalse(workflow.getId(), TO_DO)
                .orElseThrow(() -> new WorkStatusFlowNotFoundException(TO_DO));
        if (manufacturingBatch.getUpperAlignerStart() != null && manufacturingBatch.getUpperAlignerEnd() != null) {
            for (int alignerNumber = manufacturingBatch.getUpperAlignerStart();
                    alignerNumber <= manufacturingBatch.getUpperAlignerEnd();
                    alignerNumber++) {

                var tagName = manufacturingBatch.getTreatmentPlan().getTreatmentPlanName();
                var version = convertTreatmentTagToVersion(tagName);
                ManufacturingMetadata manufacturingMetadata = createManufacturingMetadata(
                        manufacturingBatch.getTreatmentPlan().getId(),
                        manufacturingBatch.getId(),
                        batchNumber,
                        JawType.UPPER,
                        alignerNumber,
                        version);

                PatientTaskTracker subtask = PatientTaskTracker.createSubTaskForManufacturingOrder(
                        parentTask,
                        createdByProfile,
                        workflow,
                        initialStatus,
                        manufacturingBatch,
                        manufacturingMetadata,
                        productId,
                        serviceProducts,
                        assigneeProfile,
                        serviceProduct);
                subtasks.add(subtask);
            }
        }

        if (manufacturingBatch.getLowerAlignerStart() != null && manufacturingBatch.getLowerAlignerEnd() != null) {
            for (int alignerNumber = manufacturingBatch.getLowerAlignerStart();
                    alignerNumber <= manufacturingBatch.getLowerAlignerEnd();
                    alignerNumber++) {
                var tagName = manufacturingBatch.getTreatmentPlan().getTreatmentPlanTagName();
                var version = convertTreatmentTagToVersion(tagName);
                ManufacturingMetadata manufacturingMetadata = createManufacturingMetadata(
                        manufacturingBatch.getTreatmentPlan().getId(),
                        manufacturingBatch.getId(),
                        batchNumber,
                        JawType.LOWER,
                        alignerNumber,
                        version);

                PatientTaskTracker subtask = PatientTaskTracker.createSubTaskForManufacturingOrder(
                        parentTask,
                        createdByProfile,
                        workflow,
                        initialStatus,
                        manufacturingBatch,
                        manufacturingMetadata,
                        productId,
                        serviceProducts,
                        assigneeProfile,
                        serviceProduct);

                subtasks.add(subtask);
            }
        }

        return subtasks;
    }

    public static String convertTreatmentTagToVersion(String tagName) {
        if (tagName == null || tagName.trim().isEmpty()) {
            return "V1";
        }
        java.util.regex.Matcher matcher =
                java.util.regex.Pattern.compile("\\d+").matcher(tagName);
        if (matcher.find()) {
            int number = Integer.parseInt(matcher.group());
            return "V" + number;
        }
        return "V1";
    }

    private ManufacturingMetadata createManufacturingMetadata(
            Long treatmentPlanId,
            Long manufacturingId,
            Integer batchNumber,
            JawType jawType,
            Integer alignerNumber,
            String treatmentVersion) {

        return new ManufacturingMetadata(
                treatmentPlanId,
                batchNumber,
                ManufacturingMetadata.Category.ALIGNER,
                jawType,
                alignerNumber,
                manufacturingId,
                treatmentVersion);
    }

    private Integer calculateBatchNumber(Long treatmentPlanId, Long currentManufacturingBatchId) {
        List<ManufacturingBatchSummary> allBatches =
                manufacturingRepository.findSummariesByTreatmentPlanId(treatmentPlanId);

        for (int i = 0; i < allBatches.size(); i++) {
            if (allBatches.get(i).getId().equals(currentManufacturingBatchId)) {
                return i + 1;
            }
        }
        return 1;
    }

    private PatientTaskTrackerResponse getPatientTaskResponseWithManufacturing(PatientTaskTracker patientTaskTracker) {
        return getPatientTaskResponseWithManufacturing(patientTaskTracker, Collections.emptyMap());
    }

    private PatientTaskTrackerResponse getPatientTaskResponseWithManufacturing(
            PatientTaskTracker patientTaskTracker,
            Map<Long, UnprocessedAlignerResponse> manufacturingResponseByTreatmentPlanId) {
        var response = PatientTaskTracker.buildPatientTaskResponse(patientTaskTracker);

        try {
            Long treatmentPlanId = Optional.ofNullable(patientTaskTracker.getManufacturingBatch())
                    .map(ManufacturingBatch::getTreatmentPlan)
                    .map(TreatmentPlan::getId)
                    .orElse(null);

            if (treatmentPlanId != null) {
                var manufacturingResponse = manufacturingResponseByTreatmentPlanId.containsKey(treatmentPlanId)
                        ? manufacturingResponseByTreatmentPlanId.get(treatmentPlanId)
                        : Optional.ofNullable(treatmentPlanRepository.findTreatmentPlanSummaryById(treatmentPlanId))
                                .map(unprocessedAlignerService::mapToUnprocessedAlignerResponse)
                                .orElse(null);
                if (manufacturingResponse != null) {
                    response.setManufacturingBatchResponse(manufacturingResponse);
                }
            }
        } catch (Exception e) {
            response.setManufacturingBatchResponse(null);
        }

        return response;
    }

    private PatientTaskTrackerResponseForMcp getPatientTaskResponse(PatientTaskTracker patientTaskTracker) {
        return PatientTaskTrackerResponseForMcp.buildPatientTaskResponse(patientTaskTracker);
    }
}
