package com.dentalstack.auth.service;

import com.dentalstack.auth.dto.AuthDetails;
import com.dentalstack.auth.dto.SendOTPRequest;
import com.dentalstack.auth.dto.ValidateEmailOTPRequest;
import com.dentalstack.auth.dto.ValidateOTPRequest;
import com.dentalstack.auth.dto.auth.*;
import com.dentalstack.auth.dto.deviceinfo.DeviceInfoDetails;
import com.dentalstack.auth.dto.deviceinfo.DeviceLogoutRequest;
import com.dentalstack.auth.dto.doctor.DeactivateLogin;
import com.dentalstack.auth.dto.email.ResetPasswordRequestEmail;
import com.dentalstack.auth.entity.Auth;
import com.dentalstack.auth.enums.auth.credentials.CredentialType;
import com.dentalstack.auth.enums.patient.UserType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public interface AuthServiceV2 {
    Auth startPasswordSignUp(StartPasswordSignUpRequest request, String xOrgName);

    Auth sendOTPOnMobile(SendOTPRequest request, String xOrgName);

    Auth validateMobileOTP(ValidateOTPRequest request, String xOrgName);

    Auth sendOTPOnEmail(SendEmailOTPRequest request, String xOrgName);

    Auth validateOTPEmail(ValidateEmailOTPRequest request, String xOrgName);

    Auth sendPasswordResetOTPOnEmail(SendEmailOTPRequest request, String xOrgName);

    CredentialType fetchLoginType(SendEmailOTPRequest request, String xOrgName);

    AuthDetails resetPassword(ResetPasswordRequestEmail request, String xOrgName);

    void logoutDevice(DeviceLogoutRequest request, String xOrgName);

    AuthDetails ssoUserLogin(String email, String token);

    Auth startGoogleSignup(String email, String token, UserType userType, Long organizationId, String xOrgName);

    AuthDetails passwordLogin(
            String email,
            String password,
            DeviceInfoDetails deviceInfoDetails,
            UserType userType,
            String orgName,
            Long organizationId,
            String xOrgName);

    AuthDetails googleLogin(
            String email,
            String token,
            DeviceInfoDetails deviceInfoDetails,
            UserType userType,
            String orgName,
            Long organizationId,
            String xOrgName);

    Auth validateResetPasswordOTP(ValidateEmailOTPRequest request, String xOrgName);

    boolean checkDeviceStatus(String fingerprint, String email, Long organizationId, String xOrgName);

    void updateAuthPatient(UpdateAuthRequest request, String xOrgName);

    Auth startAppleSignup(String email, String idToken, UserType userType, Long organizationId, String xOrgName);

    AuthDetails appleLogin(
            String email,
            String token,
            DeviceInfoDetails deviceInfoDetails,
            UserType userType,
            String orgName,
            Long organizationId,
            String xOrgName);

    DeviceInfoDetails getLastLoggedInDeviceDetails(String email, Long organizationId, String xOrgName);

    AuthDetails getUserDetailsByEmail(String email, Long organizationId, String xOrgName);

    boolean checkWithEmail(String email, Long organizationId, String xOrgName);

    AuthDetails refreshToken(RefreshTokenRequest request, String xOrgName);

    Auth updateAuthDetails(AuthDetailsUpdateRequest request, String xOrgName);

    void deactivateUserLogin(DeactivateLogin request, String xOrgName);

    boolean checkWithEmailAndOrgIdAndXOrgName(String email, Long organizationId, String xOrgName);

    List<AuthDetails> getPasswordByEmail(String email);

    void unblockUser(@NotNull(message = "Email cannot be null") @Email(message = "Email should be valid") String email);

    List<Long> findMatchingAccount(AccountPasswordValidateRequest request);
}
