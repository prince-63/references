package com.dentalstack.patient.feature.order.service.impl;

import com.dentalstack.patient.feature.order.enums.OrderStatus;
import com.dentalstack.patient.feature.order.projection.PatientCaseProjection;
import com.dentalstack.patient.feature.order.projection.PatientListSummaryV2;
import com.dentalstack.patient.feature.patient.dto.v2.PatientListRequestV2;
import com.dentalstack.patient.feature.patient.dto.v2.PatientListResponseV2;
import com.dentalstack.patient.feature.patient.enums.NextAction;
import com.dentalstack.patient.feature.patient.repository.PatientDoctorOrganizationRepository;
import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientListServiceImplV2 implements PatientListServiceV2 {

    private final PatientDoctorOrganizationRepository pdoRepository;

    @Transactional(readOnly = true)
    @Override
    public PatientListResponseV2 getPatientListV2(PatientListRequestV2 request) {
        String sortDirection =
                request.getSortDirection() != null ? request.getSortDirection().name() : "DESC";

        Pageable pageable = PageRequest.of(request.getPageNumber(), request.getPageSize());

        List<String> orderStatuses = getOrderStatusesForFilter(request.getOrderStatus());
        boolean isDraftRequested = orderStatuses.contains(OrderStatus.DRAFT.name());

        Page<PatientCaseProjection> patientPage = pdoRepository.findPatientIdsWithFiltersAndPagination(
                request.getProfileId(),
                request.getPracticeLocationId(),
                request.getClinicId(),
                request.getCustomerMappedId(),
                request.getPatientType(),
                request.getProductId(),
                request.getCaseType(),
                orderStatuses,
                isDraftRequested,
                request.getSearch(),
                request.getSortBy(),
                sortDirection,
                "DRAFT",
                "ARCHIVE",
                "REFINEMENT",
                "INITIAL",
                pageable);

        List<PatientCaseProjection> detailsList = patientPage.getContent();

        List<Long> patientIds = new ArrayList<>();
        for (PatientCaseProjection patientCaseProjection : detailsList) {
            patientIds.add(patientCaseProjection.getPatientId());
        }

        List<PatientListResponseV2.PatientSummaryDTO> patientDTOs = new ArrayList<>();
        if (!patientIds.isEmpty()) {
            List<PatientListSummaryV2> summaries = pdoRepository.findPatientSummariesByIds(patientIds);

            Map<Long, PatientListSummaryV2> summaryMap =
                    summaries.stream().collect(Collectors.toMap(PatientListSummaryV2::getPatientId, s -> s));

            patientDTOs = patientIds.stream()
                    .map(summaryMap::get)
                    .filter(Objects::nonNull)
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }

        int totalPages = (int) Math.ceil((double) patientPage.getTotalElements() / request.getPageSize());
        PaginationDetails pagination = PaginationDetails.builder()
                .pageNumber(request.getPageNumber())
                .pageSize(request.getPageSize())
                .totalPatients((int) patientPage.getTotalElements())
                .totalPages(totalPages)
                .hasNext(request.getPageNumber() < totalPages - 1)
                .hasPrevious(request.getPageNumber() > 0)
                .build();

        return PatientListResponseV2.builder()
                .patients(patientDTOs)
                .pagination(pagination)
                .build();
    }

    private List<String> getOrderStatusesForFilter(OrderStatus orderStatus) {
        if (orderStatus == null) {
            return List.of();
        }

        return switch (orderStatus) {
            case IN_PROGRESS -> List.of(OrderStatus.IN_PROGRESS.name(), OrderStatus.ORDERED.name());
            case APPROVED -> List.of(
                    OrderStatus.APPROVED.name(),
                    OrderStatus.STL_FILES_REQUESTED.name(),
                    OrderStatus.STL_FILES_UPLOADED.name());
            default -> List.of(orderStatus.name());
        };
    }

    private PatientListResponseV2.PatientSummaryDTO mapToDTO(PatientListSummaryV2 summary) {
        String initials = generateInitials(summary.getFirstName(), summary.getLastName());
        NextAction nextAction = determineNextAction(summary.getOrderStatus());
        Integer currentStep = determineCurrentStep(summary.getOrderStatus());

        return PatientListResponseV2.PatientSummaryDTO.builder()
                .patientId(summary.getPatientId())
                .fullName(summary.getFullName())
                .initials(initials)
                .profileImageId(summary.getProfileImageId())
                .profilePictureUrl(summary.getProfilePictureUrl())
                .email(summary.getEmail())
                .mobileNo(summary.getMobileNo())
                .customerMappedId(summary.getCustomerMappedId())
                .practiceLocationName(summary.getPracticeLocationName())
                .practiceLocationId(summary.getPracticeLocationId())
                .productName(summary.getProductName())
                .caseType(summary.getCaseType())
                .orderStatus(summary.getOrderStatus() != null ? mapOrderStatus(summary.getOrderStatus()) : "DRAFT")
                .nextAction(nextAction != null ? nextAction.getMessage() : null)
                .currentStep(currentStep)
                .lastUpdated(summary.getLastUpdated() != null ? summary.getLastUpdated() : null)
                .build();
    }

    private String mapOrderStatus(OrderStatus status) {
        return switch (status) {
            case STL_FILES_REQUESTED, STL_FILES_UPLOADED -> OrderStatus.APPROVED.name();
            case ORDERED -> OrderStatus.IN_PROGRESS.name();
            default -> status.toString();
        };
    }

    private String generateInitials(String firstName, String lastName) {
        StringBuilder initials = new StringBuilder();
        if (firstName != null && !firstName.isEmpty()) initials.append(firstName.charAt(0));
        if (lastName != null && !lastName.isEmpty()) initials.append(lastName.charAt(0));
        return initials.toString().toUpperCase();
    }

    private NextAction determineNextAction(OrderStatus orderStatus) {
        if (orderStatus == null) return NextAction.CREATE_ORDER;
        return switch (orderStatus) {
            case DRAFT -> NextAction.SEND_ORDER;
            case ORDERED -> NextAction.WAITING_FOR_TREATMENT_PLAN;
            case IN_REVIEW -> NextAction.APPROVE_PLAN;
            case APPROVED -> NextAction.REQUEST_STL_FILES;
            case STL_FILES_REQUESTED -> NextAction.WAITING_FOR_STL_FILES;
            case STL_FILES_UPLOADED -> NextAction.COMPLETE_ORDER;
            case RE_PLAN -> NextAction.RE_PLAN;
            default -> null;
        };
    }

    private Integer determineCurrentStep(OrderStatus orderStatus) {
        if (orderStatus == null) return 1;
        return switch (orderStatus) {
            case DRAFT, ORDERED -> 2;
            case IN_REVIEW, APPROVED, STL_FILES_REQUESTED, STL_FILES_UPLOADED -> 3;
            case COMPLETED -> 4;
            default -> 1;
        };
    }
}
