package com.dentalstack.patient.feature.treatment.service.impl;

import static com.dentalstack.patient.feature.storage.files.service.FilesService.*;
import static com.dentalstack.patient.feature.workflow.core.task_tracker.service.PatientTaskTrackerServiceImpl.*;

import com.dentalstack.patient.application.config.WhatsappTemplateTypeProperties;
import com.dentalstack.patient.feature.aligner.cache.AlignerCacheEvict;
import com.dentalstack.patient.feature.aligner.dto.aligner.STLFileMetadata;
import com.dentalstack.patient.feature.aligner.dto.aligner.v2.CreateAlignerJourneyRequest;
import com.dentalstack.patient.feature.aligner.dto.alignertreatment.AlignerTreatmentResponse;
import com.dentalstack.patient.feature.aligner.dto.alignertreatment.LowerJawDetails;
import com.dentalstack.patient.feature.aligner.dto.alignertreatment.UpperJawDetails;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.aligner.service.AlignerService;
import com.dentalstack.patient.feature.braces.entity.BracesJourney;
import com.dentalstack.patient.feature.braces.enums.BracesTreatmentStage;
import com.dentalstack.patient.feature.braces.repository.BracesJourneyRepository;
import com.dentalstack.patient.feature.dashboardlabel.cache.DashboardCacheEvictService;
import com.dentalstack.patient.feature.doctor.entity.PatientDoctorOrganization;
import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.doctor.enums.ProfileType;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.invitation.entity.Invitation;
import com.dentalstack.patient.feature.invitation.entity.PatientInvitationDetails;
import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.invitation.repository.PatientInvitationDetailsRepository;
import com.dentalstack.patient.feature.notification.dto.EmailSendReq;
import com.dentalstack.patient.feature.notification.dto.OrderManagementEmailRequest;
import com.dentalstack.patient.feature.notification.dto.SendNotificationRequest;
import com.dentalstack.patient.feature.notification.dto.planningcustomer.InRevisionEmailRequest;
import com.dentalstack.patient.feature.notification.dto.planningcustomer.PlanApprovedEmailRequest;
import com.dentalstack.patient.feature.notification.dto.planningcustomer.PlanReadyEmailRequest;
import com.dentalstack.patient.feature.notification.dto.planningcustomer.StlFileUploadedEmailRequest;
import com.dentalstack.patient.feature.notification.enums.MessageSendTo;
import com.dentalstack.patient.feature.notification.service.*;
import com.dentalstack.patient.feature.notification.util.ResolveOrgName;
import com.dentalstack.patient.feature.notification.util.ResolveWebUrl;
import com.dentalstack.patient.feature.notification.util.WhatsAppUtilities;
import com.dentalstack.patient.feature.notification.util.XOrganizationNameResolver;
import com.dentalstack.patient.feature.order.constant.OrderConstant;
import com.dentalstack.patient.feature.order.dto.ShippingDetailsResponse;
import com.dentalstack.patient.feature.order.entity.ManufacturingBatch;
import com.dentalstack.patient.feature.order.entity.Order;
import com.dentalstack.patient.feature.order.entity.OrderComments;
import com.dentalstack.patient.feature.order.enums.OrderStatus;
import com.dentalstack.patient.feature.order.enums.OrderTreatmentPlanStatus;
import com.dentalstack.patient.feature.order.exception.ShippingDetailsNotFoundException;
import com.dentalstack.patient.feature.order.projection.ManufacturingBatchProjection;
import com.dentalstack.patient.feature.order.repository.OrderCommentsRepository;
import com.dentalstack.patient.feature.order.repository.OrderRepository;
import com.dentalstack.patient.feature.order.repository.ShippingDetailsRepository;
import com.dentalstack.patient.feature.order.service.OrderManagementNotificationService;
import com.dentalstack.patient.feature.patient.dto.AddPatientCommentRequest;
import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.feature.patient.dto.TreatmentPlanRequest;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.patient.service.PatientCommentService;
import com.dentalstack.patient.feature.producttype.entity.Product;
import com.dentalstack.patient.feature.producttype.repository.ProductRepository;
import com.dentalstack.patient.feature.storage.drive.GDrivePlatformProvider;
import com.dentalstack.patient.feature.storage.drive.async.DriveAsyncHelper;
import com.dentalstack.patient.feature.storage.drive.service.GoogleDriveService;
import com.dentalstack.patient.feature.storage.files.dto.*;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.feature.storage.files.enums.HasShared;
import com.dentalstack.patient.feature.storage.files.repository.FileRepository;
import com.dentalstack.patient.feature.storage.files.service.FilesService;
import com.dentalstack.patient.feature.subcription.exception.StorageLimitExceededException;
import com.dentalstack.patient.feature.subcription.service.SubscriptionService;
import com.dentalstack.patient.feature.timeline.enums.EventType;
import com.dentalstack.patient.feature.timeline.metadata.event.*;
import com.dentalstack.patient.feature.timeline.metadata.event.laborder.StlFileApprovedMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.laborder.ThirdPartyCustomerApproveTreatmentPlanMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.laborder.ThirdPartyCustomerRequestForStlFilesMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.planningcustomer.PlanningCustomerLabUploadedStlFilesMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.planningcustomer.PlanningCustomerTreatmentPlanApprovedMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.planningcustomer.PlanningCustomerTreatmentPlanRevisionMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.planningcustomer.PlanningCustomerTreatmentPlanSendForApprovalMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.treatement.ReplanTreamentEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.treatement.TreatmentPlanFinalisedEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.treatement.TreatmentPlanSentForApprovalByOrgEventMetadata;
import com.dentalstack.patient.feature.timeline.service.TimelineService;
import com.dentalstack.patient.feature.tracking.entity.Tracking;
import com.dentalstack.patient.feature.tracking.enums.PatientTrackingStatus;
import com.dentalstack.patient.feature.tracking.enums.Status;
import com.dentalstack.patient.feature.tracking.exception.TrackingNotFoundException;
import com.dentalstack.patient.feature.tracking.repository.TrackingRepository;
import com.dentalstack.patient.feature.treatment.dto.*;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlanVideoFile;
import com.dentalstack.patient.feature.treatment.enums.TreatmentPlanVideoTags;
import com.dentalstack.patient.feature.treatment.enums.TreatmentType;
import com.dentalstack.patient.feature.treatment.exception.TreatmentNotFoundException;
import com.dentalstack.patient.feature.treatment.exception.TreatmentPlanNotFoundException;
import com.dentalstack.patient.feature.treatment.projection.TreatmentPlanProfileSummary;
import com.dentalstack.patient.feature.treatment.projection.TreatmentPlanSummary;
import com.dentalstack.patient.feature.treatment.repository.TreatmentPlanRepository;
import com.dentalstack.patient.feature.treatment.repository.TreatmentPlanVideoRepository;
import com.dentalstack.patient.feature.treatment.service.TreatmentService;
import com.dentalstack.patient.feature.user.entity.Role;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.workflow.core.task_tracker.dto.MoveSingleTaskRequest;
import com.dentalstack.patient.feature.workflow.core.task_tracker.entity.PatientTaskTracker;
import com.dentalstack.patient.feature.workflow.core.task_tracker.repository.PatientTaskTrackerRepository;
import com.dentalstack.patient.feature.workflow.core.task_tracker.service.PatientTaskTrackerService;
import com.dentalstack.patient.feature.workflow.service_configuration.repository.ServiceConfigurationRepository;
import com.dentalstack.patient.feature.workflow.util.CaseActivityLogger;
import com.dentalstack.patient.global.dto.UserId;
import com.dentalstack.patient.global.enums.ProductTypeName;
import com.dentalstack.patient.global.exception.GenericException;
import com.dentalstack.patient.global.utils.InternalUserProfileUtil;
import com.dentalstack.patient.global.utils.OrderTreatmentCommonUtil;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class TreatmentServiceImpl implements TreatmentService {

    private final FilesService filesService;
    private final ProductRepository productRepository;
    private final PatientRepository patientRepository;
    private final TreatmentPlanRepository treatmentPlanRepository;
    private final PatientInvitationDetailsRepository patientInvitationDetailsRepository;
    private final AlignerService alignerService;
    private final TimelineService timelineService;
    private final BracesJourneyRepository bracesJourneyRepository;
    private final SubscriptionService subscriptionService;
    private final ChatService chatService;
    private final AlignerCacheEvict alignerCacheEvict;
    private final NotificationService notificationService;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final UserProfileRepository userProfileRepository;
    private final OrderRepository orderRepository;
    private final OrderCommentsRepository orderCommentsRepository;
    private final OrderManagementNotificationService orderManagementNotificationService;
    private final DashboardCacheEvictService dashboardCacheEvictService;
    private final FileRepository fileRepository;
    private final TreatmentCompletionEmailService treatmentCompletionEmailService;
    private final TrackingRepository trackingRepository;
    private final ShippingDetailsRepository shippingDetailsRepository;
    private final PatientCommentService patientCommentService;
    private final PatientTaskTrackerRepository patientTaskTrackerRepository;
    private final GDrivePlatformProvider gDrivePlatformProvider;
    private final GoogleDriveService googleDriveService;

    private final DriveAsyncHelper driveAsyncHelper;
    private final TreatmentPlanVideoRepository treatmentPlanVideoRepository;
    private final CaseActivityLogger caseActivityLogger;
    private final ServiceConfigurationRepository serviceConfigurationRepository;
    private final ResolveWebUrl resolveWebUrl;
    private final PlanningCustomerEmailService planningCustomerEmailService;
    private final PatientTaskTrackerService patientTaskTrackerService;
    private final WhatsappTemplateTypeProperties whatsappTemplateTypeProperties;
    private final PlanningNotificationService planningNotificationService;
    private final XOrganizationNameResolver xOrgNameResolver;
    private final WhatsAppUtilities whatsAppUtilities;

    // ...existing code...

    @Override
    public void addTreatment(AddTreatmentRequest addTreatmentRequest) {
        ProductTypeName treatmentSubType = getProductTypeName(addTreatmentRequest);

        alignerCacheEvict.evictLeadData(addTreatmentRequest.getDoctorId());

        var patient = patientRepository
                .findById(addTreatmentRequest.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException(addTreatmentRequest.getPatientId()));

        if (patient.getProductTypeNames().contains(treatmentSubType)) {
            log.info("Patient already has the product type: {}", treatmentSubType);
            return;
        }

        patient.getProductTypeNames().add(treatmentSubType);
        patient.setProductTypeName(treatmentSubType);
        patientRepository.save(patient);

        Product product = Product.from(addTreatmentRequest);
        productRepository.save(product);

        timelineService.addEvent(
                addTreatmentRequest.getDoctorId(),
                UserType.DOCTOR,
                patient.getId(),
                UserType.PATIENT,
                EventType.PRODUCT_TYPE_ADDED,
                new ProductTypeAddedEventMetaData(
                        PatientDetails.from(patient), addTreatmentRequest.getTreatmentSubType()));

        log.info("Added treatment for patient_id: {}", addTreatmentRequest.getPatientId());
    }

    private static ProductTypeName getProductTypeName(AddTreatmentRequest addTreatmentRequest) {
        TreatmentType treatmentType = addTreatmentRequest.getTreatmentType();
        ProductTypeName treatmentSubType = addTreatmentRequest.getTreatmentSubType();

        if (treatmentType.equals(TreatmentType.IMPLANTS) && (!treatmentSubType.equals(ProductTypeName.IMPLANTS))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    String.format(
                            "treatment_type %s should not have treatment_subtype %s", treatmentType, treatmentSubType));
        }

        if (treatmentType.equals(TreatmentType.ORTHOTRACKER) && treatmentSubType.equals(ProductTypeName.IMPLANTS)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    String.format(
                            "treatment_type %s should not have treatment_subtype %s", treatmentType, treatmentSubType));
        }
        return treatmentSubType;
    }

    @Override
    @Transactional(readOnly = true)
    public List<GetTreatmentRequest> getTreatmentList(long doctor_id, long patient_id) {
        List<GetTreatmentRequest> treatmentRequests = new ArrayList<>();

        PatientInvitationDetails patientInvitationDetails = patientInvitationDetailsRepository
                .findByPatientId(patient_id)
                .orElseThrow(() -> new PatientNotFoundException(patient_id));

        Invitation invitation = patientInvitationDetails.getInvitation();
        boolean isInvited = invitation.getStatus().equals(InvitationStatus.ACCEPTED);
        List<Product> products = productRepository.findByPatientId(patient_id);

        for (Product product : products) {
            boolean isTreatmentPlanCreated = false;
            boolean isTrackingEnabled = false;
            boolean isPatientInvited = false;

            if (product.getSubType() != ProductTypeName.BRACES) {
                List<TreatmentPlan> treatmentPlansWithTracking =
                        treatmentPlanRepository.findByPatientAndDoctorIdAndTreatmentSubTypeWithTracking(
                                patient_id, ProductTypeName.ALIGNERS);
                TreatmentPlan activeTreatmentWithTracking = treatmentPlansWithTracking.stream()
                        .filter(plan -> plan.getStatus().equals(AlignerTreatmentStatus.ACTIVE))
                        .findFirst()
                        .orElseGet(() -> treatmentPlansWithTracking.stream()
                                .filter(plan -> plan.getStatus().equals(AlignerTreatmentStatus.PAUSED))
                                .findFirst()
                                .orElse(null));

                var tracking = activeTreatmentWithTracking != null ? activeTreatmentWithTracking.getTracking() : null;
                isTrackingEnabled = tracking != null && tracking.getStatus().equals(Status.ACTIVE);
                isPatientInvited = isInvited;
            }

            Collection<BracesTreatmentStage> stages = List.of(BracesTreatmentStage.ACTIVE);
            List<AlignerTreatmentStatus> activeAndPausedStatuses = Arrays.asList(
                    AlignerTreatmentStatus.ACTIVE,
                    AlignerTreatmentStatus.PAUSED,
                    AlignerTreatmentStatus.DEACTIVATED,
                    AlignerTreatmentStatus.COMPLETE);

            if (product.getSubType().equals(ProductTypeName.BRACES)) {
                isTreatmentPlanCreated = Stream.of(
                                bracesJourneyRepository.findByBracesTreatmentStageInAndPatientId(stages, patient_id))
                        .flatMap(List::stream)
                        .findAny()
                        .isPresent();
            }

            if (product.getSubType().equals(ProductTypeName.ALIGNERS)) {
                isTreatmentPlanCreated = Stream.of(
                                treatmentPlanRepository.findByPatientIdAndStatusIn(patient_id, activeAndPausedStatuses))
                        .flatMap(List::stream)
                        .findAny()
                        .isPresent();
            }

            treatmentRequests.add(GetTreatmentRequest.builder()
                    .id(product.getId())
                    .treatmentSubType(product.getSubType())
                    .treatmentType(product.getType())
                    .isTreatmentPlanCreated(isTreatmentPlanCreated)
                    .isTrackingEnabled(isTrackingEnabled)
                    .isPatientInvited(isPatientInvited)
                    .build());
        }
        return treatmentRequests;
    }

    @Transactional(readOnly = true)
    @Override
    public AlignerTreatmentResponse getTreatmentPlan(Long alignerTreatmentId) {
        var treatmentPlan = treatmentPlanRepository
                .findByIdWithLinkedPlan(alignerTreatmentId)
                .orElseThrow(() -> new TreatmentPlanNotFoundException(alignerTreatmentId));
        List<TreatmentPlan> treatmentPlansWithTracking =
                treatmentPlanRepository.findByPatientAndDoctorIdAndTreatmentSubTypeWithTracking(
                        treatmentPlan.getPatient().getId(), ProductTypeName.ALIGNERS);
        TreatmentPlan activeTreatmentWithTracking = treatmentPlansWithTracking.stream()
                .filter(plan -> plan.getStatus().equals(AlignerTreatmentStatus.ACTIVE))
                .findFirst()
                .orElseGet(() -> treatmentPlansWithTracking.stream()
                        .filter(plan -> plan.getStatus().equals(AlignerTreatmentStatus.PAUSED))
                        .findFirst()
                        .orElseGet(() -> treatmentPlansWithTracking.stream()
                                .filter(plan -> plan.getStatus().equals(AlignerTreatmentStatus.DEACTIVATED))
                                .findFirst()
                                .orElse(null)));

        if (treatmentPlan.getOrderId() != null && treatmentPlan.getStlFileMetadata() != null) {
            treatmentPlan
                    .getStlFileMetadata()
                    .setFileId(stlFilesDetails(
                            treatmentPlan.getOrderId(),
                            treatmentPlan.getDoctorId(),
                            treatmentPlan.getPatient().getId(),
                            treatmentPlan.getTreatmentPlanName()));
        }

        return AlignerTreatmentResponse.from(treatmentPlan, activeTreatmentWithTracking);
    }

    public List<GetTreatmentPlanResponse> getTreatmentPlan(
            Long patientId, Long doctorId, String orderId, Long organizationId, ProductTypeName treatmentSubtype) {

        var alignerTreatmentPlans =
                treatmentPlanRepository.findByPatientAndTreatmentSubType(patientId, treatmentSubtype);

        if (organizationId != null && orderId != null) {
            UserProfile userProfile =
                    userProfileRepository.findSingleByOrganizationIdAndProfileType(organizationId, ProfileType.OWNER);

            if (!Objects.equals(userProfile.getDoctor().getId(), doctorId)) {
                alignerTreatmentPlans = alignerTreatmentPlans.stream()
                        .filter(plan -> (plan.getApproverStatus() != null
                                        && plan.getApproverStatus().toString() != null)
                                && orderId.equals(plan.getOrderId()))
                        .toList();
            } else {
                alignerTreatmentPlans = alignerTreatmentPlans.stream()
                        .filter(plan -> orderId.equals(plan.getOrderId()))
                        .toList();
            }
        } else if (organizationId != null) {
            UserProfile userProfile =
                    userProfileRepository.findSingleByOrganizationIdAndProfileType(organizationId, ProfileType.OWNER);

            if (!Objects.equals(userProfile.getDoctor().getId(), doctorId)) {
                alignerTreatmentPlans = alignerTreatmentPlans.stream()
                        .filter(plan -> (plan.getApproverStatus() != null
                                && plan.getApproverStatus().toString() != null))
                        .toList();
            }
        }

        List<GetTreatmentPlanResponse> treatmentPlanResponse = new ArrayList<>();

        for (var alignerTreatmentPlan : alignerTreatmentPlans) {
            AlignerJourney alignerJourney = null;
            if (alignerTreatmentPlan.getTracking() != null) {
                alignerJourney = alignerTreatmentPlan.getTracking().getAlignerJourney();
            }

            var alignerMetadata = alignerTreatmentPlan.getAlignerDetailsMetadata();
            List<Integer> lowerJawRange = alignerMetadata.getLowerJawDetails().getRange();
            List<Integer> upperJawRange = alignerMetadata.getUpperJawDetails().getRange();

            Set<Integer> uniqueNumbers = new HashSet<>(lowerJawRange);
            uniqueNumbers.addAll(upperJawRange);
            Long alignerJourneyId = null;

            int countOfUniqueNumbers = uniqueNumbers.size();
            if (alignerJourney != null) {
                alignerJourneyId = alignerJourney.getId();
            }

            if (alignerTreatmentPlan.getOrderId() != null && alignerTreatmentPlan.getStlFileMetadata() != null) {
                alignerTreatmentPlan
                        .getStlFileMetadata()
                        .setFileId(stlFilesDetails(
                                alignerTreatmentPlan.getOrderId(),
                                alignerTreatmentPlan.getDoctorId(),
                                alignerTreatmentPlan.getPatient().getId(),
                                alignerTreatmentPlan.getTreatmentPlanName()));
            }

            var lastDeactivatedTreatmentPlan = alignerTreatmentPlans.stream()
                    .filter(plan -> plan.getStatus().equals(AlignerTreatmentStatus.DEACTIVATED))
                    .findFirst()
                    .orElse(null);
            treatmentPlanResponse.add(GetTreatmentPlanResponse.builder()
                    .alignerJourneyId(alignerJourneyId)
                    .planName(alignerTreatmentPlan.getTreatmentPlanName())
                    .status(alignerTreatmentPlan.getStatus())
                    .totalNumberOfAligners(countOfUniqueNumbers)
                    .planningLink(alignerTreatmentPlan.getTreatmentPlanningLink())
                    .treatmentSubType(alignerTreatmentPlan.getTreatmentSubType())
                    .treatmentPlanId(alignerTreatmentPlan.getId())
                    .latestDeactivatedDate(
                            lastDeactivatedTreatmentPlan != null
                                    ? lastDeactivatedTreatmentPlan.getDeactivatedAt()
                                    : null)
                    .orderId(alignerTreatmentPlan.getOrderId())
                    .initiatorStatus(alignerTreatmentPlan.getInitiatorStatus())
                    .approverStatus(alignerTreatmentPlan.getApproverStatus())
                    .orderStatusChangedAt(alignerTreatmentPlan.getOrderStatusChangedAt())
                    .stlFileMetadata(alignerTreatmentPlan.getStlFileMetadata())
                    .build());
        }

        return treatmentPlanResponse;
    }

    @Override
    @Transactional(readOnly = true)
    public TreatmentPlanWorkflowResponse getTreatmentPlanForWorkflow(TreatmentPlanForWorkflowRequest request) {
        List<TreatmentPlan> treatmentPlans;

        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        if (adminWithDefaultTag && userProfile.getInviterProfile() != null) {
            userProfile = userProfile.getInviterProfile();
            userProfile = userProfileRepository
                    .findByIdWithOrgAndDoctorAndUser(userProfile.getId())
                    .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
            request.setProfileId(userProfile.getId());
            request.setOrganizationId(userProfile.getOrganization().getId());
        }
        if (request.getPatientId() != null || request.getOrderId() != null) {

            if (request.getPatientId() != null && request.getOrderId() != null) {
                treatmentPlans = treatmentPlanRepository.findByPatientIdAndOrderId(
                        request.getPatientId(), request.getTreatmentSubtype(), request.getOrderId());
                return TreatmentPlanWorkflowResponse.from(treatmentPlans);
            }

            if (Boolean.TRUE.equals(request.getIsOnlyApproved())
                    && Boolean.TRUE.equals(request.getIsLatestOrderPlanRequired())) {
                var latestOrderId = orderRepository
                        .findLatestOrderIdForPatient(request.getPatientId())
                        .orElse(null);
                if (latestOrderId == null) {
                    return null;
                }
                treatmentPlans = treatmentPlanRepository.findByPatientIdAndTreatmentSubTypeWithOrder(
                        request.getPatientId(),
                        request.getTreatmentSubtype(),
                        OrderTreatmentPlanStatus.APPROVED,
                        latestOrderId);
                return TreatmentPlanWorkflowResponse.from(treatmentPlans);
            }

            if (Boolean.TRUE.equals(request.getIsOnlyApproved())) {
                treatmentPlans = treatmentPlanRepository.findByPatientIdAndTreatmentSubType(
                        request.getPatientId(), request.getTreatmentSubtype(), OrderTreatmentPlanStatus.APPROVED);
                return TreatmentPlanWorkflowResponse.from(treatmentPlans);
            }
            List<Long> internalUserProfileIds = new ArrayList<>(
                    InternalUserProfileUtil.getInternalUserProfileIds(userProfile, userProfileRepository));

            treatmentPlans = treatmentPlanRepository
                    .findByPatientIdOrderIdAndProfileIdWithRoleBasedFilter(
                            request.getPatientId(),
                            request.getTreatmentSubtype(),
                            request.getOrderId(),
                            request.getProfileId(),
                            internalUserProfileIds,
                            userProfile.isInHouseManufacturingLab())
                    .stream()
                    .distinct()
                    .collect(Collectors.toList());

            return TreatmentPlanWorkflowResponse.from(treatmentPlans);
        } else {
            int page = request.getPage() != null ? request.getPage() : 0;
            int size = request.getSize() != null ? request.getSize() : 10;
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

            Page<TreatmentPlanProfileSummary> treatmentPlanSummaryPage =
                    treatmentPlanRepository.findProfileTreatmentSummaries(
                            null, request.getTreatmentSubtype(), null, request.getProfileId(), pageable);

            return TreatmentPlanWorkflowResponse.fromProjectionPage(treatmentPlanSummaryPage);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<BracesAlignerTreatmentResponse> getBracesAndAlignerTreatmentPlanList(
            Long patientId, Long doctorId, String orderId, Long organizationId) {
        List<BracesAlignerTreatmentResponse> treatmentPlanResponses = new ArrayList<>();

        var userProfile = userProfileRepository
                .findUserProfileIdByDoctorIdAndOrganizationId(doctorId, organizationId)
                .orElseThrow(() -> new DoctorNotFoundException(doctorId));

        Long profileId = userProfile.getId();
        Set<String> userRoles =
                userProfile.getRoles().stream().map(Role::getName).collect(Collectors.toSet());
        Set<String> LAB_ROLES = Set.of(
                "IN_OFFICE_MANUFACTURER",
                "ALIGNER_COMPANY_OR_LAB",
                "COMMERCIAL_ALIGNER_LAB",
                "ENTERPRISE_COMPANY_LAB",
                "LAB_STAFF");

        boolean isLabRole = userRoles.stream().anyMatch(LAB_ROLES::contains);
        List<TreatmentPlanSummary> alignerTreatments = new ArrayList<>();

        if (isLabRole) {
            if (userRoles.contains("IN_OFFICE_MANUFACTURER")
                    || userRoles.contains("ALIGNER_COMPANY_OR_LAB")
                    || userRoles.contains("ENTERPRISE_COMPANY_LAB")) {
                List<TreatmentPlanSummary> ownerTreatments =
                        treatmentPlanRepository.findAlignerTreatmentSummariesByOwnerProfileId(
                                patientId, ProductTypeName.ALIGNERS, profileId, false);

                List<TreatmentPlanSummary> targetTreatments =
                        treatmentPlanRepository.findAlignerTreatmentSummariesByTargetProfileId(
                                patientId, ProductTypeName.ALIGNERS, profileId, true);
                List<TreatmentPlanSummary> treatmentsWithoutOrders =
                        treatmentPlanRepository.findAlignerTreatmentSummariesByPatientIdWhereOrderIsNull(
                                patientId, ProductTypeName.ALIGNERS, true);

                alignerTreatments.addAll(ownerTreatments);
                alignerTreatments.addAll(targetTreatments);
                alignerTreatments.addAll(treatmentsWithoutOrders);

                alignerTreatments = alignerTreatments.stream().distinct().collect(Collectors.toList());
            } else if (userRoles.contains("COMMERCIAL_ALIGNER_LAB")) {
                List<TreatmentPlanSummary> targetTreatments =
                        treatmentPlanRepository.findAlignerTreatmentSummariesByTargetProfileId(
                                patientId, ProductTypeName.ALIGNERS, profileId, true);
                List<TreatmentPlanSummary> treatmentsWithoutOrders =
                        treatmentPlanRepository.findAlignerTreatmentSummariesByPatientIdWhereOrderIsNull(
                                patientId, ProductTypeName.ALIGNERS, true);
                alignerTreatments.addAll(targetTreatments);
                alignerTreatments.addAll(treatmentsWithoutOrders);
            } else if (userRoles.contains("LAB_STAFF")) {
                List<TreatmentPlanSummary> targetTreatments =
                        treatmentPlanRepository.findAlignerTreatmentSummariesByTargetProfileId(
                                patientId, ProductTypeName.ALIGNERS, profileId, true);
                List<TreatmentPlanSummary> treatmentsWithoutOrders =
                        treatmentPlanRepository.findAlignerTreatmentSummariesByPatientId(
                                patientId, ProductTypeName.ALIGNERS, true);
                alignerTreatments.addAll(targetTreatments);
                alignerTreatments.addAll(treatmentsWithoutOrders);
            }
        } else if (userRoles.contains("CONSULTING_ORTHODONTIST") || userRoles.contains("CLINIC_OWNER")) {
            List<TreatmentPlanSummary> targetTreatments =
                    treatmentPlanRepository.findAlignerTreatmentSummariesByOwnerProfileId(
                            patientId, ProductTypeName.ALIGNERS, profileId, false);
            List<TreatmentPlanSummary> treatmentsWithoutOrders =
                    treatmentPlanRepository.findAlignerTreatmentSummariesByPatientIdWhereOrderIsNull(
                            patientId, ProductTypeName.ALIGNERS, true);
            alignerTreatments.addAll(targetTreatments);
            alignerTreatments.addAll(treatmentsWithoutOrders);

        } else if (userRoles.contains("CUSTOMER")) {
            List<TreatmentPlanSummary> targetTreatments =
                    treatmentPlanRepository.findAlignerTreatmentSummariesByOwnerProfileId(
                            patientId, ProductTypeName.ALIGNERS, profileId, false);
            List<TreatmentPlanSummary> treatmentsWithoutOrders =
                    treatmentPlanRepository.findAlignerTreatmentSummariesByPatientIdWhereOrderIsNull(
                            patientId, ProductTypeName.ALIGNERS, true);
            alignerTreatments.addAll(targetTreatments);
            alignerTreatments.addAll(treatmentsWithoutOrders);
        } else if (userRoles.contains("VENDOR")) {
            List<TreatmentPlanSummary> ownerTreatments =
                    treatmentPlanRepository.findAlignerTreatmentSummariesByTargetProfileId(
                            patientId, ProductTypeName.ALIGNERS, profileId, true);
            List<TreatmentPlanSummary> treatmentsWithoutOrders =
                    treatmentPlanRepository.findAlignerTreatmentSummariesByPatientIdWhereOrderIsNull(
                            patientId, ProductTypeName.ALIGNERS, true);
            alignerTreatments.addAll(ownerTreatments);
            alignerTreatments.addAll(treatmentsWithoutOrders);
        } else {
            alignerTreatments =
                    treatmentPlanRepository.findAlignerTreatmentSummaries(patientId, ProductTypeName.ALIGNERS);
        }

        List<Long> treatmentPlanIds =
                alignerTreatments.stream().map(TreatmentPlanSummary::getId).collect(Collectors.toList());

        Map<Long, List<ManufacturingBatchProjection>> batchesByTreatmentPlan = new HashMap<>();
        if (!treatmentPlanIds.isEmpty()) {
            List<ManufacturingBatchProjection> allBatches =
                    treatmentPlanRepository.findManufacturingBatchesByTreatmentPlanIds(treatmentPlanIds);

            batchesByTreatmentPlan = allBatches.stream()
                    .collect(Collectors.groupingBy(ManufacturingBatchProjection::getTreatmentPlanId));
        }

        for (TreatmentPlanSummary summary : alignerTreatments) {
            int totalAligners = OrderTreatmentCommonUtil.getTotalAligners(summary.getAlignerDetailsMetadata());
            var alignerDetailsMetadata = summary.getAlignerDetailsMetadata();
            var upperJawDetails = alignerDetailsMetadata.getUpperJawDetails();
            var lowerJawDetails = alignerDetailsMetadata.getLowerJawDetails();
            boolean isCustomerOrder = false;
            boolean isPurchaseOrder = false;

            boolean isCreatedByMe = true;
            Optional<Order> order =
                    orderRepository.findByIdWithPatientAndDoctorOrganizationAndUser(summary.getOrderId());
            if (order.isPresent()) {
                UserProfile orgProfile = userProfileRepository
                        .findByIdWithOrgAndDoctor(order.get().getProfileId())
                        .orElseThrow(DoctorNotFoundException::new);

                isCustomerOrder = orgProfile.getRoles().stream()
                        .map(Role::getName)
                        .anyMatch(roleName -> roleName.equals(DoctorRole.CUSTOMER.name()));

                isPurchaseOrder = order.get().getParentOrder() != null;

                if (order.get().getOwnerProfile().getId().equals(profileId)) {
                    isCreatedByMe = false;
                }
            }
            if (summary.getOrderId() != null && summary.getStlFileMetadata() != null) {
                summary.getStlFileMetadata()
                        .setFileId(stlFilesDetails(
                                summary.getOrderId(),
                                summary.getDoctorId(),
                                summary.getPatientId(),
                                summary.getTreatmentPlanName()));
            }

            List<ManufacturingBatchProjection> manufacturingBatches =
                    batchesByTreatmentPlan.getOrDefault(summary.getId(), new ArrayList<>());

            treatmentPlanResponses.add(BracesAlignerTreatmentResponse.from(
                    summary,
                    totalAligners,
                    upperJawDetails,
                    lowerJawDetails,
                    isCreatedByMe,
                    isCustomerOrder,
                    isPurchaseOrder,
                    manufacturingBatches));
        }

        List<BracesJourney> bracesJourneys = bracesJourneyRepository.findByPatientId(patientId);
        for (BracesJourney bracesJourney : bracesJourneys) {
            AlignerTreatmentStatus treatmentStatus =
                    convertBracesTreatmentStageToStatus(bracesJourney.getBracesTreatmentStage());
            treatmentPlanResponses.add(BracesAlignerTreatmentResponse.from(bracesJourney, treatmentStatus));
        }

        return treatmentPlanResponses;
    }

    @Override
    public List<BracesAlignerTreatmentResponse> getTreatmentPlanFromOrder(Order order, Long doctorId, Long profileId) {
        List<BracesAlignerTreatmentResponse> treatmentPlanResponses = new ArrayList<>();

        List<TreatmentPlanSummary> alignerTreatments = treatmentPlanRepository.findTreatmentPlanByOrderIdAndPatient(
                order.getPatient().getId(), order.getId(), ProductTypeName.ALIGNERS);
        boolean isCreatedByMe =
                Objects.equals(profileId, order.getOwnerProfile().getId());
        for (TreatmentPlanSummary summary : alignerTreatments) {

            int totalAligners = OrderTreatmentCommonUtil.getTotalAligners(summary.getAlignerDetailsMetadata());
            var alignerDetailsMetadata = summary.getAlignerDetailsMetadata();
            var upperJawDetails = alignerDetailsMetadata.getUpperJawDetails();
            var lowerJawDetails = alignerDetailsMetadata.getLowerJawDetails();

            if (summary.getOrderId() != null && summary.getStlFileMetadata() != null) {
                summary.getStlFileMetadata()
                        .setFileId(stlFilesDetails(
                                summary.getOrderId(),
                                summary.getDoctorId(),
                                summary.getPatientId(),
                                summary.getTreatmentPlanName()));
            }

            treatmentPlanResponses.add(BracesAlignerTreatmentResponse.from(
                    summary, totalAligners, upperJawDetails, lowerJawDetails, !isCreatedByMe, false, false));
        }

        List<BracesJourney> bracesJourneys =
                bracesJourneyRepository.findByPatientId(order.getPatient().getId());
        for (BracesJourney bracesJourney : bracesJourneys) {
            AlignerTreatmentStatus treatmentStatus =
                    convertBracesTreatmentStageToStatus(bracesJourney.getBracesTreatmentStage());
            treatmentPlanResponses.add(BracesAlignerTreatmentResponse.from(bracesJourney, treatmentStatus));
        }

        return treatmentPlanResponses;
    }

    private AlignerTreatmentStatus convertBracesTreatmentStageToStatus(BracesTreatmentStage stage) {
        if (stage == null) {
            return null;
        }
        return switch (stage) {
            case ACTIVE -> AlignerTreatmentStatus.ACTIVE;
            case COMPLETE -> AlignerTreatmentStatus.COMPLETE;
            case DRAFT -> AlignerTreatmentStatus.DRAFT;
            default -> null;
        };
    }

    private void addFiles(
            TreatmentPlanRequest request,
            TreatmentPlan alignerTreatment,
            MultipartFile[] regularFiles,
            MultipartFile[] pdfFiles,
            MultipartFile[] otherFiles) {

        var doctorId = UserId.builder()
                .userId(request.getDoctorId())
                .userType(UserType.DOCTOR)
                .build();
        var patientId = UserId.builder()
                .userId(request.getPatientId())
                .userType(UserType.PATIENT)
                .build();

        List<MultipartFile> allFilesList = new ArrayList<>();
        Map<String, FileCategory> fileNameToCategoryMap = new HashMap<>();

        if (regularFiles != null) {
            for (MultipartFile file : regularFiles) {
                allFilesList.add(file);
                fileNameToCategoryMap.put(file.getOriginalFilename(), FileCategory.REGULAR);
            }
        }

        if (pdfFiles != null) {
            for (MultipartFile file : pdfFiles) {
                allFilesList.add(file);
                fileNameToCategoryMap.put(file.getOriginalFilename(), FileCategory.PDF);
            }
        }

        if (otherFiles != null) {
            for (MultipartFile file : otherFiles) {
                allFilesList.add(file);
                fileNameToCategoryMap.put(file.getOriginalFilename(), FileCategory.OTHER);
            }
        }

        if (allFilesList.isEmpty()) {
            return;
        }

        MultipartFile[] allFilesArray = allFilesList.toArray(new MultipartFile[0]);

        PatientDoctorOrganization patientDoctorOrganization = patientDoctorOrganizationRepository
                .findPatientDoctorOrganizationsWithPatientByPatientId(request.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException(request.getPatientId()));

        var subscriptionResponse = subscriptionService.getSubSubscriptionDetails(
                request.getDoctorId(),
                patientDoctorOrganization.getUserProfile().getId());

        if (subscriptionResponse != null) {
            double totalStorageGb = subscriptionResponse.getTotalStorageGb();
            double usedStorageMb = subscriptionResponse.getUsedStorageGb();
            long usedStorageBytes = (long) (usedStorageMb * 1_048_576L);

            long totalFilesSizeBytes = 0;
            for (MultipartFile file : allFilesArray) {
                totalFilesSizeBytes += file.getSize();
            }
            long totalStorageBytes = (long) (totalStorageGb * 1_073_741_824L);

            if (usedStorageBytes + totalFilesSizeBytes > totalStorageBytes) {
                throw new StorageLimitExceededException(request.getDoctorId());
            }
        }

        createFolder(request, alignerTreatment);

        String fullPath = Paths.get(IMAGE_FOLDER_NAME, PRE_TREATMENT).toString();
        var uploadDetails = filesService.uploadAlignerJourneyFiles(
                new UploadFilesRequest(Paths.get(fullPath).toString(), doctorId, Set.of(doctorId, patientId)),
                allFilesArray,
                false,
                true);

        if (!uploadDetails.getFailedToUpload().isEmpty()) {
            log.warn("Failed to upload some files {}", uploadDetails.getFailedToUpload());
        }

        List<File> uploadedRegularFiles = new ArrayList<>();
        List<File> uploadedPdfFiles = new ArrayList<>();
        List<File> uploadedOtherFiles = new ArrayList<>();

        for (File uploadedFile : uploadDetails.getUploadFiles()) {
            String fileName = uploadedFile.getName();
            FileCategory category = fileNameToCategoryMap.get(fileName);

            if (category != null) {
                switch (category) {
                    case REGULAR:
                        uploadedRegularFiles.add(uploadedFile);
                        break;
                    case PDF:
                        uploadedPdfFiles.add(uploadedFile);
                        break;
                    case OTHER:
                        uploadedOtherFiles.add(uploadedFile);
                        break;
                }
            }
        }

        if (!uploadedRegularFiles.isEmpty()) {
            alignerTreatment.setFiles(uploadedRegularFiles);
        }
        if (!uploadedPdfFiles.isEmpty()) {
            alignerTreatment.setPdfFiles(uploadedPdfFiles);
        }
        if (!uploadedOtherFiles.isEmpty()) {
            alignerTreatment.setOtherFiles(uploadedOtherFiles);
        }
    }

    private enum FileCategory {
        REGULAR,
        PDF,
        OTHER
    }

    private void addTreatmentPlanVideos(
            TreatmentPlanRequest request,
            TreatmentPlan alignerTreatment,
            MultipartFile leftVideo,
            MultipartFile rightVideo,
            MultipartFile topVideo,
            MultipartFile bottomVideo,
            MultipartFile frontVideo,
            MultipartFile singleVideo) {

        if (leftVideo == null
                && rightVideo == null
                && topVideo == null
                && bottomVideo == null
                && frontVideo == null
                && singleVideo == null) {
            return;
        }

        var doctorId = UserId.builder()
                .userId(request.getDoctorId())
                .userType(UserType.DOCTOR)
                .build();
        var patientId = UserId.builder()
                .userId(request.getPatientId())
                .userType(UserType.PATIENT)
                .build();

        Map<TreatmentPlanVideoTags, MultipartFile> videoFilesMap = new EnumMap<>(TreatmentPlanVideoTags.class);
        videoFilesMap.put(TreatmentPlanVideoTags.LEFT_VIDEO, leftVideo);
        videoFilesMap.put(TreatmentPlanVideoTags.RIGHT_VIDEO, rightVideo);
        videoFilesMap.put(TreatmentPlanVideoTags.TOP_VIDEO, topVideo);
        videoFilesMap.put(TreatmentPlanVideoTags.BOTTOM_VIDEO, bottomVideo);
        videoFilesMap.put(TreatmentPlanVideoTags.FRONT_VIDEO, frontVideo);
        videoFilesMap.put(TreatmentPlanVideoTags.SINGLE_VIDEO, singleVideo);

        List<MultipartFile> allVideosList = new ArrayList<>();
        Map<String, TreatmentPlanVideoTags> fileNameToTagMap = new HashMap<>();

        for (Map.Entry<TreatmentPlanVideoTags, MultipartFile> entry : videoFilesMap.entrySet()) {
            if (entry.getValue() != null) {
                allVideosList.add(entry.getValue());
                fileNameToTagMap.put(entry.getValue().getOriginalFilename(), entry.getKey());
            }
        }

        if (allVideosList.isEmpty()) {
            return;
        }

        createFolder(request, alignerTreatment);

        String fullPath = Paths.get(IMAGE_FOLDER_NAME, alignerTreatment.getTreatmentPlanName())
                .toString();

        MultipartFile[] allVideosArray = allVideosList.toArray(new MultipartFile[0]);

        var uploadDetails = filesService.uploadAlignerJourneyFiles(
                new UploadFilesRequest(Paths.get(fullPath).toString(), doctorId, Set.of(doctorId, patientId)),
                allVideosArray,
                false,
                request.isVideoDisplayToPatient());

        if (!uploadDetails.getFailedToUpload().isEmpty()) {
            log.warn("Failed to upload some video files: {}", uploadDetails.getFailedToUpload());
        }

        List<TreatmentPlanVideoFile> treatmentPlanVideoFiles = new ArrayList<>();

        for (File uploadedFile : uploadDetails.getUploadFiles()) {
            String fileName = uploadedFile.getName();
            TreatmentPlanVideoTags tag = fileNameToTagMap.get(fileName);

            if (tag != null) {
                TreatmentPlanVideoFile treatmentPlanVideoFile = TreatmentPlanVideoFile.from(
                        tag, uploadedFile.getUrl(), request, uploadedFile.getId(), alignerTreatment);
                treatmentPlanVideoFiles.add(treatmentPlanVideoFile);
            } else {
                log.warn("Could not find tag mapping for uploaded file: {}", fileName);
            }
        }

        alignerTreatment.setTreatmentPlanVideoFiles(treatmentPlanVideoFiles);
    }

    @Transactional
    @Override
    public AlignerTreatmentResponse createOrUpdateTreatmentPlan(
            TreatmentPlanRequest request,
            MultipartFile[] file,
            MultipartFile[] pdfFile,
            MultipartFile[] otherFile,
            MultipartFile leftVideo,
            MultipartFile rightVideo,
            MultipartFile topVideo,
            MultipartFile bottomVideo,
            MultipartFile frontVideo,
            MultipartFile singleVideo) {
        var patient = patientRepository
                .findByIdWithDoctorProfileDetails(request.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException(request.getPatientId()));
        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));
        if (adminWithDefaultTag && userProfile.getInviterProfile() != null) {
            userProfile = userProfile.getInviterProfile();
            request.setProfileId(userProfile.getId());
            request.setDoctorId(userProfile.getDoctor().getId());
        }
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);

        AlignerTreatmentStatus alignerTreatmentStatus = null;

        if (!patient.getProductTypeNames().contains(ProductTypeName.ALIGNERS)) {

            patient.getProductTypeNames().add(ProductTypeName.ALIGNERS);
            patient.setProductTypeName(ProductTypeName.ALIGNERS);
            patientRepository.save(patient);

            Product product = Product.from(request);
            productRepository.save(product);

            timelineService.addEvent(
                    request.getDoctorId(),
                    UserType.DOCTOR,
                    patient.getId(),
                    UserType.PATIENT,
                    EventType.PRODUCT_TYPE_ADDED,
                    new ProductTypeAddedEventMetaData(PatientDetails.from(patient), ProductTypeName.ALIGNERS));

            log.info("Added treatment for patient_id: {}", request.getPatientId());
        }

        TreatmentPlan treatmentPlan;
        LocalDate approvedByPatientAt = null;

        var activeTreatment =
                treatmentPlanRepository.findByPatientIdAndStatus(patient.getId(), AlignerTreatmentStatus.ACTIVE);

        alignerCacheEvict.evictLeadData(patient.getAddedByUserId());

        if (activeTreatment.isPresent()
                && request.getStatus() != null
                && request.getStatus().equals(AlignerTreatmentStatus.ACTIVE)) {
            treatmentPlanRepository.updateStatus(
                    patient.getId(),
                    activeTreatment.get().getId(),
                    AlignerTreatmentStatus.DEACTIVATED,
                    LocalDate.now());
        }

        if (request.getTreatmentPlanId() == null) {
            Integer totalTreatmentPlanCount = treatmentPlanRepository.countByPatientId(patient.getId());
            treatmentPlan = TreatmentPlan.from(request, patient, totalTreatmentPlanCount + 1);
        } else {
            treatmentPlan = treatmentPlanRepository
                    .findByIdWithLinkedPlan(request.getTreatmentPlanId())
                    .orElseThrow(() -> new TreatmentNotFoundException(request.getPatientId(), request.getDoctorId()));

            approvedByPatientAt = treatmentPlan.getApprovedByPatientAt();
            alignerTreatmentStatus = treatmentPlan.getStatus();
            treatmentPlan.updateFromRequest(request);
        }

        if (request.getApprovedByPatientAt() != null) {
            treatmentPlan.setApprovedByPatientAt(request.getApprovedByPatientAt());
        }

        if (AlignerTreatmentStatus.ACTIVE.equals(request.getStatus())) {
            driveAsyncHelper.createTreatmentPlanDefaultFolderAsync(request, treatmentPlan);

            if (request.getOrderId() != null) {
                treatmentPlanRepository
                        .findTreatmentPlansByOrderIdAndPatientId(
                                request.getOrderId(), treatmentPlan.getPatient().getId())
                        .stream()
                        .filter(tp -> !tp.getId().equals(treatmentPlan.getId()))
                        .forEach(tp -> {
                            tp.setStatus(AlignerTreatmentStatus.ARCHIVED);
                            tp.setInitiatorStatus(OrderTreatmentPlanStatus.ARCHIVED);
                            tp.setApproverStatus(OrderTreatmentPlanStatus.ARCHIVED);
                            treatmentPlanRepository.save(tp);
                        });
            }
        }

        if (otherFile != null || pdfFile != null || file != null) {
            addFiles(request, treatmentPlan, file, pdfFile, otherFile);
        }

        if (leftVideo != null
                || rightVideo != null
                || topVideo != null
                || bottomVideo != null
                || frontVideo != null
                || singleVideo != null) {
            addTreatmentPlanVideos(
                    request, treatmentPlan, leftVideo, rightVideo, topVideo, bottomVideo, frontVideo, singleVideo);
        }
        if (AlignerTreatmentStatus.ACTIVE.equals(request.getStatus())) {
            if (request.getInitiatorStatus() == null && request.getApproverStatus() == null) {
                treatmentPlan.setInitiatorStatus(OrderTreatmentPlanStatus.APPROVED);
                treatmentPlan.setApproverStatus(OrderTreatmentPlanStatus.APPROVED);
            }
            if (treatmentPlan.getTreatmentFinalisedAt() == null) {
                treatmentPlan.setTreatmentFinalisedAt(ZonedDateTime.now());
            }
        }
        if (AlignerTreatmentStatus.DRAFT.equals(request.getStatus())) {
            if (request.getInitiatorStatus() == null && request.getApproverStatus() == null) {
                treatmentPlan.setInitiatorStatus(OrderTreatmentPlanStatus.SENT_FOR_APPROVAL);
                treatmentPlan.setApproverStatus(OrderTreatmentPlanStatus.PENDING_APPROVAL);
            }
        }
        treatmentPlan.setIsLinkDisplayPatient(request.isLinkDisplayPatient());
        treatmentPlan.setIsVideDisplayToPatient(request.isVideoDisplayToPatient());

        final TreatmentPlan savedTreatmentPlan = treatmentPlanRepository.save(treatmentPlan);

        if (request.getFileIdsToClone() == null || !request.getFileIdsToClone().isEmpty()) {
            cloneFilesFromOtherTreatmentPlans(savedTreatmentPlan, request.getFileIdsToClone());
        }

        if (OrderTreatmentPlanStatus.APPROVED.equals(request.getApproverStatus())) {

            var childLinkedPlan = savedTreatmentPlan.getLinkedTreatmentPlan();
            if (childLinkedPlan != null) {
                childLinkedPlan.setInitiatorStatus(OrderTreatmentPlanStatus.APPROVED);
                childLinkedPlan.setApproverStatus(OrderTreatmentPlanStatus.APPROVED);
                treatmentPlanRepository.save(childLinkedPlan);
            } else {

                var parentLinkedPlan =
                        treatmentPlanRepository.findByLinkedTreatmentPlanIdWithOrder(savedTreatmentPlan.getId());
                if (parentLinkedPlan.isPresent()) {
                    parentLinkedPlan.get().setInitiatorStatus(OrderTreatmentPlanStatus.APPROVED);
                    parentLinkedPlan.get().setApproverStatus(OrderTreatmentPlanStatus.APPROVED);
                    if (parentLinkedPlan.get().getOrderId() != null) {
                        Order order = orderRepository
                                .findById(parentLinkedPlan.get().getOrderId())
                                .orElseThrow();
                        order.setStatus(OrderStatus.APPROVED);
                        orderRepository.save(order);
                    }
                    treatmentPlanRepository.save(parentLinkedPlan.get());
                }
            }
        }

        if (request.getLinkedTreatmentPlanId() != null) {
            var orignalTreatmentPlan = treatmentPlanRepository
                    .findById(request.getLinkedTreatmentPlanId())
                    .orElseThrow(() -> new TreatmentPlanNotFoundException(request.getLinkedTreatmentPlanId()));
            List<TreatmentPlanVideoFile> newVideoFiles = new ArrayList<>();

            boolean hasOtherVideos = leftVideo != null
                    || rightVideo != null
                    || topVideo != null
                    || bottomVideo != null
                    || frontVideo != null;

            boolean hasNoValidPdfFiles = pdfFile == null
                    || pdfFile.length == 0
                    || Arrays.stream(pdfFile)
                            .allMatch(clonePdfFile -> clonePdfFile == null
                                    || clonePdfFile.getOriginalFilename() == null
                                    || clonePdfFile.getOriginalFilename().trim().isEmpty()
                                    || clonePdfFile.getSize() == 0);
            if (hasNoValidPdfFiles) {
                clonePdfFile(savedTreatmentPlan, orignalTreatmentPlan);
            }

            boolean hasNoValidOtherFiles = otherFile == null
                    || otherFile.length == 0
                    || Arrays.stream(otherFile)
                            .allMatch(cloneOtherFile -> cloneOtherFile == null
                                    || cloneOtherFile.getOriginalFilename() == null
                                    || cloneOtherFile
                                            .getOriginalFilename()
                                            .trim()
                                            .isEmpty()
                                    || cloneOtherFile.getSize() == 0);
            if (hasNoValidOtherFiles) {
                cloneOtherFile(savedTreatmentPlan, orignalTreatmentPlan);
            }

            boolean hasNoValidSingleVideo = singleVideo == null
                    || singleVideo.isEmpty()
                    || singleVideo.getOriginalFilename() == null
                    || singleVideo.getOriginalFilename().trim().isEmpty()
                    || singleVideo.getSize() == 0;

            if (!hasOtherVideos && hasNoValidSingleVideo) {
                log.debug("No new videos provided, copying videos from original treatment plan");

                if (orignalTreatmentPlan.getTreatmentPlanVideoFiles() != null) {
                    for (TreatmentPlanVideoFile originalFile : orignalTreatmentPlan.getTreatmentPlanVideoFiles()) {
                        TreatmentPlanVideoFile newFile = TreatmentPlanVideoFile.builder()
                                .treatmentPlanVideoTags(originalFile.getTreatmentPlanVideoTags())
                                .videoUrl(originalFile.getVideoUrl())
                                .fileId(originalFile.getFileId())
                                .isVideoDisplayToPatient(originalFile.isVideoDisplayToPatient())
                                .treatmentPlan(savedTreatmentPlan)
                                .build();

                        newVideoFiles.add(newFile);
                    }
                    savedTreatmentPlan.setTreatmentPlanVideoFiles(newVideoFiles);
                    treatmentPlanRepository.save(savedTreatmentPlan);
                }
            }

            orignalTreatmentPlan.setLinkedTreatmentPlan(savedTreatmentPlan);
            treatmentPlanRepository.save(orignalTreatmentPlan);
        }

        if (request.getOrderId() != null) {
            var order = orderRepository.findById(request.getOrderId());
            order.ifPresent(treatmentPlan::setOrder);
        }

        if (request.getInitiatorStatus() != null
                && request.getInitiatorStatus().equals(OrderTreatmentPlanStatus.RE_PLAN)) {
            if (request.getTreatmentPlanMetadata() != null
                    && request.getTreatmentPlanMetadata().getReplanReason() != null) {
                patientCommentService.addComment(
                        AddPatientCommentRequest.builder()
                                .patientId(request.getPatientId())
                                .profileId(request.getProfileId())
                                .doctorId(request.getDoctorId())
                                .notes(request.getTreatmentPlanMetadata().getReplanReason())
                                .build(),
                        null);
            }
        }

        if (request.getOrderId() != null) {

            Order order = orderRepository
                    .findByIdWithPatientAndDoctorOrganizationAndUser(request.getOrderId())
                    .orElseThrow();
            OrderComments orderComments = new OrderComments();
            OrderStatus orderStatus = order.getStatus();
            var oldOrderStatus = orderStatus;

            if (request.getInitiatorStatus() != null) {
                orderStatus = switch (request.getInitiatorStatus()) {
                    case SENT_FOR_APPROVAL -> OrderStatus.IN_REVIEW;
                    case APPROVED -> OrderStatus.APPROVED;
                    case RE_PLAN -> OrderStatus.RE_PLAN;
                    case IN_PROGRESS -> OrderStatus.IN_PROGRESS;
                    default -> order.getStatus();
                };
            }
            var newOrderStatus = orderStatus;

            STLFileMetadata stlMetadata = request.getStlFileMetadata();
            if (stlMetadata != null) {
                savedTreatmentPlan
                        .getStlFileMetadata()
                        .setFileId(stlFilesDetails(
                                order.getId(),
                                treatmentPlan.getDoctorId(),
                                treatmentPlan.getPatient().getId(),
                                treatmentPlan.getTreatmentPlanName()));
                STLFileMetadata.Status stlStatus = stlMetadata.getStatus();
                if (stlStatus != null
                        && EnumSet.of(
                                        STLFileMetadata.Status.STL_FILES_UPLOADED,
                                        STLFileMetadata.Status.STL_FILES_REQUESTED)
                                .contains(stlStatus)) {
                    orderStatus = OrderStatus.valueOf(stlStatus.name());
                }
                if (request.getStlFileMetadata().getStatus().equals(STLFileMetadata.Status.APPROVED)) {
                    stlFileApproved(
                            request,
                            userProfile,
                            order,
                            patient,
                            savedTreatmentPlan.getId(),
                            oldOrderStatus,
                            newOrderStatus);
                }
            }
            if (orderStatus.equals(OrderStatus.STL_FILES_REQUESTED)) {
                stlFileRequestedByCustomer(
                        userProfile, order, patient, savedTreatmentPlan, request, oldOrderStatus, newOrderStatus);

                caseActivityLogger.logStlRequested(
                        patient,
                        userProfile,
                        treatmentPlan.getTreatmentPlanTagName(),
                        treatmentPlan.getTreatmentPlanVersion());
            }

            if (orderStatus.equals(OrderStatus.STL_FILES_UPLOADED)) {
                stlFileUploadedByLabAdmin(
                        userProfile, order, patient, savedTreatmentPlan, request, oldOrderStatus, newOrderStatus);

                caseActivityLogger.logStlUploaded(
                        patient,
                        userProfile,
                        treatmentPlan.getTreatmentPlanTagName(),
                        treatmentPlan.getTreatmentPlanVersion());
            }

            if (orderStatus.equals(OrderStatus.IN_REVIEW)) {
                if (userProfile.isEnterprise() && serviceConfigurationRepository.isPlanningUser(userProfile.getId())
                        || userProfile.isInternalUser()) {
                    var targetProfileId = order.getTargetProfile().getId();
                    patientTaskTrackerService.moveSingleTask(
                            MoveSingleTaskRequest.builder()
                                    .workflowStausName(IN_REVIEW)
                                    .workflowName(PLANNING_IN_HOUSE_WORKFLOW)
                                    .patientId(patient.getId())
                                    .profileId(targetProfileId)
                                    .build(),
                            order);
                }

                if (treatmentPlan.getTreatmentPlanVersion().equals("V1")) {
                    caseActivityLogger.logInitialPlanSentForReview(
                            patient,
                            userProfile,
                            treatmentPlan.getTreatmentPlanTagName(),
                            treatmentPlan.getTreatmentPlanVersion());
                } else {
                    caseActivityLogger.logIterativePlanSentForReview(
                            patient,
                            userProfile,
                            treatmentPlan.getTreatmentPlanTagName(),
                            treatmentPlan.getTreatmentPlanVersion());
                }
                sentTreatmentForReviewEmail(
                        userProfile, treatmentPlan, order, patient, request, oldOrderStatus, newOrderStatus);
            }
            if (orderStatus.equals(OrderStatus.RE_PLAN)) {
                if (userProfile.isPractice() && serviceConfigurationRepository.isPlanningUser(userProfile.getId())) {
                    var targetProfileId = order.getTargetProfile().getId();
                    patientTaskTrackerService.moveSingleTask(
                            MoveSingleTaskRequest.builder()
                                    .workflowStausName(IN_REVISION)
                                    .workflowName(PLANNING_IN_HOUSE_WORKFLOW)
                                    .patientId(patient.getId())
                                    .profileId(targetProfileId)
                                    .build(),
                            order);
                }

                if (request.getTreatmentPlanMetadata() != null
                        && request.getTreatmentPlanMetadata().getReplanReason() != null) {
                    caseActivityLogger.logRevisionRequested(
                            patient,
                            userProfile,
                            treatmentPlan.getTreatmentPlanTagName(),
                            treatmentPlan.getTreatmentPlanVersion(),
                            request.getTreatmentPlanMetadata().getReplanReason());
                }

                rePlanTreatmentPlan(
                        userProfile, order, patient, request, treatmentPlan, oldOrderStatus, newOrderStatus);
            }
            if (orderStatus.equals(OrderStatus.APPROVED)
                    && !request.getStatus().equals(AlignerTreatmentStatus.ACTIVE)) {

                if (userProfile.isPractice() && serviceConfigurationRepository.isPlanningUser(userProfile.getId())) {
                    var targetProfileId = order.getTargetProfile().getId();
                    patientTaskTrackerService.moveSingleTask(
                            MoveSingleTaskRequest.builder()
                                    .workflowStausName(APPROVED)
                                    .workflowName(PLANNING_IN_HOUSE_WORKFLOW)
                                    .patientId(patient.getId())
                                    .profileId(targetProfileId)
                                    .build(),
                            order);
                }
                caseActivityLogger.logPlanApproved(
                        patient,
                        userProfile,
                        treatmentPlan.getTreatmentPlanTagName(),
                        treatmentPlan.getTreatmentPlanVersion());

                approvedPlanByCustomer(
                        userProfile, order, patient, request, treatmentPlan, oldOrderStatus, newOrderStatus);
            }

            if (order.getStatus() != orderStatus) {
                orderComments.setNotes(String.format(
                        OrderConstant.TIMELINE_PLAN_MODIFIED,
                        OrderTreatmentCommonUtil.capitalize(order.getStatus().toString()),
                        OrderTreatmentCommonUtil.capitalize(orderStatus.toString())));
                orderComments.setOrderId(order.getId());
                orderComments.setDoctorId(request.getDoctorId());
                orderComments.setProfileId(request.getProfileId());
                orderCommentsRepository.save(orderComments);
                order.setStatus(orderStatus);
            } else {
                if (alignerTreatmentStatus != AlignerTreatmentStatus.ACTIVE
                        && AlignerTreatmentStatus.ACTIVE.equals(request.getStatus())) {
                    orderComments.setNotes(String.format(
                            OrderConstant.TIMELINE_PLAN_MODIFIED,
                            OrderTreatmentCommonUtil.capitalize(
                                    order.getStatus().toString()),
                            OrderTreatmentCommonUtil.capitalize(OrderStatus.COMPLETED.toString())));
                    orderComments.setOrderId(order.getId());
                    orderComments.setDoctorId(request.getDoctorId());
                    orderComments.setProfileId(request.getProfileId());
                    orderCommentsRepository.save(orderComments);
                    order.setStatus(OrderStatus.COMPLETED);
                    practiceFinalizeTreatment(
                            request,
                            userProfile,
                            treatmentPlan,
                            order,
                            patient,
                            oldOrderStatus,
                            OrderStatus.MANUFACTURING_PENDING);
                }
            }
            orderRepository.save(order);
        }

        if (approvedByPatientAt == null && request.getApprovedByPatientAt() != null) {
            String title = notificationService.getLocalizedMessages(
                    patient, "notification.treatment.approvedbypatient.title", null);
            String message = notificationService.getLocalizedMessages(
                    patient, "notification.treatment.approvedbypatient.message", null);

            timelineService.addEvent(
                    request.getDoctorId(),
                    UserType.DOCTOR,
                    patient.getId(),
                    UserType.PATIENT,
                    EventType.TREATMENT_PLAN_SENT_FOR_APPROVAL_TO_PATIENT,
                    new TreatmentPlanSentForApprovalEventMetadata(AlignerTreatmentResponse.from(savedTreatmentPlan)));

            chatService.sendNotification(SendNotificationRequest.builder()
                    .title(title)
                    .message(message)
                    .notificationIndex(104)
                    .mobile(patient.getMobileNo())
                    .email(patient.getEmail())
                    .isDoctorApp(false)
                    .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                    .organizationId(xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                    .build());
        }

        Optional.of(request)
                .filter(req ->
                        req.getStartDate() != null && req.getEndDate() != null && req.getCurrentAlignerNo() != null)
                .ifPresent(req -> {
                    treatmentPlanRepository.findByPatientAndDoctorIdAndTreatmentSubTypeWithTracking(
                            patient.getId(), ProductTypeName.ALIGNERS);

                    var createAlignerJourneyRequest = CreateAlignerJourneyRequest.from(savedTreatmentPlan, req);

                    alignerService.finaliseAlignerJourneyTreatment(savedTreatmentPlan, createAlignerJourneyRequest);
                });
        if (AlignerTreatmentStatus.ACTIVE.equals(request.getStatus())
                && userProfile.getProfileType().equals(ProfileType.INVITED)) {
            int totalAligners = OrderTreatmentCommonUtil.getTotalAligners(treatmentPlan.getAlignerDetailsMetadata());

            var receiversUserProfile = userProfile.getInviterProfile();
            if (receiversUserProfile != null) {
                chatService.treatmentPlanFinalizedByPractice(EmailSendReq.builder()
                        .email(receiversUserProfile.getUser().getEmail())
                        .patientName(patient.fullName())
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
                        .orderId(treatmentPlan.getOrderId())
                        .practiceName(userProfile.getUser().displayName())
                        .orderReceiverEmail(receiversUserProfile.getUser().getEmail())
                        .orgName(userProfile.getOrganizationBrandName())
                        .build());
            }
        }
        if (AlignerTreatmentStatus.ACTIVE.equals(request.getStatus())) {
            timelineService.addEvent(
                    request.getDoctorId(),
                    UserType.DOCTOR,
                    patient.getId(),
                    UserType.PATIENT,
                    EventType.TREATMENT_PLAN_ADDED,
                    new TreatmentPlanAddedEventMetaData(
                            AlignerTreatmentResponse.from(savedTreatmentPlan),
                            patient.getPatientType().name(),
                            patient.getHasReadExistingPatientForm()));
        }

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
                            for (File fileItem : files) {
                                try {
                                    googleDriveService.shareFile(
                                            invitorProfile.getId(),
                                            fileItem.getFullPath(),
                                            List.of(patientTaskTracker
                                                    .getAssignee()
                                                    .getUser()
                                                    .getEmail()),
                                            "reader",
                                            fileItem.getDriveFileId());
                                    Set<HasShared> newSet = new HashSet<>(fileItem.getSharedWith());
                                    newSet.add(HasShared.INTERNAL_USER);
                                    fileItem.setSharedWith(newSet);
                                    fileRepository.save(fileItem);
                                } catch (Exception ignored) {

                                }
                            }
                        }
                    }
                }
            }
        }

        return AlignerTreatmentResponse.from(savedTreatmentPlan);
    }

    private void cloneFilesFromOtherTreatmentPlans(TreatmentPlan treatmentPlan, List<Long> fileIdsToClone) {
        if (fileIdsToClone == null || fileIdsToClone.isEmpty()) {
            return;
        }

        log.info("Cloning files with IDs: {} for treatment plan ID: {}", fileIdsToClone, treatmentPlan.getId());

        Set<Long> existingFileIds =
                treatmentPlan.getFiles().stream().map(File::getId).collect(Collectors.toSet());

        List<Long> filesToClone = fileIdsToClone.stream()
                .filter(fileId -> !existingFileIds.contains(fileId))
                .collect(Collectors.toList());

        if (filesToClone.isEmpty()) {
            log.info("No new files to clone for treatment plan ID: {}", treatmentPlan.getId());
            return;
        }

        List<File> originalFiles = fileRepository.findAllById(filesToClone);

        if (originalFiles.isEmpty()) {
            log.warn("None of the requested files with IDs: {} were found", filesToClone);
            return;
        }

        List<File> clonedFiles = originalFiles.stream()
                .map(originalFile -> {
                    File clonedFile = File.cloneFile(originalFile);
                    clonedFile.setFilesFromTreatmentPlan(true);
                    return fileRepository.save(clonedFile);
                })
                .toList();

        treatmentPlan.getFiles().addAll(clonedFiles);
        log.info("Added {} cloned files to treatment plan ID: {}", clonedFiles.size(), treatmentPlan.getId());
    }

    private void clonePdfFile(TreatmentPlan treatmentPlan, TreatmentPlan oldTreatmentPlan) {
        Set<Long> fileIdToClone =
                oldTreatmentPlan.getPdfFiles().stream().map(File::getId).collect(Collectors.toSet());

        List<File> filesToClone = fileRepository.findAllById(fileIdToClone);

        List<File> clonedFiles = filesToClone.stream()
                .map(oldFile -> {
                    File clonedFile = File.cloneFile(oldFile);
                    clonedFile.setFilesFromTreatmentPlan(true);
                    return fileRepository.save(clonedFile);
                })
                .toList();

        treatmentPlan.getPdfFiles().addAll(clonedFiles);
        log.info("Added {} cloned files to treatment plan ID: {}", clonedFiles.size(), treatmentPlan.getId());
    }

    private void cloneOtherFile(TreatmentPlan treatmentPlan, TreatmentPlan oldTreatmentPlan) {
        Set<Long> fileIdToClone =
                oldTreatmentPlan.getOtherFiles().stream().map(File::getId).collect(Collectors.toSet());

        List<File> filesToClone = fileRepository.findAllById(fileIdToClone);

        List<File> clonedFiles = filesToClone.stream()
                .map(oldFile -> {
                    File clonedFile = File.cloneFile(oldFile);
                    clonedFile.setFilesFromTreatmentPlan(true);
                    return fileRepository.save(clonedFile);
                })
                .toList();

        treatmentPlan.getOtherFiles().addAll(clonedFiles);
        log.info("Added {} cloned files to treatment plan ID: {}", clonedFiles.size(), treatmentPlan.getId());
    }

    private void stlFileApproved(
            TreatmentPlanRequest request,
            UserProfile senderUserProfile,
            Order order,
            Patient patient,
            Long treatmentPlanId,
            OrderStatus oldOrderStatus,
            OrderStatus newOrderStatus) {

        UserProfile receiverUserProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(order.getTargetProfileId())
                .orElseThrow();
        orderManagementNotificationService.notificationForSTLFileApproved(
                request,
                order.getPatient(),
                receiverUserProfile.getUser().getEmail(),
                order.getId(),
                receiverUserProfile.getOrgName(),
                treatmentPlanId,
                oldOrderStatus,
                newOrderStatus,
                receiverUserProfile);
        timelineService.addEvent(
                patient.getId(),
                UserType.PATIENT,
                receiverUserProfile.getDoctor().getId(),
                UserType.DOCTOR,
                EventType.STL_FILE_APPROVED,
                new StlFileApprovedMetadata(senderUserProfile.getOrgName(), order.getId()),
                receiverUserProfile,
                receiverUserProfile.getOrganization());
    }

    private void stlFileUploadedByLabAdmin(
            UserProfile senderUserProfile,
            Order order,
            Patient patient,
            TreatmentPlan treatmentPlan,
            TreatmentPlanRequest request,
            OrderStatus oldOrderStatus,
            OrderStatus newOrderStatus) {
        if (serviceConfigurationRepository.isPlanningUser(request.getProfileId())) {
            PatientDoctorOrganization patientDoctorOrganization =
                    patientDoctorOrganizationRepository.findByPatient(patient.getId());
            UserProfile customerProfile = patientDoctorOrganization.getUserProfile();
            LowerJawDetails lowerJawDetails = treatmentPlan.getAlignerDetailsMetadata() != null
                    ? treatmentPlan.getAlignerDetailsMetadata().getLowerJawDetails()
                    : null;
            UpperJawDetails upperJawDetails = treatmentPlan.getAlignerDetailsMetadata() != null
                    ? treatmentPlan.getAlignerDetailsMetadata().getUpperJawDetails()
                    : null;
            int upperEnd = upperJawDetails != null && upperJawDetails.getEndsWith() != null
                    ? upperJawDetails.getEndsWith()
                    : 0;
            int lowerEnd = lowerJawDetails != null && lowerJawDetails.getEndsWith() != null
                    ? lowerJawDetails.getEndsWith()
                    : 0;
            int stages = 0;
            if (upperEnd > 0 || lowerEnd > 0) {
                stages = Math.max(upperEnd, lowerEnd);
            }

            planningCustomerEmailService.sendStlFileUploadedEmail(StlFileUploadedEmailRequest.builder()
                    .email(customerProfile.getUser().getEmail())
                    .orgName(ResolveOrgName.resolveOrgName(customerProfile.getOrganizationBrandName())
                            .name())
                    .portalUrl(resolveWebUrl.resolveOrgName(customerProfile.getOrganizationBrandName()))
                    .patientFirstName(patient.getFirstName())
                    .patientLastName(patient.getLastName())
                    .practiceLocation(patient.getPracticeLocationName())
                    .patientId(patient.getCustomerMappedId())
                    .planName(treatmentPlan.getTreatmentPlanTagName())
                    .remarks(treatmentPlan.getRemarks())
                    .series(String.format(
                            "Upper %s / Lower %s",
                            upperJawDetails != null
                                    ? String.format(
                                            "%s-%s", upperJawDetails.getStartsWith(), upperJawDetails.getEndsWith())
                                    : "N/A",
                            lowerJawDetails != null
                                    ? String.format(
                                            "%s-%s", lowerJawDetails.getStartsWith(), lowerJawDetails.getEndsWith())
                                    : "N/A"))
                    .stages(String.valueOf(stages))
                    .wearDays(String.valueOf(treatmentPlan.getDaysToWearEachAligner()))
                    .build());

            timelineService.addEvent(
                    patient.getId(),
                    UserType.PATIENT,
                    customerProfile.getDoctor().getId(),
                    UserType.DOCTOR,
                    EventType.PLANNING_CUSTOMER_LAB_UPLOADED_STL_FILES,
                    new PlanningCustomerLabUploadedStlFilesMetadata(
                            patient.getId(), patient.fullName(), treatmentPlan.getId()),
                    customerProfile,
                    customerProfile.getOrganization());

            String title = String.format("New Files for %s", patient.fullName());
            String message = "STL files have been uploaded by the lab.";
            chatService.sendNotification(SendNotificationRequest.builder()
                    .patientId(patient.getId())
                    .title(title)
                    .message(message)
                    .notificationIndex(157)
                    .mobile(customerProfile.getUser().getMobileNo())
                    .email(customerProfile.getUser().getEmail())
                    .isDoctorApp(true)
                    .globalId(String.format(
                            "%s:%s",
                            treatmentPlan.getId().toString(),
                            Optional.ofNullable(order).map(Order::getId).orElse(null)))
                    .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                    .xOrgName(xOrgNameResolver
                            .resolveFromUser(customerProfile.getUser())
                            .getXOrgName())
                    .organizationId(xOrgNameResolver
                            .resolveFromUser(customerProfile.getUser())
                            .getOrganizationId())
                    .build());

            whatsAppUtilities
                    .resolveMobileNumberOfSpecificUser(patient.getId(), List.of(MessageSendTo.CUSTOMER))
                    .forEach(mobileNo -> {
                        String url = "profile/" + patient.getId() + "/plans";
                        planningNotificationService.sendWhatsAppSafely(
                                customerProfile,
                                mobileNo,
                                whatsappTemplateTypeProperties.getSTL_PLANNING_FILES_UPLOADED(),
                                List.of(url));
                    });
        }
    }

    private void stlFileRequestedByCustomer(
            UserProfile senderUserProfile,
            Order order,
            Patient patient,
            TreatmentPlan treatmentPlan,
            TreatmentPlanRequest request,
            OrderStatus oldOrderStatus,
            OrderStatus newOrderStatus) {
        int totalAligners = OrderTreatmentCommonUtil.getTotalAligners(treatmentPlan.getAlignerDetailsMetadata());

        String stlFileTypeText;
        if (request.getStlFileMetadata() != null
                && request.getStlFileMetadata().getPrintingType() == STLFileMetadata.PrintingType.THREE_D_PRINTED) {
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

    private void approvedPlanByCustomer(
            UserProfile customerProfile,
            Order order,
            Patient patient,
            TreatmentPlanRequest request,
            TreatmentPlan treatmentPlan,
            OrderStatus oldOrderStatus,
            OrderStatus newOrderStatus) {

        PatientDoctorOrganization patientDoctorOrganization =
                patientDoctorOrganizationRepository.findByPatient(patient.getId());
        UserProfile userProfile = patientDoctorOrganization.getUserProfile();
        UserProfile ownerProfile = patientDoctorOrganization.getOrgUserProfile();
        LowerJawDetails lowerJawDetails = treatmentPlan.getAlignerDetailsMetadata() != null
                ? treatmentPlan.getAlignerDetailsMetadata().getLowerJawDetails()
                : null;
        UpperJawDetails upperJawDetails = treatmentPlan.getAlignerDetailsMetadata() != null
                ? treatmentPlan.getAlignerDetailsMetadata().getUpperJawDetails()
                : null;
        int upperEnd =
                upperJawDetails != null && upperJawDetails.getEndsWith() != null ? upperJawDetails.getEndsWith() : 0;
        int lowerEnd =
                lowerJawDetails != null && lowerJawDetails.getEndsWith() != null ? lowerJawDetails.getEndsWith() : 0;
        int stages = 0;
        if (upperEnd > 0 || lowerEnd > 0) {
            stages = Math.max(upperEnd, lowerEnd);
        }

        planningCustomerEmailService.sendPlanApprovedEmail(PlanApprovedEmailRequest.builder()
                .email(userProfile.getUser().getEmail())
                .orgName(ResolveOrgName.resolveOrgName(userProfile.getOrganizationBrandName())
                        .name())
                .portalUrl(resolveWebUrl.resolveOrgName(userProfile.getOrganizationBrandName()))
                .patientFirstName(patient.getFirstName())
                .patientLastName(patient.getLastName())
                .practiceLocation(patient.getPracticeLocationName())
                .patientId(patient.getCustomerMappedId())
                .planName(treatmentPlan.getTreatmentPlanTagName())
                .remarks(treatmentPlan.getRemarks())
                .series(String.format(
                        "Upper %s / Lower %s",
                        upperJawDetails != null
                                ? String.format("%s-%s", upperJawDetails.getStartsWith(), upperJawDetails.getEndsWith())
                                : "N/A",
                        lowerJawDetails != null
                                ? String.format("%s-%s", lowerJawDetails.getStartsWith(), lowerJawDetails.getEndsWith())
                                : "N/A"))
                .stages(String.valueOf(stages))
                .wearDays(String.valueOf(treatmentPlan.getDaysToWearEachAligner()))
                .build());

        if (serviceConfigurationRepository.isPlanningUser(request.getProfileId())) {
            timelineService.addEvent(
                    patient.getId(),
                    UserType.PATIENT,
                    userProfile.getDoctor().getId(),
                    UserType.DOCTOR,
                    EventType.PLANNING_CUSTOMER_TREATMENT_PLAN_APPROVED,
                    new PlanningCustomerTreatmentPlanApprovedMetadata(patient.getId(), patient.fullName()),
                    userProfile,
                    userProfile.getOrganization());

            String treatmentName =
                    treatmentPlan.getTreatmentPlanTagName() == null ? "n/a" : treatmentPlan.getTreatmentPlanTagName();
            String title = "Plan Approved";
            String message = String.format(
                    "“%s – %s” for %s has been approved.",
                    treatmentName, treatmentPlan.getTreatmentPlanVersion(), patient.fullName());
            chatService.sendNotification(SendNotificationRequest.builder()
                    .patientId(patient.getId())
                    .title(title)
                    .message(message)
                    .notificationIndex(159)
                    .mobile(userProfile.getUser().getMobileNo())
                    .email(userProfile.getUser().getEmail())
                    .globalId(Optional.ofNullable(order).map(Order::getId).orElse(null))
                    .isDoctorApp(true)
                    .serviceName("PLANNING")
                    .xOrgName(xOrgNameResolver
                            .resolveFromUser(userProfile.getUser())
                            .getXOrgName())
                    .organizationId(xOrgNameResolver
                            .resolveFromUser(userProfile.getUser())
                            .getOrganizationId())
                    .build());

            whatsAppUtilities
                    .resolveMobileNumberOfSpecificUser(
                            patient.getId(), List.of(MessageSendTo.SUPER_ADMIN, MessageSendTo.ADMIN))
                    .forEach(mobileNo -> {
                        String url = "profile/" + patient.getId() + "/plans";
                        planningNotificationService.sendWhatsAppSafely(
                                ownerProfile,
                                mobileNo,
                                whatsappTemplateTypeProperties.getPLAN_PLANNING_APPROVED(),
                                List.of(treatmentName, treatmentPlan.getTreatmentPlanVersion(), url));
                    });
        } else {
            var isInviterExists = customerProfile.getInviterProfile() != null;
            if (isInviterExists
                    && customerProfile.getRoles().stream().anyMatch(role -> "CUSTOMER".equals(role.getName()))) {
                var orgProfile = customerProfile.getInviterProfile();
                timelineService.addEvent(
                        patient.getId(),
                        UserType.PATIENT,
                        orgProfile.getDoctor().getId(),
                        UserType.DOCTOR,
                        EventType.THIRD_PARTY_CUSTOMER_APPROVE_TREATMENT_PLAN,
                        new ThirdPartyCustomerApproveTreatmentPlanMetadata(
                                customerProfile.getOrgName(),
                                order.getId(),
                                request.getTreatmentPlanTagName() != null
                                        ? request.getTreatmentPlanTagName()
                                        : request.getTreatmentPlanId().toString(),
                                request.getTreatmentPlanId()),
                        orgProfile,
                        orgProfile.getOrganization());
                orderManagementNotificationService.notificationForTreatmentPlanApproved(
                        request,
                        customerProfile.getOrgName(),
                        orgProfile.getUser().getEmail(),
                        request.getTreatmentPlanTagName(),
                        order.getId(),
                        request.getTreatmentPlanId(),
                        patient.getId(),
                        patient.getMobileNo(),
                        patient.getFirstName(),
                        oldOrderStatus,
                        newOrderStatus,
                        orgProfile.getUser().getMobileNo());
            } else {
                var receiverUserProfile = order.getTargetProfile();
                timelineService.addEvent(
                        patient.getId(),
                        UserType.PATIENT,
                        receiverUserProfile.getDoctor().getId(),
                        UserType.DOCTOR,
                        EventType.THIRD_PARTY_CUSTOMER_APPROVE_TREATMENT_PLAN,
                        new ThirdPartyCustomerApproveTreatmentPlanMetadata(
                                customerProfile.getPracticeName(),
                                order.getId(),
                                request.getTreatmentPlanTagName() != null
                                        ? request.getTreatmentPlanTagName()
                                        : request.getTreatmentPlanId().toString(),
                                request.getTreatmentPlanId()),
                        receiverUserProfile,
                        receiverUserProfile.getOrganization());
                orderManagementNotificationService.notificationForTreatmentPlanApproved(
                        request,
                        customerProfile.getPracticeName(),
                        receiverUserProfile.getUser().getEmail(),
                        request.getTreatmentPlanTagName(),
                        order.getId(),
                        request.getTreatmentPlanId(),
                        patient.getId(),
                        patient.getFirstName(),
                        patient.getMobileNo(),
                        oldOrderStatus,
                        newOrderStatus,
                        receiverUserProfile.getUser().getMobileNo());
            }
        }
    }

    private void rePlanTreatmentPlan(
            UserProfile senderUserProfile,
            Order order,
            Patient patient,
            TreatmentPlanRequest request,
            TreatmentPlan treatmentPlan,
            OrderStatus oldOrderStatus,
            OrderStatus newOrderStatus) {
        PatientDoctorOrganization patientDoctorOrganization =
                patientDoctorOrganizationRepository.findByPatient(patient.getId());
        UserProfile planningUser = patientDoctorOrganization.getUserProfile();
        UserProfile ownerUser = patientDoctorOrganization.getOrgUserProfile();
        LowerJawDetails lowerJawDetails = treatmentPlan.getAlignerDetailsMetadata() != null
                ? treatmentPlan.getAlignerDetailsMetadata().getLowerJawDetails()
                : null;
        UpperJawDetails upperJawDetails = treatmentPlan.getAlignerDetailsMetadata() != null
                ? treatmentPlan.getAlignerDetailsMetadata().getUpperJawDetails()
                : null;
        int upperEnd =
                upperJawDetails != null && upperJawDetails.getEndsWith() != null ? upperJawDetails.getEndsWith() : 0;
        int lowerEnd =
                lowerJawDetails != null && lowerJawDetails.getEndsWith() != null ? lowerJawDetails.getEndsWith() : 0;
        int stages = 0;
        if (upperEnd > 0 || lowerEnd > 0) {
            stages = Math.max(upperEnd, lowerEnd);
        }

        planningCustomerEmailService.sendRevisionEmail(InRevisionEmailRequest.builder()
                .email(planningUser.getUser().getEmail())
                .orgName(ResolveOrgName.resolveOrgName(planningUser.getOrganizationBrandName())
                        .name())
                .portalUrl(resolveWebUrl.resolveOrgName(planningUser.getOrganizationBrandName()))
                .patientFirstName(patient.getFirstName())
                .userComments(treatmentPlan.getTreatmentPlanMetadata().getReplanReason())
                .patientLastName(patient.getLastName())
                .practiceLocation(patient.getPracticeLocationName())
                .patientId(patient.getCustomerMappedId())
                .planName(treatmentPlan.getTreatmentPlanTagName())
                .remarks(treatmentPlan.getRemarks())
                .series(String.format(
                        "Upper %s / Lower %s",
                        upperJawDetails != null
                                ? String.format("%s-%s", upperJawDetails.getStartsWith(), upperJawDetails.getEndsWith())
                                : "N/A",
                        lowerJawDetails != null
                                ? String.format("%s-%s", lowerJawDetails.getStartsWith(), lowerJawDetails.getEndsWith())
                                : "N/A"))
                .stages(String.valueOf(stages))
                .wearDays(String.valueOf(treatmentPlan.getDaysToWearEachAligner()))
                .build());

        var receiverUserProfile = order.getTargetProfile();
        int totalAligners = OrderTreatmentCommonUtil.getTotalAligners(treatmentPlan.getAlignerDetailsMetadata());
        String orgName = senderUserProfile.getOrgName();
        if (senderUserProfile.isPractice()) {
            orgName = senderUserProfile.getPracticeName();
        }
        chatService.requestToRePlan(OrderManagementEmailRequest.builder()
                .orderSenderEmail(senderUserProfile.getUser().getEmail())
                .patientName(patient.fullName())
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
                .orderSenderName(orgName)
                .replanComment(request.getTreatmentPlanMetadata().getReplanReason())
                .orgName(receiverUserProfile.getOrganizationBrandName())
                .build());

        if (serviceConfigurationRepository.isPlanningUser(request.getProfileId())) {
            timelineService.addEvent(
                    patient.getId(),
                    UserType.PATIENT,
                    planningUser.getDoctor().getId(),
                    UserType.DOCTOR,
                    EventType.PLANNING_CUSTOMER_TREATMENT_PLAN_REVISION,
                    new PlanningCustomerTreatmentPlanRevisionMetadata(patient.getId(), patient.fullName()),
                    planningUser,
                    planningUser.getOrganization());

            timelineService.addEvent(
                    patient.getId(),
                    UserType.PATIENT,
                    receiverUserProfile.getDoctor().getId(),
                    UserType.DOCTOR,
                    EventType.PLANNING_CUSTOMER_TREATMENT_PLAN_REVISION,
                    new PlanningCustomerTreatmentPlanRevisionMetadata(patient.getId(), patient.fullName()),
                    receiverUserProfile,
                    receiverUserProfile.getOrganization());

            String treatmentName =
                    treatmentPlan.getTreatmentPlanTagName() == null ? "n/a" : treatmentPlan.getTreatmentPlanTagName();
            whatsAppUtilities
                    .resolveMobileNumberOfSpecificUser(
                            patient.getId(), List.of(MessageSendTo.SUPER_ADMIN, MessageSendTo.ADMIN))
                    .forEach(mobileNo -> {
                        String url = "profile/" + patient.getId() + "/plans";
                        planningNotificationService.sendWhatsAppSafely(
                                planningUser,
                                mobileNo,
                                whatsappTemplateTypeProperties.getREVISION_PLANNING_REQUEST_SENT(),
                                List.of(treatmentName, treatmentPlan.getTreatmentPlanVersion(), url));
                    });

            String title = "Revision Sent";
            String message = String.format(
                    "Revision request for “%s – %s” (%s) has been sent to the lab.",
                    treatmentName, treatmentPlan.getTreatmentPlanVersion(), patient.fullName());
            chatService.sendNotification(SendNotificationRequest.builder()
                    .patientId(patient.getId())
                    .title(title)
                    .message(message)
                    .notificationIndex(160)
                    .mobile(planningUser.getUser().getMobileNo())
                    .email(planningUser.getUser().getEmail())
                    .globalId(Optional.ofNullable(order).map(Order::getId).orElse(null))
                    .isDoctorApp(true)
                    .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                    .xOrgName(xOrgNameResolver
                            .resolveFromUser(planningUser.getUser())
                            .getXOrgName())
                    .organizationId(xOrgNameResolver
                            .resolveFromUser(planningUser.getUser())
                            .getOrganizationId())
                    .build());

            chatService.sendNotification(SendNotificationRequest.builder()
                    .patientId(patient.getId())
                    .title(title)
                    .message(message)
                    .notificationIndex(160)
                    .mobile(receiverUserProfile.getUser().getMobileNo())
                    .email(receiverUserProfile.getUser().getEmail())
                    .globalId(Optional.ofNullable(order).map(Order::getId).orElse(null))
                    .isDoctorApp(true)
                    .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                    .xOrgName(xOrgNameResolver
                            .resolveFromUser(receiverUserProfile.getUser())
                            .getXOrgName())
                    .organizationId(xOrgNameResolver
                            .resolveFromUser(receiverUserProfile.getUser())
                            .getOrganizationId())
                    .build());
        } else {
            timelineService.addEvent(
                    patient.getId(),
                    UserType.PATIENT,
                    senderUserProfile.getDoctor().getId(),
                    UserType.DOCTOR,
                    EventType.RE_PLAN_TREATMENT,
                    new ReplanTreamentEventMetadata(
                            patient.getId(), patient.getFirstName(), orgName, order.getId(), treatmentPlan.getId()),
                    receiverUserProfile,
                    receiverUserProfile.getOrganization());

            var orgWhatsAppDetails = subscriptionService.isWhatsAppMessagingEnabled(
                    senderUserProfile.getDoctor().getId(), senderUserProfile.getId());

            orderManagementNotificationService.notificationForRePlanRequest(
                    request,
                    orgWhatsAppDetails,
                    patient,
                    orgName,
                    senderUserProfile.getUser().getEmail(),
                    order.getId(),
                    oldOrderStatus,
                    newOrderStatus,
                    senderUserProfile.getUser().getMobileNo());
        }
    }

    private void practiceFinalizeTreatment(
            TreatmentPlanRequest request,
            UserProfile orgProfile,
            TreatmentPlan treatmentPlan,
            Order order,
            Patient patient,
            OrderStatus oldOrderStatus,
            OrderStatus newOrderStatus) {
        var isInviterExists = orgProfile.getInviterProfile() != null;

        if (isInviterExists) {
            timelineService.addEvent(
                    patient.getId(),
                    UserType.PATIENT,
                    orgProfile.getInviterProfile().getDoctor().getId(),
                    UserType.DOCTOR,
                    EventType.PLAN_FINALIZED_BY_PRACTICE,
                    new TreatmentPlanFinalisedEventMetadata(
                            patient.getId(),
                            patient.getFirstName(),
                            orgProfile.getPracticeName(),
                            order.getId(),
                            treatmentPlan.getId()),
                    orgProfile.getInviterProfile(),
                    orgProfile.getOrganization());

            orderManagementNotificationService.notificationForTreatmentPlanFinalized(
                    request,
                    patient,
                    orgProfile.getPracticeName(),
                    orgProfile.getInviterProfile().getUser().getEmail(),
                    order.getId(),
                    oldOrderStatus,
                    newOrderStatus,
                    orgProfile.getUser().getMobileNo());
        }
    }

    private void sentTreatmentForReviewEmail(
            UserProfile ownerUserProfile,
            TreatmentPlan treatmentPlan,
            Order order,
            Patient patient,
            TreatmentPlanRequest request,
            OrderStatus oldOrderStatus,
            OrderStatus newOrderStatus) {

        PatientDoctorOrganization patientDoctorOrganization =
                patientDoctorOrganizationRepository.findByPatient(request.getPatientId());
        UserProfile planningUser = patientDoctorOrganization.getUserProfile();
        LowerJawDetails lowerJawDetails = treatmentPlan.getAlignerDetailsMetadata() != null
                ? treatmentPlan.getAlignerDetailsMetadata().getLowerJawDetails()
                : null;
        UpperJawDetails upperJawDetails = treatmentPlan.getAlignerDetailsMetadata() != null
                ? treatmentPlan.getAlignerDetailsMetadata().getUpperJawDetails()
                : null;
        int upperEnd =
                upperJawDetails != null && upperJawDetails.getEndsWith() != null ? upperJawDetails.getEndsWith() : 0;
        int lowerEnd =
                lowerJawDetails != null && lowerJawDetails.getEndsWith() != null ? lowerJawDetails.getEndsWith() : 0;

        int stages = 0;
        if (upperEnd > 0 || lowerEnd > 0) {
            stages = Math.max(upperEnd, lowerEnd);
        }
        planningCustomerEmailService.sendPlanReadyEmail(PlanReadyEmailRequest.builder()
                .email(planningUser.getUser().getEmail())
                .orgName(ResolveOrgName.resolveOrgName(planningUser.getOrganizationBrandName())
                        .name())
                .patientFirstName(patient.getFirstName())
                .patientLastName(patient.getLastName())
                .patientId(patient.getCustomerMappedId())
                .practiceLocation(patient.getPracticeLocationName())
                .portalUrl(resolveWebUrl.resolveOrgName(planningUser.getOrganizationBrandName()))
                .planName(treatmentPlan.getTreatmentPlanTagName())
                .remarks(treatmentPlan.getRemarks())
                .series(String.format(
                        "Upper %s / Lower %s",
                        upperJawDetails != null
                                ? String.format("%s-%s", upperJawDetails.getStartsWith(), upperJawDetails.getEndsWith())
                                : "N/A",
                        lowerJawDetails != null
                                ? String.format("%s-%s", lowerJawDetails.getStartsWith(), lowerJawDetails.getEndsWith())
                                : "N/A"))
                .stages(String.valueOf(stages))
                .wearDays(String.valueOf(treatmentPlan.getDaysToWearEachAligner()))
                .build());

        if (serviceConfigurationRepository.isPlanningUser(request.getProfileId())) {
            timelineService.addEvent(
                    patient.getId(),
                    UserType.PATIENT,
                    planningUser.getDoctor().getId(),
                    UserType.DOCTOR,
                    EventType.PLANNING_CUSTOMER_TREATMENT_PLAN_SENT_FOR_APPROVAL,
                    new PlanningCustomerTreatmentPlanSendForApprovalMetadata(patient.getId(), patient.fullName()),
                    planningUser,
                    planningUser.getOrganization());

            String treatmentName =
                    treatmentPlan.getTreatmentPlanTagName() == null ? "n/a" : treatmentPlan.getTreatmentPlanTagName();

            whatsAppUtilities
                    .resolveMobileNumberOfSpecificUser(patient.getId(), List.of(MessageSendTo.CUSTOMER))
                    .forEach(mobileNo -> {
                        String url = "profile/" + patient.getId() + "/plans";
                        planningNotificationService.sendWhatsAppSafely(
                                planningUser,
                                mobileNo,
                                whatsappTemplateTypeProperties.getPLAN_PLANNING_READY_FOR_REVIEW(),
                                List.of(treatmentName, treatmentPlan.getTreatmentPlanVersion(), url));
                    });

            String title = "Plan Ready for Review";
            String message = String.format(
                    "“%s – %s” for %s is now ready for your review.",
                    treatmentName, treatmentPlan.getTreatmentPlanVersion(), patient.fullName());
            chatService.sendNotification(SendNotificationRequest.builder()
                    .patientId(patient.getId())
                    .title(title)
                    .message(message)
                    .notificationIndex(161)
                    .mobile(planningUser.getUser().getMobileNo())
                    .email(planningUser.getUser().getEmail())
                    .globalId(Optional.ofNullable(order).map(Order::getId).orElse(null))
                    .isDoctorApp(true)
                    .serviceName("PLANNING")
                    .xOrgName(xOrgNameResolver
                            .resolveFromPatientId(patient.getId())
                            .getXOrgName())
                    .organizationId(xOrgNameResolver
                            .resolveFromPatientId(patient.getId())
                            .getOrganizationId())
                    .build());
        } else {
            UserProfile orderOwnerProfile = userProfileRepository
                    .findByIdWithOrgAndDoctorAndUser(order.getOwnerProfileId())
                    .orElseThrow();

            String ownerDisplayname = ownerUserProfile.getOrgName();
            if (ownerDisplayname == null) {
                ownerDisplayname = ownerUserProfile.getUser().fullNameWithSalutation();
            }

            timelineService.addEvent(
                    patient.getId(),
                    UserType.PATIENT,
                    order.getDoctorId(),
                    UserType.DOCTOR,
                    EventType.ORG_SEND_TREATMENT_PLAN_FOR_APPROVAL,
                    new TreatmentPlanSentForApprovalByOrgEventMetadata(
                            patient.getId(), patient.getFirstName(), ownerDisplayname, order.getId()),
                    orderOwnerProfile,
                    orderOwnerProfile.getOrganization());
            var whatsAppMessagingEnabled = subscriptionService.isWhatsAppMessagingEnabled(
                    ownerUserProfile.getDoctor().getId(), ownerUserProfile.getId());

            orderManagementNotificationService.notificationForTreatmentPlanApproval(
                    patient,
                    orderOwnerProfile.getUser().getEmail(),
                    order.getId(),
                    ownerUserProfile.getOrgName(),
                    oldOrderStatus,
                    newOrderStatus,
                    whatsAppMessagingEnabled,
                    orderOwnerProfile.getUser().getMobileNo(),
                    request);
        }
    }

    private void createFolder(TreatmentPlanRequest request, TreatmentPlan treatmentPlan) {
        var doctorId = UserId.builder()
                .userId(request.getDoctorId())
                .userType(UserType.DOCTOR)
                .build();
        var patientId = UserId.builder()
                .userId(request.getPatientId())
                .userType(UserType.PATIENT)
                .build();

        filesService.createFolderHierarchy(CreateFolderHierarchyRequest.builder()
                .path(Paths.get("/", IMAGE_FOLDER_NAME, treatmentPlan.getTreatmentPlanName())
                        .toString())
                .uploader(patientId)
                .owners(Set.of(doctorId, patientId))
                .isPatientFolder(true)
                .isDefaultFolder(true)
                .build());

        filesService.createFolderHierarchy(CreateFolderHierarchyRequest.builder()
                .path(Paths.get("/", IMAGE_FOLDER_NAME, PRE_TREATMENT).toString())
                .uploader(patientId)
                .owners(Set.of(doctorId, patientId))
                .isPatientFolder(true)
                .isDefaultFolder(true)
                .build());
    }

    private void createTreatmentPlanDefaultFolder(TreatmentPlanRequest request, TreatmentPlan treatmentPlan) {
        var doctorId = UserId.builder()
                .userId(request.getDoctorId())
                .userType(UserType.DOCTOR)
                .build();
        var patientId = UserId.builder()
                .userId(request.getPatientId())
                .userType(UserType.PATIENT)
                .build();

        @FunctionalInterface
        interface FolderCreator {
            void createIfNotExists(String folderName, String parentPath, boolean isPatientFolder);
        }

        FolderCreator createFolder = (folderName, parentPath, isPatientFolder) -> {
            filesService.createFolderIfNotExists(CreateFolderRequest.builder()
                    .folderName(folderName)
                    .parentPath(parentPath)
                    .uploader(patientId)
                    .owners(Set.of(patientId, doctorId))
                    .isDefaultFolder(true)
                    .isPatientFolder(isPatientFolder)
                    .build());
        };

        createFolder.createIfNotExists(CLEAR_ALIGNERS, "/", true);

        createFolder.createIfNotExists(treatmentPlan.getTreatmentPlanName(), CLEAR_ALIGNERS, true);

        Optional.ofNullable(request.getAlignerTreatmentDetails())
                .filter(details -> details.getLowerJaw() != null && details.getUpperJaw() != null)
                .ifPresent(details -> {
                    List<Integer> allNumbers = Stream.concat(
                                    details.getLowerJaw().getRange().stream(),
                                    details.getUpperJaw().getRange().stream())
                            .toList();
                    int lowestNumber =
                            allNumbers.stream().min(Integer::compareTo).orElse(Integer.MAX_VALUE);
                    int highestNumber =
                            allNumbers.stream().max(Integer::compareTo).orElse(Integer.MIN_VALUE);
                    String treatmentPlanFolderPath = Paths.get(
                                    "/" + CLEAR_ALIGNERS, treatmentPlan.getTreatmentPlanName())
                            .toString();
                    IntStream.iterate(highestNumber, i -> i >= lowestNumber, i -> i - 1)
                            .mapToObj(i -> String.format("Aligner %d", i))
                            .forEach(folderName ->
                                    createFolder.createIfNotExists(folderName, treatmentPlanFolderPath, true));
                });
    }

    private Integer[] stlFilesDetails(String orderId, Long doctorId, Long patientId, String treatmentPlanName) {
        List<FileDetails> documentFileDetails = Optional.ofNullable(filesService.getFiles(
                        doctorId,
                        UserType.DOCTOR,
                        patientId,
                        UserType.PATIENT,
                        "/Orders/Order " + orderId + "/" + treatmentPlanName + "/"))
                .map(UserFilesDetails::getFiles)
                .orElse(Collections.emptyList());

        return documentFileDetails.stream()
                .map(file -> file.getFileId() != 0L ? Integer.parseInt(String.valueOf(file.getFileId())) : null)
                .toArray(Integer[]::new);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientAlignerTreatmentResponse getPatientAlignerTreatment(Long patientId, Long doctorId) {

        List<TreatmentPlan> alignerTreatments =
                treatmentPlanRepository.findByPatientAndTreatmentSubType(patientId, ProductTypeName.ALIGNERS);

        List<TreatmentPlan> filteredAlignerTreatments = alignerTreatments.stream()
                .filter(treatmentPlan -> (treatmentPlan.getApprovedByPatientAt() != null
                                || treatmentPlan.getStatus().equals(AlignerTreatmentStatus.ACTIVE)
                                || treatmentPlan.getStatus().equals(AlignerTreatmentStatus.COMPLETE))
                        && !treatmentPlan.getStatus().equals(AlignerTreatmentStatus.DEACTIVATED))
                .toList();

        if (filteredAlignerTreatments.isEmpty()) {
            return PatientAlignerTreatmentResponse.from(null, false, false, false, null);
        }

        boolean isTreatmentPlanCreated = true;
        boolean isSingleTreatment = filteredAlignerTreatments.size() == 1;
        boolean isTreatmentPlanApprovedByPatient = filteredAlignerTreatments.stream()
                .anyMatch(treatmentPlan -> Boolean.TRUE.equals(treatmentPlan.getIsApprovedByPatient()));

        LocalDate approvedByPatientAt = filteredAlignerTreatments.stream()
                .filter(treatmentPlan -> Boolean.TRUE.equals(treatmentPlan.getIsApprovedByPatient())
                        && treatmentPlan.getApprovedByPatientAt() != null)
                .map(TreatmentPlan::getApprovedByPatientAt)
                .findFirst()
                .orElse(null);

        List<TreatmentPlanDTO> treatmentPlanDTOList = new ArrayList<>();

        for (TreatmentPlan treatmentPlan : filteredAlignerTreatments) {
            List<TreatmentPlanVideoResponse> treatmentPlanVideoResponseList = new ArrayList<>();
            List<FileDetails> fileDetailsList = new ArrayList<>();
            List<FileDetails> pdfFileDetailsList = new ArrayList<>();
            for (TreatmentPlanVideoFile treatmentPlanVideoResponse : treatmentPlan.getTreatmentPlanVideoFiles()) {
                treatmentPlanVideoResponseList.add(TreatmentPlanVideoResponse.from(treatmentPlanVideoResponse));
            }
            for (File fileDetails : treatmentPlan.getFiles()) {
                fileDetailsList.add(FileDetails.from(fileDetails));
            }

            for (File pdfFileDetails : treatmentPlan.getPdfFiles()) {
                pdfFileDetailsList.add(FileDetails.from(pdfFileDetails));
            }

            int totalAligners = OrderTreatmentCommonUtil.getTotalAligners(treatmentPlan.getAlignerDetailsMetadata());
            treatmentPlanDTOList.add(TreatmentPlanDTO.from(
                    treatmentPlan,
                    totalAligners,
                    treatmentPlanVideoResponseList,
                    fileDetailsList,
                    treatmentPlan.getTracking() != null ? TrackingDTO.from(treatmentPlan.getTracking()) : null,
                    pdfFileDetailsList));
        }

        return PatientAlignerTreatmentResponse.from(
                treatmentPlanDTOList,
                isTreatmentPlanCreated,
                isSingleTreatment,
                isTreatmentPlanApprovedByPatient,
                approvedByPatientAt);
    }

    @Transactional
    @Override
    public AlignerTreatmentResponse approvedPlanByPatient(
            Long treatmentPlanId, Long patientId, Boolean isApprovedByPatient, LocalDate approvedByPatientAt) {
        var patient = patientRepository
                .findByIdWithDetails(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        TreatmentPlan treatmentPlan = treatmentPlanRepository
                .findById(treatmentPlanId)
                .orElseThrow(() -> new TreatmentNotFoundException(patientId, patient.getAddedByUserId()));
        int totalAligners = OrderTreatmentCommonUtil.getTotalAligners(treatmentPlan.getAlignerDetailsMetadata());

        treatmentPlan.setIsApprovedByPatient(isApprovedByPatient);
        treatmentPlan.setApprovedByPatientAt(approvedByPatientAt);
        alignerCacheEvict.evictLeadData(patient.getAddedByUserId());
        var userProfile = patient.getDoctorOrganization().getUserProfile();

        final TreatmentPlan savedTreatmentPlan = treatmentPlanRepository.save(treatmentPlan);
        if (Boolean.TRUE.equals(isApprovedByPatient)) {
            timelineService.addEvent(
                    treatmentPlan.getDoctorId(),
                    UserType.DOCTOR,
                    patient.getId(),
                    UserType.PATIENT,
                    EventType.TREATMENT_PLAN_APPROVED_BY_PATIENT,
                    new TreatmentPlanApprovedEventMetadata(AlignerTreatmentResponse.from(savedTreatmentPlan)));

            chatService.treatmentApprovedByPatient(EmailSendReq.builder()
                    .email(patient.getDoctorOrganization().getDoctor().getEmail())
                    .patientName(patient.fullName())
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
                    .orgName(userProfile.getOrganizationBrandName())
                    .build());

            notificationService.treatmentPlanApproved(
                    patient,
                    patient.getDoctorOrganization().getUserProfile().getUser().getEmail(),
                    patient.getDoctorOrganization().getUserProfile().getUser().getMobileNo());
        }
        return AlignerTreatmentResponse.from(savedTreatmentPlan);
    }

    @Transactional
    @Override
    public void completeTreatmentPlan(CompleteTreatmentPlanRequest request) {
        TreatmentPlan treatmentPlan = treatmentPlanRepository
                .findById(request.getTreatmentPlanId())
                .orElseThrow(() -> new TreatmentPlanNotFoundException(request.getTreatmentPlanId()));

        treatmentPlan.setTreatmentPlanCompletedDate(ZonedDateTime.now());
        treatmentPlan.setStatus(AlignerTreatmentStatus.COMPLETE);
        treatmentPlan.setTreatmentPlanCompletedRemarks(request.getTreatmentCompletedRemarks());

        Tracking tracking = treatmentPlan.getTracking();
        if (tracking == null) {
            throw new TrackingNotFoundException(treatmentPlan.getId());
        }
        tracking.setPatientTrackingStatus(PatientTrackingStatus.COMPLETE);
        trackingRepository.save(tracking);
        treatmentPlan.setTracking(tracking);
        treatmentPlanRepository.save(treatmentPlan);

        Optional<Patient> dbPatient = patientRepository.findByIdWithDoctorProfileDetails(
                treatmentPlan.getPatient().getId());

        if (dbPatient.isPresent()) {
            Optional<UserProfile> userProfile = userProfileRepository.findByIdWithOrgAndDoctorAndUser(
                    dbPatient.get().getDoctorOrganization().getUserProfile().getId());
            if (userProfile.isPresent()
                    && userProfile.get().getProfileType().equals(ProfileType.INVITED)
                    && userProfile.get().getInviterProfile() != null) {
                UserProfile orgProfile = userProfileRepository
                        .findByIdWithOrgAndDoctorAndUser(
                                userProfile.get().getInviterProfile().getId())
                        .orElseThrow(() ->
                                new DoctorNotFoundException(userProfile.get().getId()));

                Patient patient = dbPatient.get();
                treatmentCompletionEmailService.sendTreatmentCompletedEmailToOrg(
                        TreatmentCompletedEmailForOrgReq.builder()
                                .patientName(patient.fullName())
                                .orgName(orgProfile.getOrganizationBrandName())
                                .orgEmail(orgProfile.getUser().getEmail())
                                .practiceName(userProfile.get().getUser().fullNameWithSalutation())
                                .orderId(treatmentPlan.getOrderId() != null ? treatmentPlan.getOrderId() : "")
                                .treatmentPlanName(treatmentPlan.getTreatmentPlanName())
                                .completionDate(ZonedDateTime.now().toLocalDate())
                                .build());

                timelineService.addEvent(
                        userProfile.get().getDoctor().getId(),
                        UserType.DOCTOR,
                        patient.getId(),
                        UserType.PATIENT,
                        EventType.TREATMENT_COMPLETED,
                        new TreatmentCompletedEventMetadata(TreatmentCompleted.builder()
                                .patientId(patient.getId())
                                .treatmentCompletionDate(ZonedDateTime.now().toLocalDate())
                                .treatmentCompletionRemark(treatmentPlan.getTreatmentPlanCompletedRemarks())
                                .treatmentId(treatmentPlan.getId().toString())
                                .treatmentPlanName(treatmentPlan.getTreatmentPlanName())
                                .patientName(patient.fullName())
                                .practiceName(userProfile.get().getUser().displayName())
                                .build()));

                timelineService.addEvent(
                        patient.getId(),
                        UserType.PATIENT,
                        userProfile.get().getDoctor().getId(),
                        UserType.DOCTOR,
                        EventType.TREATMENT_COMPLETED,
                        new TreatmentCompletedEventMetadata(TreatmentCompleted.builder()
                                .patientId(patient.getId())
                                .treatmentCompletionDate(ZonedDateTime.now().toLocalDate())
                                .treatmentCompletionRemark(treatmentPlan.getTreatmentPlanCompletedRemarks())
                                .treatmentId(treatmentPlan.getId().toString())
                                .treatmentPlanName(treatmentPlan.getTreatmentPlanName())
                                .patientName(patient.fullName())
                                .practiceName(userProfile.get().getUser().fullNameWithSalutation())
                                .build()),
                        orgProfile,
                        orgProfile.getOrganization());

                String title = "Congratulations!";
                String message = "Your treatment is complete — keep smiling!";
                chatService.sendNotification(SendNotificationRequest.builder()
                        .patientId(patient.getId())
                        .title(title)
                        .message(message)
                        .notificationIndex(140)
                        .mobile(patient.getMobileNo())
                        .email(patient.getEmail())
                        .isDoctorApp(false)
                        .xOrgName(xOrgNameResolver.resolveFromPatient(patient).getXOrgName())
                        .organizationId(
                                xOrgNameResolver.resolveFromPatient(patient).getOrganizationId())
                        .build());

                String doctorTitle = "Treatment Completed";
                String doctorMessage = String.format(
                        "Treatment for %s has been successfully completed by %s.",
                        patient.fullName(), userProfile.get().getUser().fullNameWithSalutation());
                chatService.sendNotification(SendNotificationRequest.builder()
                        .patientId(patient.getId())
                        .title(doctorTitle)
                        .message(doctorMessage)
                        .notificationIndex(141)
                        .mobile(orgProfile.getUser().getMobileNo())
                        .email(orgProfile.getUser().getEmail())
                        .isDoctorApp(true)
                        .serviceName(patientDoctorOrganizationRepository.getEnabledServiceConfig(patient.getId()))
                        .xOrgName(orgProfile.getUser().getXOrganizationName())
                        .build());
            }
        }
    }

    @Override
    public ShippingDetailsResponse attachShippingToTreatment(AttachShippingToTreatment request) {
        var treatmentPlan = treatmentPlanRepository
                .findById(request.getTreatmentPlanId())
                .orElseThrow(() -> new TreatmentPlanNotFoundException(request.getTreatmentPlanId()));
        var shippingDetails = shippingDetailsRepository
                .findById(request.getShippingId())
                .orElseThrow(() -> new ShippingDetailsNotFoundException(request.getShippingId()));
        treatmentPlan.setShippingDetails(shippingDetails);
        treatmentPlanRepository.save(treatmentPlan);
        return ShippingDetailsResponse.from(shippingDetails);
    }

    @Transactional
    @Override
    public void deleteTreatmentPlan(Long profileId, Long treatmentPlanId) {
        TreatmentPlan treatmentPlan = treatmentPlanRepository
                .findTreatmentPlanWithManufacturing(treatmentPlanId)
                .orElseThrow(() -> new TreatmentPlanNotFoundException(treatmentPlanId));

        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(profileId);
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(profileId)
                .orElseThrow(() -> new DoctorNotFoundException(profileId));
        if (adminWithDefaultTag && userProfile.getInviterProfile() != null) {
            userProfile = userProfile.getInviterProfile();
        }

        var doctorId = UserId.builder()
                .userId(userProfile.getDoctor().getId())
                .userType(UserType.DOCTOR)
                .build();

        List<File> associatedFiles = treatmentPlan.getFiles();
        if (associatedFiles != null && !associatedFiles.isEmpty()) {
            filesService.deleteFilesById(DeleteFilesRequest.builder()
                    .filesToDeleteById(associatedFiles.stream().map(File::getId).collect(Collectors.toSet()))
                    .deleter(doctorId)
                    .appointmentId(0L)
                    .build());
            treatmentPlan.getFiles().clear();
        }

        List<File> associatedPdfFiles = treatmentPlan.getPdfFiles();
        if (associatedPdfFiles != null && !associatedPdfFiles.isEmpty()) {
            filesService.deleteFilesById(DeleteFilesRequest.builder()
                    .filesToDeleteById(
                            associatedPdfFiles.stream().map(File::getId).collect(Collectors.toSet()))
                    .deleter(doctorId)
                    .appointmentId(0L)
                    .build());
            treatmentPlan.getPdfFiles().clear();
        }

        List<TreatmentPlanVideoFile> videoFiles = treatmentPlan.getTreatmentPlanVideoFiles();
        if (videoFiles != null && !videoFiles.isEmpty()) {

            filesService.deleteFilesById(DeleteFilesRequest.builder()
                    .filesToDeleteById(videoFiles.stream()
                            .map(TreatmentPlanVideoFile::getFileId)
                            .collect(Collectors.toSet()))
                    .deleter(doctorId)
                    .appointmentId(0L)
                    .build());

            treatmentPlanVideoRepository.deleteAll(videoFiles);

            treatmentPlan.getTreatmentPlanVideoFiles().clear();
        }

        List<File> otherFiles = treatmentPlan.getOtherFiles();
        if (otherFiles != null && !otherFiles.isEmpty()) {
            filesService.deleteFilesById(DeleteFilesRequest.builder()
                    .filesToDeleteById(otherFiles.stream().map(File::getId).collect(Collectors.toSet()))
                    .deleter(doctorId)
                    .appointmentId(0L)
                    .build());
            treatmentPlan.getOtherFiles().clear();
        }

        if (treatmentPlan.getTracking() != null) {
            trackingRepository.delete(treatmentPlan.getTracking());
            treatmentPlan.setTracking(null);
        }

        List<ManufacturingBatch> manufacturingBatches = treatmentPlan.getManufacturingBatches();

        if (manufacturingBatches != null && !manufacturingBatches.isEmpty()) {
            throw new GenericException("Cannot delete treatment plan with associated manufacturing batches.");
        }

        treatmentPlanRepository.delete(treatmentPlan);
    }
}
