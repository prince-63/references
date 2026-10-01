package com.dentalstack.patient.feature.treatment_insights.controller;

import com.dentalstack.patient.feature.treatment_insights.dto.InsightResponse;
import com.dentalstack.patient.feature.treatment_insights.service.TreatmentInsightService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/patient/treatment/insights")
@RequiredArgsConstructor
public class TreatmentInsightController {

    private final TreatmentInsightService service;

    @GetMapping("/today/{patientId}")
    public InsightResponse getInsights(@PathVariable Long patientId) {
        return service.getInsights(patientId);
    }
}
