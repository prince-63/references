package com.dentalstack.patient.feature.prescription.controller;

import com.dentalstack.patient.feature.prescription.dto.prescription.PrescriptionRequestDTO;
import com.dentalstack.patient.feature.prescription.dto.prescription.PrescriptionResponseDTO;
import com.dentalstack.patient.feature.prescription.dto.prescription.PrescriptionUpdateRequestDTO;
import com.dentalstack.patient.feature.prescription.entity.Prescription;
import com.dentalstack.patient.feature.prescription.service.PrescriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Patient Prescription", description = "APIs for managing patient prescriptions")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/prescription")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @Operation(
            summary = "Create Prescription for a patient",
            description = "Creates a new prescription for the given patient.",
            responses = {
                @ApiResponse(
                        responseCode = "201",
                        description = "Prescription created successfully",
                        content =
                                @Content(
                                        mediaType = "application/json",
                                        schema = @Schema(implementation = PrescriptionResponseDTO.class))),
                @ApiResponse(responseCode = "400", description = "Invalid request data")
            })
    @PostMapping("/add")
    public ResponseEntity<PrescriptionResponseDTO> addPrescription(
            @RequestBody PrescriptionRequestDTO prescriptionRequestDTO) {
        Prescription prescription = prescriptionService.createPrescription(prescriptionRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(PrescriptionResponseDTO.from(prescription));
    }

    @Operation(
            summary = "Get Prescription by ID",
            description = "Fetch a single prescription by its unique ID.",
            responses = {
                @ApiResponse(
                        responseCode = "200",
                        description = "Prescription found",
                        content =
                                @Content(
                                        mediaType = "application/json",
                                        schema = @Schema(implementation = PrescriptionResponseDTO.class))),
                @ApiResponse(responseCode = "404", description = "Prescription not found")
            })
    @GetMapping("/get/{prescriptionId}")
    public ResponseEntity<PrescriptionResponseDTO> getPrescriptionById(
            @Parameter(description = "ID of the prescription", example = "101") @PathVariable Long prescriptionId) {
        Prescription prescription = prescriptionService.getPrescriptionById(prescriptionId);
        return ResponseEntity.ok(PrescriptionResponseDTO.from(prescription));
    }

    @Operation(
            summary = "Get Prescriptions by Patient ID",
            description = "Retrieve all prescriptions linked to a particular patient. Optionally filter by order ID.",
            responses = {
                @ApiResponse(
                        responseCode = "200",
                        description = "List of prescriptions found",
                        content =
                                @Content(
                                        mediaType = "application/json",
                                        schema = @Schema(implementation = PrescriptionResponseDTO.class))),
                @ApiResponse(responseCode = "404", description = "No prescriptions found for patient")
            })
    @GetMapping("/get-by-patient/{patientId}")
    public ResponseEntity<List<PrescriptionResponseDTO>> getPrescriptionsByPatientId(
            @Parameter(description = "ID of the patient", example = "501") @PathVariable Long patientId,
            @Parameter(description = "Optional Order ID to filter prescriptions", example = "ORD-12345")
                    @RequestParam(required = false)
                    String orderId) {

        List<Prescription> prescriptions;
        if (orderId != null && !orderId.isEmpty()) {
            prescriptions = prescriptionService.getPrescriptionsByPatientIdAndOrderId(patientId, orderId);
        } else {
            prescriptions = prescriptionService.getPrescriptionByPatientId(patientId);
        }

        return ResponseEntity.ok(
                prescriptions.stream().map(PrescriptionResponseDTO::from).toList());
    }

    @PutMapping("/update/{prescriptionId}")
    @Operation(summary = "Update Prescription", description = "Update an existing prescription by its ID")
    public ResponseEntity<PrescriptionResponseDTO> updatePrescription(
            @PathVariable Long prescriptionId, @RequestBody PrescriptionUpdateRequestDTO dto) {
        Prescription updatedPrescription = prescriptionService.updatePrescription(prescriptionId, dto);
        return ResponseEntity.ok(PrescriptionResponseDTO.from(updatedPrescription));
    }

    @DeleteMapping("/delete/{prescriptionId}")
    @Operation(summary = "Delete Prescription", description = "Delete a prescription by its ID")
    public ResponseEntity<Void> deletePrescription(@PathVariable Long prescriptionId) {
        prescriptionService.deletePrescription(prescriptionId);
        return ResponseEntity.ok().build();
    }
}
