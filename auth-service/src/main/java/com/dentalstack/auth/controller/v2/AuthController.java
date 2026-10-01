package com.dentalstack.auth.controller.v2;

import com.dentalstack.auth.dto.*;
import com.dentalstack.auth.dto.auth.*;
import com.dentalstack.auth.dto.auth.apple.AppleLoginRequest;
import com.dentalstack.auth.dto.auth.apple.StartAppleSignupRequest;
import com.dentalstack.auth.dto.deviceinfo.DeviceInfoDetails;
import com.dentalstack.auth.dto.deviceinfo.DeviceLogoutRequest;
import com.dentalstack.auth.dto.doctor.DeactivateLogin;
import com.dentalstack.auth.dto.doctor.DoctorPasswordLoginRequest;
import com.dentalstack.auth.dto.email.ResetPasswordRequestEmail;
import com.dentalstack.auth.enums.auth.credentials.CredentialType;
import com.dentalstack.auth.service.AuthServiceV2;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController("authControllerV2")
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/auth/v2")
@SecurityRequirements({
    @SecurityRequirement(name = "bearer-jwt"),
    @SecurityRequirement(name = "org-name"),
    @SecurityRequirement(name = "org-token")
})
public class AuthController {

    private final AuthServiceV2 authServiceV2;

    @PostMapping("/signup/password/start")
    @Operation(summary = "Starts the password sign up")
    public ResponseEntity<AuthDetails> startPasswordSignUp(
            @Valid @RequestBody StartPasswordSignUpRequest request, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return ResponseEntity.ok(AuthDetails.from(authServiceV2.startPasswordSignUp(request, xOrgName)));
    }

    @PostMapping("/login/password")
    @Operation(summary = "Login the existing user")
    public ResponseEntity<AuthDetails> passwordLogin(
            @Valid @RequestBody DoctorPasswordLoginRequest request, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return ResponseEntity.ok((authServiceV2.passwordLogin(
                request.getEmail(),
                request.getPassword(),
                request.getDeviceInfoDetails(),
                request.getUserType(),
                request.getOrgName(),
                request.getOrganizationId(),
                xOrgName)));
    }

    @PostMapping("/signup/google/start")
    @Operation(summary = "Starts the sign up process using Google")
    public ResponseEntity<AuthDetails> startGoogleSignup(
            @Valid @RequestBody StartGoogleSignupRequest request, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return ResponseEntity.ok(AuthDetails.from(authServiceV2.startGoogleSignup(
                request.getEmail(), request.getToken(), request.getUserType(), request.getOrganizationId(), xOrgName)));
    }

    @PostMapping("/login/google")
    @Operation(summary = "Login using Google")
    public ResponseEntity<AuthDetails> googleLogin(
            @Valid @RequestBody GoogleLoginRequest request, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return ResponseEntity.ok(authServiceV2.googleLogin(
                request.getEmail(),
                request.getToken(),
                request.getDeviceInfoDetails(),
                request.getUserType(),
                request.getOrgName(),
                request.getOrganizationId(),
                xOrgName));
    }

    @PostMapping("/signup/apple/start")
    @Operation(summary = "Starts the sign up process using Apple")
    public ResponseEntity<AuthDetails> startAppleSignup(
            @Valid @RequestBody StartAppleSignupRequest request, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return ResponseEntity.ok(AuthDetails.from(authServiceV2.startAppleSignup(
                request.getEmail(),
                request.getIdToken(),
                request.getUserType(),
                request.getOrganizationId(),
                xOrgName)));
    }

    @PostMapping("/login/apple")
    @Operation(summary = "Login using Apple")
    public ResponseEntity<AuthDetails> appleLogin(
            @Valid @RequestBody AppleLoginRequest request, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return ResponseEntity.ok(authServiceV2.appleLogin(
                request.getEmail(),
                request.getIdToken(),
                request.getDeviceInfoDetails(),
                request.getUserType(),
                request.getOrgName(),
                request.getOrganizationId(),
                xOrgName));
    }

    @PostMapping("/mobile/otp")
    @Operation(summary = "Send OTP to mobile no.")
    public ResponseEntity<AuthDetails> sendOTPOnMobile(
            @Valid @RequestBody SendOTPRequest request, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return ResponseEntity.ok(AuthDetails.from(authServiceV2.sendOTPOnMobile(request, xOrgName)));
    }

    @PostMapping("/deactivate/")
    @Operation(summary = "deactivate the user login")
    public void deactivateUserLogin(@Valid @RequestBody DeactivateLogin request, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        authServiceV2.deactivateUserLogin(request, xOrgName);
    }

    @PostMapping("/mobile/otp/validate")
    @Operation(summary = "Validate the mobile otp")
    public ResponseEntity<AuthDetails> validateMobileOTP(
            @RequestBody ValidateOTPRequest request, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return ResponseEntity.ok(AuthDetails.from(authServiceV2.validateMobileOTP(request, xOrgName)));
    }

    @PostMapping("/email/otp")
    @Operation(summary = "Send OTP to the email.")
    public ResponseEntity<AuthDetails> sendOTPOnEmail(
            @Valid @RequestBody SendEmailOTPRequest request, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return ResponseEntity.ok(AuthDetails.from(authServiceV2.sendOTPOnEmail(request, xOrgName)));
    }

