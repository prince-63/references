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

public interface AuthService {

    Auth startPasswordSignUp(StartPasswordSignUpRequest request);

    Auth sendOTPOnMobile(SendOTPRequest request);

    Auth validateMobileOTP(ValidateOTPRequest request);

    Auth sendOTPOnEmail(SendEmailOTPRequest request);

    Auth validateOTPEmail(ValidateEmailOTPRequest request);

    Auth sendPasswordResetOTPOnEmail(SendEmailOTPRequest request);

    CredentialType fetchLoginType(SendEmailOTPRequest request);

    AuthDetails resetPassword(ResetPasswordRequestEmail request);

    void logoutDevice(DeviceLogoutRequest request);

    Auth startGoogleSignup(String email, String token, UserType userType);

    AuthDetails passwordLogin(
            String email, String password, DeviceInfoDetails deviceInfoDetails, UserType userType, String orgName);

    AuthDetails googleLogin(
            String email, String token, DeviceInfoDetails deviceInfoDetails, UserType userType, String orgName);

    Auth validateResetPasswordOTP(ValidateEmailOTPRequest request);

    boolean checkDeviceStatus(String fingerprint, String email);

    void updateAuthPatient(UpdateAuthRequest request);

    Auth startAppleSignup(String email, String idToken, UserType userType);

    AuthDetails appleLogin(
            String email, String token, DeviceInfoDetails deviceInfoDetails, UserType userType, String orgName);

    DeviceInfoDetails getLastLoggedInDeviceDetails(String email);

    AuthDetails getUserDetailsByEmail(String email);

    boolean checkWithEmail(String email);

    void deactivateUserLogin(DeactivateLogin request);
}
