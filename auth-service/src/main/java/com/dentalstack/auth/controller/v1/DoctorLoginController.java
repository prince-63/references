package com.dentalstack.auth.controller.v1;

import com.dentalstack.auth.dto.*;
import com.dentalstack.auth.dto.doctor.*;
import com.dentalstack.auth.service.DoctorLoginService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/auth/doctor/v1")
@SecurityRequirements({
    @SecurityRequirement(name = "bearer-jwt"),
    @SecurityRequirement(name = "org-name"),
    @SecurityRequirement(name = "org-token")
})
public class DoctorLoginController {

    private final DoctorLoginService doctorLoginService;

    @PostMapping("/signup/password")
    @Operation(summary = "Sign up a new doctor")
    public ResponseEntity<AuthDetails> passwordSignUp(
            @Valid @RequestBody DoctorPasswordSignUpRequest request, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return ResponseEntity.ok((doctorLoginService.passwordSignUp(request, xOrgName)));
    }

    @PostMapping("/signup/google")
    @Operation(summary = "Sign up process of the doctor using Google")
    public ResponseEntity<AuthDetails> googleSignup(
            @Valid @RequestBody DoctorGoogleSignupRequest request, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return ResponseEntity.ok((doctorLoginService.googleSignup(request, xOrgName)));
    }

    @PostMapping("/signup/apple")
    @Operation(summary = "Sign up process of the doctor using Google")
    public ResponseEntity<AuthDetails> appleSignup(
            @Valid @RequestBody DoctorGoogleSignupRequest request, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return ResponseEntity.ok((doctorLoginService.appleSignup(request, xOrgName)));
    }

    @PostMapping("/email/update")
    @Operation(summary = "Update Email of the doctor.")
    public void updateDoctorEmail(@RequestBody UpdateDoctorEmailRequest updateDoctorEmailRequest) {
        doctorLoginService.updateDoctorEmail(updateDoctorEmailRequest);
    }

    @GetMapping("/check/login/auth-type/{email}")
    @Operation(summary = "Check doctor login auth type")
    public boolean loginAuthTypeCheck(@PathVariable(value = "email") String email) {
        return doctorLoginService.loginAuthTypeCheck(email);
    }
}
