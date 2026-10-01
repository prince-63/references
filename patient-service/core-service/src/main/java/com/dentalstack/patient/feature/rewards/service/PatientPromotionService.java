package com.dentalstack.patient.feature.rewards.service;

import com.dentalstack.patient.feature.rewards.dto.request.ClaimPromotionRequest;
import com.dentalstack.patient.feature.rewards.dto.request.PatientPromotionClaimRequest;
import com.dentalstack.patient.feature.rewards.dto.request.VerifyPromotionClaimRequest;
import com.dentalstack.patient.feature.rewards.dto.response.PatientPromotionListResponse;
import com.dentalstack.patient.feature.rewards.dto.response.PendingPromotionClaimListResponse;
import com.dentalstack.patient.feature.rewards.dto.response.PromotionClaimResponse;
import com.dentalstack.patient.feature.rewards.enums.PromotionRedemptionStatus;

public interface PatientPromotionService {

    PatientPromotionListResponse getActivePromotions(Long patientId);

    PromotionClaimResponse claimPromotion(Long patientId, ClaimPromotionRequest request);

    PendingPromotionClaimListResponse getPatientPendingClaims(Long patientId, PromotionRedemptionStatus status);

    PendingPromotionClaimListResponse getPendingClaimsForDoctor(PatientPromotionClaimRequest request);

    PromotionClaimResponse verifyPromotionClaim(VerifyPromotionClaimRequest request);
}
