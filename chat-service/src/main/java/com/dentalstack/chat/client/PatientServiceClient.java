package com.dentalstack.chat.client;

import com.dentalstack.chat.dto.chat.ChatPatientResponse;
import com.dentalstack.chat.dto.chat.GetFilesRequest;
import com.dentalstack.chat.dto.chat.PatientResponse;
import com.dentalstack.chat.dto.doctor.SuperAdminRequest;
import com.dentalstack.chat.dto.doctor.SuperAdminResponse;
import com.dentalstack.chat.dto.file.FileDetailsV2;
import com.dentalstack.chat.dto.file.FileUploadDetails;
import com.dentalstack.chat.dto.otp.UpdateMobileNumberRequest;
import com.dentalstack.chat.dto.patient.PatientDetails;
import com.dentalstack.chat.dto.timeline.AddEventRequest;
import com.dentalstack.chat.dto.timeline.InactivateEventsRequest;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@FeignClient(name = "patient-service", url = "${spring.cloud.openfeign.client.config.patient-service.url}")
public interface PatientServiceClient {
    @GetMapping("/patient/doctor/dashboard/v1/by/patientId")
    ChatPatientResponse getPatientDetails(@RequestParam(value = "patientId", required = false) Long patientId);

    @GetMapping("/patient/doctor/dashboard/v1/list/by/patientId")
    List<PatientResponse> getPatientListResponse(
            @RequestParam(value = "patientId", required = false) List<Long> patientId);

    @GetMapping("/patient/doctor/dashboard/v1/by/patientId")
    List<ChatPatientResponse> getPatientDetailsList(
            @RequestParam(value = "patientId", required = false) List<Long> patientId);

    @PostMapping("/patient/timeline/v1/event")
    void addEvent(@RequestBody AddEventRequest request);

    @GetMapping("/patient/profile/v1/{patient_id}")
    PatientDetails getPatient(@PathVariable("patient_id") Long id);

    @GetMapping("/patient/doctor/dashboard/v1/get/aligner/id/{patient_id}")
    Long getAlignerJourneyIdOfPatient(@PathVariable("patient_id") Long id);

    @PostMapping("/patient/profile/v1/update/mobile")
    String updateMobile(@RequestBody UpdateMobileNumberRequest request);

    @PostMapping("/patient/timeline/v1/events/inactivate")
    String inactivateEvents(@RequestBody InactivateEventsRequest request);

    @PostMapping(value = "/patient/files/v1/chat/files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    FileUploadDetails uploadFiles(@RequestPart("request") String reqStr, @RequestPart("files") MultipartFile[] files);

    @GetMapping("/patient/profile/v1/email")
    @Operation(summary = "Fetch the patient details with email")
    PatientDetails getPatientByEmail(@RequestParam(value = "email", required = false) String email);

    @GetMapping("/patient/doctor/dashboard/v2/chat")
    List<PatientResponse> getPatientDetailsForChatDashboard(
            @RequestParam(value = "doctorId") Long doctorId,
            @RequestParam(value = "organizationId") Long organizationId,
            @RequestParam(value = "profileId") Long profileId);

    @PostMapping("/patient/files/v1/get-files")
    List<FileDetailsV2> getFilesById(@RequestBody GetFilesRequest request);

    @GetMapping("/patient/chargebee/v1/get/whatsapp/details/{doctorId}")
    String isWhatsAppMessagingDetails(@PathVariable Long doctorId);

    @PostMapping("/patient/doctor/v1/super-admin/details")
    SuperAdminResponse getSuperAdminDetails(@Valid @RequestBody SuperAdminRequest request);
}
