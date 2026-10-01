package com.dentalstack.patient.feature.vsp.controller;

import com.dentalstack.patient.feature.vsp.dto.request.CreateVspShippingDetailsRequest;
import com.dentalstack.patient.feature.vsp.dto.request.UpdateVspShippingDetailsRequest;
import com.dentalstack.patient.feature.vsp.dto.response.VspShippingDetailsResponse;
import com.dentalstack.patient.feature.vsp.service.VspShippingDetailsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "VSP Shipping Details", description = "VSP shipping details APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/vsp/v1/shipping")
@Slf4j
public class VspShippingDetailsController {

    private final VspShippingDetailsService vspShippingDetailsService;

    @Operation(summary = "Create shipping details")
    @PostMapping("/create")
    public ResponseEntity<VspShippingDetailsResponse> createShippingDetails(
            @RequestBody CreateVspShippingDetailsRequest request) {
        log.info("Creating VSP shipping details for profile: {}", request.getProfileId());
        VspShippingDetailsResponse response = vspShippingDetailsService.createShippingDetails(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Update shipping details")
    @PutMapping
    public ResponseEntity<VspShippingDetailsResponse> updateShippingDetails(
            @RequestBody UpdateVspShippingDetailsRequest request) {
        log.info("Updating VSP shipping details with ID: {}", request.getShippingId());
        VspShippingDetailsResponse response = vspShippingDetailsService.updateShippingDetails(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get default shipping details")
    @GetMapping("/default")
    public ResponseEntity<VspShippingDetailsResponse> getDefaultShippingDetails(
            @RequestParam Long profileId, @RequestParam(required = false) Long customerProfileId) {
        log.info("Getting default VSP shipping details for profile: {}", profileId);
        VspShippingDetailsResponse response;
        if (customerProfileId != null) {
            response = vspShippingDetailsService.getDefaultShippingDetails(profileId, customerProfileId);
        } else {
            response = vspShippingDetailsService.getDefaultShippingDetails(profileId);
        }
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get shipping details by ID")
    @GetMapping("/{shippingId}")
    public ResponseEntity<VspShippingDetailsResponse> getShippingDetailsById(@PathVariable String shippingId) {
        log.info("Getting VSP shipping details with ID: {}", shippingId);
        VspShippingDetailsResponse response = vspShippingDetailsService.getShippingDetailsById(shippingId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get all shipping details by profile")
    @GetMapping("/profile/{profileId}")
    public ResponseEntity<List<VspShippingDetailsResponse>> getShippingDetailsByProfile(@PathVariable Long profileId) {
        log.info("Getting all VSP shipping details for profile: {}", profileId);
        List<VspShippingDetailsResponse> response = vspShippingDetailsService.getShippingDetailsByProfile(profileId);
        return ResponseEntity.ok(response);
    }
}
