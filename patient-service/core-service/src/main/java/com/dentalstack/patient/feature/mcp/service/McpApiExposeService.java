package com.dentalstack.patient.feature.mcp.service;

import com.dentalstack.patient.feature.mcp.dto.request.PatientDetailedSummeryRequest;
import com.dentalstack.patient.feature.mcp.dto.response.PatientDetailedSummeryResponse;
import jakarta.validation.Valid;
import java.util.List;

public interface McpApiExposeService {
    List<PatientDetailedSummeryResponse> getPatientDetailedSummery(@Valid PatientDetailedSummeryRequest request);
}
