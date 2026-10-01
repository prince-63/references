package com.dentalstack.patient.feature.order.controller;

import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.order.dto.*;
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
@RequestMapping("/patient/order/v1")
@Slf4j
public class OrderController {
    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<CreateOrderResponse> createOrder(@RequestBody CreateOrderRequest orderRequest) {
        return ResponseEntity.ok(orderService.createOrder(orderRequest));
    }

    @PutMapping
    public void updateOrder(@RequestBody UpdateOrderRequest updateOrderRequest) {
        orderService.updateOrder(updateOrderRequest);
    }

    @PutMapping("/update-to-cancelled-or-need-more-info")
    public ResponseEntity<OrderResponse> updateToCancelledOrNeedMoreInfo(
            @RequestBody UpdateToCancelledOrNeedMoreInfoRequest request) {
        return ResponseEntity.ok(orderService.updateToCancelledOrNeedMoreInfo(request));
    }

    @PostMapping("/get-order")
    public ResponseEntity<OrderResponse> getOrder(@Valid @RequestBody OrderRequest orderRequest) {
        return ResponseEntity.ok(orderService.getOrder(orderRequest));
    }

    @PostMapping("/patients-order-detail")
    @Operation(summary = "Get the filtered orders")
    public ResponseEntity<FilteredOrderDetails> getFilteredOrders(@Valid @RequestBody FilteredOrderRequest request) {
        return ResponseEntity.ok(orderService.getFilteredOrdersV2(request));
    }

    @GetMapping("/orders-count")
    @Operation(summary = "Get data for dashboard")
    public ResponseEntity<OrdersCountResponse> getOrdersCount(
            @RequestParam(value = "doctorId") Long doctorId,
            @RequestParam(value = "organizationId") Long organizationId,
            @RequestParam(value = "profileId") Long profileId) {
        return ResponseEntity.ok(orderService.getOrdersCount(doctorId, organizationId, profileId));
    }

    @PostMapping("/add-timeline-comments")
    @Operation(summary = "Add comments to the timeline")
    public void addComments(@Valid @RequestBody OrderCommentsDTO orderCommentsDTO) {
        orderService.addComments(orderCommentsDTO);
    }

    @PostMapping("/clone-order")
    @Operation(summary = "Clone order")
    public ResponseEntity<ClonedOrderResponse> cloneOrder(@Valid @RequestBody CloneOrderRequest request) {
        return ResponseEntity.ok(orderService.cloneOrder(request));
    }

    @GetMapping("/get-timeline-comments")
    @Operation(summary = "Get comments for the timeline")
    public ResponseEntity<List<OrderCommentsResponse>> getComments(@RequestParam(value = "order_id") String orderId) {
        return ResponseEntity.ok(orderService.getAllComments(orderId));
    }

    @GetMapping("/users/orders-count")
    @Operation(summary = "Get user orders count")
    public ResponseEntity<UserOrdersCountResponseWithPagination> getUserOrdersCount(
            @RequestParam(value = "doctorId") Long doctorId,
            @RequestParam(value = "organizationId") Long organizationId,
            @RequestParam(value = "profileId") Long profileId,
            @RequestParam(value = "pageNumber", defaultValue = "0") int pageNumber,
            @RequestParam(value = "pageSize", defaultValue = "10") int pageSize,
            @RequestParam(value = "filterByRole", required = false) DoctorRole filterByRole) {
        return ResponseEntity.ok(orderService.getUserOrdersCountWithPagination(
                doctorId, organizationId, profileId, pageNumber, pageSize, filterByRole));
    }

    @PostMapping("/dismiss-zip-file")
    @Operation(summary = "Dismiss zip file")
    public void dismissZipFile(@Valid @RequestBody OrderDismissZipFile request) {
        orderService.dismissZipFile(request.getOrderId());
    }
}
