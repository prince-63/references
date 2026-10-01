package com.dentalstack.patient.feature.rewards.service.impl;

import com.dentalstack.patient.feature.rewards.dto.request.*;
import com.dentalstack.patient.feature.rewards.dto.response.*;
import com.dentalstack.patient.feature.rewards.entity.RewardTaskConfig;
import com.dentalstack.patient.feature.rewards.enums.TaskType;
import com.dentalstack.patient.feature.rewards.repository.RewardTaskConfigRepository;
import com.dentalstack.patient.feature.rewards.service.RewardTaskConfigService;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
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
public class RewardTaskConfigServiceImpl implements RewardTaskConfigService {

    private final RewardTaskConfigRepository taskConfigRepository;
    private final UserProfileRepository userProfileRepository;

    @Transactional(readOnly = true)
    @Override
    public TaskConfigListResponse getAllTasks(Long userProfileId) {
        log.info("Fetching all tasks for userProfileId: {}", userProfileId);

        List<RewardTaskConfig> tasks = taskConfigRepository.findByUserProfileIdAndIsActiveTrue(userProfileId);

        List<TaskConfigResponse> dailyTasks = tasks.stream()
                .filter(task -> task.getTaskType() == TaskType.DAILY)
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        List<TaskConfigResponse> wellnessChecks = tasks.stream()
                .filter(task -> task.getTaskType() == TaskType.DAILY_WELLNESS_CHECK)
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        List<TaskConfigResponse> milestones = tasks.stream()
                .filter(task -> task.getTaskType() == TaskType.MILESTONE)
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return TaskConfigListResponse.builder()
                .dailyTasks(dailyTasks)
                .wellnessChecks(wellnessChecks)
                .milestones(milestones)
                .totalCount(tasks.size())
                .build();
    }

    @Transactional
    @Override
    public TaskConfigResponse createTask(CreateTaskConfigRequest request) {
        log.info(
                "Creating task for userProfileId: {}, taskIdentifier: {}",
                request.getProfileId(),
                request.getTaskIdentifier());

        UserProfile userProfile = userProfileRepository
                .findById(request.getProfileId())
                .orElseThrow(() -> new GenericException("UserProfile not found"));

        boolean exists = taskConfigRepository.existsByUserProfileIdAndTaskIdentifierAndIsActiveTrue(
                request.getProfileId(), request.getTaskIdentifier());

        if (exists) {
            throw new GenericException("Task with identifier " + request.getTaskIdentifier() + " already exists");
        }

        RewardTaskConfig taskConfig = RewardTaskConfig.builder()
                .userProfile(userProfile)
                .taskIdentifier(request.getTaskIdentifier())
                .taskName(request.getTaskName())
                .taskDescription(request.getTaskDescription())
                .taskType(request.getTaskType())
                .category(request.getCategory())
                .frequency(request.getFrequency())
                .coinReward(request.getCoinReward())
                .streakRequirement(request.getStreakRequirement())
                .isEnabled(true)
                .isActive(true)
                .requiresVerification(
                        request.getRequiresVerification() != null ? request.getRequiresVerification() : false)
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .iconUrl(request.getIconUrl())
                .build();

        RewardTaskConfig saved = taskConfigRepository.save(taskConfig);
        log.info("Task created successfully with id: {}", saved.getId());

        return mapToResponse(saved);
    }

