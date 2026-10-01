package com.dentalstack.patient.feature.rewards.repository;

import com.dentalstack.patient.feature.rewards.entity.PromotionConfig;
import com.dentalstack.patient.feature.rewards.enums.PromotionStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PromotionConfigRepository extends JpaRepository<PromotionConfig, Long> {
    List<PromotionConfig> findByUserProfileIdAndStatusAndIsActiveTrue(
            Long userProfileId, PromotionStatus promotionStatus);

    List<PromotionConfig> findByUserProfileIdAndIsActiveTrueOrderByCreatedAtDesc(Long userProfileId);

    Optional<PromotionConfig> findByIdAndUserProfileIdAndIsActiveTrue(Long promotionId, Long userProfileId);
}
