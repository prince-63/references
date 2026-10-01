package com.dentalstack.patient.feature.vsp.service.impl;

import com.dentalstack.patient.feature.vsp.dto.request.VspPatientListRequest;
import com.dentalstack.patient.feature.vsp.dto.response.VspPatientListResponse;
import com.dentalstack.patient.feature.vsp.enums.VspNextAction;
import com.dentalstack.patient.feature.vsp.enums.VspOrderStatus;
import com.dentalstack.patient.feature.vsp.projection.VspPatientListSummary;
import com.dentalstack.patient.feature.vsp.repository.VspPatientRepository;
import com.dentalstack.patient.feature.vsp.service.VspPatientListService;
import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class VspPatientListServiceImpl implements VspPatientListService {

    private final VspPatientRepository vspPatientRepository;

    @Transactional(readOnly = true)
    @Override
    public VspPatientListResponse getVspPatientList(VspPatientListRequest request) {

        String sortDirection =
                request.getSortDirection() != null ? request.getSortDirection().name() : "DESC";

        List<String> vspOrderStatuses = getStatuses(request);

        boolean isDraftRequested = vspOrderStatuses.contains("DRAFT");

        long totalCount = vspPatientRepository.countVspPatientIdsWithFilters(
                request.getOrganizationId(),
                request.getProfileId(),
                request.getPracticeLocationId(),
                request.getClinicId(),
                request.getCustomerMappedId(),
                request.getSearch(),
                request.getProductId(),
                vspOrderStatuses,
                isDraftRequested,
                request.getCaseType());

        List<Long> patientIds = vspPatientRepository.findVspPatientIdsWithFilters(
                request.getOrganizationId(),
                request.getProfileId(),
                request.getPracticeLocationId(),
                request.getClinicId(),
                request.getCustomerMappedId(),
                request.getSearch(),
                request.getProductId(),
                vspOrderStatuses,
                isDraftRequested,
                request.getCaseType(),
                request.getSortBy(),
                sortDirection,
                request.getPageSize(),
                request.getPageNumber() * request.getPageSize());

        List<VspPatientListResponse.VspPatientSummaryDTO> patientDTOs = new ArrayList<>();
        if (!patientIds.isEmpty()) {
            List<VspPatientListSummary> summaries = vspPatientRepository.findVspPatientSummariesByIds(patientIds);

            Map<Long, VspPatientListSummary> summaryMap =
                    summaries.stream().collect(Collectors.toMap(VspPatientListSummary::getPatientId, s -> s));

            patientDTOs = patientIds.stream()
                    .map(summaryMap::get)
                    .filter(Objects::nonNull)
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }

        int totalPages = (int) Math.ceil((double) totalCount / request.getPageSize());
        PaginationDetails pagination = PaginationDetails.builder()
                .pageNumber(request.getPageNumber())
                .pageSize(request.getPageSize())
                .totalPatients((int) totalCount)
                .totalPages(totalPages)
                .hasNext(request.getPageNumber() < totalPages - 1)
                .hasPrevious(request.getPageNumber() > 0)
                .build();

        return VspPatientListResponse.builder()
                .patients(patientDTOs)
                .pagination(pagination)
                .build();
    }

    @NotNull
    private static List<String> getStatuses(VspPatientListRequest request) {
        List<String> vspOrderStatuses = new ArrayList<>();
        if (request.getOrderStatus() != null) {
            if (request.getOrderStatus() == VspOrderStatus.IN_PROGRESS) {
                vspOrderStatuses = List.of(VspOrderStatus.ORDERED.name());
            } else if (request.getOrderStatus() == VspOrderStatus.APPROVED) {
                vspOrderStatuses = List.of(
                        VspOrderStatus.APPROVED.name(),
                        VspOrderStatus.STL_FILES_REQUESTED.name(),
                        VspOrderStatus.STL_FILES_UPLOADED.name());
            } else {
                vspOrderStatuses = List.of(request.getOrderStatus().name());
            }
        }
        return vspOrderStatuses;
    }

    private VspPatientListResponse.VspPatientSummaryDTO mapToDTO(VspPatientListSummary summary) {
        String initials = generateInitials(summary.getFirstName(), summary.getLastName());
        VspNextAction nextAction = determineNextAction(summary.getVspOrderStatus());
        Integer currentStep = determineCurrentStep(summary.getVspOrderStatus());

        return VspPatientListResponse.VspPatientSummaryDTO.builder()
                .patientId(summary.getPatientId())
                .fullName(summary.getFullName())
                .initials(initials)
                .profilePictureUrl(summary.getProfilePictureUrl())
                .email(summary.getEmail())
                .mobileNo(summary.getMobileNo())
                .customerMappedId(summary.getCustomerMappedId())
                .practiceLocationName(summary.getPracticeLocationName())
                .practiceLocationId(summary.getPracticeLocationId())
                .productName(summary.getProductName())
                .caseType(summary.getCaseType())
                .vspOrderStatus(
                        summary.getVspOrderStatus() != null ? mapVspOrderStatus(summary.getVspOrderStatus()) : "DRAFT")
                .nextAction(nextAction != null ? nextAction.getMessage() : null)
                .currentStep(currentStep)
                .lastUpdated(summary.getLastUpdated() != null ? summary.getLastUpdated() : null)
                .build();
    }

    private String mapVspOrderStatus(VspOrderStatus status) {
        return switch (status) {
            case STL_FILES_REQUESTED, STL_FILES_UPLOADED -> VspOrderStatus.APPROVED.name();
            case ORDERED -> VspOrderStatus.IN_PROGRESS.name();
            default -> status.toString();
        };
    }

    private String generateInitials(String firstName, String lastName) {
        StringBuilder initials = new StringBuilder();
        if (firstName != null && !firstName.isEmpty()) initials.append(firstName.charAt(0));
        if (lastName != null && !lastName.isEmpty()) initials.append(lastName.charAt(0));
        return initials.toString().toUpperCase();
    }

    private VspNextAction determineNextAction(VspOrderStatus vspOrderStatus) {
        if (vspOrderStatus == null) return VspNextAction.CREATE_ORDER;
        return switch (vspOrderStatus) {
            case DRAFT -> VspNextAction.SEND_ORDER;
            case ORDERED -> VspNextAction.WAITING_FOR_TREATMENT_PLAN;
            case IN_REVIEW -> VspNextAction.APPROVE_PLAN;
            case APPROVED -> VspNextAction.COMPLETE_ORDER;
            case STL_FILES_REQUESTED -> VspNextAction.COMPLETE_ORDER;
            case STL_FILES_UPLOADED -> VspNextAction.COMPLETE_ORDER;
            case REQUEST_REVISION -> VspNextAction.REQUEST_REVISION;
            case NEED_MORE_INFO -> VspNextAction.NEED_MORE_INFO;
            case SHIPPED -> VspNextAction.ORDER_SHIPPED;
            case DELIVERED -> VspNextAction.ORDER_DELIVERED;
            default -> null;
        };
    }

    private Integer determineCurrentStep(VspOrderStatus vspOrderStatus) {
        if (vspOrderStatus == null) return 1;
        return switch (vspOrderStatus) {
            case DRAFT, ORDERED -> 2;
            case IN_REVIEW, APPROVED, STL_FILES_REQUESTED, STL_FILES_UPLOADED, REQUEST_REVISION, NEED_MORE_INFO -> 3;
            case SHIPPED -> 4;
            case DELIVERED, COMPLETED -> 5;
            default -> 1;
        };
    }
}
