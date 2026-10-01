package com.dentalstack.patient.feature.aligner.service.impl;

import com.dentalstack.patient.feature.aligner.dto.AlignerInfo;
import com.dentalstack.patient.feature.aligner.dto.UnprocessedAlignerListResponse;
import com.dentalstack.patient.feature.aligner.dto.UnprocessedAlignerRequest;
import com.dentalstack.patient.feature.aligner.dto.UnprocessedAlignerResponse;
import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.aligner.repository.AlignerJourneyRepository;
import com.dentalstack.patient.feature.aligner.service.UnprocessedAlignerService;
import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.order.entity.ManufacturingBatch;
import com.dentalstack.patient.feature.order.projection.ManufacturingBatchSummary;
import com.dentalstack.patient.feature.order.repository.ManufacturingRepository;
import com.dentalstack.patient.feature.patient.dto.PatientRes;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.feature.reminder.repository.ReminderRepository;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.dentalstack.patient.feature.treatment.projection.TreatmentPlanSummary;
import com.dentalstack.patient.feature.treatment.repository.TreatmentPlanRepository;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.workflow.core.task_tracker.repository.PatientTaskTrackerRepository;
import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UnprocessedAlignerServiceImpl implements UnprocessedAlignerService {

    private final TreatmentPlanRepository treatmentPlanRepository;
    private final PatientDoctorOrganizationRepository patientDoctorOrganizationRepository;
    private final ReminderRepository reminderRepository;
    private final ManufacturingRepository manufacturingRepository;
    private final AlignerJourneyRepository alignerJourneyRepository;
    private final UserProfileRepository userProfileRepository;
    private final PatientTaskTrackerRepository patientTaskTrackerRepository;

    @Override
    @Transactional
    public UnprocessedAlignerListResponse getUnprocessedAlignerList(UnprocessedAlignerRequest request) {
        PatientRes patientRes = fetchTreatmentPlanIds(request);
        List<Long> treatmentPlanIds =
                patientRes.getTreatmentPlanId().stream().distinct().collect(Collectors.toList());

        List<TreatmentPlanSummary> allTreatmentPlansForPatients =
                treatmentPlanRepository.findTreatmentPlanSummariesByIds(treatmentPlanIds);

        List<UnprocessedAlignerResponse> responses = allTreatmentPlansForPatients.stream()
                .map(this::mapToUnprocessedAlignerResponse)
                .filter(Objects::nonNull)
                .limit(request.getSize())
                .toList();

        var totalCount = patientRes.getTotalCount();
        PaginationDetails paginationDetails = PaginationDetails.builder()
                .pageNumber(request.getPage())
                .pageSize(request.getSize())
                .totalPatients(Math.toIntExact(totalCount))
                .totalPages((int) Math.ceil((double) totalCount / request.getSize()))
                .hasNext(request.getPage() < (Math.ceil((double) totalCount / request.getSize()) - 1))
                .hasPrevious(request.getPage() > 0)
                .build();

        return UnprocessedAlignerListResponse.builder()
                .orderDetails(responses)
                .paginationDetails(paginationDetails)
                .build();
    }

    @Override
    public UnprocessedAlignerResponse mapToUnprocessedAlignerResponse(TreatmentPlanSummary treatmentPlan) {
        AlignerInfo totalAligners = TreatmentPlan.getTotalAlignersFromMetadata(treatmentPlan);
        var treatmentPlanId = treatmentPlan.getId();

        List<ManufacturingBatchSummary> manufacturingBatches =
                manufacturingRepository.findSummariesByTreatmentPlanId(treatmentPlanId);

        LocalDate dueBy = null;
        ManufacturingBatchSummary latestBatch = manufacturingBatches.stream()
                .max(Comparator.comparing(ManufacturingBatchSummary::getId))
                .orElse(null);
        if (latestBatch != null) {
            int remainingAlignerStartNumber = ManufacturingBatch.getRemainingAlignerStartNumberSummery(latestBatch);
            Optional<LocalDate> endDate = alignerJourneyRepository.findAlignerEndDateByPatientIdAndSrNo(
                    treatmentPlan.getPatientId(), remainingAlignerStartNumber);
            dueBy = endDate.orElse(null);
        }

        AlignerInfo delivered = ManufacturingBatch.calculateDeliveredAlignersSummery(manufacturingBatches);
        AlignerInfo inInventory = ManufacturingBatch.calculateInInventoryAlignersSummery(manufacturingBatches);
        AlignerInfo transit = ManufacturingBatch.calculateTransitAlignersSummery(manufacturingBatches);
        AlignerInfo pending = ManufacturingBatch.calculatePendingAlignersSummery(totalAligners, manufacturingBatches);

        var latestReminder = reminderRepository
                .findLatestUnprocessedAlignerReminderByTreatmentPlanId(treatmentPlan.getId())
                .orElse(null);
        UnprocessedAlignerResponse.DueStatus dueStatus = determineDueStatus(dueBy);

        return UnprocessedAlignerResponse.builder()
                .patientId(treatmentPlan.getPatientId())
                .treatmentPlanId(treatmentPlan.getId())
                .patientFullName(treatmentPlan.getPatientFullName())
                .patientProfileUrl(treatmentPlan.getPatientProfileUrl())
                .caseType(determineCaseType(treatmentPlan))
                .customer(treatmentPlan.getCustomerName())
                .totalAligners(totalAligners)
                .delivered(delivered)
                .inInventory(inInventory)
                .transit(transit)
                .pending(pending)
                .patientId(treatmentPlan.getPatientId())
                .orderId(treatmentPlan.getOrderId() != null ? treatmentPlan.getOrderId() : null)
                .dueBy(dueBy)
                .reminderDate(latestReminder != null ? latestReminder.getDate() : null)
                .reminderId(latestReminder != null ? latestReminder.getId() : null)
                .latestBatchManufacturingStatus(latestBatch != null ? latestBatch.getStatus() : null)
                .dueByStatus(dueStatus)
                .treatmentPlanStatusCompleted(treatmentPlan.getStatus().equals(AlignerTreatmentStatus.COMPLETE))
                .treatmentPlanStatus(treatmentPlan.getStatus())
                .archivedOn(treatmentPlan.getDeactivatedAt())
                .build();
    }

    private UnprocessedAlignerResponse.DueStatus determineDueStatus(LocalDate dueBy) {
        if (dueBy == null) {
            return UnprocessedAlignerResponse.DueStatus.NOT_ADDED;
        }
        LocalDate today = LocalDate.now();
        LocalDate endOfWeek = today.plusDays(7);

        if (dueBy.isBefore(today)) {
            return UnprocessedAlignerResponse.DueStatus.OVERDUE;
        } else if (dueBy.isEqual(today)) {
            return UnprocessedAlignerResponse.DueStatus.DUE_TODAY;
        } else if (dueBy.isAfter(today) && dueBy.isBefore(endOfWeek)) {
            return UnprocessedAlignerResponse.DueStatus.DUE_THIS_WEEK;
        } else if (dueBy.isAfter(endOfWeek)) {
            return UnprocessedAlignerResponse.DueStatus.DUE_LATER;
        } else {
            return UnprocessedAlignerResponse.DueStatus.OVERDUE;
        }
    }

    private UnprocessedAlignerResponse.CaseType determineCaseType(TreatmentPlanSummary treatmentPlan) {
        String result = treatmentPlanRepository.determineCaseTypeForPatient(treatmentPlan.getPatientId());
        return UnprocessedAlignerResponse.CaseType.valueOf(result);
    }

    private PatientRes fetchTreatmentPlanIds(UnprocessedAlignerRequest request) {
        List<DoctorRole> alignerCompanyRoles = Arrays.asList(
                DoctorRole.ALIGNER_COMPANY_OR_LAB,
                DoctorRole.ENTERPRISE_COMPANY_LAB,
                DoctorRole.COMMERCIAL_ALIGNER_LAB,
                DoctorRole.IN_OFFICE_MANUFACTURER);

        var profileId = request.getProfileId();
        var userProfile = userProfileRepository
                .findUserProfileWithPlanHierarchy(profileId)
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

        var isAdminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getProfileId());

        if (isAdminWithDefaultTag && userProfile.getInviterProfile() != null) {
            var inviterProfile = userProfile.getInviterProfile();
            updateToOwnerProfile(inviterProfile, request);
        }

        boolean isAlignerCompanyRoles = request.getRoles().stream().anyMatch(alignerCompanyRoles::contains);

        boolean isNewestToOldest = request.getSortOption() == UnprocessedAlignerRequest.SortOption.NEWEST_TO_OLDEST;
        boolean isAllOrNotAddedFilter = request.getDueByFilter().equals(UnprocessedAlignerRequest.DueByFilter.ALL)
                || request.getDueByFilter().equals(UnprocessedAlignerRequest.DueByFilter.NOT_ADDED);

        if (isAlignerCompanyRoles) {
            if (isAllOrNotAddedFilter) {
                return fetchPatientIdsForAlignerCompany(request, isNewestToOldest);
            } else {
                return fetchPatientIdsForAlignerCompanyWithDueBy(request, isNewestToOldest);
            }
        } else if (userProfile.isCustomInternalUser()) {
            return fetchPatientIdsForCustomInternalUser(request, isNewestToOldest);
        } else {
            return fetchPatientIdsByDoctor(request, isNewestToOldest);
        }
    }

    private void updateToOwnerProfile(UserProfile inviterProfile, UnprocessedAlignerRequest request) {
        request.setProfileId(inviterProfile.getId());
        request.setDoctorId(inviterProfile.getDoctor().getId());
        request.setOrganizationId(inviterProfile.getOrganization().getId());
        request.setRoles(List.of(DoctorRole.ENTERPRISE_COMPANY_LAB));
    }

    private PatientRes fetchPatientIdsForAlignerCompany(UnprocessedAlignerRequest request, boolean isNewestToOldest) {
        int offset = request.getPage() * request.getSize();
        int limit = request.getSize();
        List<Long> treatmentPlanIds;

        var totalCount = patientDoctorOrganizationRepository.countTreatmentPlanIds(
                request.getOrganizationId(),
                request.getDueByFilter().name(),
                request.getCaseType().name(),
                request.getSearchTerm());

        if (isNewestToOldest) {
            treatmentPlanIds = patientDoctorOrganizationRepository.findTreatmentPlanIdsByPaginationDesc(
                    request.getOrganizationId(),
                    request.getDueByFilter().name(),
                    request.getCaseType().name(),
                    request.getSearchTerm(),
                    offset,
                    limit);
        } else {
            treatmentPlanIds = patientDoctorOrganizationRepository.findTreatmentPlanIdsByPaginationAsc(
                    request.getOrganizationId(),
                    request.getDueByFilter().name(),
                    request.getCaseType().name(),
                    request.getSearchTerm(),
                    offset,
                    limit);
        }

        return PatientRes.builder()
                .treatmentPlanId(treatmentPlanIds)
                .totalCount(totalCount)
                .build();
    }

    private PatientRes fetchPatientIdsForCustomInternalUser(
            UnprocessedAlignerRequest request, boolean isNewestToOldest) {
        int offset = request.getPage() * request.getSize();
        int limit = request.getSize();
        List<Long> treatmentPlanIds;

        var patientIds = patientTaskTrackerRepository.findPatientIdsByCreatedByOrAssignee(request.getProfileId());
        var totalCount = patientDoctorOrganizationRepository.countTreatmentPlanIdsForCustomInternalUser(
                request.getOrganizationId(),
                request.getDueByFilter().name(),
                request.getCaseType().name(),
                request.getSearchTerm(),
                patientIds);

        if (isNewestToOldest) {
            treatmentPlanIds =
                    patientDoctorOrganizationRepository.findTreatmentPlanIdsForInternalCustomUsersByPaginationDesc(
                            request.getOrganizationId(),
                            request.getDueByFilter().name(),
                            request.getCaseType().name(),
                            request.getSearchTerm(),
                            patientIds,
                            offset,
                            limit);
        } else {
            treatmentPlanIds =
                    patientDoctorOrganizationRepository.findTreatmentPlanIdsForCustomInternalUserPaginationAsc(
                            request.getOrganizationId(),
                            request.getDueByFilter().name(),
                            request.getCaseType().name(),
                            request.getSearchTerm(),
                            patientIds,
                            offset,
                            limit);
        }

        return PatientRes.builder()
                .treatmentPlanId(treatmentPlanIds)
                .totalCount(totalCount)
                .build();
    }

    private PatientRes fetchPatientIdsForAlignerCompanyWithDueBy(
            UnprocessedAlignerRequest request, boolean isNewestToOldest) {
        int offset = request.getPage() * request.getSize();
        int limit = request.getSize();
        List<Long> treatmentPlanIds;
        var totalCount = patientDoctorOrganizationRepository.countPatientIdsByTreatmentPlanWithDueBy(
                request.getOrganizationId(),
                request.getDueByFilter().name(),
                request.getCaseType().name(),
                request.getSearchTerm());
        if (isNewestToOldest) {
            treatmentPlanIds = patientDoctorOrganizationRepository.findPatientIdsByTreatmentPlanPaginationWithDueByDesc(
                    request.getOrganizationId(),
                    request.getDueByFilter().name(),
                    request.getCaseType().name(),
                    request.getSearchTerm(),
                    offset,
                    limit);
        } else {
            treatmentPlanIds = patientDoctorOrganizationRepository.findPatientIdsByTreatmentPlanPaginationWithDueByAsc(
                    request.getOrganizationId(),
                    request.getDueByFilter().name(),
                    request.getCaseType().name(),
                    request.getSearchTerm(),
                    offset,
                    limit);
        }

        return PatientRes.builder()
                .treatmentPlanId(treatmentPlanIds)
                .totalCount(totalCount)
                .build();
    }

    private PatientRes fetchPatientIdsByDoctor(UnprocessedAlignerRequest request, boolean isNewestToOldest) {
        int offset = request.getPage() * request.getSize();
        int limit = request.getSize();
        List<Long> treatmentPlanIds;

        var totalCount =
                patientDoctorOrganizationRepository
                        .countPatientIdsByDoctorIdWithActiveOrPausedOrDeactivatedTreatmentPlans(
                                request.getOrganizationId(),
                                request.getDoctorId(),
                                request.getProfileId(),
                                request.getCaseType().name(),
                                request.getSearchTerm());
        if (isNewestToOldest) {
            treatmentPlanIds =
                    patientDoctorOrganizationRepository
                            .findPatientIdsByDoctorIdWithActiveOrPausedOrDeactivatedTreatmentPlansDesc(
                                    request.getOrganizationId(),
                                    request.getDoctorId(),
                                    request.getProfileId(),
                                    request.getCaseType().name(),
                                    request.getSearchTerm(),
                                    offset,
                                    limit);
        } else {
            treatmentPlanIds =
                    patientDoctorOrganizationRepository
                            .findPatientIdsByDoctorIdWithActiveOrPausedOrDeactivatedTreatmentPlansAsc(
                                    request.getOrganizationId(),
                                    request.getDoctorId(),
                                    request.getProfileId(),
                                    request.getCaseType().name(),
                                    request.getSearchTerm(),
                                    offset,
                                    limit);
        }
        return PatientRes.builder()
                .treatmentPlanId(treatmentPlanIds)
                .totalCount(totalCount)
                .build();
    }
}
