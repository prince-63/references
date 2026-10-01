package com.dentalstack.patient.feature.rewards.service.impl;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.rewards.dto.request.*;
import com.dentalstack.patient.feature.rewards.dto.response.PatientRewardDashboardForDoctorResponse;
import com.dentalstack.patient.feature.rewards.dto.response.RewardOrderListResponseV2;
import com.dentalstack.patient.feature.rewards.dto.response.RewardOrderResponse;
import com.dentalstack.patient.feature.rewards.dto.response.RewardOrderResponseV2;
import com.dentalstack.patient.feature.rewards.dto.summary.RewardDashboardStats;
import com.dentalstack.patient.feature.rewards.dto.summary.RewardOrderSummary;
import com.dentalstack.patient.feature.rewards.entity.*;
import com.dentalstack.patient.feature.rewards.enums.OrderStatus;
import com.dentalstack.patient.feature.rewards.enums.ProductStatus;
import com.dentalstack.patient.feature.rewards.enums.TransactionType;
import com.dentalstack.patient.feature.rewards.repository.CoinTransactionRepository;
import com.dentalstack.patient.feature.rewards.repository.RewardOrderRepository;
import com.dentalstack.patient.feature.rewards.repository.UserWalletRepository;
import com.dentalstack.patient.feature.rewards.service.RewardOrderService;
import com.dentalstack.patient.feature.rewards.util.RewardsMapperUtil;
import com.dentalstack.patient.global.dto.pagination.PaginationDetails;
import com.dentalstack.patient.global.exception.GenericException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
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
public class RewardOrderServiceImpl implements RewardOrderService {
    private final RewardOrderRepository orderRepository;
    private final UserWalletRepository walletRepository;
    private final CoinTransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public RewardOrderListResponseV2 getOrdersForDoctor(GetAllRewardOrdersRequest request) {
        Long userProfileId = request.getProfileId();
        OrderStatus status = request.getStatus();
        String searchText = request.getSearchText();
        int page = request.getPage() != null ? request.getPage() : 0;
        int size = request.getSize() != null ? request.getSize() : 10;

        Pageable pageable = PageRequest.of(page, size);

        Page<RewardOrderSummary> orderPage;

        orderPage = orderRepository.findOrdersByUserProfileIdWithSearch(
                userProfileId, status != null ? status.name() : null, searchText, pageable);

        List<RewardOrderResponseV2> orders = orderPage.getContent().stream()
                .map(RewardOrderResponseV2::mapSummaryToResponse)
                .collect(Collectors.toList());

        PaginationDetails paginationDetails = PaginationDetails.builder()
                .pageNumber(pageable.getPageNumber())
                .pageSize(pageable.getPageSize())
                .totalPatients((int) orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .hasNext(orderPage.hasNext())
                .hasPrevious(orderPage.hasPrevious())
                .build();

        return RewardOrderListResponseV2.builder()
                .orders(orders)
                .paginationDetails(paginationDetails)
                .build();
    }

    @Override
    public PatientRewardDashboardForDoctorResponse getPatientRewardDashboardForDoctor(
            PatientRewardDashboardRequest request) {
        if (request == null || request.getProfileId() == null) {
            throw new IllegalArgumentException("Profile ID is required");
        }

        RewardDashboardStats stats = walletRepository.getPatientRewardDashboardStats(request.getProfileId());

        if (stats == null) {
            return PatientRewardDashboardForDoctorResponse.builder()
                    .activePatient(0L)
                    .coinDistributed(0L)
                    .coinRedeemed(0L)
                    .build();
        }

        return PatientRewardDashboardForDoctorResponse.builder()
                .activePatient(stats.getActivePatient())
                .coinDistributed(
                        stats.getCoinDistributed() != null
                                ? stats.getCoinDistributed().longValue()
                                : 0L)
                .coinRedeemed(
                        stats.getCoinRedeemed() != null
                                ? stats.getCoinRedeemed().longValue()
                                : 0L)
                .build();
    }

    @Transactional
    public RewardOrderResponse approveOrder(ApproveOrderRequest request) {
        log.info("Approving order {} by user {}", request.getRewardOrderId(), request.getProfileId());

        RewardOrder order = orderRepository
                .findByIdAndUserProfileId(request.getRewardOrderId(), request.getProfileId())
                .orElseThrow(() -> new GenericException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new GenericException("Only pending orders can be approved");
        }

        order.setStatus(OrderStatus.APPROVED);
        order.setApprovedAt(LocalDateTime.now());
        order.setApprovedByUserId(request.getProfileId());
        order.setAdminNotes(request.getNotes());

        orderRepository.save(order);

        Patient patient = order.getPatient();
        UserWallet wallet = walletRepository
                .findByPatientId(patient.getId())
                .orElseThrow(() -> new GenericException("Wallet not found"));

        BigDecimal orderTotal = order.getTotalCoins();
        BigDecimal balanceBefore = wallet.getTotalCoins();
        BigDecimal balanceAfter = balanceBefore.subtract(orderTotal);

        wallet.setTotalCoins(balanceAfter);
        wallet.setLockedCoins(wallet.getLockedCoins().subtract(orderTotal));
        wallet.setLifetimeSpent(wallet.getLifetimeSpent().add(orderTotal));

        walletRepository.save(wallet);

        CoinTransaction unlockTransaction = CoinTransaction.builder()
                .patient(patient)
                .userProfile(order.getUserProfile())
                .transactionType(TransactionType.UNLOCKED)
                .amount(orderTotal)
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceBefore)
                .transactionDate(LocalDateTime.now())
                .referenceType("ORDER")
                .referenceId(order.getId())
                .description("Coins unlocked - Order approved: " + order.getOrderNumber())
                .performedByUserId(request.getProfileId())
                .build();

        transactionRepository.save(unlockTransaction);

        CoinTransaction spentTransaction = CoinTransaction.builder()
                .patient(patient)
                .userProfile(order.getUserProfile())
                .transactionType(TransactionType.SPENT)
                .amount(orderTotal)
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceAfter)
                .transactionDate(LocalDateTime.now())
                .referenceType("ORDER")
                .referenceId(order.getId())
                .description("Order approved: " + order.getOrderNumber())
                .performedByUserId(request.getProfileId())
                .build();

