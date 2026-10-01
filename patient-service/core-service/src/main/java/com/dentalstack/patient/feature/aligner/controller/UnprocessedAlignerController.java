package com.dentalstack.patient.feature.aligner.controller;

import com.dentalstack.patient.feature.aligner.dto.UnprocessedAlignerListResponse;
import com.dentalstack.patient.feature.aligner.dto.UnprocessedAlignerRequest;
import com.dentalstack.patient.feature.aligner.service.UnprocessedAlignerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Unprocessed aligner", description = "Unprocessed aligner apis")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/unprocessed-aligner/v1")
public class UnprocessedAlignerController {

    private final UnprocessedAlignerService unprocessedAlignerService;

    @Operation(
            summary = "Get unprocessed aligner details",
            description = "Get unprocessed aligner details with filters")
    @PostMapping("/")
    public ResponseEntity<UnprocessedAlignerListResponse> getUnprocessedAlignerList(
            @Valid @RequestBody UnprocessedAlignerRequest request) {
        UnprocessedAlignerListResponse response = unprocessedAlignerService.getUnprocessedAlignerList(request);
        return ResponseEntity.ok(response);
    }
}
