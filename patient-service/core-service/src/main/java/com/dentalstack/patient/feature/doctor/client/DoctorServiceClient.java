package com.dentalstack.patient.feature.doctor.client;

import com.dentalstack.patient.feature.doctor.dto.AssignPracticeLocationToPatientRequest;
import com.dentalstack.patient.feature.doctor.dto.ChangePatientInvitationStatusRequest;
import com.dentalstack.patient.feature.doctor.dto.DoctorDetails;
import com.dentalstack.patient.feature.doctor.dto.PLOfPatientResponse;
import com.dentalstack.patient.feature.doctor.dto.PracticeLocationDetails;
import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationCountDetails;
import com.dentalstack.patient.feature.doctorinvitation.dto.DoctorInvitationCountRequest;
import com.dentalstack.patient.feature.invitation.dto.PatientInvitationSendRequest;
import com.dentalstack.patient.feature.sampledata.dto.GenerateSampleDoctorRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(
        name = "doctor-service",
        url = "${spring.cloud.openfeign.client.config.doctor-service.url}",
        fallback = DoctorServiceClientFallback.class)
public interface DoctorServiceClient {

    @GetMapping("/doctor/v1/details")
    DoctorDetails getDoctorDetail(@RequestParam(value = "doctor_id") Long doctorId);

    @PostMapping("/doctor/invitation/v1/to/patient")
    void patientInvitationSend(@RequestBody PatientInvitationSendRequest request);

    @PostMapping("/doctor/invitation/v1/change/status")
    void changePatientInvitationStatus(@RequestBody ChangePatientInvitationStatusRequest request);

    @GetMapping("/doctor/practice/location/v1/get/count")
    Long getCountOfLocation(@RequestParam(value = "doctorId", required = false) Long doctorId);

    @GetMapping("/get/of/patient")
    List<PLOfPatientResponse> getPracticeLocationOfPatient(
            @RequestParam(value = "doctorId", required = false) Long doctorId);

    @GetMapping("/doctor/practice/location/v1/get/by/patientId/list")
    List<PLOfPatientResponse> getPracticeLocationOfPatient(
            @RequestParam(value = "patientId", required = false) List<Long> patientId);

    @GetMapping("/doctor/practice/location/v1/get/by/patientId/list/filter")
    List<PLOfPatientResponse> getPracticeLocationOfPatientFilter(
            @RequestParam(value = "patientId", required = false) List<Long> patientId);

    @GetMapping("/doctor/practice/location/v1/get/by/patientId")
    PLOfPatientResponse getIndividualClinic(@RequestParam(value = "patientId", required = false) Long patientId);

    @GetMapping("/doctor/invitation/v1/pending/details/{patientId}/{doctorId}")
    String getPendingInviteDetails(
            @PathVariable(value = "patientId") Long patientId, @PathVariable(value = "doctorId") Long doctorId);

    @PostMapping("/doctor/sample/data/v1")
    DoctorDetails getSampleDoctor(@RequestBody GenerateSampleDoctorRequest request);

    @GetMapping("/doctor/practice/location/v1/get/by/patientId")
    PracticeLocationDetails getPracticeLocation(@RequestParam("patientId") Long patientId);

    @GetMapping("/doctor/v1/doctor/details")
    DoctorDetails doctorDetailsForPatient(
            @RequestParam(value = "doctor_id", required = false) Long doctorId,
            @RequestParam(value = "patient_id", required = false) Long patientId);

    @PostMapping("/doctor/practice/location/v1/practice/location/assign/to/patient")
    String assignPracticeLocationToPatientForApp(
            @Valid @RequestBody AssignPracticeLocationToPatientRequest assignPracticeLocationToPatientRequest);

    @GetMapping("/doctor/v1/email/{email_id}")
    DoctorDetails getDoctorByEmail(@PathVariable("email_id") String emailId);

    @PostMapping("/doctor/practice/location/v1/remove/{patient_id}")
    void removePatientPractice(@PathVariable("patient_id") Long patientId);

    @PostMapping("/doctor/invitation/v1/count")
    DoctorInvitationCountDetails getInvitationCountOfAllRoles(@Valid @RequestBody DoctorInvitationCountRequest request);
}
