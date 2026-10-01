package com.dentalstack.patient.feature.order.controller.v2;

import com.dentalstack.patient.feature.order.dto.*;
import com.dentalstack.patient.feature.order.dto.v2.CloneOrderRequestV2;
import com.dentalstack.patient.feature.order.dto.v2.CreateOrderRequestV2;
import com.dentalstack.patient.feature.order.dto.v2.MinimumOrderDetailResponse;
import com.dentalstack.patient.feature.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Order APIs", description = "Order APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/order/v2")
@Slf4j
public class OrderControllerV2 {
    private final OrderService orderService;

    @PostMapping("/enterprise-dashboard")
    public ResponseEntity<EnterpriseDashboardOrdersResponse> getEnterpriseDashboard(
            @Valid @RequestBody BaseRequest request) {
        return ResponseEntity.ok(orderService.getEnterpriseOrderDashboardResponse(request));
    }

    @PostMapping("/patients-order-detail")
    @Operation(summary = "Get the filtered orders")
    public ResponseEntity<List<PatientOrderDetails>> getFilteredOrders(
            @Valid @RequestBody PatientOrderRequest request) {
        return ResponseEntity.ok(orderService.getPatientOrderDetails(request));
    }

    @PostMapping("/customer-order-detail")
    @Operation(summary = "Get the filtered orders")
    public ResponseEntity<PatientOrderDetailsWithPagination> getCustomerOrders(
            @Valid @RequestBody PatientOrderRequest request) {
        return ResponseEntity.ok(orderService.getOrderDetailsWithPagination(request));
    }

    @PostMapping
    public ResponseEntity<CreateOrderResponse> createOrder(@RequestBody CreateOrderRequestV2 orderRequest) {
        return ResponseEntity.ok(orderService.createOrderV2(orderRequest));
    }

    @GetMapping("/orders-list/{patientId}")
    public ResponseEntity<MinimumOrderDetailResponse> getMinimumOrderDetails(@PathVariable Long patientId) {
        return ResponseEntity.ok(orderService.getMinimumOrderDetails(patientId));
    }

    @PostMapping("/clone-order")
    @Operation(summary = "Clone order")
    public ResponseEntity<ClonedOrderResponse> cloneOrder(@Valid @RequestBody CloneOrderRequestV2 request) {
        return ResponseEntity.ok(orderService.cloneOrderV2(request));
    }
}
