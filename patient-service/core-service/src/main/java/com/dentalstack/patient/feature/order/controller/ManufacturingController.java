package com.dentalstack.patient.feature.order.controller;

import com.dentalstack.patient.feature.order.dto.CreateManufacturingRequest;
import com.dentalstack.patient.feature.order.dto.GetManufacturingRequest;
import com.dentalstack.patient.feature.order.dto.ManufacturingResponse;
import com.dentalstack.patient.feature.order.dto.ProcessedAndUnprocessedManufacturingResponse;
import com.dentalstack.patient.feature.order.dto.UpdateManufacturingRequest;
import com.dentalstack.patient.feature.order.dto.UpdateManufacturingShippingRequest;
import com.dentalstack.patient.feature.order.service.ManufacturingService;
import com.dentalstack.patient.feature.treatment.exception.FailedToParseCreateTreatmentPlan;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Manufacturing API", description = "Manufacturing api")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/manufacturing")
@Slf4j
public class ManufacturingController {

    private final ManufacturingService manufacturingService;
    private final ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Operation(summary = "Get manufacturing details", description = "Get specific manufacturing batch details")
    @GetMapping("/{manufacturingId}")
    public ResponseEntity<ManufacturingResponse> getManufacturingDetails(
            @Parameter(description = "Manufacturing ID") @PathVariable Long manufacturingId) {

        ManufacturingResponse response = manufacturingService.getManufacturingDetails(manufacturingId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get manufacturing list", description = "Get list of all manufacturing batches for an patient")
    @PostMapping("/list")
    public ResponseEntity<ProcessedAndUnprocessedManufacturingResponse> getManufacturingList(
            @Valid @RequestBody GetManufacturingRequest request) {
        ProcessedAndUnprocessedManufacturingResponse response = manufacturingService.getManufacturingList(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Create manufacturing batch", description = "Create a new manufacturing batch for treatment")
    @PostMapping("/create")
    public ResponseEntity<ManufacturingResponse> createManufacturing(
            @Valid @RequestBody CreateManufacturingRequest request) {
        ManufacturingResponse response = manufacturingService.createManufacturing(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Update manufacturing", description = "Update manufacturing batch")
    @PutMapping("/update")
    public ResponseEntity<ManufacturingResponse> updateManufacturing(
            @Valid @RequestBody UpdateManufacturingRequest request) {
        ManufacturingResponse response = manufacturingService.updateManufacturing(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping(
            value = "/update/shipping",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Update shipping")
    public ResponseEntity<ManufacturingResponse> updateShippingDetails(
            @Parameter(
                            name = "",
                            example =
                                    """
            {
              "status": "SHIPPED",
              "shipping_date": "2025-06-12",
              "manufacturing_id": 2,
              "tentative_delivery_date": "2025-06-15",
              "tracking_number": "TRACK123456",
              "tracking_link": "https://courier.com/track/123456",
              "patient_id": 213,
              "doctor_id": 49
            }
            """)
                    @Valid
                    @RequestParam("updateManufacturingRequest")
                    String updateManufacturingRequest,
            @Valid @RequestPart(value = "documents", required = false) MultipartFile[] document) {

        UpdateManufacturingShippingRequest request;
        try {
            request = mapper.readValue(updateManufacturingRequest, UpdateManufacturingShippingRequest.class);
        } catch (JsonProcessingException e) {
            throw new FailedToParseCreateTreatmentPlan(updateManufacturingRequest, e);
        }
        return ResponseEntity.ok(manufacturingService.updateShippingDetails(request, document));
    }
}
