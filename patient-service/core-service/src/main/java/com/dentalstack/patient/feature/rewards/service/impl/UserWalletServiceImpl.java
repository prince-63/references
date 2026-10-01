package com.dentalstack.patient.feature.rewards.service.impl;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.rewards.dto.request.PatientWalletInfoRequest;
import com.dentalstack.patient.feature.rewards.dto.response.*;
import com.dentalstack.patient.feature.rewards.dto.summary.PatientRewardSummary;
import com.dentalstack.patient.feature.rewards.entity.CoinTransaction;
import com.dentalstack.patient.feature.rewards.entity.UserWallet;
import com.dentalstack.patient.feature.rewards.enums.TransactionType;
import com.dentalstack.patient.feature.rewards.repository.CoinTransactionRepository;
import com.dentalstack.patient.feature.rewards.repository.UserWalletRepository;
import com.dentalstack.patient.feature.rewards.service.UserWalletService;
import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import com.dentalstack.patient.global.exception.GenericException;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserWalletServiceImpl implements UserWalletService {

    private final UserWalletRepository walletRepository;
    private final CoinTransactionRepository transactionRepository;
    private final PatientRepository patientRepository;

    @Transactional
    @Override
    public WalletResponse getWallet(Long patientId) {
        log.info("Fetching wallet for patientId: {}", patientId);

        UserWallet wallet =
                walletRepository.findByPatientId(patientId).orElseGet(() -> createWalletForPatient(patientId));

        return mapToWalletResponse(wallet);
    }

    @Transactional
    @Override
    public UserWallet createWalletForPatient(Long patientId) {
        log.info("Creating wallet for patientId: {}", patientId);

        Patient patient =
                patientRepository.findById(patientId).orElseThrow(() -> new GenericException("Patient not found"));

        UserWallet wallet = UserWallet.builder()
                .patient(patient)
                .totalCoins(BigDecimal.ZERO)
                .availableCoins(BigDecimal.ZERO)
                .lockedCoins(BigDecimal.ZERO)
                .lifetimeEarned(BigDecimal.ZERO)
                .lifetimeSpent(BigDecimal.ZERO)
                .currentStreak(0)
                .longestStreak(0)
                .isActive(true)
                .build();

        return walletRepository.save(wallet);
    }

    @Transactional(readOnly = true)
    @Override
    public TransactionListResponse getTransactions(Long patientId, String type, int page, int size) {
        log.info("Fetching transactions for patientId: {}, type: {}", patientId, type);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "transactionDate"));

        Page<CoinTransaction> transactionPage;

        if (type != null && !type.isEmpty()) {
            TransactionType transactionType = TransactionType.valueOf(type);
            transactionPage =
                    transactionRepository.findByPatientIdAndTransactionType(patientId, transactionType, pageable);
        } else {
            transactionPage = transactionRepository.findByPatientId(patientId, pageable);
        }

        List<TransactionResponse> transactions = transactionPage.getContent().stream()
                .map(this::mapToTransactionResponse)
                .collect(Collectors.toList());

        return TransactionListResponse.builder()
                .transactions(transactions)
                .totalCount((int) transactionPage.getTotalElements())
                .currentPage(page)
                .totalPages(transactionPage.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    @Override
    public PatientWalletInfoListResponse getPatientRewards(PatientWalletInfoRequest request) {
        Long userProfileId = request.getUserProfileId();
        String searchText = request.getSearchText();
        int page = request.getPage() != null ? request.getPage() : 0;
        int size = request.getSize() != null ? request.getSize() : 10;

        Pageable pageable = PageRequest.of(page, size);

        Page<PatientRewardSummary> patientPage =
                walletRepository.findPatientRewardsByUserProfileId(userProfileId, searchText, pageable);

        List<PatientWalletInfoResponse> patients =
                patientPage.getContent().stream().map(this::mapToResponse).collect(Collectors.toList());

        PaginationDetails paginationDetails = PaginationDetails.builder()
                .pageNumber(pageable.getPageNumber())
                .pageSize(pageable.getPageSize())
                .totalPatients((int) patientPage.getTotalElements())
                .totalPages(patientPage.getTotalPages())
                .hasNext(patientPage.hasNext())
                .hasPrevious(patientPage.hasPrevious())
                .build();

        return PatientWalletInfoListResponse.builder()
                .patients(patients)
                .paginationDetails(paginationDetails)
                .build();
    }

    private PatientWalletInfoResponse mapToResponse(PatientRewardSummary summary) {
        return PatientWalletInfoResponse.builder()
                .patientId(summary.getPatientId())
                .firstName(summary.getFirstName())
                .lastName(summary.getLastName())
                .email(summary.getEmail())
                .customerMappedId(summary.getCustomerMappedId())
                .uuid(summary.getUuid())
                .profilePictureUrl(summary.getProfilePictureUrl())
                .profilePictureId(summary.getProfilePictureId())
                .coinsEarned(summary.getCoinsEarned())
                .coinsUsed(summary.getCoinsUsed())
                .build();
    }

    private WalletResponse mapToWalletResponse(UserWallet wallet) {
        return WalletResponse.builder()
                .walletId(wallet.getId())
                .totalCoins(wallet.getTotalCoins())
                .availableCoins(wallet.getAvailableCoins())
                .lockedCoins(wallet.getLockedCoins())
                .lifetimeEarned(wallet.getLifetimeEarned())
                .lifetimeSpent(wallet.getLifetimeSpent())
                .currentStreak(wallet.getCurrentStreak())
                .longestStreak(wallet.getLongestStreak())
                .build();
    }

    private TransactionResponse mapToTransactionResponse(CoinTransaction transaction) {
        return TransactionResponse.builder()
                .transactionId(transaction.getId())
                .transactionType(transaction.getTransactionType())
                .amount(transaction.getAmount())
                .balanceBefore(transaction.getBalanceBefore())
                .balanceAfter(transaction.getBalanceAfter())
                .transactionDate(transaction.getTransactionDate())
                .description(transaction.getDescription())
                .referenceType(transaction.getReferenceType())
                .referenceId(transaction.getReferenceId())
                .build();
    }
}
