package com.dentalstack.patient.feature.aligner.dto.analytics;

import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlignerPatientAnalyticsDetailsResponse {

    private List<AlignerPatientAnalyticsDetails> patientAnalyticsDetails;
    private PaginationDetails paginationDetails;
}
