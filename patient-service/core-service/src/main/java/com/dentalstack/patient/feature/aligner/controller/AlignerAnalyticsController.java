package com.dentalstack.patient.feature.aligner.controller;

import com.dentalstack.patient.feature.aligner.dto.analytics.AlignerAnalyticsCountResponse;
import com.dentalstack.patient.feature.aligner.dto.analytics.AlignerPatientAnalyticsDetailsRequest;
import com.dentalstack.patient.feature.aligner.dto.analytics.AlignerPatientAnalyticsDetailsResponse;
import com.dentalstack.patient.feature.aligner.dto.analytics.ChartCountForAnalyticsRequest;
import com.dentalstack.patient.feature.aligner.dto.analytics.PatientRemindAllForAnalytics;
import com.dentalstack.patient.feature.aligner.service.AlignerAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Aligner analytics", description = " Aligner analytics APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/aligner/analytics/v1")
public class AlignerAnalyticsController {

    private final AlignerAnalyticsService alignerAnalyticsService;

    @PostMapping("/chart-count")
    @Operation(summary = "Get aligner analytics chart count data")
    public ResponseEntity<AlignerAnalyticsCountResponse> getChartCountData(
            @Valid @RequestBody ChartCountForAnalyticsRequest request) {
        return ResponseEntity.ok(alignerAnalyticsService.getChartCountData(request));
    }

    @PostMapping("/")
    @Operation(summary = "Get aligner analytics patients details")
    public ResponseEntity<AlignerPatientAnalyticsDetailsResponse> getPatientsAnalyticsDetails(
            @Valid @RequestBody AlignerPatientAnalyticsDetailsRequest request) {
        return ResponseEntity.ok(alignerAnalyticsService.getPatientsAnalyticsDetails(request));
    }

    @PostMapping("/for-remind-all")
    @Operation(summary = "Get aligner analytics patients details")
    public ResponseEntity<List<PatientRemindAllForAnalytics>> getPatientForRemindAll(
            @Valid @RequestBody ChartCountForAnalyticsRequest request) {
        return ResponseEntity.ok(alignerAnalyticsService.getPatientForRemindAll(request));
    }
}
