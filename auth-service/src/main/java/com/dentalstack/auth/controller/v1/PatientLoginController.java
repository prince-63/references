package com.dentalstack.auth.controller.v1;

import com.dentalstack.auth.dto.*;
import com.dentalstack.auth.dto.patient.*;
import com.dentalstack.auth.service.PatientLoginService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth/patient/v1")
@SecurityRequirement(name = "bearer-jwt")
public class PatientLoginController {

    private final PatientLoginService patientLoginService;

    @PostMapping("/signup/password")
    @Operation(summary = "Sign up a new patient")
    public ResponseEntity<AuthDetails> passwordSignUp(@Valid @RequestBody PatientPasswordSignUpRequest request) {
        return ResponseEntity.ok((patientLoginService.passwordSignUp(request)));
    }

    @PostMapping("/signup/google")
    @Operation(summary = "Sign up process of the doctor using Google")
    public ResponseEntity<AuthDetails> googleSignup(@Valid @RequestBody Patient3rdPartySignUpRequest request) {
        return ResponseEntity.ok((patientLoginService.googleSignup(request)));
    }

    @PostMapping("/signup/apple")
    @Operation(summary = "Sign up process of the doctor using Apple")
    public ResponseEntity<AuthDetails> appleSignup(@Valid @RequestBody Patient3rdPartySignUpRequest request) {
        return ResponseEntity.ok((patientLoginService.appleSignup(request)));
    }

    @PostMapping("/delete/{UUID}")
    @Operation(summary = "Delete patient by uuid")
    public void deleteByUUID(@PathVariable("UUID") String UUID) {
        patientLoginService.delete(UUID);
    }

    @DeleteMapping("/delete/{email}")
    @Operation(summary = "Delete patient by email")
    public void deleteByEmail(@PathVariable("email") String email) {
        patientLoginService.deleteByEmail(email);
    }
}