    @Transactional
    @Override
    public void cloneDefaultTasks(Long targetProfileId) {
        log.info("Cloning default tasks for target profile ID: {}", targetProfileId);

        UserProfile targetProfile = userProfileRepository
                .findById(targetProfileId)
                .orElseThrow(() -> new GenericException("Target UserProfile not found with ID: " + targetProfileId));

        List<RewardTaskConfig> defaultTasks = taskConfigRepository.findByIsDefaultTaskTrue();

        for (RewardTaskConfig defaultTask : defaultTasks) {
            try {
                boolean exists = taskConfigRepository.existsByUserProfileIdAndTaskIdentifierAndIsActiveTrue(
                        targetProfileId, defaultTask.getTaskIdentifier());

                if (exists) {
                    log.debug(
                            "Task with identifier {} already exists for profile {}, skipping",
                            defaultTask.getTaskIdentifier(),
                            targetProfileId);
                    continue;
                }

                RewardTaskConfig clonedTask = RewardTaskConfig.builder()
                        .userProfile(targetProfile)
                        .taskIdentifier(defaultTask.getTaskIdentifier())
                        .taskName(defaultTask.getTaskName())
                        .taskDescription(defaultTask.getTaskDescription())
                        .taskType(defaultTask.getTaskType())
                        .category(defaultTask.getCategory())
                        .frequency(defaultTask.getFrequency())
                        .coinReward(defaultTask.getCoinReward())
                        .streakRequirement(defaultTask.getStreakRequirement())
                        .isEnabled(defaultTask.getIsEnabled())
                        .isActive(defaultTask.getIsActive())
                        .isDefaultTask(false)
                        .requiresVerification(defaultTask.getRequiresVerification())
                        .displayOrder(defaultTask.getDisplayOrder())
                        .iconUrl(defaultTask.getIconUrl())
                        .build();

                taskConfigRepository.save(clonedTask);

            } catch (Exception e) {
                log.error(
                        "Error cloning task {} for profile {}: {}",
                        defaultTask.getTaskIdentifier(),
                        targetProfileId,
                        e.getMessage());
            }
        }
    }

    @Transactional
    @Override
    public TaskConfigResponse updateTask(UpdateTaskConfigRequest request) {
        log.info("Updating task id: {} for userProfileId: {}", request.getTaskId(), request.getProfileId());

        RewardTaskConfig taskConfig = taskConfigRepository
                .findByIdAndUserProfileIdAndIsActiveTrue(request.getTaskId(), request.getProfileId())
                .orElseThrow(() -> new GenericException("Task not found"));

        if (request.getTaskName() != null) {
            taskConfig.setTaskName(request.getTaskName());
        }
        if (request.getTaskDescription() != null) {
            taskConfig.setTaskDescription(request.getTaskDescription());
        }
        if (request.getCoinReward() != null) {
            taskConfig.setCoinReward(request.getCoinReward());
        }
        if (request.getRequiresVerification() != null) {
            taskConfig.setRequiresVerification(request.getRequiresVerification());
        }
        if (request.getDisplayOrder() != null) {
            taskConfig.setDisplayOrder(request.getDisplayOrder());
        }

        RewardTaskConfig updated = taskConfigRepository.save(taskConfig);
        log.info("Task updated successfully: {}", updated.getId());

        return mapToResponse(updated);
    }

    @Transactional
    @Override
    public TaskConfigResponse toggleTask(Long userProfileId, Long taskId, Boolean enabled) {
        log.info("Toggling task id: {} to enabled: {}", taskId, enabled);

        RewardTaskConfig taskConfig = taskConfigRepository
                .findByIdAndUserProfileIdAndIsActiveTrue(taskId, userProfileId)
                .orElseThrow(() -> new GenericException("Task not found"));

        taskConfig.setIsEnabled(enabled);
        RewardTaskConfig updated = taskConfigRepository.save(taskConfig);

        return mapToResponse(updated);
    }

    @Transactional
    @Override
    public void deleteTask(Long userProfileId, Long taskId) {
        log.info("Deleting task id: {} for userProfileId: {}", taskId, userProfileId);

        RewardTaskConfig taskConfig = taskConfigRepository
                .findByIdAndUserProfileIdAndIsActiveTrue(taskId, userProfileId)
                .orElseThrow(() -> new GenericException("Task not found"));

        taskConfig.setIsActive(false);
        taskConfigRepository.save(taskConfig);

        log.info("Task soft deleted successfully");
    }

    private TaskConfigResponse mapToResponse(RewardTaskConfig task) {
        return TaskConfigResponse.builder()
                .id(task.getId())
                .taskIdentifier(task.getTaskIdentifier())
                .taskName(task.getTaskName())
                .taskDescription(task.getTaskDescription())
                .taskType(task.getTaskType())
                .category(task.getCategory())
                .frequency(task.getFrequency())
                .coinReward(task.getCoinReward())
                .streakRequirement(task.getStreakRequirement())
                .isEnabled(task.getIsEnabled())
                .requiresVerification(task.getRequiresVerification())
                .displayOrder(task.getDisplayOrder())
                .iconUrl(task.getIconUrl())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
