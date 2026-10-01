package com.dentalstack.patient.feature.mcp.controller;

import com.dentalstack.patient.feature.mcp.dto.request.PatientDetailedSummeryRequest;
import com.dentalstack.patient.feature.mcp.dto.response.PatientDetailedSummeryResponse;
import com.dentalstack.patient.feature.mcp.service.McpApiExposeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Mcp related apis", description = "APIs related to MCP feature")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/mcp/v1")
public class McpApiExposeController {

    private final McpApiExposeService mcpApiExposeService;

    @PostMapping("/")
    @Operation(summary = "Get patient detailed summery")
    public ResponseEntity<List<PatientDetailedSummeryResponse>> getPatientDetailedSummery(
            @Valid @RequestBody PatientDetailedSummeryRequest request) {
        return ResponseEntity.ok(mcpApiExposeService.getPatientDetailedSummery(request));
    }
}
