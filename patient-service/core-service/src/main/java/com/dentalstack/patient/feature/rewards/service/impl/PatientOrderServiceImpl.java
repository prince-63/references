package com.dentalstack.patient.feature.rewards.service.impl;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.rewards.dto.request.CancelOrderRequest;
import com.dentalstack.patient.feature.rewards.dto.request.OrderItemRequest;
import com.dentalstack.patient.feature.rewards.dto.request.PlaceOrderRequest;
import com.dentalstack.patient.feature.rewards.dto.response.*;
import com.dentalstack.patient.feature.rewards.entity.*;
import com.dentalstack.patient.feature.rewards.enums.OrderStatus;
import com.dentalstack.patient.feature.rewards.enums.ProductStatus;
import com.dentalstack.patient.feature.rewards.enums.TransactionType;
import com.dentalstack.patient.feature.rewards.repository.*;
import com.dentalstack.patient.feature.rewards.service.PatientOrderService;
import com.dentalstack.patient.feature.rewards.util.RewardsMapperUtil;
import com.dentalstack.patient.global.exception.GenericException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
public class PatientOrderServiceImpl implements PatientOrderService {

    private final PatientRepository patientRepository;
    private final RewardProductConfigRepository productConfigRepository;
    private final RewardOrderRepository orderRepository;
    private final RewardOrderItemRepository orderItemRepository;
    private final UserWalletRepository walletRepository;
    private final CoinTransactionRepository transactionRepository;
    private final PatientPromotionRedemptionRepository redemptionRepository;

