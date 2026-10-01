package com.dentalstack.chat.client;

import com.dentalstack.chat.dto.doctor.DoctorDetails;
import com.dentalstack.chat.dto.doctor.DoctorForChatService;
import com.dentalstack.chat.dto.doctor.DoctorResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "doctor-service", url = "${spring.cloud.openfeign.client.config.doctor-service.url}")
public interface DoctorServiceClient {

    @GetMapping("/doctor/v1/get/details/{doctorId}/{patientId}")
    DoctorForChatService getDoctorForChat(
            @PathVariable(value = "doctorId") Long doctorId, @PathVariable(value = "patientId") Long patientId);

    @GetMapping("/doctor/v1/get/patient/{doctorId}")
    DoctorResponse getDoctorPatientId(@PathVariable(value = "doctorId") Long doctorId);

    @GetMapping("/doctor/v1/details")
    DoctorDetails getDoctorDetail(@RequestParam(value = "doctor_id") Long doctorId);

    @GetMapping("/doctor/v1/email/{email_id}")
    DoctorDetails getDoctor(@PathVariable(value = "email_id") String emailId);

    @GetMapping("/doctor/v1/doc-details")
    DoctorDetails getDoctorDetails(
            @RequestParam(value = "emailId") String emailId,
            @RequestParam("organizationId") Long organizationId,
            @RequestParam("xOrgName") String xOrgName);

    @PostMapping("/doctor/v1/is-email-verified/{email}")
    boolean isEmailVerified(@PathVariable(value = "email") String email);

    @GetMapping("/doctor/v1/get/by/mobile/{doctorMobile}/org/{orgName}")
    boolean findDoctorWithMobileNumberAndOrg(@PathVariable String doctorMobile, @PathVariable String orgName);
}
