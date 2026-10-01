package com.dentalstack.patient.feature.appointment.controller;

import com.dentalstack.patient.feature.appointment.dto.AllAppointmentsDetails;
import com.dentalstack.patient.feature.appointment.dto.AppointmentDetails;
import com.dentalstack.patient.feature.appointment.dto.CreateAppointmentRequest;
import com.dentalstack.patient.feature.appointment.dto.UpdateAppointmentRequest;
import com.dentalstack.patient.feature.appointment.exception.FailedToParseCreateAppointment;
import com.dentalstack.patient.feature.appointment.service.AppointmentService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Appointment", description = "Appointment APIs")
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/appointment/v1")
public class AppointmentController {

    private final ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());

    private final AppointmentService appointmentService;

    @PostMapping(
            value = "/create",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Create the appointment")
    public ResponseEntity<AppointmentDetails> createAppointment(
            @Parameter(
                            name = "Request body",
                            example =
                                    """
           {
             "braces_journey_id": 74,
             "amount": 250,
             "status": "ACTIVE",
             "doctor_id": 315,
             "patient_id": 1201,
             "product_type_name": "BRACES",
             "jaw_details": [
               {
                 "material_name": "Metal Bracket",
                 "material_size": "Standard",
                 "space_enclosure_tools": [
                   "Tool1",
                   "Tool2"
                 ],
                 "accessories": [
                   "Accessory1",
                   "Accessory2"
                 ],
                 "note": "Requires careful handling",
                 "shape": "Round",
                 "treatment_stage_type": "Initial",
                 "jaw_type": "UPPER"
               },
               {
                 "material_name": "Ceramic Bracket",
                 "material_size": "Small",
                 "space_enclosure_tools": [
                   "Tool3",
                   "Tool4"
                 ],
                 "accessories": [
                   "Accessory3",
                   "Accessory4"
                 ],
                 "note": "Patient prefers clear braces",
                 "shape": "Oval",
                 "treatment_stage_type": "Advanced",
                 "jaw_type": "LOWER",
                 "start_date": "2024-10-08T00:00:00.000+05:30",
                 "end_date": "2024-10-22T00:30:00.000+05:30",
                 "reminder_id": 1
               }
             ]
           }
                                              """)
                    @Valid
                    @RequestParam("details")
                    String reqStr,
            @Valid @RequestPart(value = "files", required = false) MultipartFile[] files) {
        new CreateAppointmentRequest();
        CreateAppointmentRequest request;
        try {
            request = mapper.readValue(reqStr, CreateAppointmentRequest.class);
        } catch (JsonProcessingException e) {
            throw new FailedToParseCreateAppointment(reqStr, e);
        }
        return ResponseEntity.ok(appointmentService.createAppointment(request, files));
    }

    @PostMapping("/update")
    @Operation(summary = "Update the appointment")
    public ResponseEntity<AppointmentDetails> updateAppointment(@Valid @RequestBody UpdateAppointmentRequest request) {
        return ResponseEntity.ok(AppointmentDetails.from(appointmentService.updateAppointment(request)));
    }

    @GetMapping("/{appointment_id}")
    @Operation(summary = "Get appointment by ID")
    public ResponseEntity<AppointmentDetails> getAppointment(@PathVariable("appointment_id") Long appointmentId) {
        return ResponseEntity.ok(AppointmentDetails.from(appointmentService.getAppointment(appointmentId)));
    }

    @GetMapping
    @Operation(summary = "Get the list Appointment of the patient or the doctor")
    public ResponseEntity<AllAppointmentsDetails> getAppointment(
            @RequestParam(name = "doctor_id") long doctorId,
            @RequestParam(name = "patient_id", required = false) Long patientId) {
        if (patientId != null) {
            return ResponseEntity.ok(
                    AllAppointmentsDetails.from(appointmentService.getAppointment(doctorId, patientId)));
        } else {
            return ResponseEntity.ok(AllAppointmentsDetails.from(appointmentService.getAppointmentOfDoctor(doctorId)));
        }
    }

    @PostMapping(
            value = "/files/{appointment_id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Add files for the appointment")
    public ResponseEntity<AppointmentDetails> addFiles(
            @RequestParam("doctor_id") long doctorId,
            @PathVariable("appointment_id") long appointmentId,
            @RequestPart(value = "files") MultipartFile[] files) {
        return ResponseEntity.ok(AppointmentDetails.from(appointmentService.addFiles(appointmentId, doctorId, files)));
    }

    @DeleteMapping("/{appointment_id}")
    @Operation(summary = "Delete an appointment by ID")
    public void deleteAppointmentById(
            @Parameter(description = "Appointment ID") @PathVariable("appointment_id") long appointmentId) {
        appointmentService.deleteAppointment(appointmentId);
    }
}
