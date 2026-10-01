package com.dentalstack.patient.feature.rewards.dto.response;

import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import java.util.List;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingPromotionClaimListResponse {
    private List<PendingPromotionClaimResponse> claims;
    private Integer totalCount;
    private PaginationDetails paginationDetails;
}
