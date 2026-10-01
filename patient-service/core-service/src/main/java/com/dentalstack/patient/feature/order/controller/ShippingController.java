package com.dentalstack.patient.feature.order.controller;

import com.dentalstack.patient.feature.order.dto.CreateShippingDetailsRequest;
import com.dentalstack.patient.feature.order.dto.ShippingDetailsResponse;
import com.dentalstack.patient.feature.order.dto.UpdateShippingDetailsRequest;
import com.dentalstack.patient.feature.order.service.ShippingDetailsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Shipping api", description = "Shipping APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/shipping/v1")
@Slf4j
public class ShippingController {

    private final ShippingDetailsService shippingDetailsService;

    @Operation(summary = "Create shipping details", description = "Create new shipping details for a profile")
    @PostMapping("/create")
    public ResponseEntity<ShippingDetailsResponse> createShippingDetails(
            @Valid @RequestBody CreateShippingDetailsRequest request) {
        ShippingDetailsResponse response = shippingDetailsService.createShippingDetails(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Update shipping details", description = "Update existing shipping details")
    @PutMapping("/{shippingId}")
    public ResponseEntity<ShippingDetailsResponse> updateShippingDetails(
            @Valid @RequestBody UpdateShippingDetailsRequest request) {
        ShippingDetailsResponse response = shippingDetailsService.updateShippingDetails(request);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Make shipping details default",
            description = "Set a shipping address as default for the profile")
    @PatchMapping("/{shippingId}/make-default")
    public ResponseEntity<ShippingDetailsResponse> makeShippingDetailsDefault(
            @Parameter(description = "Shipping details ID") @PathVariable Long shippingId,
            @Parameter(description = "Customer Profile ID (optional)") @RequestParam(required = false)
                    Long customerProfileId) {
        log.info("Making shipping details default with ID: {}, customerProfileId: {}", shippingId, customerProfileId);
        ShippingDetailsResponse response =
                shippingDetailsService.makeShippingDetailsDefault(shippingId, customerProfileId);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get default shipping details by profile",
            description = "Get default shipping details for a profile")
    @GetMapping("/get-default/{profileId}")
    public ResponseEntity<ShippingDetailsResponse> getDefaultShipping(
            @Parameter(description = "Profile ID") @PathVariable Long profileId,
            @Parameter(description = "Customer Profile ID (optional)") @RequestParam(required = false)
                    Long customerProfileId) {
        ShippingDetailsResponse response = shippingDetailsService.getDefaultShipping(profileId, customerProfileId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get shipping details by ID", description = "Get specific shipping details by ID")
    @GetMapping("/{shippingId}")
    public ResponseEntity<ShippingDetailsResponse> getShippingDetailsById(
            @Parameter(description = "Shipping details ID") @PathVariable Long shippingId) {
        log.info("Getting shipping details with ID: {}", shippingId);
        ShippingDetailsResponse response = shippingDetailsService.getShippingDetailsById(shippingId);
        return ResponseEntity.ok(response);
    }
}
