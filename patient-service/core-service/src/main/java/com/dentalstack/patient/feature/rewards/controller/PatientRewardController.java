package com.dentalstack.patient.feature.rewards.controller;

import com.dentalstack.patient.feature.rewards.dto.request.*;
import com.dentalstack.patient.feature.rewards.dto.response.*;
import com.dentalstack.patient.feature.rewards.service.PatientOrderService;
import com.dentalstack.patient.feature.rewards.service.PatientRewardProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patient/v1/patient/rewards")
@RequiredArgsConstructor
public class PatientRewardController {

    private final PatientRewardProductService productService;
    private final PatientOrderService orderService;

    @GetMapping("/products")
    public ResponseEntity<PatientProductListResponse> getAvailableProducts(
            @RequestHeader("patientId") Long patientId, @RequestParam(required = false) String category) {
        PatientProductListResponse response = productService.getAvailableProducts(patientId, category);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<PatientProductResponse> getProductDetails(
            @RequestHeader("patientId") Long patientId, @PathVariable Long productId) {
        PatientProductResponse response = productService.getProductDetails(patientId, productId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/orders")
    public ResponseEntity<RewardOrderResponse> placeOrder(@Valid @RequestBody PlaceOrderRequest request) {
        RewardOrderResponse response = orderService.placeOrder(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/orders")
    public ResponseEntity<RewardOrderListResponse> getMyOrders(
            @RequestHeader("patientId") Long patientId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        RewardOrderListResponse response = orderService.getPatientOrders(patientId, status, page, size);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/orders-and-claims")
    public ResponseEntity<PatientRewardsActivityResponse> getPatientOrderAndPromotionsClaim(
            @Valid @RequestBody PatientRewardsActivityRequest request) {
        PatientRewardsActivityResponse response = orderService.getPatientOrderAndPromotionsClaim(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<RewardOrderResponse> getOrderDetails(
            @RequestHeader("patientId") Long patientId, @PathVariable Long orderId) {
        RewardOrderResponse response = orderService.getOrderDetails(patientId, orderId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/order/cancel")
    public ResponseEntity<RewardOrderResponse> cancelOrder(@Valid @RequestBody CancelOrderRequest request) {
        RewardOrderResponse response = orderService.cancelOrder(request);
        return ResponseEntity.ok(response);
    }
}
