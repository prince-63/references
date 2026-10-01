package com.dentalstack.patient.feature.rewards.dto.response;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PatientRewardDashboardResponse {
    private WalletResponse wallet;
    private PatientTaskListResponse tasks;
    private List<PatientPromotionItem> activePromotions;
    private List<PatientProductResponse> featuredProducts;
    private List<RewardOrderResponse> recentOrders;
}
