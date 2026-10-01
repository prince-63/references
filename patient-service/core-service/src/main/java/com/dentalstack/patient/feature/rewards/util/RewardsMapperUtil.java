package com.dentalstack.patient.feature.rewards.util;

import com.dentalstack.patient.feature.rewards.dto.response.OrderItemResponse;
import com.dentalstack.patient.feature.rewards.dto.response.OrderMetadataResponse;
import com.dentalstack.patient.feature.rewards.dto.response.PendingPromotionClaimResponse;
import com.dentalstack.patient.feature.rewards.dto.response.RewardOrderResponse;
import com.dentalstack.patient.feature.rewards.entity.PatientPromotionRedemption;
import com.dentalstack.patient.feature.rewards.entity.PromotionConfig;
import com.dentalstack.patient.feature.rewards.entity.RewardOrder;
import com.dentalstack.patient.feature.rewards.entity.RewardOrderItem;
import java.util.List;
import java.util.stream.Collectors;

public final class RewardsMapperUtil {

    private RewardsMapperUtil() {}

    public static RewardOrderResponse mapToOrderResponse(RewardOrder order) {
        List<OrderItemResponse> items = order.getOrderItems().stream()
                .map(RewardsMapperUtil::mapToOrderItemResponse)
                .collect(Collectors.toList());

        OrderMetadataResponse metadataResponse = null;
        if (order.getMetadata() != null) {
            metadataResponse = OrderMetadataResponse.builder()
                    .shippingAddress(order.getMetadata().getShippingAddress())
                    .city(order.getMetadata().getCity())
                    .state(order.getMetadata().getState())
                    .zipCode(order.getMetadata().getZipCode())
                    .country(order.getMetadata().getCountry())
                    .phoneNumber(order.getMetadata().getPhoneNumber())
                    .trackingNumber(order.getMetadata().getTrackingNumber())
                    .courierService(order.getMetadata().getCourierService())
                    .build();
        }

        return RewardOrderResponse.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .totalCoins(order.getTotalCoins())
                .status(order.getStatus())
                .items(items)
                .createdAt(order.getCreatedAt())
                .approvedAt(order.getApprovedAt())
                .fulfilledAt(order.getFulfilledAt())
                .cancelledAt(order.getCancelledAt())
                .cancellationReason(order.getCancellationReason())
                .adminNotes(order.getAdminNotes())
                .metadata(metadataResponse)
                .build();
    }

    public static PendingPromotionClaimResponse mapToPendingClaimResponse(PatientPromotionRedemption redemption) {
        PromotionConfig promotion = redemption.getPromotionConfig();

        return PendingPromotionClaimResponse.builder()
                .redemptionId(redemption.getId())
                .promotionId(promotion.getId())
                .promotionName(promotion.getPromotionName())
                .promotionDescription(promotion.getPromotionDescription())
                .promotionType(promotion.getPromotionType())
                .coinsReceived(redemption.getCoinsReceived())
                .status(redemption.getStatus())
                .redeemedAt(redemption.getRedeemedAt())
                .referredPatientName(redemption.getReferredPatientName())
                .referredPatientPhone(redemption.getReferredPatientPhone())
                .referredPatientEmail(redemption.getReferredPatientEmail())
                .referredPatientId(redemption.getReferredPatientId())
                .verificationNotes(redemption.getVerificationNotes())
                .rejectionReason(redemption.getRejectionReason())
                .build();
    }

    private static OrderItemResponse mapToOrderItemResponse(RewardOrderItem item) {
        return OrderItemResponse.builder()
                .itemId(item.getId())
                .productName(item.getProductSnapshotName())
                .productImageUrl(item.getProductSnapshotImageUrl())
                .quantity(item.getQuantity())
                .coinCostPerUnit(item.getCoinCostPerUnit())
                .totalCoins(item.getTotalCoins())
                .build();
    }
}
