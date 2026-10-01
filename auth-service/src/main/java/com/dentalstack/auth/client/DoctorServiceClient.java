package com.dentalstack.auth.client;

import com.dentalstack.auth.dto.doctor.*;
import com.dentalstack.auth.dto.doctor.invitation.DoctorInvitationAcceptRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "doctor-service")
public interface DoctorServiceClient {

    @GetMapping("/doctor/v1/email/{email_id}")
    DoctorDetails getDoctor(@PathVariable(value = "email_id") String emailId);

    @GetMapping("/doctor/v1/doc-details")
    DoctorDetails getDoctorDetails(
            @RequestParam(value = "emailId") String emailId,
            @RequestParam("organizationId") Long organizationId,
            @RequestParam("xOrgName") String xOrgName);

    @PostMapping("/doctor/v1/sign/up")
    DoctorDetails signUp(@Valid @RequestBody SignUpDoctor req);

    @PostMapping("/doctor/v1/reset-password")
    ResetPasswordResponse resetPassword(@RequestBody SendResetPasswordOTPRequest sendResetPasswordOTPRequest);

    @PostMapping("/doctor/invitation/v1/accept")
    DoctorDetails acceptInvitation(@Valid @RequestBody DoctorInvitationAcceptRequest request);

    @GetMapping("/doctor/v1/emails")
    Map<String, DoctorDetails> getDoctorsByEmails(@RequestParam List<String> emails);
}
