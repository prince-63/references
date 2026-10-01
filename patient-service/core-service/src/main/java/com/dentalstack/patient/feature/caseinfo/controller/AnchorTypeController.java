package com.dentalstack.patient.feature.caseinfo.controller;

import com.dentalstack.patient.feature.caseinfo.dto.AnchorTypeAddRequest;
import com.dentalstack.patient.feature.caseinfo.entity.AnchorType;
import com.dentalstack.patient.feature.caseinfo.service.AnchorTypeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Case Information", description = "Case Information APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/treatment/plan/type/v1")
public class AnchorTypeController {

    private final AnchorTypeService anchorTypeService;

    @GetMapping("/anchor/{doctorId}")
    public ResponseEntity<List<AnchorType>> getAnchorTypeForDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(anchorTypeService.getAnchorTypeForDoctor(doctorId));
    }

    @PostMapping("/anchor")
    public ResponseEntity<String> addAnchorType(@Valid @RequestBody AnchorTypeAddRequest request) {
        anchorTypeService.addAnchorType(request);
        return ResponseEntity.ok("Success");
    }
}
