package com.dentalstack.auth.controller.v2;

import com.dentalstack.auth.dto.AuthDetails;
import com.dentalstack.auth.dto.auth.AuthDetailsUpdateRequest;
import com.dentalstack.auth.dto.doctor.DoctorUrlSignUpRequest;
import com.dentalstack.auth.service.AuthServiceV2;
import com.dentalstack.auth.service.DoctorLoginService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/auth/doctor/v2")
@SecurityRequirement(name = "bearer-jwt")
public class DoctorLoginControllerV2 {

    private final DoctorLoginService doctorLoginService;
    private final AuthServiceV2 authServiceV2;

    @PostMapping("/signup/url")
    @Operation(summary = "Sign up a new doctor")
    public ResponseEntity<AuthDetails> signUpDoctorThroughUrl(
            @Valid @RequestBody DoctorUrlSignUpRequest request, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return ResponseEntity.ok((doctorLoginService.signUpDoctorThroughUrl(request, xOrgName)));
    }

    @PostMapping("/update/details")
    @Operation(summary = "Update the auth details")
    public ResponseEntity<AuthDetails> updateAuthDetails(
            @Valid @RequestBody AuthDetailsUpdateRequest request, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return ResponseEntity.ok(AuthDetails.from(authServiceV2.updateAuthDetails(request, xOrgName)));
    }
}
