package com.dentalstack.patient.feature.gettingstarted.controller;

import com.dentalstack.patient.feature.gettingstarted.dto.DoctorDashboardGettingStartedDetails;
import com.dentalstack.patient.feature.gettingstarted.dto.GettingStartedRequest;
import com.dentalstack.patient.feature.gettingstarted.dto.SkipGettingStartedRequest;
import com.dentalstack.patient.feature.gettingstarted.service.GettingStartedService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Doctor dashboard getting started", description = "Doctor dashboard getting started APIs")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/getting/started/v1")
public class GettingStartedController {

    private final GettingStartedService gettingStartedService;

    @PostMapping("/skip")
    public void skipGettingStarted(@Valid @RequestBody SkipGettingStartedRequest request) {
        gettingStartedService.skipGettingStarted(request);
    }

    @PostMapping("/details")
    public DoctorDashboardGettingStartedDetails gettingStartedDetails(
            @Valid @RequestBody GettingStartedRequest request) {
        return gettingStartedService.gettingStartedDetails(request);
    }
}
