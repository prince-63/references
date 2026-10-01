package com.dentalstack.patient.feature.aligner.controller.v1.production;

import com.dentalstack.patient.feature.aligner.dto.aligner.production.lab.AddAlignerProductionLabRequest;
import com.dentalstack.patient.feature.aligner.dto.aligner.production.lab.AlignerProductionLabDetails;
import com.dentalstack.patient.feature.aligner.dto.aligner.production.lab.AllAlignerProductionLabs;
import com.dentalstack.patient.feature.aligner.service.production.AlignerProductionLabService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Aligner Production Lab", description = "Aligner Production Lab APIs")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/aligner/production/lab/v1")
public class AlignerProductionLabController {

    private final AlignerProductionLabService alignerProductionLabService;

    @GetMapping("/")
    @Operation(summary = "Get all the aligner production labs")
    public ResponseEntity<AllAlignerProductionLabs> getAlignerProductionLab(
            @RequestParam(value = "doctor_id", required = false) Long doctorId,
            @RequestParam(value = "is_default", defaultValue = "false") Boolean isDefault) {
        return ResponseEntity.ok(
                AllAlignerProductionLabs.from(alignerProductionLabService.getLabs(doctorId, isDefault)));
    }

    @PostMapping("/")
    @Operation(summary = "Add new aligner production lab")
    public ResponseEntity<AlignerProductionLabDetails> addAlignerProductionLab(
            @RequestBody AddAlignerProductionLabRequest request) {
        return ResponseEntity.ok(
                AlignerProductionLabDetails.from(alignerProductionLabService.addAlignerProductionLab(request)));
    }
}
