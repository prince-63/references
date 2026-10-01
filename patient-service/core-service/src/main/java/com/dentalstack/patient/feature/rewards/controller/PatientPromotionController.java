package com.dentalstack.patient.feature.rewards.controller;

import com.dentalstack.patient.feature.rewards.dto.request.*;
import com.dentalstack.patient.feature.rewards.dto.response.*;
import com.dentalstack.patient.feature.rewards.enums.PromotionRedemptionStatus;
import com.dentalstack.patient.feature.rewards.service.PatientPromotionService;
import com.dentalstack.patient.feature.rewards.service.PromotionConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patient/v1/rewards/promotions")
@RequiredArgsConstructor
public class PatientPromotionController {

    private final PatientPromotionService promotionService;

    private final PromotionConfigService promotionConfigService;

    @GetMapping("/active")
    public ResponseEntity<PatientPromotionListResponse> getActivePromotions(
            @RequestHeader("patientId") Long patientId) {
        PatientPromotionListResponse response = promotionService.getActivePromotions(patientId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/patient/claim")
    public ResponseEntity<PromotionClaimResponse> claimPromotion(@RequestBody ClaimPromotionRequest request) {
        PromotionClaimResponse response = promotionService.claimPromotion(request.getPatientId(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/claims/{patientId}/all")
    public ResponseEntity<PendingPromotionClaimListResponse> getPatientPendingClaims(
            @PathVariable Long patientId, @RequestParam(required = false) PromotionRedemptionStatus status) {

        PendingPromotionClaimListResponse response = promotionService.getPatientPendingClaims(patientId, status);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/claims")
    public ResponseEntity<PendingPromotionClaimListResponse> getPendingClaimsForDoctor(
            @RequestBody PatientPromotionClaimRequest request) {
        PendingPromotionClaimListResponse response = promotionService.getPendingClaimsForDoctor(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<PromotionClaimResponse> verifyPromotionClaim(
            @RequestBody VerifyPromotionClaimRequest request) {
        PromotionClaimResponse response = promotionService.verifyPromotionClaim(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    public ResponseEntity<PromotionConfigListResponse> getAllPromotions(
            @RequestHeader("userProfileId") Long userProfileId, @RequestParam(required = false) String status) {
        PromotionConfigListResponse response = promotionConfigService.getAllPromotions(userProfileId, status);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/create")
    public ResponseEntity<PromotionConfigResponse> createPromotion(
            @Valid @RequestBody CreatePromotionConfigRequest request) {
        PromotionConfigResponse response = promotionConfigService.createPromotion(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/")
    public ResponseEntity<PromotionConfigResponse> updatePromotion(
            @Valid @RequestBody UpdatePromotionConfigRequest request) {
        PromotionConfigResponse response = promotionConfigService.updatePromotion(request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{promotionId}/end")
    public ResponseEntity<PromotionConfigResponse> endPromotion(
            @RequestHeader("userProfileId") Long userProfileId, @PathVariable Long promotionId) {
        PromotionConfigResponse response = promotionConfigService.endPromotion(userProfileId, promotionId);
        return ResponseEntity.ok(response);
    }
}
