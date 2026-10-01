package com.dentalstack.patient.feature.dailywins.controller;

import com.dentalstack.patient.feature.dailywins.dto.DailyTaskResponse;
import com.dentalstack.patient.feature.dailywins.dto.PatientDailyWinsRequest;
import com.dentalstack.patient.feature.dailywins.service.DailyTaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patients/daily-wins")
@RequiredArgsConstructor
@Tag(name = "Daily Wins", description = "Daily Wins API")
public class DailyTaskController {

    private final DailyTaskService service;

    @GetMapping("/today/{patientId}")
    @Operation(summary = "get daily wins details of the patient")
    public List<DailyTaskResponse> getTodayTasks(@PathVariable(name = "patientId") Long patientId) {
        return service.getTodayTasks(patientId);
    }

    @PostMapping("/mark-complete")
    @Operation(summary = "mark patient daily wins item to completed")
    public void completeTask(@RequestBody PatientDailyWinsRequest request) {
        service.completeTask(request.getPatientId(), request.getCode());
    }
}
