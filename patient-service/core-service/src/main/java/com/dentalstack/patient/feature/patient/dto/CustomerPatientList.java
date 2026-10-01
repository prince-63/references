package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CustomerPatientList {
    private List<CustomerPatientDetailResponse> patientDetails;
    private PaginationDetails paginationDetails;
}
