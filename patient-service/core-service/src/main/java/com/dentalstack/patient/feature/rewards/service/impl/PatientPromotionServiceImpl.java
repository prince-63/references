package com.dentalstack.patient.feature.rewards.service.impl;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.rewards.dto.request.ClaimPromotionRequest;
import com.dentalstack.patient.feature.rewards.dto.request.PatientPromotionClaimRequest;
import com.dentalstack.patient.feature.rewards.dto.request.VerifyPromotionClaimRequest;
import com.dentalstack.patient.feature.rewards.dto.response.*;
import com.dentalstack.patient.feature.rewards.dto.summary.PendingClaimSummary;
import com.dentalstack.patient.feature.rewards.entity.CoinTransaction;
import com.dentalstack.patient.feature.rewards.entity.PatientPromotionRedemption;
import com.dentalstack.patient.feature.rewards.entity.PromotionConfig;
import com.dentalstack.patient.feature.rewards.entity.UserWallet;
import com.dentalstack.patient.feature.rewards.enums.PromotionRedemptionStatus;
import com.dentalstack.patient.feature.rewards.enums.PromotionStatus;
import com.dentalstack.patient.feature.rewards.enums.PromotionType;
import com.dentalstack.patient.feature.rewards.enums.TransactionType;
import com.dentalstack.patient.feature.rewards.repository.CoinTransactionRepository;
import com.dentalstack.patient.feature.rewards.repository.PatientPromotionRedemptionRepository;
import com.dentalstack.patient.feature.rewards.repository.PromotionConfigRepository;
import com.dentalstack.patient.feature.rewards.repository.UserWalletRepository;
import com.dentalstack.patient.feature.rewards.service.PatientPromotionService;
import com.dentalstack.patient.feature.rewards.util.RewardsMapperUtil;
import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import com.dentalstack.patient.global.exception.GenericException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientPromotionServiceImpl implements PatientPromotionService {

    private final PatientRepository patientRepository;
    private final PromotionConfigRepository promotionConfigRepository;
    private final PatientPromotionRedemptionRepository redemptionRepository;
    private final UserWalletRepository walletRepository;
    private final CoinTransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    @Override
    public PatientPromotionListResponse getActivePromotions(Long patientId) {
        log.info("Fetching active promotions for patientId: {}", patientId);

        Patient patient =
                patientRepository.findById(patientId).orElseThrow(() -> new GenericException("Patient not found"));

        Long userProfileId = patient.getDoctorOrganization().getUserProfile().getId();

        List<PromotionConfig> promotions = promotionConfigRepository.findByUserProfileIdAndStatusAndIsActiveTrue(
                userProfileId, PromotionStatus.ACTIVE);

        LocalDateTime now = LocalDateTime.now();

        List<PatientPromotionItem> promotionItems = promotions.stream()
                .filter(promo -> Optional.ofNullable(promo.getStartDate())
                        .flatMap(start -> Optional.ofNullable(promo.getEndDate())
                                .map(end -> now.isAfter(start) && now.isBefore(end)))
                        .orElse(false))
                .map(promo -> mapToPatientPromotionItem(promo, patient))
                .collect(Collectors.toList());

        return PatientPromotionListResponse.builder().promotions(promotionItems).build();
    }

    @Transactional
    @Override
    public PromotionClaimResponse claimPromotion(Long patientId, ClaimPromotionRequest request) {
        log.info("Patient {} claiming promotion {}", patientId, request.getPromotionId());

        Patient patient =
                patientRepository.findById(patientId).orElseThrow(() -> new GenericException("Patient not found"));

        PromotionConfig promotion = promotionConfigRepository
                .findById(request.getPromotionId())
                .orElseThrow(() -> new GenericException("Promotion not found"));

        LocalDateTime now = LocalDateTime.now();

        if (promotion.getStartDate() != null && promotion.getEndDate() != null) {
            if (now.isBefore(promotion.getStartDate()) || now.isAfter(promotion.getEndDate())) {
                throw new RuntimeException("Promotion is not currently valid");
            }
        }

        Long patientUserProfileId =
                patient.getDoctorOrganization().getUserProfile().getId();
        if (!promotion.getUserProfile().getId().equals(patientUserProfileId)) {
            throw new GenericException("Promotion does not belong to your doctor");
        }

        if (promotion.getStatus() != PromotionStatus.ACTIVE) {
            throw new GenericException("Promotion is not active");
        }

        if (promotion.getPromotionType() != PromotionType.PATIENT_REFERRAL) {
            if (promotion.getMaxRedemptionsPerPatient() != null) {
                long patientRedemptions =
                        redemptionRepository.countByPatientIdAndPromotionConfigId(patientId, request.getPromotionId());
                if (patientRedemptions >= promotion.getMaxRedemptionsPerPatient()) {
                    throw new GenericException("You have already reached the maximum redemptions for this promotion");
                }
            }

            if (promotion.getTotalMaxRedemptions() != null) {
                if (promotion.getCurrentRedemptions() >= promotion.getTotalMaxRedemptions()) {
                    throw new GenericException("Promotion has reached maximum total redemptions");
                }
            }
        }

        if (isEligibleForPromotion(patient, promotion)) {
            throw new GenericException("You are not eligible for this promotion");
        }

        PromotionRedemptionStatus initialStatus;
        boolean requiresVerification = promotion.getPromotionType() == PromotionType.PATIENT_REFERRAL
                || promotion.getPromotionType() == PromotionType.DISCOUNT_PERCENTAGE;

        if (requiresVerification) {
            initialStatus = PromotionRedemptionStatus.PENDING_VERIFICATION;
        } else {
            initialStatus = PromotionRedemptionStatus.VERIFIED;
        }

        PatientPromotionRedemption redemption = PatientPromotionRedemption.builder()
                .patient(patient)
                .promotionConfig(promotion)
                .redeemedAt(now)
                .coinsReceived(promotion.getValue())
                .status(initialStatus)
                .appliedAt(now)
                .build();

        if (promotion.getPromotionType() == PromotionType.PATIENT_REFERRAL) {
            redemption.setReferredPatientName(request.getReferredPatientName());
            redemption.setReferredPatientPhone(request.getReferredPatientPhone());
            redemption.setReferredPatientEmail(request.getReferredPatientEmail());
        }

        if (request.getNotes() != null) {
            redemption.setVerificationNotes(request.getNotes());
        }

        redemptionRepository.save(redemption);

        promotion.setCurrentRedemptions(promotion.getCurrentRedemptions() + 1);
        promotionConfigRepository.save(promotion);

        WalletResponse updatedWallet = null;
        String message;

        if (promotion.getPromotionType() == PromotionType.BONUS_COINS) {
            updatedWallet = creditPromotionCoins(patient, promotion, redemption);
            message = "Promotion claimed successfully! " + promotion.getValue() + " coins added to your wallet.";
        } else {
            message = "Promotion claim submitted successfully! Awaiting verification from your doctor.";
        }

        return PromotionClaimResponse.builder()
                .redemptionId(redemption.getId())
                .promotionName(promotion.getPromotionName())
                .coinsReceived(promotion.getValue())
                .message(message)
                .updatedWallet(updatedWallet)
                .build();
    }

    @Transactional(readOnly = true)
    @Override
    public PendingPromotionClaimListResponse getPatientPendingClaims(Long patientId, PromotionRedemptionStatus status) {
        List<PatientPromotionRedemption> redemptions;

        if (status == null) {
            redemptions = redemptionRepository.findByPatientId(patientId);
        } else {
            redemptions = redemptionRepository.findByPatientIdAndStatus(patientId, status);
        }

        List<PendingPromotionClaimResponse> claims = redemptions.stream()
                .map(RewardsMapperUtil::mapToPendingClaimResponse)
                .collect(Collectors.toList());

        return PendingPromotionClaimListResponse.builder()
                .claims(claims)
                .totalCount(claims.size())
                .build();
    }

    @Transactional(readOnly = true)
    @Override
    public PendingPromotionClaimListResponse getPendingClaimsForDoctor(PatientPromotionClaimRequest request) {

        int pageNum = request.getPage() != null ? request.getPage() : 0;
        int pageSize = request.getSize() != null ? request.getSize() : 10;

        Pageable pageable = PageRequest.of(pageNum, pageSize);

        PromotionRedemptionStatus status = null;
        String statusName = null;
        if (request.getStatus() != null) {
            status = request.getStatus();
            statusName = status.name();
        }
        Page<PendingClaimSummary> claimPage = redemptionRepository.findPendingClaimsByUserProfileId(
                request.getProfileId(), request.getSearch(), statusName, pageable);

        List<PendingPromotionClaimResponse> claims =
                claimPage.getContent().stream().map(this::mapSummaryToResponse).collect(Collectors.toList());

        PaginationDetails paginationDetails = PaginationDetails.builder()
                .pageNumber(pageable.getPageNumber())
                .pageSize(pageable.getPageSize())
                .totalPatients((int) claimPage.getTotalElements())
                .totalPages(claimPage.getTotalPages())
                .hasNext(claimPage.hasNext())
                .hasPrevious(claimPage.hasPrevious())
                .build();

        return PendingPromotionClaimListResponse.builder()
                .claims(claims)
                .totalCount((int) claimPage.getTotalElements())
                .paginationDetails(paginationDetails)
                .build();
    }

    @Transactional
    @Override
    public PromotionClaimResponse verifyPromotionClaim(VerifyPromotionClaimRequest request) {

        PatientPromotionRedemption redemption = redemptionRepository
                .findById(request.getRedemptionId())
                .orElseThrow(() -> new GenericException("Redemption not found"));

        if (redemption.getStatus() != PromotionRedemptionStatus.PENDING_VERIFICATION) {
            throw new GenericException("Redemption is not pending verification");
        }

        Long redemptionUserProfileId =
                redemption.getPromotionConfig().getUserProfile().getId();
        if (!redemptionUserProfileId.equals(request.getUserProfileId())) {
            throw new GenericException("You are not authorized to verify this claim");
        }

        LocalDateTime now = LocalDateTime.now();
        WalletResponse updatedWallet = null;
        String message;

        if (request.getApproved()) {

            redemption.setStatus(PromotionRedemptionStatus.VERIFIED);
            redemption.setVerifiedAt(now);
            redemption.setVerifiedByUserId(request.getUserProfileId());

            if (request.getNotes() != null) {
                redemption.setVerificationNotes(request.getNotes());
            }

            if (request.getReferredPatientId() != null) {
                redemption.setReferredPatientId(request.getReferredPatientId());
            }

            updatedWallet = creditPromotionCoins(redemption.getPatient(), redemption.getPromotionConfig(), redemption);

            message = "Promotion claim verified successfully! " + redemption.getCoinsReceived()
                    + " coins have been added to the patient's wallet.";
        } else {

            redemption.setStatus(PromotionRedemptionStatus.REJECTED);
            redemption.setRejectedAt(now);
            redemption.setRejectedByUserId(request.getUserProfileId());
            redemption.setRejectionReason(request.getNotes());

            message = "Promotion claim has been rejected.";
        }

        redemptionRepository.save(redemption);

        return PromotionClaimResponse.builder()
                .redemptionId(redemption.getId())
                .promotionName(redemption.getPromotionConfig().getPromotionName())
                .coinsReceived(redemption.getCoinsReceived())
                .message(message)
                .updatedWallet(updatedWallet)
                .build();
    }

    private boolean isEligibleForPromotion(Patient patient, PromotionConfig promotion) {
        return switch (promotion.getTargetAudience()) {
            case ALL -> false;
            case NEW_PATIENTS -> {
                ZonedDateTime thirtyDaysAgo = ZonedDateTime.now().minusDays(30);
                yield !patient.getCreatedAt().isAfter(thirtyDaysAgo);
            }
            case EXISTING_PATIENTS -> {
                ZonedDateTime cutoff = ZonedDateTime.now().minusDays(30);
                yield !patient.getCreatedAt().isBefore(cutoff);
            }
            case CUSTOM_SEGMENT -> false;
            default -> true;
        };
    }

    private WalletResponse creditPromotionCoins(
            Patient patient, PromotionConfig promotion, PatientPromotionRedemption redemption) {
        log.info("Crediting promotion coins: {} to patient {}", promotion.getValue(), patient.getId());

        UserWallet wallet = walletRepository
                .findByPatientId(patient.getId())
                .orElseThrow(() -> new GenericException("Wallet not found"));

        BigDecimal coinAmount = promotion.getValue();
        BigDecimal balanceBefore = wallet.getTotalCoins();
        BigDecimal balanceAfter = balanceBefore.add(coinAmount);

        wallet.setTotalCoins(balanceAfter);
        wallet.setAvailableCoins(wallet.getAvailableCoins().add(coinAmount));
        wallet.setLifetimeEarned(wallet.getLifetimeEarned().add(coinAmount));

        UserWallet updatedWallet = walletRepository.save(wallet);

        CoinTransaction transaction = CoinTransaction.builder()
                .patient(patient)
                .userProfile(promotion.getUserProfile())
                .transactionType(TransactionType.EARNED)
                .amount(coinAmount)
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceAfter)
                .transactionDate(LocalDateTime.now())
                .referenceType("PROMOTION")
                .referenceId(redemption.getId())
                .description("Promotion: " + promotion.getPromotionName())
                .build();

        transactionRepository.save(transaction);

        return WalletResponse.builder()
                .walletId(updatedWallet.getId())
                .totalCoins(updatedWallet.getTotalCoins())
                .availableCoins(updatedWallet.getAvailableCoins())
                .lockedCoins(updatedWallet.getLockedCoins())
                .lifetimeEarned(updatedWallet.getLifetimeEarned())
                .lifetimeSpent(updatedWallet.getLifetimeSpent())
                .currentStreak(updatedWallet.getCurrentStreak())
                .longestStreak(updatedWallet.getLongestStreak())
                .build();
    }

    private PatientPromotionItem mapToPatientPromotionItem(PromotionConfig promotion, Patient patient) {
        boolean canClaim = true;
        String cannotClaimReason = null;

        if (promotion.getPromotionType() != PromotionType.PATIENT_REFERRAL
                && promotion.getMaxRedemptionsPerPatient() != null) {
            long patientRedemptions =
                    redemptionRepository.countByPatientIdAndPromotionConfigId(patient.getId(), promotion.getId());

            if (patientRedemptions >= promotion.getMaxRedemptionsPerPatient()) {
                canClaim = false;
                cannotClaimReason = "You have already claimed this promotion";
            }
        }

        if (canClaim && promotion.getTotalMaxRedemptions() != null) {
            if (promotion.getCurrentRedemptions() >= promotion.getTotalMaxRedemptions()) {
                canClaim = false;
                cannotClaimReason = "Promotion has reached maximum redemptions";
            }
        }

        if (canClaim && isEligibleForPromotion(patient, promotion)) {
            canClaim = false;
            cannotClaimReason = "You are not eligible for this promotion";
        }

        return PatientPromotionItem.builder()
                .promotionId(promotion.getId())
                .promotionName(promotion.getPromotionName())
                .promotionDescription(promotion.getPromotionDescription())
                .promotionType(promotion.getPromotionType())
                .value(promotion.getValue())
                .canClaim(canClaim)
                .cannotClaimReason(cannotClaimReason)
                .build();
    }

    private PendingPromotionClaimResponse mapSummaryToResponse(PendingClaimSummary summary) {
        String patientName = summary.getPatientFirstName() + " " + summary.getPatientLastName();

        return PendingPromotionClaimResponse.builder()
                .redemptionId(summary.getRedemptionId())
                .promotionId(summary.getPromotionId())
                .promotionName(summary.getPromotionName())
                .promotionDescription(summary.getPromotionDescription())
                .promotionType(PromotionType.valueOf(summary.getPromotionType()))
                .coinsReceived(summary.getCoinsReceived())
                .status(PromotionRedemptionStatus.valueOf(summary.getStatus()))
                .redeemedAt(summary.getRedeemedAt())
                .patientId(summary.getPatientId())
                .patientName(patientName)
                .patientEmail(summary.getPatientEmail())
                .patientPhone(summary.getPatientPhone())
                .referredPatientName(summary.getReferredPatientName())
                .referredPatientPhone(summary.getReferredPatientPhone())
                .referredPatientEmail(summary.getReferredPatientEmail())
                .referredPatientId(summary.getReferredPatientId())
                .verificationNotes(summary.getVerificationNotes())
                .build();
    }
}
