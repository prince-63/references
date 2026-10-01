package com.dentalstack.patient.feature.rewards.dto.response;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RewardOrderListResponse {
    private List<RewardOrderResponse> orders;
    private Integer totalCount;
    private Integer currentPage;
    private Integer totalPages;
}
