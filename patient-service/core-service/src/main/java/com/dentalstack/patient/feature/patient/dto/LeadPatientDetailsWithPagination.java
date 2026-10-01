package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import com.dentalstack.patient.global.dto.pagination.PatientListCount;
import java.util.Collections;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LeadPatientDetailsWithPagination {

    private List<LeadPatientDetails> patients;
    private PaginationDetails paginationDetails;
    private PatientListCount listCount;

    public static LeadPatientDetailsWithPagination from(
            List<LeadPatientDetails> allPatientDetails, int page, int size, PatientListCount listCount) {

        int totalElements = allPatientDetails.size();
        int fromIndex = (page - 1) * size;

        if (fromIndex >= totalElements) {
            return LeadPatientDetailsWithPagination.builder()
                    .patients(Collections.emptyList())
                    .paginationDetails(PaginationDetails.builder()
                            .pageNumber(page)
                            .pageSize(size)
                            .totalPatients(totalElements)
                            .totalPages((int) Math.ceil((double) totalElements / size))
                            .hasNext(false)
                            .hasPrevious(page > 1)
                            .build())
                    .listCount(listCount)
                    .build();
        }

        int toIndex = Math.min(fromIndex + size, totalElements);

        List<LeadPatientDetails> paginatedPatientDetails = allPatientDetails.subList(fromIndex, toIndex);

        PaginationDetails paginationDetails = PaginationDetails.builder()
                .pageNumber(page)
                .pageSize(size)
                .totalPatients(totalElements)
                .totalPages((int) Math.ceil((double) totalElements / size))
                .hasNext(toIndex < totalElements)
                .hasPrevious(page > 0)
                .build();

        return LeadPatientDetailsWithPagination.builder()
                .patients(paginatedPatientDetails)
                .paginationDetails(paginationDetails)
                .listCount(listCount)
                .build();
    }
}