    @PostMapping("/email/otp/validate")
    @Operation(summary = "Validate otp of email")
    public ResponseEntity<AuthDetails> validateOTPOfEmail(
            @RequestBody ValidateEmailOTPRequest request, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return ResponseEntity.ok(AuthDetails.from(authServiceV2.validateOTPEmail(request, xOrgName)));
    }

    @PostMapping("/password/reset/email/otp")
    @Operation(summary = "Send OTP on email to reset password")
    public ResponseEntity<AuthDetails> sendPasswordResetOTP(
            @Valid @RequestBody SendEmailOTPRequest request, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return ResponseEntity.ok(AuthDetails.from(authServiceV2.sendPasswordResetOTPOnEmail(request, xOrgName)));
    }

    @PostMapping("/profile-exists")
    @Operation(summary = "Send OTP on email for existing user")
    public ResponseEntity<AuthDetails> sendOtpForExistingUser(
            @Valid @RequestBody SendEmailOTPRequest request, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return ResponseEntity.ok(AuthDetails.from(authServiceV2.sendPasswordResetOTPOnEmail(request, xOrgName)));
    }

    @PostMapping("/fetch-login-type")
    @Operation(summary = "Send user type for an existing user")
    public ResponseEntity<CredentialType> fetchUserLoginType(
            @Valid @RequestBody SendEmailOTPRequest request, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return ResponseEntity.ok(authServiceV2.fetchLoginType(request, xOrgName));
    }

    @PostMapping("/password/reset/validate")
    @Operation(summary = "Validate OTP and reset password")
    public ResponseEntity<AuthDetails> validateResetPasswordOTP(
            @Valid @RequestBody ValidateEmailOTPRequest request, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return ResponseEntity.ok(AuthDetails.from(authServiceV2.validateResetPasswordOTP(request, xOrgName)));
    }

    @PostMapping("/password/reset")
    @Operation(summary = "Set new password")
    public ResponseEntity<AuthDetails> resetPassword(
            @Valid @RequestBody ResetPasswordRequestEmail request, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return ResponseEntity.ok((authServiceV2.resetPassword(request, xOrgName)));
    }

    @PostMapping("/logout-device")
    @Operation(summary = "Logout the device")
    public ResponseEntity<String> logoutDevice(
            @Valid @RequestBody DeviceLogoutRequest request, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        authServiceV2.logoutDevice(request, xOrgName);
        return ResponseEntity.ok("Device logout successfully");
    }

    @GetMapping("/device/{fingerprint}/{email}/{organizationId}")
    @Operation(summary = "Check device is logged in or out")
    public boolean checkDeviceStatus(
            @PathVariable(value = "fingerprint") String fingerprint,
            @PathVariable(value = "email") String email,
            @PathVariable("organizationId") Long organizationId,
            HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return authServiceV2.checkDeviceStatus(fingerprint, email, organizationId, xOrgName);
    }

    @PutMapping("/update")
    public void updateAuthPatient(@Valid @RequestBody UpdateAuthRequest request, HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        authServiceV2.updateAuthPatient(request, xOrgName);
    }

    @GetMapping("/device/{email}/{organizationId}")
    @Operation(summary = "Get device details by email")
    public DeviceInfoDetails getLastLoggedInDeviceDetails(
            @PathVariable(value = "email") String email,
            @PathVariable("organizationId") Long organizationId,
            HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return authServiceV2.getLastLoggedInDeviceDetails(email, organizationId, xOrgName);
    }

    @GetMapping("/user/{email}/{organizationId}")
    @Operation(summary = "Get user details by email")
    public AuthDetails getUserDetailsByEmail(
            @PathVariable(value = "email") String email,
            @PathVariable("organizationId") Long organizationId,
            HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return authServiceV2.getUserDetailsByEmail(email, organizationId, xOrgName);
    }

    @GetMapping("/check-with-email/{email}/{organizationId}")
    @Operation(summary = "Check user is present with email")
    public boolean checkWithEmail(
            @PathVariable(value = "email") String email,
            @PathVariable("organizationId") Long organizationId,
            HttpServletRequest servletRequest) {
        String xOrgName = servletRequest.getHeader("X-Organization-Name");
        return authServiceV2.checkWithEmail(email, organizationId, xOrgName);
    }

    @GetMapping("/check-with-email")
    @Operation(summary = "Check user is present with email")
    public boolean checkWithEmailAndOrgIdAndXOrgName(
            @RequestParam(value = "email") String email,
            @RequestParam(value = "organizationId") Long organizationId,
            @RequestParam("xOrgName") String xOrgName) {
        return authServiceV2.checkWithEmailAndOrgIdAndXOrgName(email, organizationId, xOrgName);
    }

    @PostMapping("/admin/get-password")
    @Operation(summary = "Get password and user details by email for admin dashboard")
    @SecurityRequirements({})
    public ResponseEntity<List<AuthDetails>> getPasswordByEmail(@Valid @RequestBody GetPasswordRequest request) {
        return ResponseEntity.ok(authServiceV2.getPasswordByEmail(request.getEmail()));
    }

    @PostMapping("/admin/unblock")
    @Operation(summary = "Unblock the user")
    @SecurityRequirements({})
    public void getPasswordByEmail(@Valid @RequestBody UnblockRequest request) {
        authServiceV2.unblockUser(request.getEmail());
    }

    @PostMapping("/validate/password")
    @Operation(summary = "Validate Password")
    @SecurityRequirements({})
    public List<Long> findMatchingAccount(@RequestBody AccountPasswordValidateRequest request) {
        return authServiceV2.findMatchingAccount(request);
    }
}
