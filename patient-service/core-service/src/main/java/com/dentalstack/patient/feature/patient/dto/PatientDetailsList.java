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
public class PatientDetailsList {
    private List<PatientDetailResponse> patientDetails;
    private PatientCountResponse patientCountResponse;
    private PaginationDetails paginationDetails;
}
