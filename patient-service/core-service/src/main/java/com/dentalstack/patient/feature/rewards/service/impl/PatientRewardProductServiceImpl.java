package com.dentalstack.patient.feature.rewards.service.impl;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.rewards.dto.response.*;
import com.dentalstack.patient.feature.rewards.entity.RewardProductConfig;
import com.dentalstack.patient.feature.rewards.entity.UserWallet;
import com.dentalstack.patient.feature.rewards.enums.ProductStatus;
import com.dentalstack.patient.feature.rewards.repository.RewardProductConfigRepository;
import com.dentalstack.patient.feature.rewards.repository.UserWalletRepository;
import com.dentalstack.patient.feature.rewards.service.PatientRewardProductService;
import com.dentalstack.patient.global.exception.GenericException;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientRewardProductServiceImpl implements PatientRewardProductService {

    private final PatientRepository patientRepository;
    private final RewardProductConfigRepository productConfigRepository;
    private final UserWalletRepository walletRepository;

    @Transactional(readOnly = true)
    @Override
    public PatientProductListResponse getAvailableProducts(Long patientId, String category) {
        log.info("Fetching available products for patientId: {}, category: {}", patientId, category);

        Patient patient =
                patientRepository.findById(patientId).orElseThrow(() -> new GenericException("Patient not found"));

        Long userProfileId = patient.getDoctorOrganization().getUserProfile().getId();

        UserWallet wallet =
                walletRepository.findByPatientId(patientId).orElseThrow(() -> new GenericException("Wallet not found"));

        List<RewardProductConfig> products;
        if (category != null && !category.isEmpty()) {
            products = productConfigRepository.findByUserProfileIdAndIsActiveTrueAndStatusNotOrderByDisplayOrderAsc(
                    userProfileId, ProductStatus.DISCONTINUED);
        } else {
            products = productConfigRepository.findByUserProfileIdAndIsActiveTrueOrderByDisplayOrderAsc(userProfileId);
        }

        List<PatientProductResponse> productResponses = products.stream()
                .filter(product -> product.getStatus() != ProductStatus.DISCONTINUED)
                .map(product -> mapToPatientProductResponse(product, wallet))
                .collect(Collectors.toList());

        WalletResponse walletResponse = WalletResponse.builder()
                .walletId(wallet.getId())
                .totalCoins(wallet.getTotalCoins())
                .availableCoins(wallet.getAvailableCoins())
                .lockedCoins(wallet.getLockedCoins())
                .lifetimeEarned(wallet.getLifetimeEarned())
                .lifetimeSpent(wallet.getLifetimeSpent())
                .currentStreak(wallet.getCurrentStreak())
                .longestStreak(wallet.getLongestStreak())
                .build();

        return PatientProductListResponse.builder()
                .products(productResponses)
                .wallet(walletResponse)
                .build();
    }

    @Transactional(readOnly = true)
    @Override
    public PatientProductResponse getProductDetails(Long patientId, Long productId) {
        log.info("Fetching product details for patientId: {}, productId: {}", patientId, productId);

        Patient patient =
                patientRepository.findById(patientId).orElseThrow(() -> new GenericException("Patient not found"));

        RewardProductConfig product = productConfigRepository
                .findById(productId)
                .orElseThrow(() -> new GenericException("Product not found"));

        Long patientUserProfileId =
                patient.getDoctorOrganization().getUserProfile().getId();
        if (!product.getUserProfile().getId().equals(patientUserProfileId)) {
            throw new GenericException("Product not found");
        }

        UserWallet wallet =
                walletRepository.findByPatientId(patientId).orElseThrow(() -> new GenericException("Wallet not found"));

        return mapToPatientProductResponse(product, wallet);
    }

    private PatientProductResponse mapToPatientProductResponse(RewardProductConfig product, UserWallet wallet) {
        boolean canAfford = wallet.getAvailableCoins().compareTo(product.getCoinCost()) >= 0;

        return PatientProductResponse.builder()
                .productId(product.getId())
                .productName(product.getProductName())
                .productDescription(product.getProductDescription())
                .category(product.getCategory())
                .coinCost(product.getCoinCost())
                .monetaryValue(product.getMonetaryValue())
                .status(product.getStatus())
                .imageUrl(product.getImageUrl())
                .termsAndConditions(product.getTermsAndConditions())
                .canAfford(canAfford)
                .build();
    }
}
