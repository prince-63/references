package com.dentalstack.patient.feature.rewards.service;

import com.dentalstack.patient.feature.rewards.dto.request.CancelOrderRequest;
import com.dentalstack.patient.feature.rewards.dto.request.PlaceOrderRequest;
import com.dentalstack.patient.feature.rewards.dto.response.PatientRewardsActivityRequest;
import com.dentalstack.patient.feature.rewards.dto.response.PatientRewardsActivityResponse;
import com.dentalstack.patient.feature.rewards.dto.response.RewardOrderListResponse;
import com.dentalstack.patient.feature.rewards.dto.response.RewardOrderResponse;
import jakarta.validation.Valid;
import org.springframework.transaction.annotation.Transactional;

public interface PatientOrderService {

    @Transactional
    RewardOrderResponse placeOrder(PlaceOrderRequest request);

    @Transactional(readOnly = true)
    RewardOrderListResponse getPatientOrders(Long patientId, String status, int page, int size);

    @Transactional(readOnly = true)
    RewardOrderResponse getOrderDetails(Long patientId, Long orderId);

    @Transactional
    RewardOrderResponse cancelOrder(CancelOrderRequest request);

    PatientRewardsActivityResponse getPatientOrderAndPromotionsClaim(@Valid PatientRewardsActivityRequest request);
}
