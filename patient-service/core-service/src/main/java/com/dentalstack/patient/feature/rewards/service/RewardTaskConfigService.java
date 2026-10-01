package com.dentalstack.patient.feature.rewards.service;

import com.dentalstack.patient.feature.rewards.dto.request.CreateTaskConfigRequest;
import com.dentalstack.patient.feature.rewards.dto.request.UpdateTaskConfigRequest;
import com.dentalstack.patient.feature.rewards.dto.response.TaskConfigListResponse;
import com.dentalstack.patient.feature.rewards.dto.response.TaskConfigResponse;
import org.springframework.transaction.annotation.Transactional;

public interface RewardTaskConfigService {

    @Transactional(readOnly = true)
    TaskConfigListResponse getAllTasks(Long userProfileId);

    @Transactional
    TaskConfigResponse createTask(CreateTaskConfigRequest request);

    @Transactional
    void cloneDefaultTasks(Long targetProfileId);

    @Transactional
    TaskConfigResponse updateTask(UpdateTaskConfigRequest request);

    @Transactional
    TaskConfigResponse toggleTask(Long userProfileId, Long taskId, Boolean enabled);

    @Transactional
    void deleteTask(Long userProfileId, Long taskId);
}