    @Transactional
    @Override
    public RewardOrderResponse placeOrder(PlaceOrderRequest request) {
        log.info("Patient {} placing order", request.getPatientId());

        Patient patient = patientRepository
                .findById(request.getPatientId())
                .orElseThrow(() -> new GenericException("Patient not found"));

        UserWallet wallet = walletRepository
                .findByPatientId(request.getPatientId())
                .orElseThrow(() -> new GenericException("Wallet not found"));

        OrderItemRequest itemRequest = request.getItem();

        RewardProductConfig product = productConfigRepository
                .findById(itemRequest.getProductId())
                .orElseThrow(() -> new GenericException("Product not found: " + itemRequest.getProductId()));

        if (product.getStatus() == ProductStatus.OUT_OF_STOCK) {
            throw new GenericException("Product out of stock: " + product.getProductName());
        }

        if (product.getStatus() == ProductStatus.DISCONTINUED) {
            throw new GenericException("Product discontinued: " + product.getProductName());
        }

        if (product.getInventoryCount() < itemRequest.getQuantity()) {
            throw new GenericException("Insufficient inventory for: " + product.getProductName());
        }

        BigDecimal totalCoins = product.getCoinCost().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

        if (wallet.getAvailableCoins().compareTo(totalCoins) < 0) {
            throw new GenericException(
                    "Insufficient coins. Required: " + totalCoins + ", Available: " + wallet.getAvailableCoins());
        }

        String orderNumber = generateOrderNumber();

        OrderMetadata metadata = null;
        if (request.getMetadata() != null) {
            metadata = OrderMetadata.builder()
                    .shippingAddress(request.getMetadata().getShippingAddress())
                    .city(request.getMetadata().getCity())
                    .state(request.getMetadata().getState())
                    .zipCode(request.getMetadata().getZipCode())
                    .country(request.getMetadata().getCountry())
                    .phoneNumber(request.getPhoneNumber())
                    .deliveryNotes(request.getDeliveryNotes())
                    .build();
        }

        RewardOrder order = RewardOrder.builder()
                .patient(patient)
                .userProfile(patient.getDoctorOrganization().getUserProfile())
                .orderNumber(orderNumber)
                .totalCoins(totalCoins)
                .status(OrderStatus.PENDING)
                .patientNotes(request.getDeliveryNotes())
                .metadata(metadata)
                .build();

        RewardOrder savedOrder = orderRepository.save(order);

        RewardOrderItem orderItem = RewardOrderItem.builder()
                .rewardOrder(savedOrder)
                .rewardProductConfig(product)
                .quantity(itemRequest.getQuantity())
                .coinCostPerUnit(product.getCoinCost())
                .totalCoins(totalCoins)
                .productSnapshotName(product.getProductName())
                .productSnapshotDescription(product.getProductDescription())
                .productSnapshotImageUrl(product.getImageUrl())
                .build();

        RewardOrderItem savedOrderItem = orderItemRepository.save(orderItem);

        savedOrder.setOrderItem(savedOrderItem);
        orderRepository.save(savedOrder);

        product.setInventoryCount(product.getInventoryCount() - itemRequest.getQuantity());

        if (product.getInventoryCount() == 0) {
            product.setStatus(ProductStatus.OUT_OF_STOCK);
        } else if (product.getInventoryCount() <= product.getLowStockThreshold()) {
            product.setStatus(ProductStatus.LOW_STOCK);
        }

        productConfigRepository.save(product);

        wallet.setAvailableCoins(wallet.getAvailableCoins().subtract(totalCoins));
        wallet.setLockedCoins(wallet.getLockedCoins().add(totalCoins));
        walletRepository.save(wallet);

        CoinTransaction lockTransaction = CoinTransaction.builder()
                .patient(patient)
                .userProfile(patient.getDoctorOrganization().getUserProfile())
                .transactionType(TransactionType.LOCKED)
                .amount(totalCoins)
                .balanceBefore(wallet.getTotalCoins())
                .balanceAfter(wallet.getTotalCoins())
                .transactionDate(LocalDateTime.now())
                .referenceType("ORDER")
                .referenceId(savedOrder.getId())
                .description("Coins locked for order " + orderNumber)
                .build();

        transactionRepository.save(lockTransaction);

        log.info("Order placed successfully: {}", orderNumber);

        return RewardsMapperUtil.mapToOrderResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    @Override
    public RewardOrderListResponse getPatientOrders(Long patientId, String status, int page, int size) {
        log.info("Fetching orders for patientId: {}, status: {}", patientId, status);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<RewardOrder> orderPage;

        if (status != null && !status.isEmpty()) {
            OrderStatus orderStatus = OrderStatus.valueOf(status);
            orderPage = orderRepository.findByPatientIdAndStatus(patientId, orderStatus, pageable);
        } else {
            orderPage = orderRepository.findByPatientId(patientId, pageable);
        }

        List<RewardOrderResponse> orders = orderPage.getContent().stream()
                .map(RewardsMapperUtil::mapToOrderResponse)
                .collect(Collectors.toList());

        return RewardOrderListResponse.builder()
                .orders(orders)
                .totalCount((int) orderPage.getTotalElements())
                .currentPage(page)
                .totalPages(orderPage.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    @Override
    public RewardOrderResponse getOrderDetails(Long patientId, Long orderId) {
        log.info("Fetching order details for patientId: {}, orderId: {}", patientId, orderId);

        RewardOrder order = orderRepository
                .findByIdAndPatientId(orderId, patientId)
                .orElseThrow(() -> new GenericException("Order not found"));

        return RewardsMapperUtil.mapToOrderResponse(order);
    }

    @Transactional
    @Override
    public RewardOrderResponse cancelOrder(CancelOrderRequest request) {
        log.info("Patient {} cancelling order {}", request.getPatientId(), request.getRewardOrderId());

        RewardOrder order = orderRepository
                .findByIdAndPatientId(request.getRewardOrderId(), request.getPatientId())
                .orElseThrow(() -> new GenericException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new GenericException("Only pending orders can be cancelled");
        }

        order.setStatus(OrderStatus.CANCELLED);
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

            productConfigRepository.save(product);
        }

        Patient patient = order.getPatient();
        UserWallet wallet = walletRepository
                .findByPatientId(request.getPatientId())
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
                .description("Coins unlocked - Order cancelled: " + order.getOrderNumber())
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
                .description("Refund - Order cancelled: " + order.getOrderNumber())
                .notes(request.getReason())
                .build();

        transactionRepository.save(refundTransaction);

        log.info("Order cancelled and coins refunded: {}", order.getOrderNumber());

        return RewardsMapperUtil.mapToOrderResponse(order);
    }

    @Override
    public PatientRewardsActivityResponse getPatientOrderAndPromotionsClaim(PatientRewardsActivityRequest request) {
        List<RewardOrder> orderPage =
                orderRepository.findByPatientIdAndOptionalStatus(request.getPatientId(), request.getOrderStatus());
        List<RewardOrderResponse> orders =
                orderPage.stream().map(RewardsMapperUtil::mapToOrderResponse).toList();

        List<PatientPromotionRedemption> redemptions = redemptionRepository.findByPatientIdAndStatus(
                request.getPatientId(), request.getPromotionRedemptionStatus());

        List<PendingPromotionClaimResponse> claims = redemptions.stream()
                .map(RewardsMapperUtil::mapToPendingClaimResponse)
                .toList();
        return PatientRewardsActivityResponse.builder()
                .orders(orders)
                .promotionClaims(claims)
                .build();
    }

    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return "ORD-" + timestamp;
    }
}
