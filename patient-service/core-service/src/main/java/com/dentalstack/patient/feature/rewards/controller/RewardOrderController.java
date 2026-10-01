package com.dentalstack.patient.feature.rewards.controller;

import com.dentalstack.patient.feature.rewards.dto.request.*;
import com.dentalstack.patient.feature.rewards.dto.response.*;
import com.dentalstack.patient.feature.rewards.service.RewardOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patient/v1/rewards/orders")
@RequiredArgsConstructor
public class RewardOrderController {

    private final RewardOrderService orderService;

    @PostMapping("/all")
    public ResponseEntity<RewardOrderListResponseV2> getAllOrders(
            @Valid @RequestBody GetAllRewardOrdersRequest request) {
        RewardOrderListResponseV2 response = orderService.getOrdersForDoctor(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/dashboard")
    public ResponseEntity<PatientRewardDashboardForDoctorResponse> getPatientRewardDashboardForDoctor(
            @Valid @RequestBody PatientRewardDashboardRequest request) {
        PatientRewardDashboardForDoctorResponse response = orderService.getPatientRewardDashboardForDoctor(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/approve")
    public ResponseEntity<RewardOrderResponse> approveOrder(@Valid @RequestBody ApproveOrderRequest request) {
        RewardOrderResponse response = orderService.approveOrder(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reject")
    public ResponseEntity<RewardOrderResponse> rejectOrder(@Valid @RequestBody RejectOrderRequest request) {
        RewardOrderResponse response = orderService.rejectOrder(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/fulfill")
    public ResponseEntity<RewardOrderResponse> fulfillOrder(@Valid @RequestBody FulfillOrderRequest request) {
        RewardOrderResponse response = orderService.fulfillOrder(request);
        return ResponseEntity.ok(response);
    }
}
