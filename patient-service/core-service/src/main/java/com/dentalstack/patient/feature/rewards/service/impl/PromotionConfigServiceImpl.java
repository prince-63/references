package com.dentalstack.patient.feature.rewards.service.impl;

import com.dentalstack.patient.feature.rewards.dto.request.*;
import com.dentalstack.patient.feature.rewards.dto.response.*;
import com.dentalstack.patient.feature.rewards.entity.PromotionConfig;
import com.dentalstack.patient.feature.rewards.enums.PromotionStatus;
import com.dentalstack.patient.feature.rewards.repository.PromotionConfigRepository;
import com.dentalstack.patient.feature.rewards.service.PromotionConfigService;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.exception.GenericException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PromotionConfigServiceImpl implements PromotionConfigService {

    private final PromotionConfigRepository promotionConfigRepository;
    private final UserProfileRepository userProfileRepository;

    @Transactional(readOnly = true)
    @Override
    public PromotionConfigListResponse getAllPromotions(Long userProfileId, String status) {
        log.info("Fetching promotions for userProfileId: {}, status: {}", userProfileId, status);

        List<PromotionConfig> promotions;

        if (status != null && !status.isEmpty()) {
            PromotionStatus promotionStatus = PromotionStatus.valueOf(status);
            promotions = promotionConfigRepository.findByUserProfileIdAndStatusAndIsActiveTrue(
                    userProfileId, promotionStatus);
        } else {
            promotions =
                    promotionConfigRepository.findByUserProfileIdAndIsActiveTrueOrderByCreatedAtDesc(userProfileId);
        }

        List<PromotionConfigResponse> responses =
                promotions.stream().map(this::mapToResponse).collect(Collectors.toList());

        return PromotionConfigListResponse.builder()
                .promotions(responses)
                .totalCount(responses.size())
                .build();
    }

    @Transactional
    @Override
    public PromotionConfigResponse createPromotion(CreatePromotionConfigRequest request) {
        log.info(
                "Creating promotion for userProfileId: {}, name: {}",
                request.getProfileId(),
                request.getPromotionName());

        UserProfile userProfile = userProfileRepository
                .findById(request.getProfileId())
                .orElseThrow(() -> new GenericException("UserProfile not found"));

        LocalDateTime startDate = request.getStartDate();
        LocalDateTime endDate = request.getEndDate();

        if (endDate.isBefore(startDate)) {
            throw new RuntimeException("End date must be after start date");
        }

        PromotionStatus status = determinePromotionStatus(startDate, endDate);

        PromotionConfig promotion = PromotionConfig.builder()
                .userProfile(userProfile)
                .promotionName(request.getPromotionName())
                .promotionType(request.getPromotionType())
                .value(request.getValue())
                .targetAudience(request.getTargetAudience())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(status)
                .currentRedemptions(0)
                .isActive(true)
                .totalMaxRedemptions(1)
                .maxRedemptionsPerPatient(1)
                .createdByUserId(request.getProfileId())
                .build();

        PromotionConfig saved = promotionConfigRepository.save(promotion);
        log.info("Promotion created successfully with id: {}", saved.getId());

        return mapToResponse(saved);
    }

    @Transactional
    @Override
    public PromotionConfigResponse updatePromotion(UpdatePromotionConfigRequest request) {
        log.info("Updating promotion id: {} for userProfileId: {}", request.getPromotionId(), request.getProfileId());

        PromotionConfig promotion = promotionConfigRepository
                .findByIdAndUserProfileIdAndIsActiveTrue(request.getPromotionId(), request.getProfileId())
                .orElseThrow(() -> new GenericException("Promotion not found"));

        if (request.getPromotionName() != null) {
            promotion.setPromotionName(request.getPromotionName());
        }

        if (request.getValue() != null) {
            promotion.setValue(request.getValue());
        }
        if (request.getEndDate() != null) {
            LocalDateTime newEndDate = request.getEndDate();
            promotion.setEndDate(newEndDate);

            promotion.setStatus(determinePromotionStatus(promotion.getStartDate(), newEndDate));
        }
        PromotionConfig updated = promotionConfigRepository.save(promotion);
        log.info("Promotion updated successfully: {}", updated.getId());

        return mapToResponse(updated);
    }

    @Transactional
    @Override
    public PromotionConfigResponse endPromotion(Long userProfileId, Long promotionId) {
        log.info("Ending promotion id: {} for userProfileId: {}", promotionId, userProfileId);

        PromotionConfig promotion = promotionConfigRepository
                .findByIdAndUserProfileIdAndIsActiveTrue(promotionId, userProfileId)
                .orElseThrow(() -> new GenericException("Promotion not found"));

        promotion.setStatus(PromotionStatus.ENDED);
        promotion.setEndDate(LocalDateTime.now());

        PromotionConfig updated = promotionConfigRepository.save(promotion);
        log.info("Promotion ended successfully");

        return mapToResponse(updated);
    }

    private PromotionStatus determinePromotionStatus(LocalDateTime startDate, LocalDateTime endDate) {
        LocalDateTime now = LocalDateTime.now();

        if (now.isBefore(startDate)) {
            return PromotionStatus.SCHEDULED;
        } else if (now.isAfter(endDate)) {
            return PromotionStatus.ENDED;
        } else {
            return PromotionStatus.ACTIVE;
        }
    }

    private PromotionConfigResponse mapToResponse(PromotionConfig promotion) {
        return PromotionConfigResponse.builder()
                .id(promotion.getId())
                .promotionName(promotion.getPromotionName())
                .promotionDescription(promotion.getPromotionDescription())
                .promotionType(promotion.getPromotionType())
                .value(promotion.getValue())
                .targetAudience(promotion.getTargetAudience())
                .startDate(promotion.getStartDate())
                .endDate(promotion.getEndDate())
                .status(promotion.getStatus())
                .maxRedemptionsPerPatient(promotion.getMaxRedemptionsPerPatient())
                .totalMaxRedemptions(promotion.getTotalMaxRedemptions())
                .currentRedemptions(promotion.getCurrentRedemptions())
                .termsAndConditions(promotion.getTermsAndConditions())
                .createdAt(promotion.getCreatedAt())
                .build();
    }
}
