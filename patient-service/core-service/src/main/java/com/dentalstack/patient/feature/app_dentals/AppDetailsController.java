package com.dentalstack.patient.feature.app_dentals;

import com.dentalstack.patient.feature.app_dentals.dto.AppDetailsRequest;
import com.dentalstack.patient.feature.app_dentals.dto.AppDetailsResponse;
import com.dentalstack.patient.feature.app_dentals.service.AppDetailsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "App details", description = "APIs to perform on app details")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/app/v1")
public class AppDetailsController {

    private final AppDetailsService appDetailsService;

    @Operation(summary = "Get All App Details")
    @GetMapping("/app-details")
    public ResponseEntity<List<AppDetailsResponse>> getAllAppDetails() {
        List<AppDetailsResponse> appDetailsList = appDetailsService.getAllAppDetails();
        return ResponseEntity.ok(appDetailsList);
    }

    @Operation(summary = "Update App Details by App Name")
    @PutMapping("/app-details")
    public ResponseEntity<AppDetailsResponse> updateAppDetailsByAppName(@RequestBody AppDetailsRequest request) {
        AppDetailsResponse updatedAppDetails = appDetailsService.updateAppDetailsByAppName(request);
        return ResponseEntity.ok(updatedAppDetails);
    }
}
