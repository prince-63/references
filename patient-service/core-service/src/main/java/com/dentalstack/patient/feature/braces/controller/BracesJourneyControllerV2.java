package com.dentalstack.patient.feature.braces.controller;

import com.dentalstack.patient.feature.braces.dto.BracesJourneyDetails;
import com.dentalstack.patient.feature.braces.dto.GetBracesJourneyRequest;
import com.dentalstack.patient.feature.braces.service.BracesJourneyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Braces v2", description = "Braces APIs v2")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/braces/v2")
@Slf4j
public class BracesJourneyControllerV2 {

    private final BracesJourneyService bracesService;

    @PostMapping("/")
    @Operation(summary = "Get the list of the braces patient for web only with appointments")
    public ResponseEntity<List<BracesJourneyDetails>> getBracesJourneysForWeb(
            @Valid @RequestBody GetBracesJourneyRequest request) {
        var status = request.getStatus();
        var doctorId = request.getDoctorId();
        var profileId = request.getProfileId();
        var organizationId = request.getOrganizationId();
        return ResponseEntity.ok(
                bracesService.getBracesJourneyDetailsForOrganization(doctorId, status, profileId, organizationId));
    }
}
