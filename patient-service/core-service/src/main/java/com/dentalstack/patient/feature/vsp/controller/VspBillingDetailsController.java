package com.dentalstack.patient.feature.vsp.controller;

import com.dentalstack.patient.feature.vsp.dto.request.CreateVspBillingDetailsRequest;
import com.dentalstack.patient.feature.vsp.dto.request.UpdateVspBillingDetailsRequest;
import com.dentalstack.patient.feature.vsp.dto.response.VspBillingDetailsResponse;
import com.dentalstack.patient.feature.vsp.service.VspBillingDetailsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "VSP Billing Details", description = "VSP billing details APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/vsp/v1/billing")
@Slf4j
public class VspBillingDetailsController {

    private final VspBillingDetailsService vspBillingDetailsService;

    @Operation(summary = "Create billing details")
    @PostMapping("/create")
    public ResponseEntity<VspBillingDetailsResponse> createBillingDetails(
            @RequestBody CreateVspBillingDetailsRequest request) {
        log.info("Creating VSP billing details for profile: {}", request.getProfileId());
        VspBillingDetailsResponse response = vspBillingDetailsService.createBillingDetails(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Update billing details")
    @PutMapping
    public ResponseEntity<VspBillingDetailsResponse> updateBillingDetails(
            @RequestBody UpdateVspBillingDetailsRequest request) {
        log.info("Updating VSP billing details with ID: {}", request.getBillingId());
        VspBillingDetailsResponse response = vspBillingDetailsService.updateBillingDetails(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get default billing details")
    @GetMapping("/default")
    public ResponseEntity<VspBillingDetailsResponse> getDefaultBillingDetails(
            @RequestParam Long profileId, @RequestParam(required = false) Long customerProfileId) {
        log.info("Getting default VSP billing details for profile: {}", profileId);
        VspBillingDetailsResponse response;
        if (customerProfileId != null) {
            response = vspBillingDetailsService.getDefaultBillingDetails(profileId, customerProfileId);
        } else {
            response = vspBillingDetailsService.getDefaultBillingDetails(profileId);
        }
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get billing details by ID")
    @GetMapping("/{billingId}")
    public ResponseEntity<VspBillingDetailsResponse> getBillingDetailsById(@PathVariable String billingId) {
        log.info("Getting VSP billing details with ID: {}", billingId);
        VspBillingDetailsResponse response = vspBillingDetailsService.getBillingDetailsById(billingId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get all billing details by profile")
    @GetMapping("/profile/{profileId}")
    public ResponseEntity<List<VspBillingDetailsResponse>> getBillingDetailsByProfile(@PathVariable Long profileId) {
        log.info("Getting all VSP billing details for profile: {}", profileId);
        List<VspBillingDetailsResponse> response = vspBillingDetailsService.getBillingDetailsByProfile(profileId);
        return ResponseEntity.ok(response);
    }
}
