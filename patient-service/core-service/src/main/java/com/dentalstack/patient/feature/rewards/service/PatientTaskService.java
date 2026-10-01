package com.dentalstack.patient.feature.rewards.service;

import com.dentalstack.patient.feature.rewards.dto.request.CompleteTaskRequest;
import com.dentalstack.patient.feature.rewards.dto.request.CompletedTaskGetRequest;
import com.dentalstack.patient.feature.rewards.dto.response.PatientTaskListResponse;
import com.dentalstack.patient.feature.rewards.dto.response.TaskCompletionHistoryItem;
import com.dentalstack.patient.feature.rewards.dto.response.TaskCompletionListResponse;
import com.dentalstack.patient.feature.rewards.dto.response.TaskCompletionResponse;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

public interface PatientTaskService {

    @Transactional(readOnly = true)
    PatientTaskListResponse getAvailableTasksByPatientId(Long patientId);

    @Transactional(readOnly = true)
    PatientTaskListResponse getAvailableTasks(Long patientId);

    @Transactional
    TaskCompletionResponse completeTask(CompleteTaskRequest request);

    @Transactional(readOnly = true)
    TaskCompletionListResponse getTaskHistory(Long patientId, String status, int page, int size);

    @Transactional(readOnly = true)
    List<TaskCompletionHistoryItem> getCompletedTaskHistory(CompletedTaskGetRequest request);

    List<TaskCompletionHistoryItem> getWellnessCompletedTaskHistory(CompletedTaskGetRequest request);
}
