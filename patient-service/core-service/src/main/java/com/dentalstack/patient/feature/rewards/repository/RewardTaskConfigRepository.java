package com.dentalstack.patient.feature.rewards.repository;

import com.dentalstack.patient.feature.rewards.entity.RewardTaskConfig;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RewardTaskConfigRepository extends JpaRepository<RewardTaskConfig, Long> {

    List<RewardTaskConfig> findByUserProfileIdAndIsActiveTrueAndIsEnabledTrue(Long userProfileId);

    boolean existsByUserProfileIdAndTaskIdentifierAndIsActiveTrue(Long userProfileId, @NotBlank String taskIdentifier);

    Optional<RewardTaskConfig> findByIdAndUserProfileIdAndIsActiveTrue(Long taskId, Long userProfileId);

    List<RewardTaskConfig> findByUserProfileIdAndIsActiveTrue(Long userProfileId);

    List<RewardTaskConfig> findByIsDefaultTaskTrue();
}
