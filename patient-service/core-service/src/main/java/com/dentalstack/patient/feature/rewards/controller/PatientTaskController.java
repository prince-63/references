package com.dentalstack.patient.feature.rewards.controller;

import com.dentalstack.patient.feature.rewards.dto.request.CompleteTaskRequest;
import com.dentalstack.patient.feature.rewards.dto.request.CompletedTaskGetRequest;
import com.dentalstack.patient.feature.rewards.dto.response.PatientTaskListResponse;
import com.dentalstack.patient.feature.rewards.dto.response.TaskCompletionHistoryItem;
import com.dentalstack.patient.feature.rewards.dto.response.TaskCompletionListResponse;
import com.dentalstack.patient.feature.rewards.dto.response.TaskCompletionResponse;
import com.dentalstack.patient.feature.rewards.service.PatientTaskService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patient/v1/patient/rewards/tasks")
@RequiredArgsConstructor
public class PatientTaskController {

    private final PatientTaskService taskService;

    @GetMapping
    public ResponseEntity<PatientTaskListResponse> getAvailableTasks(@RequestHeader("patientId") Long patientId) {
        PatientTaskListResponse response = taskService.getAvailableTasks(patientId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/complete")
    public ResponseEntity<TaskCompletionResponse> completeTask(@Valid @RequestBody CompleteTaskRequest request) {
        TaskCompletionResponse response = taskService.completeTask(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<TaskCompletionListResponse> getTaskHistory(
            @RequestHeader("patientId") Long patientId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        TaskCompletionListResponse response = taskService.getTaskHistory(patientId, status, page, size);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/completed-task")
    public ResponseEntity<List<TaskCompletionHistoryItem>> getCompletedTasks(
            @Valid @RequestBody CompletedTaskGetRequest request) {
        List<TaskCompletionHistoryItem> response = taskService.getCompletedTaskHistory(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/wellness/completed-task")
    public ResponseEntity<List<TaskCompletionHistoryItem>> getWellnessCompletedTasks(
            @Valid @RequestBody CompletedTaskGetRequest request) {
        List<TaskCompletionHistoryItem> response = taskService.getWellnessCompletedTaskHistory(request);
        return ResponseEntity.ok(response);
    }
}
