package com.dentalstack.patient.feature.vsp.controller;

import com.dentalstack.patient.feature.vsp.dto.request.*;
import com.dentalstack.patient.feature.vsp.dto.response.VspProductionResponse;
import com.dentalstack.patient.feature.vsp.service.VspProductionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "VSP Production", description = "VSP Production Management APIs")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/vsp/production")
public class VspProductionController {

    private final VspProductionService vspProductionService;

    @PostMapping
    @Operation(summary = "Create a new VSP production order")
    public ResponseEntity<VspProductionResponse> createProduction(
            @Valid @RequestBody CreateVspProductionRequest request) {
        return ResponseEntity.ok(vspProductionService.createProduction(request));
    }

    @GetMapping("/{productionId}")
    @Operation(summary = "Get VSP production by production ID")
    public ResponseEntity<VspProductionResponse> getProduction(@PathVariable String productionId) {
        return ResponseEntity.ok(vspProductionService.getProduction(productionId));
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get VSP production by VSP order ID")
    public ResponseEntity<VspProductionResponse> getProductionByOrderId(@PathVariable String orderId) {
        return ResponseEntity.ok(vspProductionService.getProductionByOrderId(orderId));
    }

    @PutMapping
    @Operation(summary = "Update VSP production details (items, notes, STL files)")
    public ResponseEntity<VspProductionResponse> updateProduction(
            @Valid @RequestBody UpdateVspProductionRequest request) {
        return ResponseEntity.ok(vspProductionService.updateProduction(request));
    }

    @PatchMapping("/status")
    @Operation(summary = "Update VSP production status")
    public ResponseEntity<VspProductionResponse> updateProductionStatus(
            @Valid @RequestBody UpdateVspProductionStatusRequest request) {
        return ResponseEntity.ok(vspProductionService.updateProductionStatus(request));
    }

    @PostMapping("/shipping")
    @Operation(summary = "Add shipping details to a VSP production order")
    public ResponseEntity<VspProductionResponse> addShippingDetails(
            @Valid @RequestBody AddVspProductionShippingRequest request) {
        return ResponseEntity.ok(vspProductionService.addShippingDetails(request));
    }

    @PutMapping("/shipping")
    @Operation(summary = "Update shipping details of a VSP production order")
    public ResponseEntity<VspProductionResponse> updateShippingDetails(
            @Valid @RequestBody AddVspProductionShippingRequest request) {
        return ResponseEntity.ok(vspProductionService.updateShippingDetails(request));
    }
}
