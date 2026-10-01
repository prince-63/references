package com.dentalstack.patient.feature.rewards.dto.response;

import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RewardOrderListResponseV2 {
    private List<RewardOrderResponseV2> orders;
    private PaginationDetails paginationDetails;
}
