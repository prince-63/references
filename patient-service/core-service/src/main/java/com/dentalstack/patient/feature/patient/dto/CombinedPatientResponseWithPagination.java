package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import com.dentalstack.patient.global.dto.pagination.PatientListCount;
import java.util.Collections;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CombinedPatientResponseWithPagination {
    private List<CombinedPatientDetails> patients;
    private PatientListCount listCount;
    private PatientListCount practiceListCount;
    private PatientListCount customerListCount;
    private PaginationDetails paginationDetails;

    public static CombinedPatientResponseWithPagination from(
            List<CombinedPatientDetails> allPatientDetails,
            int page,
            int size,
            PatientListCount listCount,
            PatientListCount listCountForPractice,
            PatientListCount listCountForCustomer) {

        int totalElements = allPatientDetails.size();
        int fromIndex = (page - 1) * size;

        if (fromIndex >= totalElements) {
            return CombinedPatientResponseWithPagination.builder()
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
                    .practiceListCount(listCountForPractice)
                    .customerListCount(listCountForCustomer)
                    .build();
        }

        int toIndex = Math.min(fromIndex + size, totalElements);
        List<CombinedPatientDetails> paginatedPatientDetails = allPatientDetails.subList(fromIndex, toIndex);

        PaginationDetails paginationDetails = PaginationDetails.builder()
                .pageNumber(page)
                .pageSize(size)
                .totalPatients(totalElements)
                .totalPages((int) Math.ceil((double) totalElements / size))
                .hasNext(toIndex < totalElements)
                .hasPrevious(page > 0)
                .build();

        return CombinedPatientResponseWithPagination.builder()
                .patients(paginatedPatientDetails)
                .paginationDetails(paginationDetails)
                .listCount(listCount)
                .practiceListCount(listCountForPractice)
                .customerListCount(listCountForCustomer)
                .build();
    }
}
