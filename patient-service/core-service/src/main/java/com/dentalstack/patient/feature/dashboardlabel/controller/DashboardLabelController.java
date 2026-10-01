package com.dentalstack.patient.feature.dashboardlabel.controller;

import com.dentalstack.patient.feature.dashboardlabel.dto.DashboardLabelRequest;
import com.dentalstack.patient.feature.dashboardlabel.dto.DashboardLabelsDetails;
import com.dentalstack.patient.feature.dashboardlabel.service.DashboardLabelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Doctor dashboard label", description = "Doctor dashboard label APIs")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/dashboard/label/v1")
public class DashboardLabelController {

    private final DashboardLabelService dashboardLabelService;

    @PostMapping("/create-or-update")
    public ResponseEntity<DashboardLabelsDetails> createOrUpdateDashboardLabels(
            @RequestBody @Valid DashboardLabelRequest request) {
        return ResponseEntity.ok(dashboardLabelService.saveOrUpdateDashboardLabels(request));
    }

    @DeleteMapping("/{profile_id}")
    @Operation(summary = "Get labels")
    public ResponseEntity<DashboardLabelsDetails> getDashboardLabels(@PathVariable("profile_id") long profileId) {
        return ResponseEntity.ok(dashboardLabelService.getDashboardLabels(profileId));
    }
}
