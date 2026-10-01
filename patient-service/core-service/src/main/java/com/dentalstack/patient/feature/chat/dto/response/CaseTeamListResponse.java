package com.dentalstack.patient.feature.chat.dto.response;

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
public class CaseTeamListResponse {

    private List<CaseTeamResponse> teams;
    private PaginationDetails paginationDetails;
}
