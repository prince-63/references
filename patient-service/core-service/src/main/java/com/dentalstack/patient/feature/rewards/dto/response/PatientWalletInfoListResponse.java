package com.dentalstack.patient.feature.rewards.dto.response;

import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PatientWalletInfoListResponse {
    private List<PatientWalletInfoResponse> patients;
    private PaginationDetails paginationDetails;
}
