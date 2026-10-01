package com.dentalstack.patient.feature.rewards.dto.response;

import com.dentalstack.patient.feature.rewards.dto.summary.RewardOrderSummary;
import com.dentalstack.patient.feature.rewards.enums.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RewardOrderResponseV2 {
    private String orderNumber;
    private String patientName;
    private Long patientId;
    private String uuid;
    private String patientCustomerMappedId;
    private String patientEmail;
    private String profilePictureUrl;
    private Long profilePictureId;
    private String productName;
    private BigDecimal coinValue;
    private LocalDateTime orderDate;
    private OrderStatus status;
    private Long rewardOrderId;

    public static RewardOrderResponseV2 mapSummaryToResponse(RewardOrderSummary summary) {
        return RewardOrderResponseV2.builder()
                .orderNumber(summary.getOrderNumber())
                .patientName(summary.getFirstName() + " " + summary.getLastName())
                .patientId(summary.getPatientId())
                .uuid(summary.getUuid())
                .patientCustomerMappedId(summary.getCustomerMappedId())
                .patientEmail(summary.getEmail())
                .profilePictureUrl(summary.getProfilePictureUrl())
                .profilePictureId(summary.getProfilePictureId())
                .productName(summary.getProductName())
                .coinValue(summary.getCoinValue())
                .orderDate(summary.getOrderDate())
                .status(OrderStatus.valueOf(summary.getStatus()))
                .rewardOrderId(summary.getRewardOrderId())
                .build();
    }
}
