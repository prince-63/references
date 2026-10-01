package com.dentalstack.patient.feature.rewards.service;

import com.dentalstack.patient.feature.rewards.dto.request.CreatePromotionConfigRequest;
import com.dentalstack.patient.feature.rewards.dto.request.UpdatePromotionConfigRequest;
import com.dentalstack.patient.feature.rewards.dto.response.PromotionConfigListResponse;
import com.dentalstack.patient.feature.rewards.dto.response.PromotionConfigResponse;
import org.springframework.transaction.annotation.Transactional;

public interface PromotionConfigService {

    @Transactional(readOnly = true)
    PromotionConfigListResponse getAllPromotions(Long userProfileId, String status);

    @Transactional
    PromotionConfigResponse createPromotion(CreatePromotionConfigRequest request);

    @Transactional
    PromotionConfigResponse updatePromotion(UpdatePromotionConfigRequest request);

    @Transactional
    PromotionConfigResponse endPromotion(Long userProfileId, Long promotionId);
}
