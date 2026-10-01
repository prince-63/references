package com.dentalstack.patient.feature.rewards.service.impl;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.rewards.dto.request.ManualCoinAdjustmentRequest;
import com.dentalstack.patient.feature.rewards.dto.response.TransactionResponse;
import com.dentalstack.patient.feature.rewards.entity.CoinTransaction;
import com.dentalstack.patient.feature.rewards.entity.UserWallet;
import com.dentalstack.patient.feature.rewards.enums.TransactionType;
import com.dentalstack.patient.feature.rewards.repository.CoinTransactionRepository;
import com.dentalstack.patient.feature.rewards.repository.UserWalletRepository;
import com.dentalstack.patient.feature.rewards.service.CoinAdjustmentService;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.exception.GenericException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CoinAdjustmentServiceImpl implements CoinAdjustmentService {

    private final PatientRepository patientRepository;
    private final UserWalletRepository walletRepository;
    private final CoinTransactionRepository transactionRepository;
    private final UserProfileRepository userProfileRepository;

    @Transactional
    @Override
    public TransactionResponse adjustCoins(ManualCoinAdjustmentRequest request) {
        log.info(
                "Manual coin adjustment: {} coins for patient {} by user {}",
                request.getAmount(),
                request.getPatientId(),
                request.getProfileId());

        UserProfile userProfile = userProfileRepository
                .findById(request.getProfileId())
                .orElseThrow(() -> new GenericException("UserProfile not found"));

        Patient patient = patientRepository
                .findById(request.getPatientId())
                .orElseThrow(() -> new GenericException("Patient not found"));

        if (!patient.getDoctorOrganization().getUserProfile().getId().equals(request.getProfileId())) {
            throw new GenericException("Patient does not belong to your organization");
        }

        UserWallet wallet = walletRepository
                .findByPatientId(patient.getId())
                .orElseThrow(() -> new GenericException("Wallet not found"));

        BigDecimal amount = request.getAmount();
        BigDecimal balanceBefore = wallet.getTotalCoins();
        BigDecimal balanceAfter = balanceBefore.add(amount);

        if (balanceAfter.compareTo(BigDecimal.ZERO) < 0) {
            throw new GenericException("Adjustment would result in negative balance");
        }

        wallet.setTotalCoins(balanceAfter);
        wallet.setAvailableCoins(wallet.getAvailableCoins().add(amount));

        if (amount.compareTo(BigDecimal.ZERO) > 0) {
            wallet.setLifetimeEarned(wallet.getLifetimeEarned().add(amount));
        }

        walletRepository.save(wallet);

        CoinTransaction transaction = CoinTransaction.builder()
                .patient(patient)
                .userProfile(userProfile)
                .transactionType(TransactionType.ADJUSTED)
                .amount(amount.abs())
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceAfter)
                .transactionDate(LocalDateTime.now())
                .referenceType("MANUAL_ADJUSTMENT")
                .referenceId(null)
                .description(request.getReason())
                .notes(request.getNotes())
                .performedByUserId(request.getProfileId())
                .build();

        CoinTransaction savedTransaction = transactionRepository.save(transaction);

        log.info("Coin adjustment completed. New balance: {}", balanceAfter);

        return TransactionResponse.builder()
                .transactionId(savedTransaction.getId())
                .transactionType(savedTransaction.getTransactionType())
                .amount(savedTransaction.getAmount())
                .balanceBefore(savedTransaction.getBalanceBefore())
                .balanceAfter(savedTransaction.getBalanceAfter())
                .transactionDate(savedTransaction.getTransactionDate())
                .description(savedTransaction.getDescription())
                .referenceType(savedTransaction.getReferenceType())
                .referenceId(savedTransaction.getReferenceId())
                .build();
    }
}
