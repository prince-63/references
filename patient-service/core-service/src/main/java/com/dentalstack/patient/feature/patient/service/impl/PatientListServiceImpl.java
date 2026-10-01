package com.dentalstack.patient.feature.patient.service.impl;

import com.dentalstack.patient.feature.aligner.enums.aligner.AlignerTreatmentStage;
import com.dentalstack.patient.feature.aligner.projection.BracesJourneySummary;
import com.dentalstack.patient.feature.aligner.repository.AlignerJourneyRepository;
import com.dentalstack.patient.feature.braces.repository.BracesJourneyRepository;
import com.dentalstack.patient.feature.doctor.dto.DoctorDashboardCount;
import com.dentalstack.patient.feature.doctor.entity.PatientDoctorOrganization;
import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.doctor.enums.ProfileType;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.doctor.service.DoctorDashboardService;
import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.invitation.enums.PatientBelongsTo;
import com.dentalstack.patient.feature.invitation.projection.WebLeadDetailsSummary;
import com.dentalstack.patient.feature.order.enums.ManufacturingStatus;
import com.dentalstack.patient.feature.order.enums.OrderStatus;
import com.dentalstack.patient.feature.order.projection.OrderSummary;
import com.dentalstack.patient.feature.order.projection.PatientOrderCountResult;
import com.dentalstack.patient.feature.order.repository.OrderRepository;
import com.dentalstack.patient.feature.patient.dto.*;
import com.dentalstack.patient.feature.patient.enums.AppInviteStatus;
import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import com.dentalstack.patient.feature.patient.projection.ActivePatientSummary;
import com.dentalstack.patient.feature.patient.projection.CombinedPatientSummary;
import com.dentalstack.patient.feature.patient.projection.PatientStageResult;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.patient.repository.PatientListCountRepository;
import com.dentalstack.patient.feature.patient.repository.PatientListRepository;
import com.dentalstack.patient.feature.patient.service.PatientListService;
import com.dentalstack.patient.feature.tracking.enums.Status;
import com.dentalstack.patient.feature.treatment.projection.TreatmentPlanPatientSummary;
import com.dentalstack.patient.feature.treatment.repository.TreatmentPlanRepository;
import com.dentalstack.patient.feature.user.entity.Role;
import com.dentalstack.patient.feature.user.entity.User;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.constant.GlobalConstant;
import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import com.dentalstack.patient.global.dto.pagination.PatientListCount;
import com.dentalstack.patient.global.enums.ProductTypeName;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientListServiceImpl implements PatientListService {

    private final PatientListRepository patientListRepository;
    private final UserProfileRepository userProfileRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final OrderRepository orderRepository;
    private final AlignerJourneyRepository alignerJourneyRepository;
    private final BracesJourneyRepository bracesJourneyRepository;
    private final TreatmentPlanRepository treatmentPlanRepository;
    private final PatientListCountRepository PatientListCountRepository;
    private final DoctorDashboardService doctorDashboardService;

    @Qualifier("dbQueryExecutor")
    private final Executor dbQueryExecutor;

    @Override
    @Transactional(readOnly = true)
    public ActivePatientDetailsWithPagination getPatientList(ActivePatientRequest request) {
        UserProfile userProfile = userProfileRepository
                .findByIdWithRoles(request.getProfileId())
                .orElseThrow(DoctorNotFoundException::new);

        Set<Long> patientIds = fetchPatientIds(userProfile, request, null);

        return StringUtils.hasText(request.getSearch())
                ? searchPatients(request, patientIds)
                : getFilteredPatients(request, patientIds);
    }

    private Set<Long> fetchPatientIds(UserProfile userProfile, ActivePatientRequest request, List<String> roles) {
        List<Long> ids;
        if (request.isArchive()) {
            if (isAlignerCompanyOrLab(userProfile.getRoles())
                    || isEnterpriseCompanyLab(userProfile.getRoles())
                    || UserProfile.isCommercialAlignerLab(userProfile.getRoles())) {
                ids = patientDoctorOrganizationRepository.findPatientIdsByOrganizationIdWithStatus(
                        request.getOrganizationId(), PatientStatus.ARCHIVE);
            } else if (isConsultingOrthodontist(userProfile.getRoles()) || isCustomer(userProfile.getRoles())) {
                ids = patientDoctorOrganizationRepository.findPatientIdsByCustomerProfile(
                        request.getProfileId(), PatientStatus.ARCHIVE);
            } else {
                ids = patientDoctorOrganizationRepository.findPatientIdsByOrganizationIdWithStatus(
                        request.getOrganizationId(), PatientStatus.ARCHIVE);
            }
        } else if (isAlignerCompanyOrLab(userProfile.getRoles())
                || isEnterpriseCompanyLab(userProfile.getRoles())
                || UserProfile.isCommercialAlignerLab(userProfile.getRoles())) {
            if (roles != null) {
                ids = patientDoctorOrganizationRepository.findPatientIdsByOrganizationIdWithoutArchiveAndRoles(
                        request.getOrganizationId(), roles);
            } else {
                ids = patientDoctorOrganizationRepository.findPatientIdsByOrganizationIdWithoutArchive(
                        request.getOrganizationId());
            }
        } else {
            ids = patientDoctorOrganizationRepository.findPatientIdsByDoctorOrgAndProfileWithoutArchive(
                    request.getDoctorId(), request.getOrganizationId(), request.getProfileId());
        }
        return new HashSet<>(ids);
    }

    private ActivePatientDetailsWithPagination getFilteredPatients(ActivePatientRequest request, Set<Long> patientIds) {
        CompletableFuture<List<ActivePatientSummary>> alignerFuture = CompletableFuture.supplyAsync(
                () -> patientListRepository.findDetailedAlignerJourneySummariesByPatientIds(patientIds),
                dbQueryExecutor);

        CompletableFuture<List<BracesJourneySummary>> bracesFuture = CompletableFuture.supplyAsync(
                () -> patientListRepository.findBracesJourneySummariesByPatientIds(patientIds), dbQueryExecutor);

        CompletableFuture.allOf(alignerFuture, bracesFuture).join();

        List<ActivePatientSummary> alignerPatients = alignerFuture.join();
        List<BracesJourneySummary> bracesPatients = bracesFuture.join();

        Map<Long, ActivePatientDetails> patientDetailsMap = alignerPatients.stream()
                .filter(patient ->
                        shouldIncludePatient(patient, request.getPracticeLocation(), request.getTreatments()))
                .collect(Collectors.toMap(
                        ActivePatientSummary::getPatientId,
                        ActivePatientDetails::from,
                        (existing, replacement) -> existing));

        for (BracesJourneySummary bracesJourney : bracesPatients) {
            if (shouldIncludePatient(bracesJourney, request.getPracticeLocation(), request.getTreatments())) {
                patientDetailsMap.compute(bracesJourney.getPatientId(), (key, existingDetails) -> {
                    if (existingDetails == null) {
                        return ActivePatientDetails.from(bracesJourney);
                    } else {
                        List<String> treatments = new ArrayList<>(existingDetails.getTreatments());

                        if (!treatments.contains(ProductTypeName.BRACES.name())) {
                            treatments.add(ProductTypeName.BRACES.name());
                        }

                        existingDetails.setTreatments(treatments);
                        return existingDetails;
                    }
                });
            }
        }

        List<ActivePatientDetails> allPatientDetails = new ArrayList<>(patientDetailsMap.values());

        Set<Long> allPatientIds = allPatientDetails.stream()
                .map(ActivePatientDetails::getPatientId)
                .collect(Collectors.toSet());
        Set<Long> yourPatientIds = new HashSet<>(patientDoctorOrganizationRepository.findYourPatientIds(
                request.getDoctorId(), allPatientIds, request.getProfileId(), request.getOrganizationId()));
        Map<Long, PatientDoctorOrganization> pdoMap =
                patientDoctorOrganizationRepository
                        .findWithAssociationsByPatientIds(allPatientIds, request.getDoctorId())
                        .stream()
                        .collect(Collectors.toMap(pdo -> pdo.getPatient().getId(), pdo -> pdo, (a, b) -> a));

        allPatientDetails.forEach(alignerPatientDetail -> {
            boolean isYourPatient = yourPatientIds.contains(alignerPatientDetail.getPatientId());
            PatientDoctorOrganization patientDoctorOrganization = pdoMap.get(alignerPatientDetail.getPatientId());

            if (patientDoctorOrganization != null) {
                alignerPatientDetail.setAssignedPractice(ActivePatientDetails.AssignedPractice.builder()
                        .practiceDoctorId(patientDoctorOrganization.getDoctor().getId())
                        .practiceProfileId(
                                patientDoctorOrganization.getUserProfile().getId())
                        .practiceOrganizationId(
                                patientDoctorOrganization.getOrganization().getId())
                        .name(
                                patientDoctorOrganization
                                                        .getUserProfile()
                                                        .getUser()
                                                        .fullNameWithSalutation()
                                                != null
                                        ? patientDoctorOrganization
                                                .getUserProfile()
                                                .getUser()
                                                .fullNameWithSalutation()
                                        : patientDoctorOrganization
                                                        .getUserProfile()
                                                        .getUser()
                                                        .getFirstName() + " "
                                                + patientDoctorOrganization
                                                        .getUserProfile()
                                                        .getUser()
                                                        .getLastName()
                                                        .trim())
                        .build());
            }
            alignerPatientDetail.setDoctorId(
                    patientDoctorOrganization != null
                            ? patientDoctorOrganization.getDoctor().getId()
                            : null);
            alignerPatientDetail.setIsYourPatient(isYourPatient);
        });
        PatientListCount listCount = calculatePatientListCount(patientIds, allPatientDetails.size());

        return paginateResults(allPatientDetails, request.getPageNumber(), request.getPageSize(), listCount);
    }

    private ActivePatientDetailsWithPagination searchPatients(ActivePatientRequest request, Set<Long> patientIds) {

        CompletableFuture<List<ActivePatientSummary>> filterFuture = CompletableFuture.supplyAsync(
                () -> patientListRepository.findDetailedAlignerJourneySummariesByPatientIds(patientIds),
                dbQueryExecutor);

        CompletableFuture<List<ActivePatientSummary>> searchFuture = CompletableFuture.supplyAsync(
                () -> patientListRepository.findDetailedPatientSummariesWithSearch(
                        request.getSearch(), new ArrayList<>(patientIds)),
                dbQueryExecutor);

        CompletableFuture<List<BracesJourneySummary>> bracesFuture = CompletableFuture.supplyAsync(
                () -> patientListRepository.findBracesJourneySummariesByPatientIds(patientIds), dbQueryExecutor);

        CompletableFuture.allOf(searchFuture, bracesFuture).join();

        List<ActivePatientSummary> alignerSearchPatients = filterFuture.join();
        List<ActivePatientSummary> alignerPatients = searchFuture.join();
        List<BracesJourneySummary> bracesPatients = bracesFuture.join();

        Map<Long, ActivePatientDetails> patientDetailsMap = alignerPatients.stream()
                .filter(patient ->
                        isPatientMatchingFilters(patient, request.getPracticeLocation(), request.getTreatments()))
                .collect(Collectors.toMap(
                        ActivePatientSummary::getPatientId,
                        ActivePatientDetails::from,
                        (existing, replacement) -> existing));

        for (BracesJourneySummary bracesJourney : bracesPatients) {
            if (shouldIncludePatient(bracesJourney, request.getPracticeLocation(), request.getTreatments())) {
                patientDetailsMap.compute(bracesJourney.getPatientId(), (key, existingDetails) -> {
                    if (existingDetails == null) {
                        return ActivePatientDetails.from(bracesJourney);
                    } else {
                        List<String> treatments = new ArrayList<>(existingDetails.getTreatments());

                        if (!treatments.contains(ProductTypeName.BRACES.name())) {
                            treatments.add(ProductTypeName.BRACES.name());
                        }

                        existingDetails.setTreatments(treatments);
                        return existingDetails;
                    }
                });
            }
        }

        List<ActivePatientDetails> filteredResults = new ArrayList<>(patientDetailsMap.values());

        Map<Long, ActivePatientDetails> patientDetailsMapWithoutSearch = alignerSearchPatients.stream()
                .filter(patient ->
                        shouldIncludePatient(patient, request.getPracticeLocation(), request.getTreatments()))
                .collect(Collectors.toMap(
                        ActivePatientSummary::getPatientId,
                        ActivePatientDetails::from,
                        (existing, replacement) -> existing));

        for (BracesJourneySummary bracesJourney : bracesPatients) {
            if (shouldIncludePatient(bracesJourney, request.getPracticeLocation(), request.getTreatments())) {
                patientDetailsMapWithoutSearch.compute(bracesJourney.getPatientId(), (key, existingDetails) -> {
                    if (existingDetails == null) {
                        return ActivePatientDetails.from(bracesJourney);
                    } else {
                        List<String> treatments = new ArrayList<>(existingDetails.getTreatments());

                        if (!treatments.contains(ProductTypeName.BRACES.name())) {
                            treatments.add(ProductTypeName.BRACES.name());
                        }

                        existingDetails.setTreatments(treatments);
                        return existingDetails;
                    }
                });
            }
        }

        List<ActivePatientDetails> allPatientDetailsWithoutSearch =
                new ArrayList<>(patientDetailsMapWithoutSearch.values());

        Set<Long> filteredPatientIds =
                filteredResults.stream().map(ActivePatientDetails::getPatientId).collect(Collectors.toSet());
        Set<Long> yourFilteredPatientIds = new HashSet<>(patientDoctorOrganizationRepository.findYourPatientIds(
                request.getDoctorId(), filteredPatientIds, request.getProfileId(), request.getOrganizationId()));
        Map<Long, PatientDoctorOrganization> filteredPdoMap =
                patientDoctorOrganizationRepository
                        .findWithAssociationsByPatientIds(filteredPatientIds, request.getDoctorId())
                        .stream()
                        .collect(Collectors.toMap(pdo -> pdo.getPatient().getId(), pdo -> pdo, (a, b) -> a));

        filteredResults.forEach(filteredActivePatientDetail -> {
            boolean isYourPatient = yourFilteredPatientIds.contains(filteredActivePatientDetail.getPatientId());
            PatientDoctorOrganization patientDoctorOrganization =
                    filteredPdoMap.get(filteredActivePatientDetail.getPatientId());

            if (patientDoctorOrganization != null) {

                filteredActivePatientDetail.setAssignedPractice(ActivePatientDetails.AssignedPractice.builder()
                        .practiceDoctorId(patientDoctorOrganization.getDoctor().getId())
                        .practiceProfileId(
                                patientDoctorOrganization.getUserProfile().getId())
                        .practiceOrganizationId(
                                patientDoctorOrganization.getOrganization().getId())
                        .name(
                                patientDoctorOrganization
                                                        .getUserProfile()
                                                        .getUser()
                                                        .fullNameWithSalutation()
                                                != null
                                        ? patientDoctorOrganization
                                                .getUserProfile()
                                                .getUser()
                                                .fullNameWithSalutation()
                                        : patientDoctorOrganization
                                                        .getUserProfile()
                                                        .getUser()
                                                        .getFirstName() + " "
                                                + patientDoctorOrganization
                                                        .getUserProfile()
                                                        .getUser()
                                                        .getLastName()
                                                        .trim())
                        .build());
            }

            filteredActivePatientDetail.setDoctorId(
                    patientDoctorOrganization != null
                            ? patientDoctorOrganization.getDoctor().getId()
                            : null);
            filteredActivePatientDetail.setIsYourPatient(isYourPatient);
        });

        PatientListCount listCount = calculatePatientListCount(patientIds, allPatientDetailsWithoutSearch.size());

        return paginateResults(filteredResults, request.getPageNumber(), request.getPageSize(), listCount);
    }

    @Override
    @Transactional(readOnly = true)
    public LeadPatientDetailsWithPagination getLeadPatientList(ActivePatientRequest request) {
        UserProfile userProfile = userProfileRepository
                .findByIdWithRoles(request.getProfileId())
                .orElseThrow(() ->
                        new DoctorNotFoundException("User profile not found for profileId: " + request.getProfileId()));

        Set<Long> patientIds = fetchPatientIds(userProfile, request, null);

        List<Integer> statusList = Arrays.asList(InvitationStatus.ACCEPTED.ordinal(), InvitationStatus.SENT.ordinal());
        List<String> treatmentSubTypes = Arrays.asList(ProductTypeName.ALIGNERS.name(), ProductTypeName.BRACES.name());

        CompletableFuture<List<WebLeadDetailsSummary>> leadsFuture = CompletableFuture.supplyAsync(
                () -> {
                    if (!StringUtils.hasText(request.getSearch())) {
                        return patientListRepository.findWebLeadInvitationsByPatientIds(
                                new ArrayList<>(patientIds),
                                request.getOrganizationId(),
                                UserType.DOCTOR.ordinal(),
                                UserType.PATIENT.ordinal(),
                                statusList,
                                treatmentSubTypes,
                                PatientStatus.ARCHIVE.name(),
                                Status.DRAFT.name());
                    } else {
                        return patientListRepository.findWebLeadInvitationsByPatientIdsWithSearch(
                                new ArrayList<>(patientIds),
                                request.getOrganizationId(),
                                UserType.DOCTOR.ordinal(),
                                UserType.PATIENT.ordinal(),
                                statusList,
                                treatmentSubTypes,
                                PatientStatus.ARCHIVE.name(),
                                Status.DRAFT.name(),
                                request.getSearch());
                    }
                },
                dbQueryExecutor);

        CompletableFuture<List<Long>> bracesCountFuture = CompletableFuture.supplyAsync(
                () -> patientListRepository.countBracesJourneySummariesByPatientIds(patientIds), dbQueryExecutor);

        CompletableFuture<List<Long>> alignerCountFuture = CompletableFuture.supplyAsync(
                () -> patientListRepository.countDetailedAlignerJourneySummariesByPatientIds(patientIds),
                dbQueryExecutor);

        CompletableFuture.allOf(leadsFuture, bracesCountFuture, alignerCountFuture)
                .join();

        CompletableFuture<List<Long>> mergedFuture =
                bracesCountFuture.thenCombine(alignerCountFuture, (bracesList, alignerList) -> {
                    Set<Long> mergedSet = new HashSet<>();
                    mergedSet.addAll(bracesList);
                    mergedSet.addAll(alignerList);
                    return new ArrayList<>(mergedSet);
                });

        List<WebLeadDetailsSummary> allLeadPatients = leadsFuture.join();

        long totalActiveCount = mergedFuture.join().size();

        if (request.getPracticeLocation() != null
                && !request.getPracticeLocation().isEmpty()) {
            allLeadPatients = allLeadPatients.stream()
                    .filter(lead -> request.getPracticeLocation().contains(lead.getPracticeLocationName()))
                    .collect(Collectors.toList());
        }

        if (request.getTreatments() != null && !request.getTreatments().isEmpty()) {
            allLeadPatients = allLeadPatients.stream()
                    .filter(lead -> lead.getProductTypeNames().stream()
                            .map(ProductTypeName::valueOf)
                            .map(ProductTypeName::toString)
                            .anyMatch(request.getTreatments()::contains))
                    .collect(Collectors.toList());
        }

        List<LeadPatientDetails> patientDetails =
                allLeadPatients.stream().map(LeadPatientDetails::from).collect(Collectors.toList());

        Set<Long> leadPatientIds =
                patientDetails.stream().map(LeadPatientDetails::getPatientId).collect(Collectors.toSet());
        Set<Long> yourLeadPatientIds = new HashSet<>(patientDoctorOrganizationRepository.findYourPatientIds(
                request.getDoctorId(), leadPatientIds, request.getProfileId(), request.getOrganizationId()));
        Map<Long, PatientDoctorOrganization> leadPdoMap =
                patientDoctorOrganizationRepository
                        .findWithAssociationsByPatientIds(leadPatientIds, request.getDoctorId())
                        .stream()
                        .collect(Collectors.toMap(pdo -> pdo.getPatient().getId(), pdo -> pdo, (a, b) -> a));

        patientDetails.forEach(filteredActivePatientDetail -> {
            boolean isYourPatient = yourLeadPatientIds.contains(filteredActivePatientDetail.getPatientId());
            PatientDoctorOrganization patientDoctorOrganization =
                    leadPdoMap.get(filteredActivePatientDetail.getPatientId());

            if (patientDoctorOrganization != null) {
                filteredActivePatientDetail.setAssignedPractice(LeadPatientDetails.AssignedPractice.builder()
                        .practiceDoctorId(patientDoctorOrganization.getDoctor().getId())
                        .practiceProfileId(
                                patientDoctorOrganization.getUserProfile().getId())
                        .practiceOrganizationId(
                                patientDoctorOrganization.getOrganization().getId())
                        .name(
                                patientDoctorOrganization
                                                        .getUserProfile()
                                                        .getUser()
                                                        .fullNameWithSalutation()
                                                != null
                                        ? patientDoctorOrganization
                                                .getUserProfile()
                                                .getUser()
                                                .fullNameWithSalutation()
                                        : patientDoctorOrganization
                                                        .getUserProfile()
                                                        .getUser()
                                                        .getFirstName() + " "
                                                + patientDoctorOrganization
                                                        .getUserProfile()
                                                        .getUser()
                                                        .getLastName()
                                                        .trim())
                        .build());
            }

            filteredActivePatientDetail.setDoctorId(
                    patientDoctorOrganization != null
                            ? patientDoctorOrganization.getDoctor().getId()
                            : null);
            filteredActivePatientDetail.setIsYourPatient(isYourPatient);
        });

        PatientListCount listCount = calculatePatientListCount(patientIds, totalActiveCount);

        return paginateLeadResults(patientDetails, request.getPageNumber(), request.getPageSize(), listCount);
    }

    @Override
    @Transactional(readOnly = true)
    public CombinedPatientResponseWithPagination getAllPatients(ActivePatientRequest request) {
        Set<Long> patientIds;
        Set<Long> patientIdsAddedByPractice = Set.of();
        Set<Long> patientIdsAddedByCustomer = Set.of();

        var isInternalUser =
                userProfileRepository.isInternalUser(request.getProfileId(), DoctorRole.INTERNAL_USER.name());

        if (isInternalUser) {
            updateToOwnerProfile(request);
        }

        UserProfile userProfile = userProfileRepository
                .findByIdWithRoles(request.getProfileId())
                .orElseThrow(() ->
                        new DoctorNotFoundException("User profile not found for profileId: " + request.getProfileId()));

        Set<String> restrictedRoles =
                Set.of(DoctorRole.COMMERCIAL_ALIGNER_LAB.name(), DoctorRole.LAB_STAFF.name(), DoctorRole.VENDOR.name());

        boolean hasRestrictedRole =
                userProfile.getRoles().stream().map(Role::getName).anyMatch(restrictedRoles::contains);

        if (request.getPatientId() == null) {
            if (!hasRestrictedRole) {
                if (request.getFilterByRole() == DoctorRole.CONSULTING_ORTHODONTIST) {
                    patientIdsAddedByPractice = fetchPatientIds(
                            userProfile,
                            request,
                            List.of(
                                    DoctorRole.CONSULTING_ORTHODONTIST.name(),
                                    DoctorRole.ENTERPRISE_COMPANY_LAB.name()));
                    patientIdsAddedByCustomer =
                            fetchPatientIds(userProfile, request, List.of(DoctorRole.CUSTOMER.name()));
                    patientIds = patientIdsAddedByPractice;
                } else if (request.getFilterByRole() == DoctorRole.CUSTOMER) {
                    patientIdsAddedByPractice = fetchPatientIds(
                            userProfile,
                            request,
                            List.of(
                                    DoctorRole.CONSULTING_ORTHODONTIST.name(),
                                    DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                                    DoctorRole.ALIGNER_COMPANY_OR_LAB.name()));
                    patientIdsAddedByCustomer =
                            fetchPatientIds(userProfile, request, List.of(DoctorRole.CUSTOMER.name()));
                    patientIds = patientIdsAddedByCustomer;
                    var patientIdsFromOrder =
                            orderRepository.findDistinctPatientIdsByTargetProfileId(request.getProfileId());
                    patientIdsAddedByCustomer.addAll(patientIdsFromOrder);
                } else {
                    patientIds = fetchPatientIds(userProfile, request, null);
                }
            } else {
                if (userProfile.getRoles().stream().map(Role::getName).toList().contains(DoctorRole.LAB_STAFF.name())) {
                    patientIds = orderRepository.findPatientIdByAssignedLabUserIdAndOrganizationId(
                            request.getProfileId(), request.getOrganizationId());
                } else if (userProfile.getRoles().stream()
                                .map(Role::getName)
                                .toList()
                                .contains(DoctorRole.COMMERCIAL_ALIGNER_LAB.name())
                        || userProfile.getRoles().stream()
                                .map(Role::getName)
                                .toList()
                                .contains(DoctorRole.VENDOR.name())) {
                    patientIds = orderRepository.findPatientIdsFromReceivedOrdersByProfileId(request.getProfileId());

                } else {
                    patientIds = orderRepository.findPatientIdByLabId(request.getOrganizationId());
                }
            }
        } else {
            patientIds = Set.of(request.getPatientId());
        }

        List<CombinedPatientSummary> summaries;
        if (!request.isArchive()) {
            if (StringUtils.hasText(request.getSearch())) {
                summaries = patientListRepository.findPatientSummariesByIdsWithSearch(
                        new ArrayList<>(patientIds), request.getSearch());
            } else {
                summaries = patientListRepository.findPatientSummariesByIds(new ArrayList<>(patientIds));
            }
        } else {
            if (StringUtils.hasText(request.getSearch())) {
                summaries = patientListRepository.findArchivedPatientSummariesByIdsWithSearch(
                        new ArrayList<>(patientIds), request.getSearch(), PatientStatus.ARCHIVE.name());
            } else {
                summaries = patientListRepository.findArchivedPatientSummariesByIds(
                        new ArrayList<>(patientIds), PatientStatus.ARCHIVE.name());
            }
        }

        Set<Long> mergedSet = new HashSet<>();
        long totalActiveCountByPractice = 0L;
        long totalActiveCountByCustomer = 0L;
        long totalActiveCount = 0L;

        if (request.getFilterByRole() != null) {

            Set<Long> practiceMergedSet = getMergedJourneyPatientIds(patientIdsAddedByPractice);
            totalActiveCountByPractice = practiceMergedSet.size();

            Set<Long> customerMergedSet = getMergedJourneyPatientIds(patientIdsAddedByCustomer);
            totalActiveCountByCustomer = customerMergedSet.size();

            mergedSet = switch (request.getFilterByRole()) {
                case CONSULTING_ORTHODONTIST -> practiceMergedSet;
                case CUSTOMER -> customerMergedSet;
                default -> Collections.emptySet();
            };

        } else {
            mergedSet = getMergedJourneyPatientIds(patientIds);
            totalActiveCount = mergedSet.size();
        }

        if (request.getPracticeLocation() != null
                && !request.getPracticeLocation().isEmpty()) {
            String location = request.getPracticeLocation().get(0);
            summaries = summaries.stream()
                    .filter(patient -> location.equalsIgnoreCase(patient.getPracticeLocationName()))
                    .toList();
        }

        if (request.getTreatments() != null && !request.getTreatments().isEmpty()) {
            summaries = summaries.stream()
                    .filter(patient -> {
                        List<String> patientTreatments = patient.getBrandName() != null
                                ? Arrays.asList(patient.getBrandName().split(","))
                                : Collections.emptyList();
                        return patientTreatments.stream().anyMatch(request.getTreatments()::contains);
                    })
                    .collect(Collectors.toList());
        }

        PatientListCount listCount = calculatePatientListCount(patientIds, totalActiveCount);
        PatientListCount listCountForPractice =
                calculatePatientListCount(patientIdsAddedByPractice, totalActiveCountByPractice);
        PatientListCount listCountForCustomer =
                calculatePatientListCount(patientIdsAddedByCustomer, totalActiveCountByCustomer);

        List<CombinedPatientDetails> patientDetails = new ArrayList<>(summaries.stream()
                .map(CombinedPatientDetails::fromSimplified)
                .collect(Collectors.toMap(
                        CombinedPatientDetails::getPatientId, patient -> patient, (existing, replacement) -> existing))
                .values());

        Set<Long> combinedPatientIds = patientDetails.stream()
                .map(CombinedPatientDetails::getPatientId)
                .collect(Collectors.toSet());
        Set<Long> yourCombinedPatientIds = new HashSet<>(patientDoctorOrganizationRepository.findYourPatientIds(
                request.getDoctorId(), combinedPatientIds, request.getProfileId(), request.getOrganizationId()));
        Map<Long, PatientDoctorOrganization> combinedPdoMap =
                patientDoctorOrganizationRepository
                        .findWithAssociationsByPatientIds(combinedPatientIds, request.getDoctorId())
                        .stream()
                        .collect(Collectors.toMap(pdo -> pdo.getPatient().getId(), pdo -> pdo, (a, b) -> a));

        patientDetails.forEach(detail -> {
            boolean isYourPatient = yourCombinedPatientIds.contains(detail.getPatientId());
            PatientDoctorOrganization pdo = combinedPdoMap.get(detail.getPatientId());

            if (pdo != null) {
                detail.setAssignedPractice(CombinedPatientDetails.AssignedPractice.builder()
                        .practiceDoctorId(pdo.getDoctor().getId())
                        .practiceProfileId(pdo.getUserProfile().getId())
                        .practiceOrganizationId(pdo.getOrganization().getId())
                        .name(User.getFullNameWithSalutation(
                                pdo.getUserProfile().getUser().getSalutation(),
                                pdo.getUserProfile().getUser().getFirstName(),
                                pdo.getUserProfile().getUser().getLastName()))
                        .build());
            }

            detail.setDoctorId(pdo != null ? pdo.getDoctor().getId() : null);
            detail.setIsYourPatient(isYourPatient);
        });

        if (request.getFilterByAppInviteStatus() != null
                && request.getFilterByAppInviteStatus() != AppInviteStatus.ALL) {
            patientDetails = patientDetails.stream()
                    .filter(patientDetail ->
                            patientDetail.getAppInviteStatus().equals(request.getFilterByAppInviteStatus()))
                    .toList();
        }

        if (request.getFilterByGlobalStatus() != null
                && request.getFilterByGlobalStatus() != AlignerTreatmentStage.ALL) {

            patientDetails = patientDetails.stream()
                    .filter(patientDetail ->
                            patientDetail.getTreatmentStage().equals(request.getFilterByGlobalStatus()))
                    .toList();
        }

        if (!request.getFilterByTreatmentType().isEmpty()) {
            if (request.getFilterByTreatmentType().equals(GlobalConstant.SHOW_ALIGNERS)) {
                patientDetails = patientDetails.stream()
                        .filter(patientDetail ->
                                !patientDetail.getTreatments().contains(GlobalConstant.BRACES_TREATMENT))
                        .toList();
            } else {
                patientDetails = patientDetails.stream()
                        .filter(patientDetail ->
                                patientDetail.getTreatments().contains(request.getFilterByTreatmentType()))
                        .toList();
            }
        }

        if (!request.getFilterByPracticeName().isEmpty()) {
            if (request.getFilterByPracticeName().equals(GlobalConstant.SHOW_UNASSIGNED)) {
                patientDetails = patientDetails.stream()
                        .filter(patientDetail -> patientDetail.getPatientBelongsTo() == PatientBelongsTo.NOT_ASSIGNED)
                        .toList();
            } else {
                patientDetails = patientDetails.stream()
                        .filter(patientDetail -> patientDetail.getAssignedPractice() != null
                                && Objects.equals(
                                        patientDetail
                                                .getAssignedPractice()
                                                .getName()
                                                .toLowerCase(),
                                        request.getFilterByPracticeName().toLowerCase()))
                        .toList();
            }
        }

        patientDetails = patientDetails.stream()
                .sorted(Comparator.comparing(
                        CombinedPatientDetails::getAddedOn, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());

        int totalElements = patientDetails.size();

        int fromIndex = (request.getPageNumber() - 1) * request.getPageSize();
        List<CombinedPatientDetails> paginatedDetails;
        if (fromIndex >= totalElements) {
            paginatedDetails = Collections.emptyList();
        } else {
            int toIndex = Math.min(fromIndex + request.getPageSize(), totalElements);
            paginatedDetails = new ArrayList<>(patientDetails.subList(fromIndex, toIndex));
        }

        if (!paginatedDetails.isEmpty()) {
            Set<String> userRoles =
                    userProfile.getRoles().stream().map(Role::getName).collect(Collectors.toSet());
            Set<String> LAB_ROLES = Set.of(
                    "IN_OFFICE_MANUFACTURER",
                    "ALIGNER_COMPANY_OR_LAB",
                    "ENTERPRISE_COMPANY_LAB",
                    "COMMERCIAL_ALIGNER_LAB",
                    "LAB_STAFF");
            boolean isLabRole = userRoles.stream().anyMatch(LAB_ROLES::contains);

            Set<Long> pagePatientIds = paginatedDetails.stream()
                    .map(CombinedPatientDetails::getPatientId)
                    .collect(Collectors.toSet());

            List<com.dentalstack.patient.feature.order.projection.PatientOrderSummaryResult> orderSummaries;

            if (isLabRole) {
                if (userRoles.contains("IN_OFFICE_MANUFACTURER")
                        || userRoles.contains("ALIGNER_COMPANY_OR_LAB")
                        || userRoles.contains("ENTERPRISE_COMPANY_LAB")) {
                    orderSummaries =
                            orderRepository.batchSentPlusReceivedOrderSummary(pagePatientIds, request.getProfileId());
                } else if (userRoles.contains("COMMERCIAL_ALIGNER_LAB")) {
                    orderSummaries = orderRepository.batchReceivedOrderSummary(pagePatientIds, request.getProfileId());
                } else if (userRoles.contains("LAB_STAFF")) {
                    orderSummaries = orderRepository.batchLabStaffOrderSummary(pagePatientIds, request.getProfileId());
                } else {
                    orderSummaries = Collections.emptyList();
                }
            } else if (userRoles.contains("CONSULTING_ORTHODONTIST")
                    || userRoles.contains("CLINIC_OWNER")
                    || userRoles.contains("CUSTOMER")) {
                orderSummaries = orderRepository.batchSentOrderSummary(pagePatientIds, request.getProfileId());
            } else if (userRoles.contains("VENDOR")) {
                orderSummaries = orderRepository.batchReceivedOrderSummary(pagePatientIds, request.getProfileId());
            } else {
                orderSummaries = Collections.emptyList();
            }

            Map<Long, Long> orderCountMap = new HashMap<>();
            Map<Long, String> customerNameMap = new HashMap<>();
            for (var os : orderSummaries) {
                orderCountMap.put(os.getPatientId(), os.getOrderCount());
                customerNameMap.put(os.getPatientId(), os.getCustomerName());
            }

            paginatedDetails.forEach(detail -> {
                if (detail.getAssignedPractice() != null) {
                    detail.getAssignedPractice().setOrderCount(orderCountMap.getOrDefault(detail.getPatientId(), 0L));
                    detail.getAssignedPractice().setCustomerName(customerNameMap.get(detail.getPatientId()));
                }
            });
        }

        PaginationDetails paginationDetails = PaginationDetails.builder()
                .pageNumber(request.getPageNumber())
                .pageSize(request.getPageSize())
                .totalPatients(totalElements)
                .totalPages((int) Math.ceil((double) totalElements / request.getPageSize()))
                .hasNext(fromIndex + request.getPageSize() < totalElements)
                .hasPrevious(request.getPageNumber() > 1)
                .build();

        return CombinedPatientResponseWithPagination.builder()
                .patients(paginatedDetails)
                .paginationDetails(paginationDetails)
                .listCount(listCount)
                .practiceListCount(listCountForPractice)
                .customerListCount(listCountForCustomer)
                .build();
    }

    private void updateToOwnerProfile(ActivePatientRequest request) {
        UserProfile userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getProfileId())
                .orElseThrow(() ->
                        new DoctorNotFoundException("User profile not found for profileId: " + request.getProfileId()));
        if (userProfile.getProfileType().equals(ProfileType.INVITED) && userProfile.getInviterProfile() != null) {
            request.setProfileId(userProfile.getInviterProfile().getId());
            request.setOrganizationId(
                    userProfile.getInviterProfile().getOrganization().getId());
            request.setDoctorId(userProfile.getInviterProfile().getDoctor().getId());
        }
    }

    private void updateToOwnerProfile(ActivePatientRequestV2 request, UserProfile inviterUserProfile) {
        request.setProfileId(inviterUserProfile.getId());
        request.setOrganizationId(inviterUserProfile.getOrganization().getId());
        request.setDoctorId(inviterUserProfile.getId());
        if (inviterUserProfile.isInHouseManufacturingLab()) {
            request.setDoctorRole(DoctorRole.IN_OFFICE_MANUFACTURER);
        } else {
            request.setDoctorRole(DoctorRole.ALIGNER_COMPANY_OR_LAB);
        }
    }

    private LeadPatientDetailsWithPagination paginateLeadResults(
            List<LeadPatientDetails> results, int page, int size, PatientListCount listCount) {
        return LeadPatientDetailsWithPagination.from(results, page, size, listCount);
    }

    private CombinedPatientResponseWithPagination paginateCombinedResults(
            List<CombinedPatientDetails> patientDetails,
            int page,
            int size,
            PatientListCount listCount,
            PatientListCount listCountForPractice,
            PatientListCount listCountForCustomer) {
        return CombinedPatientResponseWithPagination.from(
                patientDetails, page, size, listCount, listCountForPractice, listCountForCustomer);
    }

    private boolean shouldIncludePatient(
            ActivePatientSummary patient, List<String> practiceLocations, List<String> treatments) {
        boolean matchesPracticeLocation = practiceLocations == null
                || practiceLocations.isEmpty()
                || (patient.getPracticeLocationName() != null
                        && practiceLocations.contains(patient.getPracticeLocationName()));

        boolean matchesTreatment =
                treatments == null || treatments.isEmpty() || treatments.contains(patient.getBrandName());

        return matchesPracticeLocation && matchesTreatment;
    }

    private boolean shouldIncludePatient(
            BracesJourneySummary patient, List<String> practiceLocations, List<String> treatments) {
        boolean matchesPracticeLocation = practiceLocations == null
                || practiceLocations.isEmpty()
                || (patient.getPracticeLocationName() != null
                        && practiceLocations.contains(patient.getPracticeLocationName()));

        boolean matchesTreatment = treatments == null || treatments.isEmpty() || treatments.contains("BRACES");

        return matchesPracticeLocation && matchesTreatment;
    }

    private boolean isAlignerCompanyOrLab(Set<Role> roles) {
        return roles.stream()
                .map(Role::getName)
                .anyMatch(roleName -> roleName.equals(DoctorRole.ALIGNER_COMPANY_OR_LAB.name()));
    }

    private boolean isConsultingOrthodontist(Set<Role> roles) {
        return roles.stream()
                .map(Role::getName)
                .anyMatch(roleName -> roleName.equals(DoctorRole.CONSULTING_ORTHODONTIST.name()));
    }

    private boolean isCustomer(Set<Role> roles) {
        return roles.stream().map(Role::getName).anyMatch(roleName -> roleName.equals(DoctorRole.CUSTOMER.name()));
    }

    private boolean isEnterpriseCompanyLab(Set<Role> roles) {
        return roles.stream()
                .map(Role::getName)
                .anyMatch(roleName -> roleName.equals(DoctorRole.ENTERPRISE_COMPANY_LAB.name()));
    }

    private PatientListCount calculatePatientListCount(Set<Long> patientIds, long activePatient) {
        long allCount = patientIds.size();
        long leadCount = allCount - activePatient;

        return PatientListCount.builder()
                .allCount(allCount)
                .leadCount(leadCount)
                .activeCount(activePatient)
                .build();
    }

    private boolean isPatientMatchingFilters(
            ActivePatientSummary patient, List<String> practiceLocations, List<String> treatments) {
        return (practiceLocations == null
                        || practiceLocations.isEmpty()
                        || practiceLocations.contains(patient.getPracticeLocationName()))
                && (treatments == null || treatments.isEmpty() || treatments.contains(patient.getTreatmentType()));
    }

    private ActivePatientDetailsWithPagination paginateResults(
            List<ActivePatientDetails> results, int page, int size, PatientListCount listCount) {
        return ActivePatientDetailsWithPagination.from(results, page, size, listCount);
    }

    @Override
    public PatientCountDTO getAllPatientMetrics(long doctorId, long organizationId, long profileId, DoctorRole role) {
        UserProfile userProfile =
                userProfileRepository.findByIdWithRoles(profileId).orElseThrow(DoctorNotFoundException::new);

        if ((isAlignerCompanyOrLab(userProfile.getRoles()) || isEnterpriseCompanyLab(userProfile.getRoles()))
                && role == DoctorRole.CONSULTING_ORTHODONTIST) {
            DoctorDashboardCount dashboardCount =
                    doctorDashboardService.getDashboardCountForPatientMetrics(doctorId, organizationId, profileId);

            return PatientCountDTO.builder()
                    .allPatient(
                            dashboardCount.getPatientCount() != null
                                    ? dashboardCount.getPatientCount().getTotal()
                                    : 0)
                    .inAssessment(
                            dashboardCount.getLeadCount() != null
                                    ? dashboardCount.getLeadCount().getInAssessment()
                                    : 0)
                    .inPlanning(
                            dashboardCount.getLeadCount() != null
                                    ? dashboardCount.getLeadCount().getInPlanning()
                                    : 0)
                    .trackingPending(
                            dashboardCount.getLeadCount() != null
                                    ? dashboardCount.getLeadCount().getTrackingPending()
                                    : 0)
                    .startingSoon(
                            dashboardCount.getAllTreatments() != null
                                    ? dashboardCount.getAllTreatments().getStartingSoon()
                                    : 0)
                    .ongoing(
                            dashboardCount.getAllTreatments() != null
                                    ? dashboardCount.getAllTreatments().getOngoing()
                                    : 0)
                    .paused(
                            dashboardCount.getAllTreatments() != null
                                    ? dashboardCount.getAllTreatments().getPaused()
                                    : 0)
                    .inRefinement(
                            dashboardCount.getAllTreatments() != null
                                    ? dashboardCount.getAllTreatments().getRefinement()
                                    : 0)
                    .completed(
                            dashboardCount.getAllTreatments() != null
                                    ? dashboardCount.getLeadCount().getCompleted()
                                    : 0)
                    .build();
        }

        CompletableFuture<Long> allPatientsFuture;
        CompletableFuture<Long> inAssessmentFuture;
        CompletableFuture<Long> inPlanningFuture;
        CompletableFuture<Long> startingSoonFuture;
        CompletableFuture<Long> ongoingFuture;
        CompletableFuture<Long> completedFuture;
        CompletableFuture<Long> pausedFuture;
        CompletableFuture<Long> refinementFuture;

        if (role == DoctorRole.CONSULTING_ORTHODONTIST) {

            allPatientsFuture = CompletableFuture.supplyAsync(
                    () -> PatientListCountRepository.getAllPatientCountForDoctor(
                            doctorId, organizationId, profileId, null, null, null, null),
                    dbQueryExecutor);
            inAssessmentFuture = CompletableFuture.supplyAsync(
                    () -> PatientListCountRepository.countAssessmentPatientsForDoctor(
                            doctorId,
                            organizationId,
                            profileId,
                            null,
                            null,
                            null,
                            List.of(DoctorRole.CONSULTING_ORTHODONTIST.name()),
                            null),
                    dbQueryExecutor);
            inPlanningFuture = CompletableFuture.supplyAsync(
                    () -> PatientListCountRepository.planningCountsForDoctor(
                            doctorId, organizationId, profileId, null, null, null, null),
                    dbQueryExecutor);
            startingSoonFuture = CompletableFuture.supplyAsync(
                    () -> PatientListCountRepository.startingSoonCountsForDoctor(
                            doctorId, organizationId, profileId, null, null, null, null),
                    dbQueryExecutor);
            ongoingFuture = CompletableFuture.supplyAsync(
                    () -> PatientListCountRepository.ongoingCountsForDoctor(
                            doctorId, organizationId, profileId, null, null, null, null),
                    dbQueryExecutor);
            completedFuture = CompletableFuture.supplyAsync(
                    () -> PatientListCountRepository.treatmentCompleteCountsForDoctor(
                            doctorId, organizationId, profileId, null, null, null, null),
                    dbQueryExecutor);
            pausedFuture = CompletableFuture.supplyAsync(
                    () -> PatientListCountRepository.pausedPatientIdsForDoctor(
                            doctorId, organizationId, profileId, null, null, null, null),
                    dbQueryExecutor);
            refinementFuture = CompletableFuture.supplyAsync(
                    () -> PatientListCountRepository.refinementCountsForDoctor(
                            doctorId, organizationId, profileId, null, null, null, null),
                    dbQueryExecutor);
        } else if (role == DoctorRole.CUSTOMER) {
            List<String> roles = List.of(role.name());
            allPatientsFuture = CompletableFuture.supplyAsync(
                    () -> PatientListCountRepository.getPatientCountForOrg(
                            organizationId, null, null, null, null, roles),
                    dbQueryExecutor);
            inAssessmentFuture = CompletableFuture.supplyAsync(
                    () -> PatientListCountRepository.countAssessmentPatientsForOrganization(
                            organizationId, null, null, null, null, roles),
                    dbQueryExecutor);
            inPlanningFuture = CompletableFuture.supplyAsync(
                    () -> PatientListCountRepository.planningCountsForOrg(
                            organizationId, null, null, null, null, roles),
                    dbQueryExecutor);
            startingSoonFuture = CompletableFuture.supplyAsync(
                    () -> PatientListCountRepository.startingSoonCountsForOrg(
                            organizationId, null, null, null, null, roles),
                    dbQueryExecutor);
            ongoingFuture = CompletableFuture.supplyAsync(
                    () -> PatientListCountRepository.ongoingCountsForOrg(organizationId, null, null, null, null, roles),
                    dbQueryExecutor);
            completedFuture = CompletableFuture.supplyAsync(
                    () -> PatientListCountRepository.treatmentCompletedCountsForOrg(
                            organizationId, null, null, null, null, roles),
                    dbQueryExecutor);
            pausedFuture = CompletableFuture.supplyAsync(
                    () -> PatientListCountRepository.pausedCountsForOrg(organizationId, null, null, null, null, roles),
                    dbQueryExecutor);
            refinementFuture = CompletableFuture.supplyAsync(
                    () -> PatientListCountRepository.refinementCountsForOrg(
                            organizationId, null, null, null, null, roles),
                    dbQueryExecutor);
        } else {

            List<String> roles = List.of(
                    DoctorRole.CONSULTING_ORTHODONTIST.name(),
                    DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                    DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                    DoctorRole.IN_OFFICE_MANUFACTURER.name(),
                    DoctorRole.INTERNAL_USER.name());
            allPatientsFuture = CompletableFuture.supplyAsync(
                    () -> PatientListCountRepository.getPatientCountForOrg(
                            organizationId, null, null, null, null, roles),
                    dbQueryExecutor);
            inAssessmentFuture = CompletableFuture.supplyAsync(
                    () -> PatientListCountRepository.countAssessmentPatientsForOrganization(
                            organizationId, null, null, null, null, roles),
                    dbQueryExecutor);
            inPlanningFuture = CompletableFuture.supplyAsync(
                    () -> PatientListCountRepository.planningCountsForOrg(
                            organizationId, null, null, null, null, roles),
                    dbQueryExecutor);
            startingSoonFuture = CompletableFuture.supplyAsync(
                    () -> PatientListCountRepository.startingSoonCountsForOrg(
                            organizationId, null, null, null, null, roles),
                    dbQueryExecutor);
            ongoingFuture = CompletableFuture.supplyAsync(
                    () -> PatientListCountRepository.ongoingCountsForOrg(organizationId, null, null, null, null, roles),
                    dbQueryExecutor);
            completedFuture = CompletableFuture.supplyAsync(
                    () -> PatientListCountRepository.treatmentCompletedCountsForOrg(
                            organizationId, null, null, null, null, roles),
                    dbQueryExecutor);
            pausedFuture = CompletableFuture.supplyAsync(
                    () -> PatientListCountRepository.pausedCountsForOrg(organizationId, null, null, null, null, roles),
                    dbQueryExecutor);
            refinementFuture = CompletableFuture.supplyAsync(
                    () -> PatientListCountRepository.refinementCountsForOrg(
                            organizationId, null, null, null, null, roles),
                    dbQueryExecutor);
        }

        CompletableFuture.allOf(
                        allPatientsFuture,
                        inAssessmentFuture,
                        inPlanningFuture,
                        startingSoonFuture,
                        ongoingFuture,
                        completedFuture,
                        pausedFuture,
                        refinementFuture)
                .join();

        return PatientCountDTO.builder()
                .allPatient(allPatientsFuture.join().intValue())
                .inAssessment(inAssessmentFuture.join().intValue())
                .inPlanning(inPlanningFuture.join().intValue())
                .trackingPending(0)
                .startingSoon(startingSoonFuture.join().intValue())
                .ongoing(ongoingFuture.join().intValue())
                .paused(pausedFuture.join().intValue())
                .inRefinement(refinementFuture.join().intValue())
                .completed(completedFuture.join().intValue())
                .build();
    }

    private Set<Long> getMergedJourneyPatientIds(Set<Long> patientIds) {
        Set<Long> mergedSet = new HashSet<>();
        mergedSet.addAll(patientListRepository.countBracesJourneySummariesByPatientIds(patientIds));
        mergedSet.addAll(patientListRepository.countDetailedAlignerJourneySummariesByPatientIds(patientIds));
        return mergedSet;
    }

    @Override
    public PatientDetailsList getAllPatientsByStages(ActivePatientRequestV2 request) {
        int totalPatients;
        List<Long> patientIds;
        int totalPages;
        PaginationDetails paginationDetails;
        List<CombinedPatientSummary> combinedPatientSummaries;
        List<PatientDetailResponse> patientDetails;
        List<TreatmentPlanPatientSummary> treatmentPlans;
        Map<Long, String> patientToBrandNameMap;
        Map<Long, LocalDate> patientTreatmentStartDate;
        Map<Long, LocalDate> patientTreatmentEndDate;
        Map<Long, ManufacturingStatus> manufacturingStatusMap;
        Map<Long, String> patientToOrderStatusMap;
        Map<Long, Boolean> trackingAdded;
        List<Long> paginatedPatientIds;
        List<OrderSummary> latestOrdersForPatients;
        Map<Long, String> patientOrderIdMap;
        Map<Long, OrderStatus> patientOrderStatusMap;
        Map<Long, Long> alignerJourneyIdMap;

        var isInternalUser =
                userProfileRepository.isInternalUser(request.getProfileId(), DoctorRole.INTERNAL_USER.name());
        if (isInternalUser) {
            UserProfile userProfile = userProfileRepository
                    .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                    .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

            var isAdminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());

            if (userProfile.getInviterProfile() != null && isAdminWithDefaultTag) {
                var inviterUserProfile = userProfile.getInviterProfile();
                updateToOwnerProfile(request, inviterUserProfile);
            }
        }
        var requestedDoctorRole = request.getDoctorRole();
        var requestedProfileId = request.getProfileId();

        var practiceProfileIds = request.getPracticeProfileIds();
        if (practiceProfileIds != null && !practiceProfileIds.isEmpty()) {
            updateRequestForConsultingOrthodontist(request);
        }

        PatientCountResponse patientCountResponse = getPatientCount(request);
        if (request.getIsPatientCountRequest()) {
            return getOnlyPatientCountResponse(patientCountResponse);
        }

        if (request.getFilterByGlobalStatus() != null) {
            var userProfileId = request.getProfileId();
            switch (request.getFilterByGlobalStatus()) {
                case ASSESSMENT:
                    patientIds = getAssessmentPatientId(request);

                    combinedPatientSummaries = patientListRepository.getAssessmentPatientSummaries(
                            patientIds, userProfileId, request.getPageNumber(), request.getPageSize());

                    paginatedPatientIds = combinedPatientSummaries.stream()
                            .map(CombinedPatientSummary::getPatientId)
                            .collect(Collectors.toList());
                    latestOrdersForPatients = orderRepository.findLatestOrdersForPatients(paginatedPatientIds);

                    patientOrderIdMap = latestOrdersForPatients.stream()
                            .collect(Collectors.toMap(
                                    OrderSummary::getPatientId,
                                    OrderSummary::getOrderId,
                                    (existing, replacement) -> existing));

                    patientOrderStatusMap = latestOrdersForPatients.stream()
                            .collect(Collectors.toMap(
                                    OrderSummary::getPatientId,
                                    OrderSummary::getOrderStatus,
                                    (existing, replacement) -> existing));

                    patientDetails = new ArrayList<>(combinedPatientSummaries.stream()
                            .map(summary -> {
                                String orderId = patientOrderIdMap.get(summary.getPatientId());
                                OrderStatus orderStatus = patientOrderStatusMap.get(summary.getPatientId());
                                return PatientDetailResponse.newPatientList(
                                        summary,
                                        AlignerTreatmentStage.ASSESSMENT,
                                        null,
                                        orderId,
                                        orderStatus,
                                        null,
                                        null);
                            })
                            .collect(Collectors.toMap(
                                    PatientDetailResponse::getPatientId,
                                    patient -> patient,
                                    (existing, replacement) -> existing,
                                    LinkedHashMap::new))
                            .values());

                    totalPatients = patientIds.size();
                    totalPages = (int) Math.ceil((double) totalPatients / request.getPageSize());
                    paginationDetails = PaginationDetails.builder()
                            .pageNumber(request.getPageNumber())
                            .pageSize(request.getPageSize())
                            .totalPatients(totalPatients)
                            .totalPages(totalPages)
                            .hasNext((request.getPageNumber() + 1) < totalPages)
                            .hasPrevious(request.getPageNumber() > 0)
                            .build();

                    return PatientDetailsList.builder()
                            .patientDetails(patientDetails)
                            .patientCountResponse(patientCountResponse)
                            .paginationDetails(paginationDetails)
                            .build();

                case IN_PLANNING:
                    patientIds = getPatientIdForPlanning(request);

                    combinedPatientSummaries = patientListRepository.getAssessmentPatientSummaries(
                            patientIds, userProfileId, request.getPageNumber(), request.getPageSize());

                    paginatedPatientIds = combinedPatientSummaries.stream()
                            .map(CombinedPatientSummary::getPatientId)
                            .collect(Collectors.toList());

                    treatmentPlans = patientListRepository.findLatestTreatmentPlanPerPatient(paginatedPatientIds);

                    patientToBrandNameMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getBrandName() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getBrandName,
                                    (existing, replacement) -> existing));

                    patientToOrderStatusMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getOrderStatus() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getOrderStatus,
                                    (existing, replacement) -> existing));

                    patientTreatmentStartDate = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getStartDate() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getStartDate,
                                    (existing, replacement) -> existing));

                    patientTreatmentEndDate = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getEndDate() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getEndDate,
                                    (existing, replacement) -> existing));

                    patientDetails = new ArrayList<>(combinedPatientSummaries.stream()
                            .map(summary -> {
                                String brandName = patientToBrandNameMap.get(summary.getPatientId());
                                String orderStatus = patientToOrderStatusMap.get(summary.getPatientId());
                                LocalDate treatmentStartDate = patientTreatmentStartDate.get(summary.getPatientId());
                                LocalDate treatmentEndDate = patientTreatmentEndDate.get(summary.getPatientId());
                                return PatientDetailResponse.newPatientList(
                                        summary,
                                        AlignerTreatmentStage.IN_PLANNING,
                                        brandName,
                                        orderStatus,
                                        treatmentStartDate,
                                        treatmentEndDate);
                            })
                            .collect(Collectors.toMap(
                                    PatientDetailResponse::getPatientId,
                                    patient -> patient,
                                    (existing, replacement) -> existing,
                                    LinkedHashMap::new))
                            .values());

                    totalPatients = patientIds.size();
                    totalPages = (int) Math.ceil((double) totalPatients / request.getPageSize());
                    paginationDetails = PaginationDetails.builder()
                            .pageNumber(request.getPageNumber())
                            .pageSize(request.getPageSize())
                            .totalPatients(totalPatients)
                            .totalPages(totalPages)
                            .hasNext((request.getPageNumber() + 1) < totalPages)
                            .hasPrevious(request.getPageNumber() > 0)
                            .build();

                    return PatientDetailsList.builder()
                            .patientDetails(patientDetails)
                            .paginationDetails(paginationDetails)
                            .patientCountResponse(patientCountResponse)
                            .build();

                case MANUFACTURING:
                    patientIds = getPatientIdsForManufacturing(request);

                    combinedPatientSummaries = patientListRepository.getAssessmentPatientSummaries(
                            patientIds, userProfileId, request.getPageNumber(), request.getPageSize());

                    paginatedPatientIds = combinedPatientSummaries.stream()
                            .map(CombinedPatientSummary::getPatientId)
                            .collect(Collectors.toList());

                    treatmentPlans =
                            patientListRepository.findLatestManufacturingTreatmentPlanPerPatient(paginatedPatientIds);

                    patientToBrandNameMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getBrandName() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getBrandName,
                                    (existing, replacement) -> existing));

                    manufacturingStatusMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getManufacturingStatus() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getManufacturingStatus,
                                    (existing, replacement) -> existing));

                    patientToOrderStatusMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getOrderStatus() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getOrderStatus,
                                    (existing, replacement) -> existing));

                    trackingAdded = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getTrackingAdded() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getTrackingAdded,
                                    (existing, replacement) -> existing));

                    alignerJourneyIdMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getAlignerJourneyId() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getAlignerJourneyId,
                                    (existing, replacement) -> existing));

                    patientTreatmentStartDate = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getStartDate() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getStartDate,
                                    (existing, replacement) -> existing));

                    patientTreatmentEndDate = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getEndDate() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getEndDate,
                                    (existing, replacement) -> existing));

                    patientDetails = new ArrayList<>(combinedPatientSummaries.stream()
                            .map(summary -> {
                                String brandName = patientToBrandNameMap.get(summary.getPatientId());
                                String orderStatus = patientToOrderStatusMap.get(summary.getPatientId());
                                LocalDate treatmentStartDate = patientTreatmentStartDate.get(summary.getPatientId());
                                LocalDate treatmentEndDate = patientTreatmentEndDate.get(summary.getPatientId());
                                ManufacturingStatus manufacturingStatus =
                                        manufacturingStatusMap.get(summary.getPatientId());
                                Boolean isTrackingAdded = trackingAdded.get(summary.getPatientId());
                                Long alignerJourneyId = alignerJourneyIdMap.get(summary.getPatientId());
                                return PatientDetailResponse.newPatientList(
                                        summary,
                                        AlignerTreatmentStage.MANUFACTURING,
                                        brandName,
                                        orderStatus,
                                        manufacturingStatus,
                                        isTrackingAdded,
                                        alignerJourneyId,
                                        treatmentStartDate,
                                        treatmentEndDate);
                            })
                            .collect(Collectors.toMap(
                                    PatientDetailResponse::getPatientId,
                                    patient -> patient,
                                    (existing, replacement) -> existing,
                                    LinkedHashMap::new))
                            .values());

                    totalPatients = patientIds.size();
                    totalPages = (int) Math.ceil((double) totalPatients / request.getPageSize());
                    paginationDetails = PaginationDetails.builder()
                            .pageNumber(request.getPageNumber())
                            .pageSize(request.getPageSize())
                            .totalPatients(totalPatients)
                            .totalPages(totalPages)
                            .hasNext((request.getPageNumber() + 1) < totalPages)
                            .hasPrevious(request.getPageNumber() > 0)
                            .build();

                    return PatientDetailsList.builder()
                            .patientDetails(patientDetails)
                            .paginationDetails(paginationDetails)
                            .patientCountResponse(patientCountResponse)
                            .build();

                case IN_TRANSIT:
                    patientIds = getPatientIdsForInTransit(request);

                    combinedPatientSummaries = patientListRepository.getAssessmentPatientSummaries(
                            patientIds, userProfileId, request.getPageNumber(), request.getPageSize());

                    paginatedPatientIds = combinedPatientSummaries.stream()
                            .map(CombinedPatientSummary::getPatientId)
                            .collect(Collectors.toList());

                    treatmentPlans =
                            patientListRepository.findLatestManufacturingTreatmentPlanPerPatient(paginatedPatientIds);

                    patientToBrandNameMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getBrandName() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getBrandName,
                                    (existing, replacement) -> existing));

                    manufacturingStatusMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getManufacturingStatus() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getManufacturingStatus,
                                    (existing, replacement) -> existing));

                    patientToOrderStatusMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getOrderStatus() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getOrderStatus,
                                    (existing, replacement) -> existing));

                    trackingAdded = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getTrackingAdded() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getTrackingAdded,
                                    (existing, replacement) -> existing));
                    alignerJourneyIdMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getAlignerJourneyId() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getAlignerJourneyId,
                                    (existing, replacement) -> existing));

                    patientTreatmentStartDate = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getStartDate() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getStartDate,
                                    (existing, replacement) -> existing));

                    patientTreatmentEndDate = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getEndDate() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getEndDate,
                                    (existing, replacement) -> existing));

                    patientDetails = new ArrayList<>(combinedPatientSummaries.stream()
                            .map(summary -> {
                                String brandName = patientToBrandNameMap.get(summary.getPatientId());
                                String orderStatus = patientToOrderStatusMap.get(summary.getPatientId());
                                LocalDate treatmentStartDate = patientTreatmentStartDate.get(summary.getPatientId());
                                LocalDate treatmentEndDate = patientTreatmentEndDate.get(summary.getPatientId());
                                ManufacturingStatus manufacturingStatus =
                                        manufacturingStatusMap.get(summary.getPatientId());
                                Boolean isTrackingAdded = trackingAdded.get(summary.getPatientId());
                                Long alignerJourneyId = alignerJourneyIdMap.get(summary.getPatientId());
                                return PatientDetailResponse.newPatientList(
                                        summary,
                                        AlignerTreatmentStage.IN_TRANSIT,
                                        brandName,
                                        orderStatus,
                                        manufacturingStatus,
                                        isTrackingAdded,
                                        alignerJourneyId,
                                        treatmentStartDate,
                                        treatmentEndDate);
                            })
                            .collect(Collectors.toMap(
                                    PatientDetailResponse::getPatientId,
                                    patient -> patient,
                                    (existing, replacement) -> existing,
                                    LinkedHashMap::new))
                            .values());

                    totalPatients = patientIds.size();
                    totalPages = (int) Math.ceil((double) totalPatients / request.getPageSize());
                    paginationDetails = PaginationDetails.builder()
                            .pageNumber(request.getPageNumber())
                            .pageSize(request.getPageSize())
                            .totalPatients(totalPatients)
                            .totalPages(totalPages)
                            .hasNext((request.getPageNumber() + 1) < totalPages)
                            .hasPrevious(request.getPageNumber() > 0)
                            .build();
                    return PatientDetailsList.builder()
                            .patientDetails(patientDetails)
                            .paginationDetails(paginationDetails)
                            .patientCountResponse(patientCountResponse)
                            .build();

                case STARTING_SOON:
                    patientIds = getPatientIdsForStartingSoon(request);

                    combinedPatientSummaries = patientListRepository.getAssessmentPatientSummaries(
                            patientIds, userProfileId, request.getPageNumber(), request.getPageSize());

                    paginatedPatientIds = combinedPatientSummaries.stream()
                            .map(CombinedPatientSummary::getPatientId)
                            .collect(Collectors.toList());

                    treatmentPlans =
                            patientListRepository.findLatestManufacturingTreatmentPlanPerPatient(paginatedPatientIds);

                    patientToBrandNameMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getBrandName() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getBrandName,
                                    (existing, replacement) -> existing));

                    manufacturingStatusMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getManufacturingStatus() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getManufacturingStatus,
                                    (existing, replacement) -> existing));

                    patientToOrderStatusMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getOrderStatus() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getOrderStatus,
                                    (existing, replacement) -> existing));

                    trackingAdded = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getTrackingAdded() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getTrackingAdded,
                                    (existing, replacement) -> existing));

                    alignerJourneyIdMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getAlignerJourneyId() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getAlignerJourneyId,
                                    (existing, replacement) -> existing));

                    patientTreatmentStartDate = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getStartDate() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getStartDate,
                                    (existing, replacement) -> existing));

                    patientTreatmentEndDate = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getEndDate() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getEndDate,
                                    (existing, replacement) -> existing));

                    patientDetails = new ArrayList<>(combinedPatientSummaries.stream()
                            .map(summary -> {
                                String brandName = patientToBrandNameMap.get(summary.getPatientId());
                                String orderStatus = patientToOrderStatusMap.get(summary.getPatientId());
                                LocalDate treatmentStartDate = patientTreatmentStartDate.get(summary.getPatientId());
                                LocalDate treatmentEndDate = patientTreatmentEndDate.get(summary.getPatientId());
                                ManufacturingStatus manufacturingStatus =
                                        manufacturingStatusMap.get(summary.getPatientId());
                                Boolean isTrackingAdded = trackingAdded.get(summary.getPatientId());
                                Long alignerJourneyId = alignerJourneyIdMap.get(summary.getPatientId());
                                return PatientDetailResponse.newPatientList(
                                        summary,
                                        AlignerTreatmentStage.STARTING_SOON,
                                        brandName,
                                        orderStatus,
                                        manufacturingStatus,
                                        isTrackingAdded,
                                        alignerJourneyId,
                                        treatmentStartDate,
                                        treatmentEndDate);
                            })
                            .collect(Collectors.toMap(
                                    PatientDetailResponse::getPatientId,
                                    patient -> patient,
                                    (existing, replacement) -> existing,
                                    LinkedHashMap::new))
                            .values());

                    totalPatients = patientIds.size();
                    totalPages = (int) Math.ceil((double) totalPatients / request.getPageSize());
                    paginationDetails = PaginationDetails.builder()
                            .pageNumber(request.getPageNumber())
                            .pageSize(request.getPageSize())
                            .totalPatients(totalPatients)
                            .totalPages(totalPages)
                            .hasNext((request.getPageNumber() + 1) < totalPages)
                            .hasPrevious(request.getPageNumber() > 0)
                            .build();
                    return PatientDetailsList.builder()
                            .patientDetails(patientDetails)
                            .paginationDetails(paginationDetails)
                            .patientCountResponse(patientCountResponse)
                            .build();

                case ONGOING:
                    patientIds = getPatientIdsForOngoing(request);

                    combinedPatientSummaries = patientListRepository.getAssessmentPatientSummaries(
                            patientIds, userProfileId, request.getPageNumber(), request.getPageSize());

                    paginatedPatientIds = combinedPatientSummaries.stream()
                            .map(CombinedPatientSummary::getPatientId)
                            .collect(Collectors.toList());

                    treatmentPlans =
                            patientListRepository.findLatestManufacturingTreatmentPlanPerPatient(paginatedPatientIds);

                    patientToBrandNameMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getBrandName() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getBrandName,
                                    (existing, replacement) -> existing));

                    manufacturingStatusMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getManufacturingStatus() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getManufacturingStatus,
                                    (existing, replacement) -> existing));

                    patientToOrderStatusMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getOrderStatus() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getOrderStatus,
                                    (existing, replacement) -> existing));

                    trackingAdded = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getTrackingAdded() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getTrackingAdded,
                                    (existing, replacement) -> existing));

                    alignerJourneyIdMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getAlignerJourneyId() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getAlignerJourneyId,
                                    (existing, replacement) -> existing));

                    patientTreatmentStartDate = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getStartDate() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getStartDate,
                                    (existing, replacement) -> existing));

                    patientTreatmentEndDate = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getEndDate() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getEndDate,
                                    (existing, replacement) -> existing));

                    patientDetails = new ArrayList<>(combinedPatientSummaries.stream()
                            .map(summary -> {
                                String brandName = patientToBrandNameMap.get(summary.getPatientId());
                                String orderStatus = patientToOrderStatusMap.get(summary.getPatientId());
                                LocalDate treatmentStartDate = patientTreatmentStartDate.get(summary.getPatientId());
                                LocalDate treatmentEndDate = patientTreatmentEndDate.get(summary.getPatientId());
                                ManufacturingStatus manufacturingStatus =
                                        manufacturingStatusMap.get(summary.getPatientId());

                                Boolean isTrackingAdded = trackingAdded.get(summary.getPatientId());
                                Long alignerJourneyId = alignerJourneyIdMap.get(summary.getPatientId());
                                return PatientDetailResponse.newPatientList(
                                        summary,
                                        AlignerTreatmentStage.ONGOING,
                                        brandName,
                                        orderStatus,
                                        manufacturingStatus,
                                        isTrackingAdded,
                                        alignerJourneyId,
                                        treatmentStartDate,
                                        treatmentEndDate);
                            })
                            .collect(Collectors.toMap(
                                    PatientDetailResponse::getPatientId,
                                    patient -> patient,
                                    (existing, replacement) -> existing,
                                    LinkedHashMap::new))
                            .values());

                    totalPatients = patientIds.size();
                    totalPages = (int) Math.ceil((double) totalPatients / request.getPageSize());
                    paginationDetails = PaginationDetails.builder()
                            .pageNumber(request.getPageNumber())
                            .pageSize(request.getPageSize())
                            .totalPatients(totalPatients)
                            .totalPages(totalPages)
                            .hasNext((request.getPageNumber() + 1) < totalPages)
                            .hasPrevious(request.getPageNumber() > 0)
                            .build();
                    return PatientDetailsList.builder()
                            .patientDetails(patientDetails)
                            .paginationDetails(paginationDetails)
                            .patientCountResponse(patientCountResponse)
                            .build();

                case COMPLETE:
                    patientIds = getPatientIdsForTreatmentCompleted(request);

                    combinedPatientSummaries = patientListRepository.getAssessmentPatientSummaries(
                            patientIds, userProfileId, request.getPageNumber(), request.getPageSize());

                    paginatedPatientIds = combinedPatientSummaries.stream()
                            .map(CombinedPatientSummary::getPatientId)
                            .collect(Collectors.toList());

                    treatmentPlans =
                            patientListRepository.findLatestManufacturingTreatmentPlanPerPatient(paginatedPatientIds);

                    patientToBrandNameMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getBrandName() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getBrandName,
                                    (existing, replacement) -> existing));

                    manufacturingStatusMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getManufacturingStatus() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getManufacturingStatus,
                                    (existing, replacement) -> existing));

                    patientToOrderStatusMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getOrderStatus() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getOrderStatus,
                                    (existing, replacement) -> existing));

                    trackingAdded = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getTrackingAdded() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getTrackingAdded,
                                    (existing, replacement) -> existing));

                    alignerJourneyIdMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getAlignerJourneyId() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getAlignerJourneyId,
                                    (existing, replacement) -> existing));

                    patientTreatmentStartDate = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getStartDate() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getStartDate,
                                    (existing, replacement) -> existing));

                    patientTreatmentEndDate = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getEndDate() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getEndDate,
                                    (existing, replacement) -> existing));

                    patientDetails = new ArrayList<>(combinedPatientSummaries.stream()
                            .map(summary -> {
                                String brandName = patientToBrandNameMap.get(summary.getPatientId());
                                String orderStatus = patientToOrderStatusMap.get(summary.getPatientId());
                                LocalDate treatmentStartDate = patientTreatmentStartDate.get(summary.getPatientId());
                                LocalDate treatmentEndDate = patientTreatmentEndDate.get(summary.getPatientId());
                                ManufacturingStatus manufacturingStatus =
                                        manufacturingStatusMap.get(summary.getPatientId());

                                Boolean isTrackingAdded = trackingAdded.get(summary.getPatientId());
                                Long alignerJourneyId = alignerJourneyIdMap.get(summary.getPatientId());

                                return PatientDetailResponse.newPatientList(
                                        summary,
                                        AlignerTreatmentStage.COMPLETE,
                                        brandName,
                                        orderStatus,
                                        manufacturingStatus,
                                        isTrackingAdded,
                                        alignerJourneyId,
                                        treatmentStartDate,
                                        treatmentEndDate);
                            })
                            .collect(Collectors.toMap(
                                    PatientDetailResponse::getPatientId,
                                    patient -> patient,
                                    (existing, replacement) -> existing,
                                    LinkedHashMap::new))
                            .values());

                    totalPatients = patientIds.size();
                    totalPages = (int) Math.ceil((double) totalPatients / request.getPageSize());
                    paginationDetails = PaginationDetails.builder()
                            .pageNumber(request.getPageNumber())
                            .pageSize(request.getPageSize())
                            .totalPatients(totalPatients)
                            .totalPages(totalPages)
                            .hasNext((request.getPageNumber() + 1) < totalPages)
                            .hasPrevious(request.getPageNumber() > 0)
                            .build();
                    return PatientDetailsList.builder()
                            .patientDetails(patientDetails)
                            .paginationDetails(paginationDetails)
                            .patientCountResponse(patientCountResponse)
                            .build();

                case REFINEMENT:
                    patientIds = getPatientIdsForRefinement(request);

                    combinedPatientSummaries = patientListRepository.getAssessmentPatientSummaries(
                            patientIds, userProfileId, request.getPageNumber(), request.getPageSize());

                    paginatedPatientIds = combinedPatientSummaries.stream()
                            .map(CombinedPatientSummary::getPatientId)
                            .collect(Collectors.toList());

                    treatmentPlans =
                            patientListRepository.findLatestManufacturingTreatmentPlanPerPatient(paginatedPatientIds);

                    trackingAdded = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getTrackingAdded() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getTrackingAdded,
                                    (existing, replacement) -> existing));

                    alignerJourneyIdMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getAlignerJourneyId() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getAlignerJourneyId,
                                    (existing, replacement) -> existing));

                    patientToBrandNameMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getBrandName() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getBrandName,
                                    (existing, replacement) -> existing));

                    manufacturingStatusMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getManufacturingStatus() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getManufacturingStatus,
                                    (existing, replacement) -> existing));

                    patientToOrderStatusMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getOrderStatus() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getOrderStatus,
                                    (existing, replacement) -> existing));

                    patientTreatmentStartDate = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getStartDate() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getStartDate,
                                    (existing, replacement) -> existing));

                    patientTreatmentEndDate = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getEndDate() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getEndDate,
                                    (existing, replacement) -> existing));

                    patientDetails = new ArrayList<>(combinedPatientSummaries.stream()
                            .map(summary -> {
                                String brandName = patientToBrandNameMap.get(summary.getPatientId());
                                String orderStatus = patientToOrderStatusMap.get(summary.getPatientId());
                                LocalDate treatmentStartDate = patientTreatmentStartDate.get(summary.getPatientId());
                                LocalDate treatmentEndDate = patientTreatmentEndDate.get(summary.getPatientId());
                                ManufacturingStatus manufacturingStatus =
                                        manufacturingStatusMap.get(summary.getPatientId());
                                Boolean isTrackingAdded = trackingAdded.get(summary.getPatientId());
                                Long alignerJourneyId = alignerJourneyIdMap.get(summary.getPatientId());
                                return PatientDetailResponse.newPatientList(
                                        summary,
                                        AlignerTreatmentStage.REFINEMENT,
                                        brandName,
                                        orderStatus,
                                        manufacturingStatus,
                                        isTrackingAdded,
                                        alignerJourneyId,
                                        treatmentStartDate,
                                        treatmentEndDate);
                            })
                            .collect(Collectors.toMap(
                                    PatientDetailResponse::getPatientId,
                                    patient -> patient,
                                    (existing, replacement) -> existing,
                                    LinkedHashMap::new))
                            .values());

                    totalPatients = patientIds.size();
                    totalPages = (int) Math.ceil((double) totalPatients / request.getPageSize());
                    paginationDetails = PaginationDetails.builder()
                            .pageNumber(request.getPageNumber())
                            .pageSize(request.getPageSize())
                            .totalPatients(totalPatients)
                            .totalPages(totalPages)
                            .hasNext((request.getPageNumber() + 1) < totalPages)
                            .hasPrevious(request.getPageNumber() > 0)
                            .build();
                    return PatientDetailsList.builder()
                            .patientDetails(patientDetails)
                            .paginationDetails(paginationDetails)
                            .patientCountResponse(patientCountResponse)
                            .build();

                case PAUSED:
                    patientIds = getPatientIdForPaused(request);

                    combinedPatientSummaries = patientListRepository.getAssessmentPatientSummaries(
                            patientIds, userProfileId, request.getPageNumber(), request.getPageSize());

                    paginatedPatientIds = combinedPatientSummaries.stream()
                            .map(CombinedPatientSummary::getPatientId)
                            .collect(Collectors.toList());

                    treatmentPlans =
                            patientListRepository.findLatestManufacturingTreatmentPlanPerPatient(paginatedPatientIds);

                    patientToBrandNameMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getBrandName() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getBrandName,
                                    (existing, replacement) -> existing));

                    manufacturingStatusMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getManufacturingStatus() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getManufacturingStatus,
                                    (existing, replacement) -> existing));

                    patientToOrderStatusMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getOrderStatus() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getOrderStatus,
                                    (existing, replacement) -> existing));

                    trackingAdded = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getTrackingAdded() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getTrackingAdded,
                                    (existing, replacement) -> existing));

                    alignerJourneyIdMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getAlignerJourneyId() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getAlignerJourneyId,
                                    (existing, replacement) -> existing));

                    patientTreatmentStartDate = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getStartDate() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getStartDate,
                                    (existing, replacement) -> existing));

                    patientTreatmentEndDate = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getEndDate() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getEndDate,
                                    (existing, replacement) -> existing));

                    patientDetails = new ArrayList<>(combinedPatientSummaries.stream()
                            .map(summary -> {
                                String brandName = patientToBrandNameMap.get(summary.getPatientId());
                                String orderStatus = patientToOrderStatusMap.get(summary.getPatientId());
                                LocalDate treatmentStartDate = patientTreatmentStartDate.get(summary.getPatientId());
                                LocalDate treatmentEndDate = patientTreatmentEndDate.get(summary.getPatientId());
                                ManufacturingStatus manufacturingStatus =
                                        manufacturingStatusMap.get(summary.getPatientId());
                                Boolean isTrackingAdded = trackingAdded.get(summary.getPatientId());
                                Long alignerJourneyId = alignerJourneyIdMap.get(summary.getPatientId());
                                return PatientDetailResponse.newPatientList(
                                        summary,
                                        AlignerTreatmentStage.PAUSED,
                                        brandName,
                                        orderStatus,
                                        manufacturingStatus,
                                        isTrackingAdded,
                                        alignerJourneyId,
                                        treatmentStartDate,
                                        treatmentEndDate);
                            })
                            .collect(Collectors.toMap(
                                    PatientDetailResponse::getPatientId,
                                    patient -> patient,
                                    (existing, replacement) -> existing,
                                    LinkedHashMap::new))
                            .values());

                    totalPatients = patientIds.size();
                    totalPages = (int) Math.ceil((double) totalPatients / request.getPageSize());
                    paginationDetails = PaginationDetails.builder()
                            .pageNumber(request.getPageNumber())
                            .pageSize(request.getPageSize())
                            .totalPatients(totalPatients)
                            .totalPages(totalPages)
                            .hasNext((request.getPageNumber() + 1) < totalPages)
                            .hasPrevious(request.getPageNumber() > 0)
                            .build();
                    return PatientDetailsList.builder()
                            .patientDetails(patientDetails)
                            .paginationDetails(paginationDetails)
                            .patientCountResponse(patientCountResponse)
                            .build();
                case ALL_TREATMENT_TRACKING:
                    patientIds = getAllPatientIdsForAlignerTracking(request);

                    combinedPatientSummaries = patientListRepository.getAssessmentPatientSummaries(
                            patientIds, userProfileId, request.getPageNumber(), request.getPageSize());

                    paginatedPatientIds = combinedPatientSummaries.stream()
                            .map(CombinedPatientSummary::getPatientId)
                            .collect(Collectors.toList());

                    var patientsWithStages =
                            patientDoctorOrganizationRepository.getAllPatientsWithStages(paginatedPatientIds);

                    Map<Long, String> allPatientStageMap = patientsWithStages.stream()
                            .collect(Collectors.toMap(
                                    PatientStageResult::getPatientId, PatientStageResult::getCurrentStage));

                    latestOrdersForPatients = orderRepository.findLatestOrdersForPatients(paginatedPatientIds);

                    patientOrderIdMap = latestOrdersForPatients.stream()
                            .collect(Collectors.toMap(
                                    OrderSummary::getPatientId,
                                    OrderSummary::getOrderId,
                                    (existing, replacement) -> existing));

                    patientOrderStatusMap = latestOrdersForPatients.stream()
                            .collect(Collectors.toMap(
                                    OrderSummary::getPatientId,
                                    OrderSummary::getOrderStatus,
                                    (existing, replacement) -> existing));

                    Map<Long, Long> allpatientOrderCountMap;
                    if (request.getCustomerOrPracticeRole().equals(DoctorRole.CUSTOMER)
                            && requestedDoctorRole.equals(DoctorRole.ENTERPRISE_COMPANY_LAB)) {

                        var patientOrderCounts = orderRepository.getOrderCountsByPatientIds(
                                paginatedPatientIds, requestedProfileId, List.of(DoctorRole.CUSTOMER.name()));

                        allpatientOrderCountMap = patientOrderCounts.stream()
                                .collect(Collectors.toMap(
                                        PatientOrderCountResult::getPatientId, PatientOrderCountResult::getOrderCount));
                    } else {
                        allpatientOrderCountMap = new HashMap<>();
                    }
                    treatmentPlans = patientListRepository.findTreatmentPlanPerPatient(paginatedPatientIds);

                    trackingAdded = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getTrackingAdded() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getTrackingAdded,
                                    (existing, replacement) -> existing));

                    alignerJourneyIdMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getAlignerJourneyId() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getAlignerJourneyId,
                                    (existing, replacement) -> existing));

                    patientToBrandNameMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getBrandName() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getBrandName,
                                    (existing, replacement) -> existing));

                    patientTreatmentStartDate = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getStartDate() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getStartDate,
                                    (existing, replacement) -> existing));

                    patientTreatmentEndDate = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getEndDate() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getEndDate,
                                    (existing, replacement) -> existing));

                    manufacturingStatusMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getManufacturingStatus() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getManufacturingStatus,
                                    (existing, replacement) -> existing));

                    patientDetails = new ArrayList<>(combinedPatientSummaries.stream()
                            .map(summary -> {
                                String allStage = allPatientStageMap.getOrDefault(summary.getPatientId(), "UNKNOWN");
                                Long orderCount = allpatientOrderCountMap.getOrDefault(summary.getPatientId(), 0L);
                                LocalDate treatmentStartDate = patientTreatmentStartDate.get(summary.getPatientId());
                                LocalDate treatmentEndDate = patientTreatmentEndDate.get(summary.getPatientId());
                                String orderId = patientOrderIdMap.get(summary.getPatientId());
                                OrderStatus orderStatus = patientOrderStatusMap.get(summary.getPatientId());
                                String brandName = patientToBrandNameMap.get(summary.getPatientId());
                                ManufacturingStatus manufacturingStatus =
                                        manufacturingStatusMap.get(summary.getPatientId());
                                Boolean isTrackingAdded = trackingAdded.get(summary.getPatientId());
                                Long alignerJourneyId = alignerJourneyIdMap.get(summary.getPatientId());
                                return PatientDetailResponse.newPatientList(
                                        summary,
                                        AlignerTreatmentStage.valueOf(allStage),
                                        orderCount,
                                        orderId,
                                        orderStatus,
                                        brandName,
                                        manufacturingStatus,
                                        isTrackingAdded,
                                        alignerJourneyId,
                                        treatmentStartDate,
                                        treatmentEndDate);
                            })
                            .collect(Collectors.toMap(
                                    PatientDetailResponse::getPatientId,
                                    patient -> patient,
                                    (existing, replacement) -> existing,
                                    LinkedHashMap::new))
                            .values());
                    totalPatients = patientIds.size();
                    totalPages = (int) Math.ceil((double) totalPatients / request.getPageSize());
                    paginationDetails = PaginationDetails.builder()
                            .pageNumber(request.getPageNumber())
                            .pageSize(request.getPageSize())
                            .totalPatients(totalPatients)
                            .totalPages(totalPages)
                            .hasNext((request.getPageNumber() + 1) < totalPages)
                            .hasPrevious(request.getPageNumber() > 0)
                            .build();

                    return PatientDetailsList.builder()
                            .patientDetails(patientDetails)
                            .paginationDetails(paginationDetails)
                            .patientCountResponse(patientCountResponse)
                            .build();

                case ALL:
                    patientIds = getAllPatientIds(request);

                    combinedPatientSummaries = patientListRepository.getAssessmentPatientSummaries(
                            patientIds, userProfileId, request.getPageNumber(), request.getPageSize());

                    paginatedPatientIds = combinedPatientSummaries.stream()
                            .map(CombinedPatientSummary::getPatientId)
                            .collect(Collectors.toList());

                    var allPatientsWithStages =
                            patientDoctorOrganizationRepository.getAllPatientsWithStages(paginatedPatientIds);

                    Map<Long, String> patientStageMap = allPatientsWithStages.stream()
                            .collect(Collectors.toMap(
                                    PatientStageResult::getPatientId, PatientStageResult::getCurrentStage));

                    latestOrdersForPatients = orderRepository.findLatestOrdersForPatients(paginatedPatientIds);

                    patientOrderIdMap = latestOrdersForPatients.stream()
                            .collect(Collectors.toMap(
                                    OrderSummary::getPatientId,
                                    OrderSummary::getOrderId,
                                    (existing, replacement) -> existing));

                    patientOrderStatusMap = latestOrdersForPatients.stream()
                            .collect(Collectors.toMap(
                                    OrderSummary::getPatientId,
                                    OrderSummary::getOrderStatus,
                                    (existing, replacement) -> existing));

                    Map<Long, Long> patientOrderCountMap;
                    if (request.getCustomerOrPracticeRole().equals(DoctorRole.CUSTOMER)
                            && requestedDoctorRole.equals(DoctorRole.ENTERPRISE_COMPANY_LAB)) {

                        var patientOrderCounts = orderRepository.getOrderCountsByPatientIds(
                                paginatedPatientIds, requestedProfileId, List.of(DoctorRole.CUSTOMER.name()));

                        patientOrderCountMap = patientOrderCounts.stream()
                                .collect(Collectors.toMap(
                                        PatientOrderCountResult::getPatientId, PatientOrderCountResult::getOrderCount));
                    } else {
                        patientOrderCountMap = new HashMap<>();
                    }
                    treatmentPlans = patientListRepository.findTreatmentPlanPerPatient(paginatedPatientIds);

                    trackingAdded = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getTrackingAdded() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getTrackingAdded,
                                    (existing, replacement) -> existing));

                    alignerJourneyIdMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getAlignerJourneyId() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getAlignerJourneyId,
                                    (existing, replacement) -> existing));

                    patientToBrandNameMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getBrandName() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getBrandName,
                                    (existing, replacement) -> existing));

                    patientTreatmentStartDate = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getStartDate() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getStartDate,
                                    (existing, replacement) -> existing));

                    patientTreatmentEndDate = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getEndDate() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getEndDate,
                                    (existing, replacement) -> existing));

                    manufacturingStatusMap = treatmentPlans.stream()
                            .filter(plan -> plan.getPatientId() != null && plan.getManufacturingStatus() != null)
                            .collect(Collectors.toMap(
                                    TreatmentPlanPatientSummary::getPatientId,
                                    TreatmentPlanPatientSummary::getManufacturingStatus,
                                    (existing, replacement) -> existing));

                    patientDetails = new ArrayList<>(combinedPatientSummaries.stream()
                            .map(summary -> {
                                String stage = patientStageMap.getOrDefault(summary.getPatientId(), "UNKNOWN");
                                Long orderCount = patientOrderCountMap.getOrDefault(summary.getPatientId(), 0L);
                                LocalDate treatmentStartDate = patientTreatmentStartDate.get(summary.getPatientId());
                                LocalDate treatmentEndDate = patientTreatmentEndDate.get(summary.getPatientId());
                                String orderId = patientOrderIdMap.get(summary.getPatientId());
                                OrderStatus orderStatus = patientOrderStatusMap.get(summary.getPatientId());
                                String brandName = patientToBrandNameMap.get(summary.getPatientId());
                                ManufacturingStatus manufacturingStatus =
                                        manufacturingStatusMap.get(summary.getPatientId());
                                Boolean isTrackingAdded = trackingAdded.get(summary.getPatientId());
                                Long alignerJourneyId = alignerJourneyIdMap.get(summary.getPatientId());
                                return PatientDetailResponse.newPatientList(
                                        summary,
                                        AlignerTreatmentStage.valueOf(stage),
                                        orderCount,
                                        orderId,
                                        orderStatus,
                                        brandName,
                                        manufacturingStatus,
                                        isTrackingAdded,
                                        alignerJourneyId,
                                        treatmentStartDate,
                                        treatmentEndDate);
                            })
                            .collect(Collectors.toMap(
                                    PatientDetailResponse::getPatientId,
                                    patient -> patient,
                                    (existing, replacement) -> existing,
                                    LinkedHashMap::new))
                            .values());
                    totalPatients = patientIds.size();
                    totalPages = (int) Math.ceil((double) totalPatients / request.getPageSize());
                    paginationDetails = PaginationDetails.builder()
                            .pageNumber(request.getPageNumber())
                            .pageSize(request.getPageSize())
                            .totalPatients(totalPatients)
                            .totalPages(totalPages)
                            .hasNext((request.getPageNumber() + 1) < totalPages)
                            .hasPrevious(request.getPageNumber() > 0)
                            .build();

                    return PatientDetailsList.builder()
                            .patientDetails(patientDetails)
                            .paginationDetails(paginationDetails)
                            .patientCountResponse(patientCountResponse)
                            .build();

                default:
            }
        } else {
            return null;
        }
        return null;
    }

    private void updateRequestForConsultingOrthodontist(ActivePatientRequestV2 request) {
        var practiceProfileIds = request.getPracticeProfileIds();
        if (practiceProfileIds == null || practiceProfileIds.isEmpty()) {
            throw new DoctorNotFoundException("Practice profile IDs are missing");
        }
        var practiceProfileId = practiceProfileIds.get(0);
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(practiceProfileId)
                .orElseThrow(() -> new DoctorNotFoundException(practiceProfileId));
        request.setProfileId(userProfile.getId());
        request.setOrganizationId(userProfile.getOrganization().getId());
        request.setDoctorRole(DoctorRole.CONSULTING_ORTHODONTIST);
        request.setDoctorId(userProfile.getDoctor().getId());
    }

    private PatientDetailsList getOnlyPatientCountResponse(PatientCountResponse patientCountResponse) {
        return PatientDetailsList.builder()
                .patientCountResponse(patientCountResponse)
                .build();
    }

    private List<Long> getAssessmentPatientId(ActivePatientRequestV2 request) {
        Long profileId = request.getProfileId();
        Long organizationId = request.getOrganizationId();
        Long doctorId = request.getDoctorId();
        AppInviteStatus appInviteStatus = request.getFilterByAppInviteStatus();
        String appInviteStatusStr = appInviteStatus != null ? appInviteStatus.name() : null;
        var search = request.getSearch();
        var patientType = request.getPatientType().name();
        List<Long> practiceLocationIds = request.getPracticeLocationIds();
        String customerMappedId = request.getCustomerMappedId();
        Long practiceLocationId =
                (practiceLocationIds != null && !practiceLocationIds.isEmpty()) ? practiceLocationIds.get(0) : null;
        return switch (request.getDoctorRole()) {
            case ALIGNER_COMPANY_OR_LAB,
                    ENTERPRISE_COMPANY_LAB,
                    IN_OFFICE_MANUFACTURER -> patientDoctorOrganizationRepository.assessmentPatientIdsForOrganization(
                    organizationId,
                    practiceLocationId,
                    customerMappedId,
                    appInviteStatusStr,
                    search,
                    patientType,
                    List.of(
                            DoctorRole.CONSULTING_ORTHODONTIST.name(),
                            DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                            DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                            DoctorRole.COMMERCIAL_ALIGNER_LAB.name(),
                            DoctorRole.IN_OFFICE_MANUFACTURER.name(),
                            DoctorRole.INTERNAL_USER.name()));
            case CONSULTING_ORTHODONTIST -> patientDoctorOrganizationRepository.assessmentPatientIdsForDoctor(
                    doctorId,
                    organizationId,
                    customerMappedId,
                    profileId,
                    appInviteStatusStr,
                    search,
                    patientType,
                    List.of(DoctorRole.CONSULTING_ORTHODONTIST.name()),
                    practiceLocationId);
            default -> Collections.emptyList();
        };
    }

    private List<Long> getPatientIdForPlanning(ActivePatientRequestV2 request) {
        Long profileId = request.getProfileId();
        Long organizationId = request.getOrganizationId();
        Long doctorId = request.getDoctorId();
        AppInviteStatus appInviteStatus = request.getFilterByAppInviteStatus();
        String appInviteStatusStr = appInviteStatus != null ? appInviteStatus.name() : null;
        var search = request.getSearch();
        var patientType = request.getPatientType().name();
        String customerMappedId = request.getCustomerMappedId();

        List<Long> practiceLocationIds = request.getPracticeLocationIds();
        Long practiceLocationId =
                (practiceLocationIds != null && !practiceLocationIds.isEmpty()) ? practiceLocationIds.get(0) : null;
        return switch (request.getDoctorRole()) {
            case ALIGNER_COMPANY_OR_LAB,
                    ENTERPRISE_COMPANY_LAB,
                    IN_OFFICE_MANUFACTURER -> patientDoctorOrganizationRepository.planningPatientIdsForOrg(
                    organizationId,
                    practiceLocationId,
                    customerMappedId,
                    appInviteStatusStr,
                    search,
                    patientType,
                    List.of(
                            DoctorRole.CONSULTING_ORTHODONTIST.name(),
                            DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                            DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                            DoctorRole.COMMERCIAL_ALIGNER_LAB.name(),
                            DoctorRole.IN_OFFICE_MANUFACTURER.name(),
                            DoctorRole.INTERNAL_USER.name()));
            case CONSULTING_ORTHODONTIST -> patientDoctorOrganizationRepository.planningPatientIdsForDoctor(
                    doctorId,
                    organizationId,
                    customerMappedId,
                    profileId,
                    appInviteStatusStr,
                    search,
                    patientType,
                    practiceLocationId);
            default -> Collections.emptyList();
        };
    }

    private List<Long> getPatientIdsForManufacturing(ActivePatientRequestV2 request) {
        Long profileId = request.getProfileId();
        Long organizationId = request.getOrganizationId();
        Long doctorId = request.getDoctorId();
        AppInviteStatus appInviteStatus = request.getFilterByAppInviteStatus();
        String appInviteStatusStr = appInviteStatus != null ? appInviteStatus.name() : null;
        String search = request.getSearch();
        var patientType = request.getPatientType().name();
        String customerMappedId = request.getCustomerMappedId();

        List<Long> practiceLocationIds = request.getPracticeLocationIds();
        Long practiceLocationId =
                (practiceLocationIds != null && !practiceLocationIds.isEmpty()) ? practiceLocationIds.get(0) : null;
        return switch (request.getDoctorRole()) {
            case ALIGNER_COMPANY_OR_LAB,
                    ENTERPRISE_COMPANY_LAB,
                    IN_OFFICE_MANUFACTURER -> patientDoctorOrganizationRepository.manufacturingPatientIdsForOrg(
                    organizationId,
                    practiceLocationId,
                    customerMappedId,
                    appInviteStatusStr,
                    search,
                    patientType,
                    List.of(
                            DoctorRole.CONSULTING_ORTHODONTIST.name(),
                            DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                            DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                            DoctorRole.COMMERCIAL_ALIGNER_LAB.name(),
                            DoctorRole.IN_OFFICE_MANUFACTURER.name(),
                            DoctorRole.INTERNAL_USER.name()));
            case CONSULTING_ORTHODONTIST -> patientDoctorOrganizationRepository.manufacturingPatientIdsForDoctor(
                    doctorId,
                    organizationId,
                    customerMappedId,
                    profileId,
                    appInviteStatusStr,
                    search,
                    patientType,
                    practiceLocationId);
            default -> Collections.emptyList();
        };
    }

    private List<Long> getPatientIdsForStartingSoon(ActivePatientRequestV2 request) {
        Long profileId = request.getProfileId();
        Long organizationId = request.getOrganizationId();
        Long doctorId = request.getDoctorId();
        AppInviteStatus appInviteStatus = request.getFilterByAppInviteStatus();
        String appInviteStatusStr = appInviteStatus != null ? appInviteStatus.name() : null;
        String search = request.getSearch();
        var patientType = request.getPatientType().name();
        String customerMappedId = request.getCustomerMappedId();

        List<Long> practiceLocationIds = request.getPracticeLocationIds();
        Long practiceLocationId =
                (practiceLocationIds != null && !practiceLocationIds.isEmpty()) ? practiceLocationIds.get(0) : null;

        return switch (request.getDoctorRole()) {
            case ALIGNER_COMPANY_OR_LAB,
                    ENTERPRISE_COMPANY_LAB,
                    IN_OFFICE_MANUFACTURER -> patientDoctorOrganizationRepository.startingSoonPatientIdsForOrg(
                    organizationId,
                    practiceLocationId,
                    customerMappedId,
                    appInviteStatusStr,
                    search,
                    patientType,
                    List.of(
                            DoctorRole.CONSULTING_ORTHODONTIST.name(),
                            DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                            DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                            DoctorRole.COMMERCIAL_ALIGNER_LAB.name(),
                            DoctorRole.IN_OFFICE_MANUFACTURER.name(),
                            DoctorRole.INTERNAL_USER.name()));
            case CONSULTING_ORTHODONTIST -> patientDoctorOrganizationRepository.startingSoonPatientIdsForDoctor(
                    doctorId,
                    organizationId,
                    customerMappedId,
                    profileId,
                    appInviteStatusStr,
                    search,
                    patientType,
                    practiceLocationId);
            default -> Collections.emptyList();
        };
    }

    private List<Long> getPatientIdsForOngoing(ActivePatientRequestV2 request) {
        Long profileId = request.getProfileId();
        Long organizationId = request.getOrganizationId();
        Long doctorId = request.getDoctorId();
        AppInviteStatus appInviteStatus = request.getFilterByAppInviteStatus();
        String appInviteStatusStr = appInviteStatus != null ? appInviteStatus.name() : null;
        String search = request.getSearch();
        var patientType = request.getPatientType().name();
        String customerMappedId = request.getCustomerMappedId();

        List<Long> practiceLocationIds = request.getPracticeLocationIds();
        Long practiceLocationId =
                (practiceLocationIds != null && !practiceLocationIds.isEmpty()) ? practiceLocationIds.get(0) : null;
        return switch (request.getDoctorRole()) {
            case ALIGNER_COMPANY_OR_LAB,
                    ENTERPRISE_COMPANY_LAB,
                    IN_OFFICE_MANUFACTURER -> patientDoctorOrganizationRepository.ongoingPatientIdsForOrg(
                    organizationId,
                    practiceLocationId,
                    customerMappedId,
                    appInviteStatusStr,
                    search,
                    patientType,
                    List.of(
                            DoctorRole.CONSULTING_ORTHODONTIST.name(),
                            DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                            DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                            DoctorRole.COMMERCIAL_ALIGNER_LAB.name(),
                            DoctorRole.IN_OFFICE_MANUFACTURER.name(),
                            DoctorRole.INTERNAL_USER.name()));
            case CONSULTING_ORTHODONTIST -> patientDoctorOrganizationRepository.ongoingPatientIdsForDoctor(
                    doctorId,
                    organizationId,
                    customerMappedId,
                    profileId,
                    appInviteStatusStr,
                    search,
                    patientType,
                    practiceLocationId);
            default -> Collections.emptyList();
        };
    }

    private List<Long> getPatientIdsForTreatmentCompleted(ActivePatientRequestV2 request) {
        Long profileId = request.getProfileId();
        Long organizationId = request.getOrganizationId();
        Long doctorId = request.getDoctorId();
        AppInviteStatus appInviteStatus = request.getFilterByAppInviteStatus();
        String appInviteStatusStr = appInviteStatus != null ? appInviteStatus.name() : null;
        String search = request.getSearch();
        var patientType = request.getPatientType().name();
        String customerMappedId = request.getCustomerMappedId();

        List<Long> practiceLocationIds = request.getPracticeLocationIds();
        Long practiceLocationId =
                (practiceLocationIds != null && !practiceLocationIds.isEmpty()) ? practiceLocationIds.get(0) : null;
        return switch (request.getDoctorRole()) {
            case ALIGNER_COMPANY_OR_LAB,
                    ENTERPRISE_COMPANY_LAB,
                    IN_OFFICE_MANUFACTURER -> patientDoctorOrganizationRepository.completedPatientIdsForOrg(
                    organizationId,
                    practiceLocationId,
                    customerMappedId,
                    appInviteStatusStr,
                    search,
                    patientType,
                    List.of(
                            DoctorRole.CONSULTING_ORTHODONTIST.name(),
                            DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                            DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                            DoctorRole.COMMERCIAL_ALIGNER_LAB.name(),
                            DoctorRole.IN_OFFICE_MANUFACTURER.name(),
                            DoctorRole.INTERNAL_USER.name()));
            case CONSULTING_ORTHODONTIST -> patientDoctorOrganizationRepository.completedPatientIdsForDoctor(
                    doctorId,
                    organizationId,
                    customerMappedId,
                    profileId,
                    appInviteStatusStr,
                    search,
                    patientType,
                    practiceLocationId);
            default -> Collections.emptyList();
        };
    }

    private List<Long> getPatientIdForPaused(ActivePatientRequestV2 request) {
        Long profileId = request.getProfileId();
        Long organizationId = request.getOrganizationId();
        Long doctorId = request.getDoctorId();
        AppInviteStatus appInviteStatus = request.getFilterByAppInviteStatus();
        String appInviteStatusStr = appInviteStatus != null ? appInviteStatus.name() : null;
        String search = request.getSearch();
        var patientType = request.getPatientType().name();
        String customerMappedId = request.getCustomerMappedId();

        List<Long> practiceLocationIds = request.getPracticeLocationIds();
        Long practiceLocationId =
                (practiceLocationIds != null && !practiceLocationIds.isEmpty()) ? practiceLocationIds.get(0) : null;

        return switch (request.getDoctorRole()) {
            case ALIGNER_COMPANY_OR_LAB,
                    ENTERPRISE_COMPANY_LAB,
                    IN_OFFICE_MANUFACTURER -> patientDoctorOrganizationRepository.pausedPatientIdsForOrg(
                    organizationId,
                    practiceLocationId,
                    customerMappedId,
                    appInviteStatusStr,
                    search,
                    patientType,
                    List.of(
                            DoctorRole.CONSULTING_ORTHODONTIST.name(),
                            DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                            DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                            DoctorRole.COMMERCIAL_ALIGNER_LAB.name(),
                            DoctorRole.IN_OFFICE_MANUFACTURER.name(),
                            DoctorRole.INTERNAL_USER.name()));
            case CONSULTING_ORTHODONTIST -> patientDoctorOrganizationRepository.pausedPatientIdsForDoctor(
                    doctorId,
                    organizationId,
                    customerMappedId,
                    profileId,
                    appInviteStatusStr,
                    search,
                    patientType,
                    practiceLocationId);
            default -> Collections.emptyList();
        };
    }

    private List<Long> getPatientIdsForInTransit(ActivePatientRequestV2 request) {
        Long profileId = request.getProfileId();
        Long organizationId = request.getOrganizationId();
        Long doctorId = request.getDoctorId();
        AppInviteStatus appInviteStatus = request.getFilterByAppInviteStatus();
        String appInviteStatusStr = appInviteStatus != null ? appInviteStatus.name() : null;
        String search = request.getSearch();
        var patientType = request.getPatientType().name();
        String customerMappedId = request.getCustomerMappedId();

        List<Long> practiceLocationIds = request.getPracticeLocationIds();
        Long practiceLocationId =
                (practiceLocationIds != null && !practiceLocationIds.isEmpty()) ? practiceLocationIds.get(0) : null;

        return switch (request.getDoctorRole()) {
            case ALIGNER_COMPANY_OR_LAB,
                    ENTERPRISE_COMPANY_LAB,
                    IN_OFFICE_MANUFACTURER -> patientDoctorOrganizationRepository.transitPatientIdsForOrg(
                    organizationId,
                    practiceLocationId,
                    customerMappedId,
                    appInviteStatusStr,
                    search,
                    patientType,
                    List.of(
                            DoctorRole.CONSULTING_ORTHODONTIST.name(),
                            DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                            DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                            DoctorRole.COMMERCIAL_ALIGNER_LAB.name(),
                            DoctorRole.IN_OFFICE_MANUFACTURER.name(),
                            DoctorRole.INTERNAL_USER.name()));
            case CONSULTING_ORTHODONTIST -> patientDoctorOrganizationRepository.transitPatientIdsForDoctor(
                    doctorId,
                    organizationId,
                    customerMappedId,
                    profileId,
                    appInviteStatusStr,
                    search,
                    patientType,
                    practiceLocationId);
            default -> Collections.emptyList();
        };
    }

    private List<Long> getPatientIdsForRefinement(ActivePatientRequestV2 request) {
        Long profileId = request.getProfileId();
        Long organizationId = request.getOrganizationId();
        Long doctorId = request.getDoctorId();
        AppInviteStatus appInviteStatus = request.getFilterByAppInviteStatus();
        String appInviteStatusStr = appInviteStatus != null ? appInviteStatus.name() : null;
        String search = request.getSearch();
        var patientType = request.getPatientType().name();
        String customerMappedId = request.getCustomerMappedId();

        List<Long> practiceLocationIds = request.getPracticeLocationIds();
        Long practiceLocationId =
                (practiceLocationIds != null && !practiceLocationIds.isEmpty()) ? practiceLocationIds.get(0) : null;

        return switch (request.getDoctorRole()) {
            case ALIGNER_COMPANY_OR_LAB,
                    ENTERPRISE_COMPANY_LAB,
                    IN_OFFICE_MANUFACTURER -> patientDoctorOrganizationRepository.refinementPatientIdsForOrg(
                    organizationId,
                    practiceLocationId,
                    customerMappedId,
                    appInviteStatusStr,
                    search,
                    patientType,
                    List.of(
                            DoctorRole.CONSULTING_ORTHODONTIST.name(),
                            DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                            DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                            DoctorRole.COMMERCIAL_ALIGNER_LAB.name(),
                            DoctorRole.IN_OFFICE_MANUFACTURER.name(),
                            DoctorRole.INTERNAL_USER.name()));
            case CONSULTING_ORTHODONTIST -> patientDoctorOrganizationRepository.refinementPatientIdsForDoctor(
                    doctorId,
                    organizationId,
                    customerMappedId,
                    profileId,
                    appInviteStatusStr,
                    search,
                    patientType,
                    practiceLocationId);
            default -> Collections.emptyList();
        };
    }

    private List<Long> getAllPatientIdsForAlignerTracking(ActivePatientRequestV2 request) {

        var profileId = request.getProfileId();
        Long organizationId = request.getOrganizationId();
        Long doctorId = request.getDoctorId();
        AppInviteStatus appInviteStatus = request.getFilterByAppInviteStatus();
        String appInviteStatusStr = appInviteStatus != null ? appInviteStatus.name() : null;
        String search = request.getSearch();
        var patientType = request.getPatientType().name();
        String customerMappedId = request.getCustomerMappedId();

        List<Long> practiceLocationIds = request.getPracticeLocationIds();
        Long practiceLocationId =
                (practiceLocationIds != null && !practiceLocationIds.isEmpty()) ? practiceLocationIds.get(0) : null;

        return switch (request.getDoctorRole()) {
            case ENTERPRISE_COMPANY_LAB -> patientDoctorOrganizationRepository.combinedActivePatientIdsForOrg(
                    organizationId,
                    practiceLocationId,
                    customerMappedId,
                    appInviteStatusStr,
                    search,
                    patientType,
                    List.of(DoctorRole.CONSULTING_ORTHODONTIST.name(), DoctorRole.ENTERPRISE_COMPANY_LAB.name()));
            case ALIGNER_COMPANY_OR_LAB, IN_OFFICE_MANUFACTURER -> patientDoctorOrganizationRepository
                    .combinedActivePatientIdsForOrg(
                            organizationId,
                            practiceLocationId,
                            customerMappedId,
                            appInviteStatusStr,
                            search,
                            patientType,
                            List.of(
                                    DoctorRole.CONSULTING_ORTHODONTIST.name(),
                                    DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                                    DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                                    DoctorRole.IN_OFFICE_MANUFACTURER.name(),
                                    DoctorRole.INTERNAL_USER.name()));

            case CONSULTING_ORTHODONTIST -> patientDoctorOrganizationRepository.combinedActivePatientIdsForDoctor(
                    doctorId,
                    organizationId,
                    customerMappedId,
                    profileId,
                    appInviteStatusStr,
                    search,
                    patientType,
                    practiceLocationId);
            default -> Collections.emptyList();
        };
    }

    private List<Long> getAllPatientIds(ActivePatientRequestV2 request) {
        Long customerProfileId = null;
        if (request.getPracticeProfileIds() != null
                && !request.getPracticeProfileIds().isEmpty()) {
            customerProfileId = request.getPracticeProfileIds().get(0);
        }
        var profileId = request.getProfileId();
        Long organizationId = request.getOrganizationId();
        Long doctorId = request.getDoctorId();
        AppInviteStatus appInviteStatus = request.getFilterByAppInviteStatus();
        String appInviteStatusStr = appInviteStatus != null ? appInviteStatus.name() : null;
        String search = request.getSearch();
        var patientType = request.getPatientType().name();
        String customerMappedId = request.getCustomerMappedId();

        List<Long> practiceLocationIds = request.getPracticeLocationIds();
        Long practiceLocationId =
                (practiceLocationIds != null && !practiceLocationIds.isEmpty()) ? practiceLocationIds.get(0) : null;
        return switch (request.getDoctorRole()) {
            case ENTERPRISE_COMPANY_LAB -> {
                if (request.getCustomerOrPracticeRole().equals(DoctorRole.CUSTOMER)) {
                    if (customerProfileId != null) {
                        yield patientDoctorOrganizationRepository.allPatientIdOfCustomerPatientForOrg(
                                customerProfileId,
                                appInviteStatusStr,
                                search,
                                patientType,
                                List.of(DoctorRole.CUSTOMER.name()));
                    } else {
                        yield patientDoctorOrganizationRepository.allPatientIdOfAllCustomerPatientForOrg(
                                profileId,
                                appInviteStatusStr,
                                search,
                                patientType,
                                List.of(DoctorRole.CUSTOMER.name()));
                    }

                } else {
                    yield patientDoctorOrganizationRepository.allPatientIdsForOrg(
                            organizationId,
                            practiceLocationId,
                            customerMappedId,
                            appInviteStatusStr,
                            search,
                            patientType,
                            List.of(
                                    DoctorRole.CONSULTING_ORTHODONTIST.name(),
                                    DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                                    DoctorRole.INTERNAL_USER.name()));
                }
            }
            case ALIGNER_COMPANY_OR_LAB, IN_OFFICE_MANUFACTURER -> patientDoctorOrganizationRepository
                    .allPatientIdsForOrg(
                            organizationId,
                            practiceLocationId,
                            customerMappedId,
                            appInviteStatusStr,
                            search,
                            patientType,
                            List.of(
                                    DoctorRole.CONSULTING_ORTHODONTIST.name(),
                                    DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                                    DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                                    DoctorRole.IN_OFFICE_MANUFACTURER.name(),
                                    DoctorRole.INTERNAL_USER.name()));

            case CONSULTING_ORTHODONTIST -> patientDoctorOrganizationRepository.allPatientIdsForDoctor(
                    doctorId, organizationId, practiceLocationId, profileId, appInviteStatusStr, search, patientType);
            default -> Collections.emptyList();
        };
    }

    private List<Long> getAllPatientIds(CustomerPatientListRequest request) {
        String search = request.getSearch();
        UserProfile customerProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getCustomerId())
                .orElseThrow(() -> new DoctorNotFoundException(
                        "User profile not found for profileId: " + request.getCustomerId()));
        return patientDoctorOrganizationRepository.getCustomerPatientList(
                request.getCustomerId(), request.getProfileId(), search, customerProfile.getId());
    }

    @Override
    public PatientCountResponse getPatientCount(ActivePatientRequestV2 request) {
        Long profileId = request.getProfileId();
        Long organizationId = request.getOrganizationId();
        Long doctorId = request.getDoctorId();
        AppInviteStatus appInviteStatus = request.getFilterByAppInviteStatus();
        String appInviteStatusStr = appInviteStatus != null ? appInviteStatus.name() : null;
        var search = request.getSearch();
        var patientType = request.getPatientType().name();

        int inAssessment = 0;
        int inPlanning = 0;
        int inManufacturing = 0;
        int refinement = 0;
        int allPatients = 0;

        int transit = 0;
        int startingSoon = 0;
        int combinedTreatmentTracking = 0;
        int ongoing = 0;
        int completed = 0;
        int paused = 0;
        int customerPatientCount = 0;
        int newCasesThisMonthCount = 0;

        List<Long> practiceLocationIds = request.getPracticeLocationIds();
        Long practiceLocationId =
                (practiceLocationIds != null && !practiceLocationIds.isEmpty()) ? practiceLocationIds.get(0) : null;

        switch (request.getDoctorRole()) {
            case ALIGNER_COMPANY_OR_LAB, ENTERPRISE_COMPANY_LAB, IN_OFFICE_MANUFACTURER -> {
                inAssessment = PatientListCountRepository.countAssessmentPatientsForOrganization(
                                organizationId,
                                practiceLocationId,
                                appInviteStatusStr,
                                search,
                                patientType,
                                List.of(
                                        DoctorRole.CONSULTING_ORTHODONTIST.name(),
                                        DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                                        DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                                        DoctorRole.IN_OFFICE_MANUFACTURER.name(),
                                        DoctorRole.INTERNAL_USER.name()))
                        .intValue();

                if (request.getDoctorRole().equals(DoctorRole.ENTERPRISE_COMPANY_LAB)) {
                    Long customerProfileId = null;
                    if (request.getPracticeProfileIds() != null
                            && !request.getPracticeProfileIds().isEmpty()) {
                        customerProfileId = request.getPracticeProfileIds().get(0);
                    }

                    if (request.getCustomerOrPracticeRole().equals(DoctorRole.CUSTOMER)) {
                        if (customerProfileId != null) {
                            customerPatientCount = PatientListCountRepository.countPatientIdOfCustomerPatientForOrg(
                                            customerProfileId,
                                            appInviteStatusStr,
                                            search,
                                            patientType,
                                            List.of(DoctorRole.CUSTOMER.name()))
                                    .intValue();
                        } else {
                            customerPatientCount = PatientListCountRepository.countPatientIdOfAllCustomerPatientForOrg(
                                            profileId,
                                            appInviteStatusStr,
                                            search,
                                            patientType,
                                            List.of(DoctorRole.CUSTOMER.name()))
                                    .intValue();
                        }
                    } else {
                        customerPatientCount = PatientListCountRepository.countPatientIdOfAllCustomerPatientForOrg(
                                        profileId,
                                        appInviteStatusStr,
                                        search,
                                        patientType,
                                        List.of(DoctorRole.CUSTOMER.name()))
                                .intValue();
                    }
                }

                inPlanning = PatientListCountRepository.planningCountsForOrg(
                                organizationId,
                                practiceLocationId,
                                appInviteStatusStr,
                                search,
                                patientType,
                                List.of(
                                        DoctorRole.CONSULTING_ORTHODONTIST.name(),
                                        DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                                        DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                                        DoctorRole.IN_OFFICE_MANUFACTURER.name(),
                                        DoctorRole.INTERNAL_USER.name()))
                        .intValue();

                inManufacturing = PatientListCountRepository.manufacturingCountsForOrg(
                                organizationId,
                                practiceLocationId,
                                appInviteStatusStr,
                                search,
                                patientType,
                                List.of(
                                        DoctorRole.CONSULTING_ORTHODONTIST.name(),
                                        DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                                        DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                                        DoctorRole.IN_OFFICE_MANUFACTURER.name(),
                                        DoctorRole.INTERNAL_USER.name()))
                        .intValue();

                startingSoon = PatientListCountRepository.startingSoonCountsForOrg(
                                organizationId,
                                practiceLocationId,
                                appInviteStatusStr,
                                search,
                                patientType,
                                List.of(
                                        DoctorRole.CONSULTING_ORTHODONTIST.name(),
                                        DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                                        DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                                        DoctorRole.IN_OFFICE_MANUFACTURER.name()))
                        .intValue();

                combinedTreatmentTracking = PatientListCountRepository.combinedActivePatientCountForOrg(
                                organizationId,
                                practiceLocationId,
                                appInviteStatusStr,
                                search,
                                patientType,
                                List.of(
                                        DoctorRole.CONSULTING_ORTHODONTIST.name(),
                                        DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                                        DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                                        DoctorRole.IN_OFFICE_MANUFACTURER.name(),
                                        DoctorRole.INTERNAL_USER.name()))
                        .intValue();

                ongoing = PatientListCountRepository.ongoingCountsForOrg(
                                organizationId,
                                practiceLocationId,
                                appInviteStatusStr,
                                search,
                                patientType,
                                List.of(
                                        DoctorRole.CONSULTING_ORTHODONTIST.name(),
                                        DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                                        DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                                        DoctorRole.IN_OFFICE_MANUFACTURER.name(),
                                        DoctorRole.INTERNAL_USER.name()))
                        .intValue();

                completed = PatientListCountRepository.treatmentCompletedCountsForOrg(
                                organizationId,
                                practiceLocationId,
                                appInviteStatusStr,
                                search,
                                patientType,
                                List.of(
                                        DoctorRole.CONSULTING_ORTHODONTIST.name(),
                                        DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                                        DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                                        DoctorRole.IN_OFFICE_MANUFACTURER.name(),
                                        DoctorRole.INTERNAL_USER.name()))
                        .intValue();

                paused = PatientListCountRepository.pausedCountsForOrg(
                                organizationId,
                                practiceLocationId,
                                appInviteStatusStr,
                                search,
                                patientType,
                                List.of(
                                        DoctorRole.CONSULTING_ORTHODONTIST.name(),
                                        DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                                        DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                                        DoctorRole.IN_OFFICE_MANUFACTURER.name(),
                                        DoctorRole.INTERNAL_USER.name()))
                        .intValue();

                transit = PatientListCountRepository.transitCountsForOrg(
                                organizationId,
                                practiceLocationId,
                                appInviteStatusStr,
                                search,
                                patientType,
                                List.of(
                                        DoctorRole.CONSULTING_ORTHODONTIST.name(),
                                        DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                                        DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                                        DoctorRole.IN_OFFICE_MANUFACTURER.name(),
                                        DoctorRole.INTERNAL_USER.name()))
                        .intValue();

                refinement = PatientListCountRepository.refinementCountsForOrg(
                                organizationId,
                                practiceLocationId,
                                appInviteStatusStr,
                                search,
                                patientType,
                                List.of(
                                        DoctorRole.CONSULTING_ORTHODONTIST.name(),
                                        DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                                        DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                                        DoctorRole.IN_OFFICE_MANUFACTURER.name(),
                                        DoctorRole.INTERNAL_USER.name()))
                        .intValue();

                allPatients = PatientListCountRepository.getPatientCountForOrg(
                                organizationId,
                                practiceLocationId,
                                appInviteStatusStr,
                                search,
                                patientType,
                                List.of(
                                        DoctorRole.CONSULTING_ORTHODONTIST.name(),
                                        DoctorRole.ALIGNER_COMPANY_OR_LAB.name(),
                                        DoctorRole.ENTERPRISE_COMPANY_LAB.name(),
                                        DoctorRole.IN_OFFICE_MANUFACTURER.name(),
                                        DoctorRole.INTERNAL_USER.name()))
                        .intValue();

                newCasesThisMonthCount = PatientListCountRepository.newCasesThisMonthCount(organizationId)
                        .intValue();
            }
            case CONSULTING_ORTHODONTIST -> {
                inAssessment = PatientListCountRepository.countAssessmentPatientsForDoctor(
                                doctorId,
                                organizationId,
                                profileId,
                                appInviteStatusStr,
                                search,
                                patientType,
                                List.of(DoctorRole.CONSULTING_ORTHODONTIST.name()),
                                practiceLocationId)
                        .intValue();

                inPlanning = PatientListCountRepository.planningCountsForDoctor(
                                doctorId,
                                organizationId,
                                profileId,
                                appInviteStatusStr,
                                search,
                                patientType,
                                practiceLocationId)
                        .intValue();

                inManufacturing = PatientListCountRepository.manufacturingCountsForDoctor(
                                doctorId,
                                organizationId,
                                profileId,
                                appInviteStatusStr,
                                search,
                                patientType,
                                practiceLocationId)
                        .intValue();

                startingSoon = PatientListCountRepository.startingSoonCountsForDoctor(
                                doctorId,
                                organizationId,
                                profileId,
                                appInviteStatusStr,
                                search,
                                patientType,
                                practiceLocationId)
                        .intValue();

                combinedTreatmentTracking = PatientListCountRepository.combinedActivePatientCountForDoctor(
                                doctorId,
                                organizationId,
                                profileId,
                                appInviteStatusStr,
                                search,
                                patientType,
                                practiceLocationId)
                        .intValue();

                ongoing = PatientListCountRepository.ongoingCountsForDoctor(
                                doctorId,
                                organizationId,
                                profileId,
                                appInviteStatusStr,
                                search,
                                patientType,
                                practiceLocationId)
                        .intValue();

                completed = PatientListCountRepository.treatmentCompleteCountsForDoctor(
                                doctorId,
                                organizationId,
                                profileId,
                                appInviteStatusStr,
                                search,
                                patientType,
                                practiceLocationId)
                        .intValue();

                paused = PatientListCountRepository.pausedPatientIdsForDoctor(
                                doctorId,
                                organizationId,
                                profileId,
                                appInviteStatusStr,
                                search,
                                patientType,
                                practiceLocationId)
                        .intValue();

                transit = PatientListCountRepository.transitCountsForDoctor(
                                doctorId,
                                organizationId,
                                profileId,
                                appInviteStatusStr,
                                search,
                                patientType,
                                practiceLocationId)
                        .intValue();

                refinement = PatientListCountRepository.refinementCountsForDoctor(
                                doctorId,
                                organizationId,
                                profileId,
                                appInviteStatusStr,
                                search,
                                patientType,
                                practiceLocationId)
                        .intValue();

                allPatients = PatientListCountRepository.getAllPatientCountForDoctor(
                                doctorId,
                                organizationId,
                                profileId,
                                appInviteStatusStr,
                                search,
                                patientType,
                                practiceLocationId)
                        .intValue();

                newCasesThisMonthCount = PatientListCountRepository.newCasesThisMonthCountForOrg(
                                doctorId, organizationId, profileId)
                        .intValue();
            }
        }

        return PatientCountResponse.builder()
                .allPatients(allPatients)
                .inAssessment(inAssessment)
                .inPlanning(inPlanning)
                .inManufacturing(inManufacturing)
                .transit(transit)
                .startingSoon(startingSoon)
                .ongoing(ongoing)
                .completed(completed)
                .paused(paused)
                .refinement(refinement)
                .customerPatientCount(customerPatientCount)
                .practicePatientCount(allPatients)
                .newCasesThisMonthCount(newCasesThisMonthCount)
                .combinedTreatmentTrackingCount(combinedTreatmentTracking)
                .build();
    }

    @Override
    public CustomerPatientList getCustomerPatientList(CustomerPatientListRequest request) {
        UserProfile userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUseWithInviterRoles(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

        var isAdminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());

        if (userProfile.getInviterProfile() != null && isAdminWithDefaultTag) {
            var inviterUserProfile = userProfile.getInviterProfile();
            request.setProfileId(inviterUserProfile.getId());
        }
        List<CombinedPatientSummary> combinedPatientSummaries;
        List<Long> patientIds;
        List<CustomerPatientDetailResponse> patientDetails;
        int totalPatients;
        int totalPages;
        PaginationDetails paginationDetails;

        patientIds = getAllPatientIds(request);
        patientIds.sort(Collections.reverseOrder());

        combinedPatientSummaries = patientListRepository.getCustomerPatientDetails(
                patientIds, request.getPageNumber(), request.getPageSize());

        patientDetails = new ArrayList<>(combinedPatientSummaries.stream()
                .map(CustomerPatientDetailResponse::newPatientList)
                .collect(Collectors.toMap(
                        CustomerPatientDetailResponse::getPatientId,
                        patient -> patient,
                        (existing, replacement) -> existing,
                        LinkedHashMap::new))
                .values());
        totalPatients = patientIds.size();
        totalPages = (int) Math.ceil((double) totalPatients / request.getPageSize());
        paginationDetails = PaginationDetails.builder()
                .pageNumber(request.getPageNumber())
                .pageSize(request.getPageSize())
                .totalPatients(totalPatients)
                .totalPages(totalPages)
                .hasNext((request.getPageNumber() + 1) < totalPages)
                .hasPrevious(request.getPageNumber() > 0)
                .build();

        return CustomerPatientList.builder()
                .patientDetails(patientDetails)
                .paginationDetails(paginationDetails)
                .build();
    }
}
