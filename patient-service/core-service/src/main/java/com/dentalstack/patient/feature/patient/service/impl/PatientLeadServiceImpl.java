package com.dentalstack.patient.feature.patient.service.impl;

import static com.dentalstack.patient.feature.workflow.core.task_tracker.service.PatientTaskTrackerServiceImpl.CANCELLED;
import static com.dentalstack.patient.feature.workflow.core.task_tracker.service.PatientTaskTrackerServiceImpl.ONGOING_PRODUCT_LIST;

import com.amazonaws.services.kms.model.NotFoundException;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.aligner.repository.AlignerJourneyRepository;
import com.dentalstack.patient.feature.braces.dto.BracesJourneyTrackingResponse;
import com.dentalstack.patient.feature.braces.entity.BracesJourney;
import com.dentalstack.patient.feature.braces.enums.BracesTreatmentStage;
import com.dentalstack.patient.feature.braces.repository.BracesJourneyRepository;
import com.dentalstack.patient.feature.caseinfo.Metadata;
import com.dentalstack.patient.feature.caseinfo.repository.CaseInformationRepository;
import com.dentalstack.patient.feature.dashboardlabel.cache.DashboardCacheEvictService;
import com.dentalstack.patient.feature.doctor.dto.AssignPracticeLocationToPatientRequest;
import com.dentalstack.patient.feature.doctor.dto.DashboardLeadDetails;
import com.dentalstack.patient.feature.doctor.entity.CustomerAccessAndRevoke;
import com.dentalstack.patient.feature.doctor.entity.PatientDoctorOrganization;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.doctor.repository.CustomerAccessAndRevokeRepository;
import com.dentalstack.patient.feature.doctor.service.DoctorService;
import com.dentalstack.patient.feature.invitation.entity.Invitation;
import com.dentalstack.patient.feature.invitation.entity.PatientInvitationDetails;
import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.invitation.enums.PatientBelongsTo;
import com.dentalstack.patient.feature.invitation.exception.UserAlreadyInvitedException;
import com.dentalstack.patient.feature.invitation.projection.WebLeadDetailsSummary;
import com.dentalstack.patient.feature.invitation.repository.InvitationRepository;
import com.dentalstack.patient.feature.invitation.repository.PatientInvitationDetailsRepository;
import com.dentalstack.patient.feature.notification.dto.EmailSendReq;
import com.dentalstack.patient.feature.notification.service.ChatService;
import com.dentalstack.patient.feature.order.enums.OrderTreatmentPlanStatus;
import com.dentalstack.patient.feature.order.repository.OrderRepository;
import com.dentalstack.patient.feature.patient.dto.*;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.entity.PatientDetailsMetadata;
import com.dentalstack.patient.feature.patient.enums.AppInviteStatus;
import com.dentalstack.patient.feature.patient.enums.LeadTreatmentStage;
import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import com.dentalstack.patient.feature.patient.exception.PatientAlreadyAssignedToDoctorException;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.projection.PatientSummary;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.patient.service.PatientLeadService;
import com.dentalstack.patient.feature.patient.util.LeadTreatmentStageResolver;
import com.dentalstack.patient.feature.storage.files.dto.GetFolderSizeRequest;
import com.dentalstack.patient.feature.storage.files.repository.FileRepository;
import com.dentalstack.patient.feature.storage.files.service.FilesService;
import com.dentalstack.patient.feature.subcription.service.SubscriptionService;
import com.dentalstack.patient.feature.tracking.entity.Tracking;
import com.dentalstack.patient.feature.tracking.enums.PatientTrackingStatus;
import com.dentalstack.patient.feature.tracking.enums.Status;
import com.dentalstack.patient.feature.tracking.repository.TrackingRepository;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.dentalstack.patient.feature.treatment.enums.TreatmentServices;
import com.dentalstack.patient.feature.treatment.exception.TreatmentPlanNotFoundException;
import com.dentalstack.patient.feature.treatment.repository.TreatmentPlanRepository;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.workflow.core.task_tracker.repository.PatientTaskTrackerRepository;
import com.dentalstack.patient.feature.workflow.core.workflows.repository.WorkflowStatusRepository;
import com.dentalstack.patient.global.enums.ProductTypeName;
import jakarta.validation.constraints.NotNull;
import java.nio.file.Paths;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class PatientLeadServiceImpl implements PatientLeadService {

    private final AlignerJourneyRepository alignerJourneyRepository;
    private final InvitationRepository invitationRepository;
    private final BracesJourneyRepository bracesJourneyRepository;
    private final PatientRepository patientRepository;
    private final TrackingRepository trackingRepository;
    private final TreatmentPlanRepository treatmentPlanRepository;

    private final PatientInvitationDetailsRepository patientInvitationDetailsRepository;
    private final SubscriptionService subscriptionService;
    private final FilesService filesService;
    private final CaseInformationRepository caseInformationRepository;
    private final DoctorService doctorService;
    private final UserProfileRepository userProfileRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final ChatService chatService;
    private final FileRepository fileRepository;
    private final DashboardCacheEvictService dashboardCacheEvictService;
    private final OrderRepository orderRepository;
    private final PatientTaskTrackerRepository patientTaskTrackerRepository;
    private final WorkflowStatusRepository workflowStatusRepository;
    private final CustomerAccessAndRevokeRepository customerAccessAndRevokeRepository;
    String FILES_FOLDER_NAME = "files";

    @Override
    public List<DashboardLeadDetails> getWebLeadData(Long doctorId) {
        List<ProductTypeName> treatmentSubTypes = Arrays.asList(ProductTypeName.ALIGNERS, ProductTypeName.BRACES);
        List<TreatmentPlan> treatmentPlans =
                treatmentPlanRepository.findByDoctorIdAndTreatmentSubTypesWithTracking(doctorId, treatmentSubTypes);

        Map<Long, List<TreatmentPlan>> patientTreatmentPlans = treatmentPlans.stream()
                .filter(tp -> tp.getTracking() != null
                                && tp.getTracking().getStatus().equals(Status.DRAFT)
                                && tp.getTracking().getAskPatientToFill()
                        || tp.getTracking() != null
                                && !tp.getTracking().getStatus().equals(Status.DRAFT))
                .collect(Collectors.groupingBy(tp -> tp.getPatient().getId()));

        List<InvitationStatus> statusList = Arrays.asList(InvitationStatus.ACCEPTED, InvitationStatus.SENT);
        List<Invitation> invitations =
                invitationRepository.findByInviterIdAndInviterUserTypeAndInvitedUserTypeAndStatusIn(
                        doctorId, UserType.DOCTOR, UserType.PATIENT, statusList);

        Set<Long> patientIds = invitations.stream()
                .map(Invitation::getPatientInvitation)
                .filter(Objects::nonNull)
                .map(PatientInvitationDetails::getPatient)
                .map(Patient::getId)
                .collect(Collectors.toSet());

        List<AlignerJourney> alignerJourneys = alignerJourneyRepository.findByPatientIds(patientIds);
        Map<Long, List<AlignerJourney>> alignerJourneyMap = alignerJourneys.stream()
                .collect(Collectors.groupingBy(aj -> aj.getPatient().getId()));

        Collection<BracesTreatmentStage> stages =
                Arrays.asList(BracesTreatmentStage.ACTIVE, BracesTreatmentStage.DISCARDED);

        Set<Long> patientsWithBracesAppointments =
                bracesJourneyRepository.findPatientIdsWithAppointmentsByPatientIdInAndBracesTreatmentStageIn(
                        patientIds, stages);

        List<DashboardLeadDetails> dashboardLeadDetails = new ArrayList<>();
        for (Invitation invitation : invitations) {
            if (invitation.getPatientInvitation() == null) {
                continue;
            }
            Patient patient = invitation.getPatientInvitation().getPatient();
            Long patientId = patient.getId();
            if (!patient.getPatientStatus().equals(PatientStatus.ARCHIVE)) {
                boolean hasAlignerJourney = !alignerJourneyMap
                        .getOrDefault(patientId, Collections.emptyList())
                        .isEmpty();
                boolean hasBracesJourneyWithAppointments = patientsWithBracesAppointments.contains(patientId);
                boolean hasNonDraftOrAskPatientToFillTreatmentPlan = patientTreatmentPlans.containsKey(patientId);
                boolean hasActiveTracking = hasAlignerJourney
                        || hasBracesJourneyWithAppointments
                        || hasNonDraftOrAskPatientToFillTreatmentPlan;

                if (!hasActiveTracking) {
                    dashboardLeadDetails.add(DashboardLeadDetails.from(invitation));
                }
            }
        }

        return dashboardLeadDetails;
    }

    @Override
    @Deprecated
    public List<DashboardLeadDetails> getWebLead(Long doctorId) {
        List<InvitationStatus> statusList = Arrays.asList(InvitationStatus.ACCEPTED, InvitationStatus.SENT);
        var invitations = getWebLeadData(doctorId, statusList);

        return null;
    }

    @Deprecated
    public List<Invitation> getWebLeadData(Long doctorId, List<InvitationStatus> statusList) {

        List<ProductTypeName> treatmentSubTypes = Arrays.asList(ProductTypeName.ALIGNERS, ProductTypeName.BRACES);

        return invitationRepository.findWebLeadInvitations(
                doctorId,
                UserType.DOCTOR,
                UserType.PATIENT,
                statusList,
                treatmentSubTypes,
                PatientStatus.ARCHIVE,
                Status.DRAFT);
    }

    @Override
    public List<DashboardLeadDetails> getWebLead(GetWebLeadDataRequest request) {
        List<InvitationStatus> statusList = Arrays.asList(InvitationStatus.ACCEPTED, InvitationStatus.SENT);

        List<WebLeadDetailsSummary> invitations;

        Long doctorId = request.getDoctorId();
        long profileId = request.getProfileId();
        long organizationId = request.getOrganizationId();

        UserProfile userProfile = userProfileRepository
                .findByIdWithRoles(request.getProfileId())
                .orElseThrow(DoctorNotFoundException::new);

        List<Long> patientIds;
        if (UserProfile.isAlignerCompanyOrLab(userProfile.getRoles())
                || UserProfile.isCommercialAlignerLab(userProfile.getRoles())
                || UserProfile.isEnterpriseCompanyLab(userProfile.getRoles())) {
            patientIds = patientDoctorOrganizationRepository.findPatientIdsByOrganizationId(organizationId);
        } else {
            patientIds = patientDoctorOrganizationRepository.findPatientIdsByDoctorOrgAndProfile(
                    doctorId, organizationId, profileId);
        }
        invitations = getWebLeadData(request.getOrganizationId(), statusList, patientIds);
        return invitations.stream()
                .map(invitation -> mapToDashboardLeadDetails(invitation, request.getProfileId()))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public List<WebLeadDetailsSummary> getWebLeadData(
            Long organizationId, List<InvitationStatus> statusList, List<Long> patientIds) {
        List<ProductTypeName> treatmentSubTypes = Arrays.asList(ProductTypeName.ALIGNERS, ProductTypeName.BRACES);

        return invitationRepository.findWebLeadInvitationsByPatientIds(
                patientIds,
                organizationId,
                UserType.DOCTOR,
                UserType.PATIENT,
                statusList,
                treatmentSubTypes,
                PatientStatus.ARCHIVE,
                Status.DRAFT);
    }

    private DashboardLeadDetails mapToDashboardLeadDetails(Invitation invitation, Long profileId) {
        if (invitation.getPatientInvitation() == null
                || invitation.getPatientInvitation().getPatient() == null) {
            return null;
        }
        Patient patient = invitation.getPatientInvitation().getPatient();
        var leadTreatmentStage = determineTreatmentStage(patient.getId(), patient.getAddedByUserId());

        AppInviteStatus appInviteStatus;
        if (invitation.getStatus().equals(InvitationStatus.ACCEPTED)) {
            appInviteStatus = AppInviteStatus.CONNECTED;
        } else if (invitation.getStatus().equals(InvitationStatus.SENT) && invitation.getIsInvitationSent()) {
            appInviteStatus = AppInviteStatus.PENDING;
        } else {
            appInviteStatus = AppInviteStatus.NOT_CONNECTED;
        }
        return DashboardLeadDetails.builder()
                .patientId(patient.getId())
                .firstName(patient.getFirstName())
                .lastName(patient.getLastName())
                .fullName(patient.fullName())
                .patientName(patient.fullName())
                .practiceLocationName(patient.getPracticeLocationName())
                .email(patient.getEmail())
                .mobile(patient.getMobileNo())
                .age(patient.getAge())
                .gender(patient.getGender())
                .customerMappedId(patient.getCustomerMappedId())
                .productTypes(patient.getProductTypeName())
                .productTypeNames(patient.getProductTypeNames())
                .profileImage(patient.getProfilePictureUrl())
                .UUID(patient.getUUID())
                .chiefComplaint(patient.getChiefComplaint())
                .countryCode(patient.getCountryCode())
                .patientStatus(patient.getPatientStatus())
                .invitationId(invitation.getId())
                .invitationStatus(invitation.getStatus())
                .isInvitationSent(invitation.getIsInvitationSent())
                .inviteCode(
                        invitation.getInvitationCode() != null
                                ? invitation.getInvitationCode().getCode()
                                : null)
                .invitedAt(invitation.getCreatedAt())
                .isYourPatient(patient.isYourPatient(patient, profileId))
                .patientBelongsTo(patient.getDoctorOrganization().getPatientBelongsTo())
                .isPracticeAssigned(patient.getDoctorOrganization() != null
                        && patient.getDoctorOrganization().isPracticeAssigned())
                .assignedPractice(DashboardLeadDetails.AssignedPractice.builder()
                        .practiceDoctorId(
                                patient.getDoctorOrganization().getDoctor().getId())
                        .practiceProfileId(
                                patient.getDoctorOrganization().getUserProfile().getId())
                        .practiceOrganizationId(patient.getDoctorOrganization()
                                .getOrganization()
                                .getId())
                        .name(patient.getDoctorOrganization()
                                .getUserProfile()
                                .getUser()
                                .displayName())
                        .build())
                .treatmentStage(leadTreatmentStage)
                .appInviteStatus(appInviteStatus)
                .build();
    }

    private DashboardLeadDetails mapToDashboardLeadDetails(WebLeadDetailsSummary summary, Long profileId) {
        String fullName = String.format(
                        "%s %s",
                        Optional.ofNullable(summary.getFirstName()).orElse(""),
                        Optional.ofNullable(summary.getLastName()).orElse(""))
                .trim();

        AppInviteStatus appInviteStatus;
        if (summary.getInvitationStatus().equals(InvitationStatus.ACCEPTED)) {
            appInviteStatus = AppInviteStatus.CONNECTED;
        } else if (summary.getInvitationStatus().equals(InvitationStatus.SENT) && summary.getIsInvitationSent()) {
            appInviteStatus = AppInviteStatus.PENDING;
        } else {
            appInviteStatus = AppInviteStatus.NOT_CONNECTED;
        }

        return DashboardLeadDetails.builder()
                .patientId(summary.getPatientId())
                .firstName(summary.getFirstName())
                .lastName(summary.getLastName())
                .fullName(fullName)
                .patientName(fullName)
                .practiceLocationName(summary.getPracticeLocationName())
                .email(summary.getEmail())
                .mobile(summary.getMobileNo())
                .age(summary.getAge())
                .gender(summary.getGender())
                .customerMappedId(summary.getCustomerMappedId())
                .productTypeNames(summary.getRawProductTypeNames().stream()
                        .map(ProductTypeName::valueOf)
                        .collect(Collectors.toList()))
                .profileImage(summary.getProfilePictureUrl())
                .UUID(summary.getUUID())
                .chiefComplaint(summary.getChiefComplaint())
                .countryCode(summary.getCountryCode())
                .patientStatus(summary.getPatientStatus())
                .invitationId(summary.getInvitationId())
                .invitationStatus(summary.getMappedInvitationStatus())
                .isInvitationSent(summary.getIsInvitationSent())
                .inviteCode(summary.getInviteCode())
                .invitedAt(summary.getInvitedAt())
                .isYourPatient(summary.getAddedByUserProfileId().equals(profileId))
                .patientBelongsTo(summary.getPatientBelongsTo())
                .isPracticeAssigned(summary.getIsPracticeAssigned())
                .assignedPractice(DashboardLeadDetails.AssignedPractice.builder()
                        .practiceDoctorId(summary.getPracticeDoctorId())
                        .practiceProfileId(summary.getPracticeProfileId())
                        .practiceOrganizationId(summary.getPracticeOrganizationId())
                        .name(summary.getPracticeDisplayName())
                        .build())
                .treatmentStage(summary.getTreatmentStage())
                .appInviteStatus(appInviteStatus)
                .build();
    }

    public String rootPath(long userId, @NotNull UserType userType) {
        return Paths.get(userType.name().toLowerCase(), String.valueOf(userId), FILES_FOLDER_NAME)
                .toString();
    }

    private LeadTreatmentStage determineTreatmentStage(Long patientId, Long doctorId) {
        return LeadTreatmentStageResolver.determineTreatmentStage(
                patientId,
                doctorId,
                fileRepository,
                patientRepository,
                caseInformationRepository,
                treatmentPlanRepository,
                bracesJourneyRepository);
    }

    @Override
    @Deprecated
    public List<ArchivedLeadDetails> getPatientWithStatus(Long doctorId, String patientStatus) {
        PatientStatus status = PatientStatus.valueOf(patientStatus);
        List<InvitationStatus> statusList = Arrays.asList(InvitationStatus.ACCEPTED, InvitationStatus.SENT);

        List<Invitation> invitations = invitationRepository.findInvitationsWithPatientDetails(
                doctorId, UserType.DOCTOR, UserType.PATIENT, statusList);

        return invitations.stream()
                .filter(invitation -> invitation.getPatientInvitation() != null)
                .filter(invitation -> {
                    Patient patient = invitation.getPatientInvitation().getPatient();
                    return status.equals(patient.getPatientStatus());
                })
                .map(ArchivedLeadDetails::from)
                .collect(Collectors.toList());
    }

    @Override
    public List<ArchivedLeadDetails> getPatientWithStatus(ArchivedLeadRequest request) {
        UserProfile userProfile = userProfileRepository
                .findByIdWithRoles(request.getProfileId())
                .orElseThrow(DoctorNotFoundException::new);

        List<Long> patientIds;
        if (UserProfile.isAlignerCompanyOrLab(userProfile.getRoles())
                || UserProfile.isEnterpriseCompanyLab(userProfile.getRoles())) {
            patientIds = patientDoctorOrganizationRepository.findPatientIdsByOrganizationIdWithStatus(
                    request.getOrganizationId(), request.getPatientStatus());
        } else {
            patientIds = patientDoctorOrganizationRepository.findPatientIdsByDoctorOrgAndProfileWithStatus(
                    request.getDoctorId(),
                    request.getOrganizationId(),
                    request.getProfileId(),
                    request.getPatientStatus());
        }
        var patientSummaries = patientRepository.findPatientSummaryWithOrganizationDetails(patientIds);

        if (request.getSearch() != null) {
            String searchLower = request.getSearch().toLowerCase();

            patientSummaries = patientSummaries.stream()
                    .filter(patientSummary -> patientSummary
                                    .getFirstName()
                                    .toLowerCase()
                                    .contains(searchLower)
                            || patientSummary.getLastName().toLowerCase().contains(searchLower)
                            || patientSummary.getEmail().toLowerCase().contains(searchLower)
                            || (patientSummary.getFirstName() + " " + patientSummary.getLastName())
                                    .toLowerCase()
                                    .contains(searchLower))
                    .toList();
        }

        int pageNumber = request.getPageNumber();
        int pageSize = request.getPageSize();

        int startIndex = (pageNumber - 1) * pageSize;

        int totalElements = patientSummaries.size();
        int totalPages = (int) Math.ceil((double) totalElements / pageSize);

        if (startIndex >= totalElements) {
            return List.of();
        }

        List<PatientSummary> paginatedOrders =
                patientSummaries.stream().skip(startIndex).limit(pageSize).toList();

        ArchivedLeadDetails.PaginationDetails paginationDetails = ArchivedLeadDetails.PaginationDetails.builder()
                .pageNumber(pageNumber)
                .pageSize(pageSize)
                .totalOrders(totalElements)
                .totalPages(totalPages)
                .hasNext(pageNumber < totalPages - 1)
                .hasPrevious(pageNumber > 0)
                .build();

        return paginatedOrders.stream()
                .map(patient -> ArchivedLeadDetails.from(patient, request.getProfileId(), paginationDetails))
                .collect(Collectors.toList());
    }

    @Override
    public DashboardLeadDetails getLeadProfileDetails(Long patientId) {
        var patientInvitationDetails = patientInvitationDetailsRepository
                .findByPatientId(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        var invitation = patientInvitationDetails.getInvitation();
        Optional<Metadata> metadataOptional =
                caseInformationRepository.findMetadataByPatientIdAndDoctorId(patientId, invitation.getInviterId());
        String chiefComplaint = null;
        if (metadataOptional.isPresent()) {
            chiefComplaint = metadataOptional.get().getChiefComplaint();
        }
        var patient = patientRepository
                .findByIdWithDetails(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));
        return DashboardLeadDetails.from(patient, invitation, chiefComplaint);
    }

    @Override
    @Transactional(readOnly = true)
    public LeadProfileOverviewResponse getLeadProfileOverview(Long patientId, Long doctorId) {
        AtomicReference<Boolean> isCustomerTackingEnabled = new AtomicReference<>(false);
        AtomicReference<Boolean> isCustomerStlFileEnabled = new AtomicReference<>(false);
        AtomicReference<Boolean> isPatientTrackingEnabled = new AtomicReference<>(false);
        AtomicReference<Boolean> isPatientStlFileViewEnabled = new AtomicReference<>(false);
        AtomicReference<Boolean> isCustomerPrintFileEnabled = new AtomicReference<>(false);
        AtomicReference<Boolean> isCustomerScanFileEnabled = new AtomicReference<>(false);
        PatientInvitationDetails patientInvitationDetails = patientInvitationDetailsRepository
                .findByPatientIdWithInvitationAndPatient(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        Invitation invitation = patientInvitationDetails.getInvitation();
        Patient patient = patientInvitationDetails.getPatient();
        List<TreatmentPlan> treatmentPlansWithTracking =
                treatmentPlanRepository.findByPatientAndDoctorIdAndTreatmentSubTypeWithTracking(
                        patientId, ProductTypeName.ALIGNERS);

        Optional<String> currentOrderStatus = orderRepository.findLatestOrderStatusForPatient(patient.getId());
        Optional<String> gettingStartedOrderId = orderRepository.findLatestOrderIdForPatient(patient.getId());

        AtomicBoolean isActiveTrackingTreatment = new AtomicBoolean(false);

        List<TreatmentPlan> sortedPlans = treatmentPlansWithTracking.stream()
                .sorted(Comparator.comparing(TreatmentPlan::getCreatedAt).reversed())
                .toList();

        sortedPlans.forEach(treatmentPlan -> {
            if (treatmentPlan.getTracking() != null) {
                Tracking tracking = treatmentPlan.getTracking();
                if (tracking.getPatientTrackingStatus() != null
                        && tracking.getPatientTrackingStatus().equals(PatientTrackingStatus.ACTIVE)) {
                    isActiveTrackingTreatment.set(true);
                }
            }
        });

        TreatmentPlan lastTreatmentPlan = sortedPlans.isEmpty() ? null : sortedPlans.get(0);
        TreatmentPlan secondLastTreatment = sortedPlans.size() > 1 ? sortedPlans.get(1) : null;

        TreatmentPlan treatmentWithTracking = treatmentPlansWithTracking.stream()
                .filter(plan -> plan.getStatus() == AlignerTreatmentStatus.COMPLETE)
                .findFirst()
                .orElseGet(() -> treatmentPlansWithTracking.stream()
                        .filter(plan -> plan.getStatus() == AlignerTreatmentStatus.ACTIVE)
                        .findFirst()
                        .orElseGet(() -> treatmentPlansWithTracking.stream()
                                .filter(plan -> plan.getStatus() == AlignerTreatmentStatus.PAUSED)
                                .findFirst()
                                .orElseGet(() -> treatmentPlansWithTracking.stream()
                                        .filter(plan -> plan.getStatus() == AlignerTreatmentStatus.DEACTIVATED)
                                        .findFirst()
                                        .orElse(null))));

        boolean isInvited = invitation.getIsInvitationSent();

        boolean isPatientConnected = invitation.getStatus().equals(InvitationStatus.ACCEPTED);
        boolean isTreatmentAdded = patient.getProductTypeNames().stream()
                .anyMatch(type -> type == ProductTypeName.ALIGNERS || type == ProductTypeName.BRACES);

        Optional<PatientDoctorOrganization> patientDoctorOrganization =
                patientDoctorOrganizationRepository.findPatientDoctorOrganizationsWithPatientByPatientId(patientId);

        if (patientDoctorOrganization.isEmpty()) {
            throw new NotFoundException("No organization found for the given patient and doctor.");
        }

        PatientDoctorOrganization patientDoctorOrganizationData = patientDoctorOrganization.get();
        Optional<CustomerAccessAndRevoke> customerAccessAndRevoke =
                customerAccessAndRevokeRepository.findByProfileIdAndOrganizationId(
                        patientDoctorOrganizationData.getUserProfile().getId(),
                        patientDoctorOrganizationData.getOrganization().getId());
        customerAccessAndRevoke.ifPresent(c -> {
            isCustomerTackingEnabled.set(c.getIsTrackingEnabled());
            isCustomerStlFileEnabled.set(c.getIsStlFileViewEnabled());
            isCustomerPrintFileEnabled.set(c.getIsPrintFileViewEnabled());
            isCustomerScanFileEnabled.set(c.getIsScanFileViewEnabled());
        });
        if (patientDoctorOrganizationData.getPatient() != null) {
            isPatientTrackingEnabled.set(
                    patientDoctorOrganizationData.getPatient().getIsTrackingEnabled());
            isPatientStlFileViewEnabled.set(
                    patientDoctorOrganizationData.getPatient().getIsStlFileViewEnabled());
        }

        Long profileId = patientDoctorOrganizationData.getOrgUserProfile().getId();
        CompletableFuture<Double> folderSizeFuture = CompletableFuture.supplyAsync(() -> Optional.ofNullable(patientId)
                .map(id -> {
                    try {
                        return filesService.getSizeOfTheFolder(GetFolderSizeRequest.builder()
                                .path("patient/" + id)
                                .profileId(profileId)
                                .doctorId(doctorId)
                                .build());
                    } catch (Exception e) {
                        return 0.0;
                    }
                })
                .orElse(0.0));

        CompletableFuture<Boolean> subscriptionActiveFuture = CompletableFuture.supplyAsync(() -> {
            try {
                var ownerProfileId =
                        patientDoctorOrganizationData.getOrgUserProfile().getId();
                var ownerDoctorId = patientDoctorOrganizationData
                        .getOrgUserProfile()
                        .getDoctor()
                        .getId();
                var customerProfileId =
                        patientDoctorOrganizationData.getUserProfile().getId();
                var customerDoctorId = patientDoctorOrganizationData.getDoctor().getId();
                return subscriptionService.isSubscriptionActive(ownerDoctorId, ownerProfileId)
                        || subscriptionService.isSubscriptionActive(customerDoctorId, customerProfileId);
            } catch (Exception e) {
                log.info("Subscription not found for the patient");
                return false;
            }
        });

        boolean isServiceSelected = patient.getTreatmentServices() != null
                && patient.getTreatmentServices().equals(TreatmentServices.SMILESIMULATION);
        var treatmentPlans = treatmentPlanRepository.findByPatientId(patientId);
        boolean isTreatmentPlanFilled = !treatmentPlans.isEmpty();

        TreatmentPlan treatmentPlan = treatmentPlans.stream()
                .filter(plan -> plan.getStatus().equals(AlignerTreatmentStatus.ACTIVE))
                .findFirst()
                .orElseGet(() -> treatmentPlans.stream()
                        .filter(plan -> plan.getStatus().equals(AlignerTreatmentStatus.PAUSED))
                        .findFirst()
                        .orElseGet(() -> treatmentPlans.stream()
                                .filter(plan -> plan.getStatus().equals(AlignerTreatmentStatus.DEACTIVATED))
                                .findFirst()
                                .orElse(null)));

        boolean isTreatmentActive = treatmentPlan != null
                && (treatmentPlan.getStatus().equals(AlignerTreatmentStatus.ACTIVE)
                        || treatmentPlan.getStatus().equals(AlignerTreatmentStatus.PAUSED));

        TreatmentPlan latestTreatmentPlan = treatmentPlans.stream()
                .max(Comparator.comparing(TreatmentPlan::getCreatedAt))
                .orElse(null);

        boolean isTrackingAddedForLatestTreatmentPlan =
                latestTreatmentPlan != null && latestTreatmentPlan.getTracking() != null;

        List<BracesJourney> bracesJourneys = bracesJourneyRepository.findByDoctorIdAndPatientId(doctorId, patientId);
        var bracesJourney = bracesJourneys.stream()
                .filter(braces -> braces.getBracesTreatmentStage().equals(BracesTreatmentStage.ACTIVE))
                .findFirst()
                .orElseGet(() -> bracesJourneys.stream()
                        .filter(braces -> braces.getBracesTreatmentStage().equals(BracesTreatmentStage.INACTIVE))
                        .findFirst()
                        .orElse(null));
        boolean isFileAdded = folderSizeFuture.join() > 0;
        boolean subscriptionActive = subscriptionActiveFuture.join();

        Boolean isRefinementPatient = treatmentPlanRepository.isRefinementPatient(patientId);

        return LeadProfileOverviewResponse.builder()
                .isFileAdded(isFileAdded)
                .isInvited(isInvited)
                .isTreatmentAdded(isTreatmentAdded)
                .isServiceSelected(isServiceSelected)
                .isTreatmentPlanFilled(isTreatmentPlanFilled)
                .tracking(AlignerJourneyTrackingResponse.from(
                        treatmentWithTracking != null ? treatmentWithTracking.getTracking() : null))
                .treatmentPlan(TreatmentPlanTrackingResponse.from(treatmentWithTracking))
                .treatmentPlanId(treatmentPlan != null ? treatmentPlan.getId() : null)
                .bracesJourneyTrackingResponse(BracesJourneyTrackingResponse.from(bracesJourney))
                .isSubscriptionEnabled(subscriptionActive)
                .isPatientConnected(isPatientConnected)
                .isTreatmentActive(isTreatmentActive)
                .productTypeNames(patient.getProductTypeNames())
                .doctorId(doctorId)
                .deactivatedAt(lastTreatmentPlan != null ? lastTreatmentPlan.getDeactivatedAt() : null)
                .deactivatedRemarks(treatmentPlan != null ? treatmentPlan.getOtherRemarks() : null)
                .reasonForDeactivation(treatmentPlan != null ? treatmentPlan.getReasonForDeactivation() : null)
                .reasonForPause(
                        treatmentWithTracking != null
                                        && treatmentWithTracking.getStatus().equals(AlignerTreatmentStatus.PAUSED)
                                ? treatmentWithTracking.getTracking().getReasonForPausing()
                                : null)
                .pausedAt(
                        treatmentWithTracking != null
                                        && treatmentWithTracking.getStatus().equals(AlignerTreatmentStatus.PAUSED)
                                ? treatmentWithTracking.getTracking().getPauseDate()
                                : null)
                .isRefinement(isRefinementPatient)
                .isTrackingAddedForLatestTreatmentPlan(isTrackingAddedForLatestTreatmentPlan)
                .previousTreatmentPlanStatus(secondLastTreatment != null ? secondLastTreatment.getStatus() : null)
                .currentTreatmentPlanStatus(lastTreatmentPlan != null ? lastTreatmentPlan.getStatus() : null)
                .gettingStartedOrderStatus(currentOrderStatus.orElse(null))
                .treatmentPlanCompleted(Optional.ofNullable(latestTreatmentPlan)
                        .map(TreatmentPlan::getStatus)
                        .filter(status -> status.equals(AlignerTreatmentStatus.COMPLETE))
                        .isPresent())
                .treatmentPlanCompletedRemarks(Optional.ofNullable(latestTreatmentPlan)
                        .map(TreatmentPlan::getTreatmentPlanCompletedRemarks)
                        .orElse(null))
                .treatmentPlanStatus(Optional.ofNullable(latestTreatmentPlan)
                        .map(TreatmentPlan::getStatus)
                        .orElse(null))
                .trackingAddedForActiveTreatmentPlan(isActiveTrackingTreatment.get())
                .gettingStartedOrderId(gettingStartedOrderId.orElse(null))
                .isCustomerTrackingEnabled(isCustomerTackingEnabled.get())
                .isCustomerStlFileViewEnabled(isCustomerStlFileEnabled.get())
                .isCustomerPrintFileViewEnabled(isCustomerPrintFileEnabled.get())
                .isCustomerScanFileViewEnabled(isCustomerScanFileEnabled.get())
                .isPatientStlFileViewEnabled(isPatientStlFileViewEnabled.get())
                .isPatientTrackingEnabled(isPatientTrackingEnabled.get())
                .build();
    }

    @Override
    public void changeLeadStatus(long patientId, PatientStatus status) {
        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        patient.setPatientStatus(status);
        if (status.equals(PatientStatus.ARCHIVE)) {
            patient.setArchivedAt(ZonedDateTime.now());
            var treatmentPlans = treatmentPlanRepository.findByPatientId(patientId);
            treatmentPlans.forEach(plan -> {
                plan.setStatus(AlignerTreatmentStatus.DEACTIVATED);
                plan.setApproverStatus(OrderTreatmentPlanStatus.DEACTIVATED);
                plan.setInitiatorStatus(OrderTreatmentPlanStatus.DEACTIVATED);
                treatmentPlanRepository.save(plan);
            });
            var patientTaskTrackers = patientTaskTrackerRepository.findPatientTasksByPatientId(patientId);
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
        }
        patientRepository.save(patient);
    }

    @Override
    public List<DashboardLeadDetails> filterPatients(FilterPatientsRequest request) {
        var doctorId = request.getDoctorId();
        var practiceLocations = request.getPracticeLocation();
        var treatments = request.getTreatments();
        var services = request.getServices();
        if (doctorId == null) {
            throw new IllegalArgumentException("Doctor ID is required.");
        }

        List<InvitationStatus> statusList = List.of(InvitationStatus.SENT);
        long profileId = request.getProfileId();
        long organizationId = request.getOrganizationId();

        UserProfile userProfile = userProfileRepository
                .findByIdWithRoles(request.getProfileId())
                .orElseThrow(DoctorNotFoundException::new);

        List<Long> patientIds;
        if (UserProfile.isAlignerCompanyOrLab(userProfile.getRoles())
                || UserProfile.isEnterpriseCompanyLab(userProfile.getRoles())) {
            patientIds = patientDoctorOrganizationRepository.findPatientIdsByOrganizationId(organizationId);
        } else {
            patientIds = patientDoctorOrganizationRepository.findPatientIdsByDoctorOrgAndProfile(
                    doctorId, organizationId, profileId);
        }

        List<Invitation> invitations = invitationRepository.findByPatientIdsAndStatusIn(
                patientIds, UserType.DOCTOR, UserType.PATIENT, statusList);

        Stream<Invitation> invitationStream = invitations.stream()
                .filter(invitation -> invitation.getPatientInvitation() != null)
                .filter(invitation -> {
                    Patient patient = invitation.getPatientInvitation().getPatient();
                    return !patient.getPatientStatus().equals(PatientStatus.ARCHIVE);
                });

        if (practiceLocations != null && !practiceLocations.isEmpty()) {
            List<String> cleanedLocations = practiceLocations.stream()
                    .map(String::trim)
                    .map(String::toLowerCase)
                    .toList();

            invitationStream = invitationStream.filter(invitation -> {
                assert invitation.getPatientInvitation() != null;

                String cleanedPatientLocation =
                        invitation.getPatientInvitation().getPatient().getPracticeLocationName();
                if (cleanedPatientLocation != null) {
                    cleanedPatientLocation = cleanedPatientLocation.trim().toLowerCase();
                }
                return cleanedPatientLocation != null && cleanedLocations.contains(cleanedPatientLocation);
            });
        }

        if (treatments != null && !treatments.isEmpty()) {
            List<ProductTypeName> productTypeNames = ProductTypeName.fromStrings(treatments);
            invitationStream = invitationStream.filter(invitation -> {
                assert invitation.getPatientInvitation() != null;

                Patient patient = invitation.getPatientInvitation().getPatient();
                List<ProductTypeName> patientProductTypes = patient.getProductTypeNames();

                if (productTypeNames.contains(ProductTypeName.UNASSIGNED)) {
                    return patientProductTypes.contains(ProductTypeName.UNASSIGNED) && patientProductTypes.size() == 1;
                }

                var trackings = trackingRepository.findByPatientIdAndStatus(patient.getId(), Status.ACTIVE);
                var bracesJourneyOptional = bracesJourneyRepository.findByPatientIdAndBracesTreatmentStage(
                        patient.getId(), BracesTreatmentStage.ACTIVE);

                if (patient.getProductTypeNames().contains(ProductTypeName.ALIGNERS) && trackings.isEmpty()) {
                    return patientProductTypes.stream().anyMatch(productTypeNames::contains);
                }
                return trackings.isEmpty()
                        && (bracesJourneyOptional.isEmpty()
                                || !bracesJourneyOptional.get().getIsTreatmentStarted())
                        && patientProductTypes.stream().anyMatch(productTypeNames::contains);
            });
        }

        if (services != null && !services.isEmpty()) {
            List<TreatmentServices> treatmentServicesList = TreatmentServices.fromStrings(services);
            invitationStream = invitationStream.filter(invitation -> {
                assert invitation.getPatientInvitation() != null;

                Patient patient = invitation.getPatientInvitation().getPatient();
                return patient.getTreatmentServices() != null
                        && treatmentServicesList.contains(patient.getTreatmentServices());
            });
        }

        List<DashboardLeadDetails> dashboardLeadDetails = invitationStream
                .filter(invitation -> {
                    assert invitation.getPatientInvitation() != null;

                    Patient patient = invitation.getPatientInvitation().getPatient();
                    if (patient.getProductTypeNames().contains(ProductTypeName.ALIGNERS)) {
                        List<Tracking> trackings =
                                trackingRepository.findByPatientIdAndStatus(patient.getId(), Status.ACTIVE);
                        return shouldIncludePatient(patient, trackings);
                    }
                    return shouldIncludePatient(patient, new ArrayList<>());
                })
                .map(invitation -> {
                    DashboardLeadDetails details = mapToDashboardLeadDetails(invitation, doctorId);
                    if (details != null && invitation.getPatientInvitation() != null) {
                        PatientInvitationDetails patientInvitation = invitation.getPatientInvitation();
                        Patient patient = patientInvitation.getPatient();
                        if (patient != null) {
                            PatientDoctorOrganization org = patient.getDoctorOrganization();
                            if (org != null) {
                                UserProfile addedByProfile = org.getAddedByUserProfile();
                                if (addedByProfile != null) {
                                    details.setIsYourPatient(Objects.equals(addedByProfile.getId(), profileId));
                                }
                            }
                        }
                    }
                    return details;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (request.getFilterBy() != null) {
            return switch (request.getFilterBy()) {
                case BY_YOU -> dashboardLeadDetails.stream()
                        .filter(DashboardLeadDetails::getIsYourPatient)
                        .collect(Collectors.toList());
                case BY_ORGANIZATION -> dashboardLeadDetails.stream()
                        .filter(lead -> !lead.getIsYourPatient())
                        .collect(Collectors.toList());
                default -> dashboardLeadDetails;
            };
        }

        return dashboardLeadDetails;
    }

    private boolean shouldIncludePatient(Patient patient, List<Tracking> trackings) {
        if (patient.getProductTypeNames().size() == 1) {
            return true;
        }

        if (patient.getProductTypeNames().contains(ProductTypeName.ALIGNERS) && trackings.isEmpty()) {
            return true;
        }

        var bracesJourneyOptional = bracesJourneyRepository.findByPatientIdAndBracesTreatmentStage(
                patient.getId(), BracesTreatmentStage.ACTIVE);
        return trackings.isEmpty()
                && (bracesJourneyOptional.isEmpty()
                        || !bracesJourneyOptional.get().getIsTreatmentStarted());
    }

    @Override
    @Transactional
    public DashboardLeadDetails updatePatient(UpdateLeadDetails request) {
        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(request.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException(request.getPatientId()));

        var profileId = patient.getDoctorOrganization().getUserProfile().getId();
        var orgProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(profileId)
                .orElseThrow(() -> new DoctorNotFoundException(profileId));
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(orgProfile);

        if (request.getMobile() != null && !request.getMobile().equals(patient.getMobileNo())) {
            patient.setMobileNo(request.getMobile());
        }

        if (request.getEmail() != null && !request.getEmail().equals(patient.getEmail())) {
            var existingPatient = patientRepository.findByEmail(request.getEmail());
            if (patient.getEmail() != null) {
                if (existingPatient.isPresent()) {
                    if (existingPatient.get().getAddedByUserId().equals(patient.getAddedByUserId())) {
                        throw new UserAlreadyInvitedException(
                                patient.getAddedByUserId(), UserType.DOCTOR, UserType.PATIENT);
                    } else {
                        throw new PatientAlreadyAssignedToDoctorException(
                                existingPatient.get().getId(), patient.getAddedByUserId());
                    }
                }
            } else {
                patient.setEmail(request.getEmail());
            }
        }

        if (request.getChiefComplaint() != null) {
            patient.setChiefComplaint(request.getChiefComplaint());
        }

        if (request.getGender() != null) {
            patient.setGender(request.getGender());
        }

        if (request.getAge() != null) {
            patient.setAge(request.getAge());
        }

        if (request.getCity() != null) {
            patient.setCity(request.getCity());
        }
        if (request.getState() != null) {
            patient.setState(request.getState());
        }
        if (request.getCountry() != null) {
            patient.setCountry(request.getCountry());
        }

        if (request.getCustomerMappedId() != null) {
            patient.setCustomerMappedId(request.getCustomerMappedId());
        }
        if (request.getIsPatientDetailsEdited() != null) {
            patient.setIsPatientDetailsEdited(request.getIsPatientDetailsEdited());
        }
        if (request.getHasReadExistingPatientForm() != null) {
            patient.setHasReadExistingPatientForm(request.getHasReadExistingPatientForm());
        }
        if (request.getPrescriptionRead() != null) {
            patient.setPrescriptionRead(request.getPrescriptionRead());
        }
        if (request.getInviteModal() != null) {
            patient.setInviteModal(request.getInviteModal());
        }
        if (request.getCaseRecord() != null) {
            patient.setCaseRecord(request.getCaseRecord());
        }
        if (Boolean.TRUE.equals(request.getRemovePracticeLocation())) {
            if (patient.getPracticeLocationId() != null) {
                doctorService.removePatientPractice(patient.getId());
            }
            patient.setPracticeLocationId(null);
            patient.setPracticeLocationName(null);
        }
        if (request.getPracticeLocationId() != null) {
            doctorService.assignPracticeLocationToPatientForApp(AssignPracticeLocationToPatientRequest.builder()
                    .userId(patient.getAddedByUserId())
                    .patientId(patient.getId())
                    .practiceLocationId(request.getPracticeLocationId())
                    .build());
            patient.setPracticeLocationId(request.getPracticeLocationId());
        }
        if (request.getPracticeLocationName() != null) {
            patient.setPracticeLocationName(request.getPracticeLocationName());
        }

        if (request.getFirstName() != null) {
            patient.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            patient.setLastName(request.getLastName());
        }
        if (request.getCountryCode() != null) {
            patient.setCountryCode(request.getCountryCode());
        }
        if (request.getCurrentStep() != null) {
            patient.setCurrentStep(request.getCurrentStep());
        }
        updatePatientMetadata(patient, request);

        var patientInvitationDetails = patientInvitationDetailsRepository
                .findByPatientId(request.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException(request.getPatientId()));

        var invitation = patientInvitationDetails.getInvitation();
        if (request.getPracticeProfileId() != null) {
            var userProfile = userProfileRepository
                    .findByIdWithOrgAndDoctorAndUser(request.getPracticeProfileId())
                    .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));
            var orgUserProfile = userProfileRepository
                    .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                    .orElseThrow(() -> new DoctorNotFoundException(request.getDoctorId()));

            var patientDoctorOrganization = patientDoctorOrganizationRepository
                    .findPatientDoctorOrganizationsWithPatientByPatientId(request.getPatientId())
                    .orElseThrow(() -> new PatientNotFoundException(request.getPatientId()));

            if (!Objects.equals(request.getProfileId(), userProfile.getId())) {
                chatService.newPatientAssignedToPractice(EmailSendReq.builder()
                        .practiceAdminName(userProfile.getUser().fullName())
                        .doctorEmail(userProfile.getUser().getEmail())
                        .orgName(orgUserProfile.getOrgName())
                        .patientFirstName(patientDoctorOrganization.getPatient().fullName())
                        .build());
            }
            if (!Objects.equals(patientDoctorOrganization.getUserProfile().getId(), request.getPracticeProfileId())) {
                updatePatientInvitation(patientInvitationDetails, userProfile);
                updatePatientDoctorOrganization(patientDoctorOrganization, userProfile, orgUserProfile);
            }
        }
        patient = patientRepository.save(patient);
        return DashboardLeadDetails.from(patient, invitation);
    }

    private void updatePatientMetadata(Patient patient, UpdateLeadDetails request) {
        PatientDetailsMetadata metadata = patient.getPatientDetailsMetadata();
        if (metadata == null) {
            metadata = new PatientDetailsMetadata();
        }

        boolean hasMetadataChanges = false;

        if (request.getNextFollowUp() != null) {
            metadata.setNextFollowUp(request.getNextFollowUp());
            hasMetadataChanges = true;
        }

        if (request.getLabels() != null) {
            metadata.setLabels(request.getLabels());
            hasMetadataChanges = true;
        }

        if (request.getDateOfBirth() != null) {
            metadata.setDateOfBirth(request.getDateOfBirth());
            hasMetadataChanges = true;
        }

        if (request.getBloodGroup() != null) {
            metadata.setBloodGroup(request.getBloodGroup());
            hasMetadataChanges = true;
        }

        if (request.getEmergencyContact() != null) {
            metadata.setEmergencyContact(request.getEmergencyContact());
            hasMetadataChanges = true;
        }

        PatientDetailsMetadata.MedicalInformation medicalInfo = metadata.getMedicalInformation();
        if (medicalInfo == null) {
            medicalInfo = new PatientDetailsMetadata.MedicalInformation();
        }

        boolean hasMedicalInfoChanges = false;

        if (request.getAllergies() != null) {
            medicalInfo.setAllergies(request.getAllergies());
            hasMedicalInfoChanges = true;
        }

        if (request.getMedicalConditions() != null) {
            medicalInfo.setMedicalConditions(request.getMedicalConditions());
            hasMedicalInfoChanges = true;
        }

        if (request.getCurrentMedications() != null) {
            medicalInfo.setCurrentMedications(request.getCurrentMedications());
            hasMedicalInfoChanges = true;
        }

        if (hasMedicalInfoChanges) {
            metadata.setMedicalInformation(medicalInfo);
            hasMetadataChanges = true;
        }

        if (hasMetadataChanges) {
            patient.setPatientDetailsMetadata(metadata);
        }
    }

    private void updatePatientDoctorOrganization(
            PatientDoctorOrganization patientDoctorOrganization, UserProfile userProfile, UserProfile orgUserProfile) {
        patientDoctorOrganization.setOrganization(userProfile.getOrganization());
        patientDoctorOrganization.setDoctor(userProfile.getDoctor());
        patientDoctorOrganization.setUserProfile(userProfile);
        patientDoctorOrganization.setAddedByUserProfile(orgUserProfile);
        patientDoctorOrganization.setPracticeAssigned(true);
        patientDoctorOrganization.setPatientBelongsTo(PatientBelongsTo.ASSIGNED_TO_PRACTICE);
        patientDoctorOrganizationRepository.save(patientDoctorOrganization);
    }

    private void updatePatientInvitation(PatientInvitationDetails patientInvitation, UserProfile userProfile) {
        var invitation = patientInvitation.getInvitation();
        invitation.setInviterId(userProfile.getDoctor().getId());
        invitationRepository.save(invitation);
    }

    @Override
    public void updatePatientTrackingStatus(PatientStatusChangeRequest request) {
        var treatmentPlan = treatmentPlanRepository
                .findByIdWithTracking(request.getTreatmentPlanId())
                .orElseThrow(() -> new TreatmentPlanNotFoundException(request.getTreatmentPlanId()));
        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(treatmentPlan.getPatient().getId())
                .orElseThrow(() ->
                        new PatientNotFoundException(treatmentPlan.getPatient().getId()));
        var userProfile = patient.getDoctorOrganization().getUserProfile();
        dashboardCacheEvictService.evictDoctorDashboardCacheForUserProfile(userProfile);
        if (treatmentPlan.getTracking() != null) {
            treatmentPlan.getTracking().setPatientTrackingStatus(request.getPatientTrackingStatus());
            treatmentPlanRepository.save(treatmentPlan);
        }
    }

    @Override
    public PatientCurrStepResponse getPatientCurrentStep(Long patientId) {
        Patient patient = patientRepository.findByPatientId(patientId);
        return new PatientCurrStepResponse(patientId, patient.getCurrentStep());
    }

    @Override
    public PatientCurrStepResponse updatePatientCurrentStep(Long patientId, Long currentStep) {
        Patient patient = patientRepository.findByPatientId(patientId);
        patient.setCurrentStep(currentStep);
        patientRepository.save(patient);
        return new PatientCurrStepResponse(patientId, patient.getCurrentStep());
    }
}