        transactionRepository.save(spentTransaction);

        log.info("Order approved and coins spent: {}", order.getOrderNumber());

        return RewardsMapperUtil.mapToOrderResponse(order);
    }

    @Transactional
    public RewardOrderResponse rejectOrder(RejectOrderRequest request) {
        log.info("Rejecting order {} by user {}", request.getRewardOrderId(), request.getProfileId());

        RewardOrder order = orderRepository
                .findByIdAndUserProfileId(request.getRewardOrderId(), request.getProfileId())
                .orElseThrow(() -> new GenericException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new GenericException("Only pending orders can be rejected");
        }

        order.setStatus(OrderStatus.REJECTED);
        order.setCancelledAt(LocalDateTime.now());
        order.setCancellationReason(request.getReason());

        orderRepository.save(order);

        for (RewardOrderItem item : order.getOrderItems()) {
            RewardProductConfig product = item.getRewardProductConfig();
            product.setInventoryCount(product.getInventoryCount() + item.getQuantity());

            if (product.getInventoryCount() > product.getLowStockThreshold()) {
                product.setStatus(ProductStatus.IN_STOCK);
            } else if (product.getInventoryCount() > 0) {
                product.setStatus(ProductStatus.LOW_STOCK);
            }
        }

        Patient patient = order.getPatient();
        UserWallet wallet = walletRepository
                .findByPatientId(patient.getId())
                .orElseThrow(() -> new GenericException("Wallet not found"));

        wallet.setLockedCoins(wallet.getLockedCoins().subtract(order.getTotalCoins()));
        wallet.setAvailableCoins(wallet.getAvailableCoins().add(order.getTotalCoins()));
        walletRepository.save(wallet);

        CoinTransaction unlockTransaction = CoinTransaction.builder()
                .patient(patient)
                .userProfile(order.getUserProfile())
                .transactionType(TransactionType.UNLOCKED)
                .amount(order.getTotalCoins())
                .balanceBefore(wallet.getTotalCoins())
                .balanceAfter(wallet.getTotalCoins())
                .transactionDate(LocalDateTime.now())
                .referenceType("ORDER")
                .referenceId(order.getId())
                .description("Coins unlocked - Order rejected: " + order.getOrderNumber())
                .performedByUserId(request.getProfileId())
                .build();

        transactionRepository.save(unlockTransaction);

        CoinTransaction refundTransaction = CoinTransaction.builder()
                .patient(patient)
                .userProfile(order.getUserProfile())
                .transactionType(TransactionType.REFUNDED)
                .amount(order.getTotalCoins())
                .balanceBefore(wallet.getTotalCoins())
                .balanceAfter(wallet.getTotalCoins())
                .transactionDate(LocalDateTime.now())
                .referenceType("ORDER")
                .referenceId(order.getId())
                .description("Refund - Order rejected: " + order.getOrderNumber())
                .notes(request.getReason())
                .performedByUserId(request.getProfileId())
                .build();

        transactionRepository.save(refundTransaction);

        log.info("Order rejected and coins refunded: {}", order.getOrderNumber());

        return RewardsMapperUtil.mapToOrderResponse(order);
    }

    @Transactional
    public RewardOrderResponse fulfillOrder(FulfillOrderRequest request) {
        log.info("Fulfilling order {}", request.getRewardOrderId());

        RewardOrder order = orderRepository
                .findByIdAndUserProfileId(request.getRewardOrderId(), request.getProfileId())
                .orElseThrow(() -> new GenericException("Order not found"));

        if (order.getStatus() != OrderStatus.APPROVED) {
            throw new GenericException("Only approved orders can be fulfilled");
        }

        order.setStatus(OrderStatus.FULFILLED);
        order.setFulfilledAt(LocalDateTime.now());
        order.setAdminNotes(request.getNotes());

        if (order.getMetadata() != null) {
            order.getMetadata().setTrackingNumber(request.getTrackingNumber());
            order.getMetadata().setCourierService(request.getCourierService());
        }

        orderRepository.save(order);

        log.info("Order fulfilled: {}", order.getOrderNumber());

        return RewardsMapperUtil.mapToOrderResponse(order);
    }
}
