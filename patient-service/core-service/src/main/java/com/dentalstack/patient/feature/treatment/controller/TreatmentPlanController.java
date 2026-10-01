package com.dentalstack.patient.feature.treatment.controller;

import com.dentalstack.patient.feature.treatment.service.TreatmentPlanService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Treatment", description = "Treatment Plan APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/doctor/dashboard/v2")
public class TreatmentPlanController {

    private final TreatmentPlanService treatmentPlanService;
}
