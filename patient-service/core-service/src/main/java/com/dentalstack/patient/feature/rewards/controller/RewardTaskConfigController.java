package com.dentalstack.patient.feature.rewards.controller;

import com.dentalstack.patient.feature.rewards.dto.request.*;
import com.dentalstack.patient.feature.rewards.dto.response.*;
import com.dentalstack.patient.feature.rewards.service.RewardTaskConfigService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patient/v1/rewards/tasks")
@RequiredArgsConstructor
public class RewardTaskConfigController {

    private final RewardTaskConfigService taskConfigService;

    @GetMapping
    public ResponseEntity<TaskConfigListResponse> getAllTasks(@RequestHeader("profileId") Long userProfileId) {
        TaskConfigListResponse response = taskConfigService.getAllTasks(userProfileId);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<TaskConfigResponse> createTask(@Valid @RequestBody CreateTaskConfigRequest request) {
        TaskConfigResponse response = taskConfigService.createTask(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/")
    public ResponseEntity<TaskConfigResponse> updateTask(@Valid @RequestBody UpdateTaskConfigRequest request) {
        TaskConfigResponse response = taskConfigService.updateTask(request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{taskId}/toggle")
    public ResponseEntity<TaskConfigResponse> toggleTask(
            @RequestHeader("profileId") Long userProfileId, @PathVariable Long taskId, @RequestParam Boolean enabled) {
        TaskConfigResponse response = taskConfigService.toggleTask(userProfileId, taskId, enabled);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@RequestHeader("profileId") Long userProfileId, @PathVariable Long taskId) {
        taskConfigService.deleteTask(userProfileId, taskId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/clone-default-tasks")
    @Operation(summary = "Clone all default tasks for a profile")
    public void cloneDefaultTasks(@RequestParam Long profileId) {
        taskConfigService.cloneDefaultTasks(profileId);
    }
}
