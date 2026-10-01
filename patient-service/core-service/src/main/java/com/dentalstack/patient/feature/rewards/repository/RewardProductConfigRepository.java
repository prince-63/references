package com.dentalstack.patient.feature.rewards.repository;

import com.dentalstack.patient.feature.rewards.entity.RewardProductConfig;
import com.dentalstack.patient.feature.rewards.enums.ProductStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RewardProductConfigRepository extends JpaRepository<RewardProductConfig, Long> {

    List<RewardProductConfig> findByUserProfileIdAndIsActiveTrueOrderByDisplayOrderAsc(Long userProfileId);

    Optional<RewardProductConfig> findByIdAndUserProfileIdAndIsActiveTrue(Long productId, Long userProfileId);

    List<RewardProductConfig> findByUserProfileIdAndIsActiveTrueAndStatusNotOrderByDisplayOrderAsc(
            Long userProfileId, ProductStatus productStatus);
}
