package com.dentalstack.patient.feature.workflow.mytask;

import com.dentalstack.patient.feature.workflow.mytask.dto.*;
import com.dentalstack.patient.feature.workflow.mytask.service.MyTaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patient/my-task")
@AllArgsConstructor
@Tag(name = "My Task", description = "APIs for managing patient tasks")
public class MyTaskController {

    private final MyTaskService myTaskService;

    @Operation(summary = "Add a new task", description = "Creates a new task for a patient, doctor, and user profile.")
    @PostMapping("/add")
    public void addMyTask(@RequestBody MyTaskRequestDTO myTaskRequestDTO) {
        myTaskService.addMyTask(myTaskRequestDTO);
    }

    @Operation(summary = "Get task by ID", description = "Fetches a task based on its unique ID.")
    @PostMapping("/get")
    public ResponseEntity<MyTaskResponseDTO> getMyTaskById(@RequestBody MyTaskGetRequestDTO request) {
        MyTaskResponseDTO response = myTaskService.getTaskById(request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/get/all-task")
    public ResponseEntity<List<MyTaskResponseDTO>> getAllMyTasks(@RequestBody MyTaskGetRequestByFilterDTO request) {
        List<MyTaskResponseDTO> responses = myTaskService.getAllMyTasks(request);
        return new ResponseEntity<>(responses, HttpStatus.OK);
    }

    @PutMapping("/")
    public void updateMyTask(@RequestBody MyTaskUpdateRequest request) {
        myTaskService.updateMyTask(request);
    }

    @DeleteMapping("/delete/{taskId}")
    public void deleteByTaskId(@PathVariable Long taskId) {
        myTaskService.deleteByTaskId(taskId);
    }
}
