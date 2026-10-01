package com.dentalstack.auth.controller.v1;

import com.dentalstack.auth.dto.AuthDetails;
import com.dentalstack.auth.dto.SendOTPRequest;
import com.dentalstack.auth.dto.ValidateEmailOTPRequest;
import com.dentalstack.auth.dto.ValidateOTPRequest;
import com.dentalstack.auth.dto.auth.*;
import com.dentalstack.auth.dto.auth.apple.AppleLoginRequest;
import com.dentalstack.auth.dto.auth.apple.StartAppleSignupRequest;
import com.dentalstack.auth.dto.deviceinfo.DeviceInfoDetails;
import com.dentalstack.auth.dto.deviceinfo.DeviceLogoutRequest;
import com.dentalstack.auth.dto.doctor.DeactivateLogin;
import com.dentalstack.auth.dto.doctor.DoctorPasswordLoginRequest;
import com.dentalstack.auth.dto.email.ResetPasswordRequestEmail;
import com.dentalstack.auth.enums.auth.credentials.CredentialType;
import com.dentalstack.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController("authControllerV1")
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/auth/v1")
@SecurityRequirements({
    @SecurityRequirement(name = "bearer-jwt"),
    @SecurityRequirement(name = "org-name"),
    @SecurityRequirement(name = "org-token")
})
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup/password/start")
    @Operation(summary = "Starts the password sign up")
    public ResponseEntity<AuthDetails> startPasswordSignUp(@Valid @RequestBody StartPasswordSignUpRequest request) {
        return ResponseEntity.ok(AuthDetails.from(authService.startPasswordSignUp(request)));
    }

    @PostMapping("/login/password")
    @Operation(summary = "Login the existing user")
    public ResponseEntity<AuthDetails> passwordLogin(@Valid @RequestBody DoctorPasswordLoginRequest request) {
        return ResponseEntity.ok((authService.passwordLogin(
                request.getEmail(),
                request.getPassword(),
                request.getDeviceInfoDetails(),
                request.getUserType(),
                request.getOrgName())));
    }

    @PostMapping("/signup/google/start")
    @Operation(summary = "Starts the sign up process using Google")
    public ResponseEntity<AuthDetails> startGoogleSignup(@Valid @RequestBody StartGoogleSignupRequest request) {
        return ResponseEntity.ok(AuthDetails.from(
                authService.startGoogleSignup(request.getEmail(), request.getToken(), request.getUserType())));
    }

    @PostMapping("/login/google")
    @Operation(summary = "Login using Google")
    public ResponseEntity<AuthDetails> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(authService.googleLogin(
                request.getEmail(),
                request.getToken(),
                request.getDeviceInfoDetails(),
                request.getUserType(),
                request.getOrgName()));
    }

    @PostMapping("/signup/apple/start")
    @Operation(summary = "Starts the sign up process using Apple")
    public ResponseEntity<AuthDetails> startAppleSignup(@Valid @RequestBody StartAppleSignupRequest request) {
        return ResponseEntity.ok(AuthDetails.from(
                authService.startAppleSignup(request.getEmail(), request.getIdToken(), request.getUserType())));
    }

    @PostMapping("/login/apple")
    @Operation(summary = "Login using Apple")
    public ResponseEntity<AuthDetails> appleLogin(@Valid @RequestBody AppleLoginRequest request) {
        return ResponseEntity.ok(authService.appleLogin(
                request.getEmail(),
                request.getIdToken(),
                request.getDeviceInfoDetails(),
                request.getUserType(),
                request.getOrgName()));
    }

    @PostMapping("/mobile/otp")
    @Operation(summary = "Send OTP to mobile no.")
    public ResponseEntity<AuthDetails> sendOTPOnMobile(@Valid @RequestBody SendOTPRequest request) {
        return ResponseEntity.ok(AuthDetails.from(authService.sendOTPOnMobile(request)));
    }

    @PostMapping("/deactivate/")
    @Operation(summary = "deactivate the user login")
    public void deactivateUserLogin(@Valid @RequestBody DeactivateLogin request) {
        authService.deactivateUserLogin(request);
    }

    @PostMapping("/mobile/otp/validate")
    @Operation(summary = "Validate the mobile otp")
    public ResponseEntity<AuthDetails> validateMobileOTP(@RequestBody ValidateOTPRequest request) {
        return ResponseEntity.ok(AuthDetails.from(authService.validateMobileOTP(request)));
    }

    @PostMapping("/email/otp")
    @Operation(summary = "Send OTP to the email.")
    public ResponseEntity<AuthDetails> sendOTPOnEmail(@Valid @RequestBody SendEmailOTPRequest request) {
        return ResponseEntity.ok(AuthDetails.from(authService.sendOTPOnEmail(request)));
    }

    @PostMapping("/email/otp/validate")
    @Operation(summary = "Validate otp of email")
    public ResponseEntity<AuthDetails> validateOTPOfEmail(@RequestBody ValidateEmailOTPRequest request) {
        return ResponseEntity.ok(AuthDetails.from(authService.validateOTPEmail(request)));
    }

    @PostMapping("/password/reset/email/otp")
    @Operation(summary = "Send OTP on email to reset password")
    public ResponseEntity<AuthDetails> sendPasswordResetOTP(@Valid @RequestBody SendEmailOTPRequest request) {
        return ResponseEntity.ok(AuthDetails.from(authService.sendPasswordResetOTPOnEmail(request)));
    }

    @PostMapping("/profile-exists")
    @Operation(summary = "Send OTP on email for existing user")
    public ResponseEntity<AuthDetails> sendOtpForExistingUser(@Valid @RequestBody SendEmailOTPRequest request) {
        return ResponseEntity.ok(AuthDetails.from(authService.sendPasswordResetOTPOnEmail(request)));
    }

    @PostMapping("/fetch-login-type")
    @Operation(summary = "Send user type for an existing user")
    public ResponseEntity<CredentialType> fetchUserLoginType(@Valid @RequestBody SendEmailOTPRequest request) {
        return ResponseEntity.ok(authService.fetchLoginType(request));
    }

    @PostMapping("/password/reset/validate")
    @Operation(summary = "Validate OTP and reset password")
    public ResponseEntity<AuthDetails> validateResetPasswordOTP(@Valid @RequestBody ValidateEmailOTPRequest request) {
        return ResponseEntity.ok(AuthDetails.from(authService.validateResetPasswordOTP(request)));
    }

    @PostMapping("/password/reset")
    @Operation(summary = "Set new password")
    public ResponseEntity<AuthDetails> resetPassword(@Valid @RequestBody ResetPasswordRequestEmail request) {
        return ResponseEntity.ok((authService.resetPassword(request)));
    }

    @PostMapping("/logout-device")
    @Operation(summary = "Logout the device")
    public ResponseEntity<String> logoutDevice(@Valid @RequestBody DeviceLogoutRequest request) {
        authService.logoutDevice(request);
        return ResponseEntity.ok("Device logout successfully");
    }

    @GetMapping("/device/{fingerprint}/{email}")
    @Operation(summary = "Check device is logged in or out")
    public boolean checkDeviceStatus(
            @PathVariable(value = "fingerprint") String fingerprint, @PathVariable(value = "email") String email) {
        return authService.checkDeviceStatus(fingerprint, email);
    }

    @PutMapping("/update")
    public void updateAuthPatient(@Valid @RequestBody UpdateAuthRequest request) {
        authService.updateAuthPatient(request);
    }

    @GetMapping("/device/{email}")
    @Operation(summary = "Get device details by email")
    public DeviceInfoDetails getLastLoggedInDeviceDetails(@PathVariable(value = "email") String email) {
        return authService.getLastLoggedInDeviceDetails(email);
    }

    @GetMapping("/user/{email}")
    @Operation(summary = "Get user details by email")
    public AuthDetails getUserDetailsByEmail(@PathVariable(value = "email") String email) {
        return authService.getUserDetailsByEmail(email);
    }

    @GetMapping("/check-with-email/{email}")
    @Operation(summary = "Check user is present with email")
    public boolean checkWithEmail(@PathVariable(value = "email") String email) {
        return authService.checkWithEmail(email);
    }
}
