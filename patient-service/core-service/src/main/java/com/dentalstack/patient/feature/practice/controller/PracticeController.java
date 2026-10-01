package com.dentalstack.patient.feature.practice.controller;

import com.dentalstack.patient.feature.practice.dto.AssignPracticeRequest;
import com.dentalstack.patient.feature.practice.service.PracticeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Practice", description = "Practice APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/practice/v1")
public class PracticeController {

    private final PracticeService practiceService;

    @PostMapping("/")
    @Operation(summary = "Assign practice")
    public void assignPractice(@Valid @RequestBody AssignPracticeRequest request) {
        practiceService.assignPractice(request);
    }
}
