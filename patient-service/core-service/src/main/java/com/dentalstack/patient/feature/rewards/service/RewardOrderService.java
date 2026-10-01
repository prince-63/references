package com.dentalstack.patient.feature.rewards.service;

import com.dentalstack.patient.feature.rewards.dto.request.*;
import com.dentalstack.patient.feature.rewards.dto.response.PatientRewardDashboardForDoctorResponse;
import com.dentalstack.patient.feature.rewards.dto.response.RewardOrderListResponseV2;
import com.dentalstack.patient.feature.rewards.dto.response.RewardOrderResponse;
import jakarta.validation.Valid;

public interface RewardOrderService {
    RewardOrderResponse approveOrder(@Valid ApproveOrderRequest request);

    RewardOrderResponse rejectOrder(@Valid RejectOrderRequest request);

    RewardOrderResponse fulfillOrder(@Valid FulfillOrderRequest request);

    RewardOrderListResponseV2 getOrdersForDoctor(GetAllRewardOrdersRequest request);

    PatientRewardDashboardForDoctorResponse getPatientRewardDashboardForDoctor(
            @Valid PatientRewardDashboardRequest request);
}
