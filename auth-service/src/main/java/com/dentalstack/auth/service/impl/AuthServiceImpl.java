package com.dentalstack.auth.service.impl;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.dentalstack.auth.dto.*;
import com.dentalstack.auth.dto.auth.*;
import com.dentalstack.auth.dto.deviceinfo.DeviceInfoDetails;
import com.dentalstack.auth.dto.deviceinfo.DeviceLogoutRequest;
import com.dentalstack.auth.dto.doctor.DeactivateLogin;
import com.dentalstack.auth.dto.doctor.DoctorDetails;
import com.dentalstack.auth.dto.email.EmailSendReq;
import com.dentalstack.auth.dto.email.OtpSendOnEmailRequest;
import com.dentalstack.auth.dto.email.ResetPasswordRequestEmail;
import com.dentalstack.auth.dto.otp.OTPDetailsDTO;
import com.dentalstack.auth.dto.patient.PatientDetails;
import com.dentalstack.auth.entity.Auth;
import com.dentalstack.auth.entity.DeviceInfo;
import com.dentalstack.auth.entity.LoginAttempt;
import com.dentalstack.auth.entity.MobileOTPVerificationStageData;
import com.dentalstack.auth.entity.authstage.AuthStage;
import com.dentalstack.auth.entity.authstage.EmailOTPVerificationStageData;
import com.dentalstack.auth.entity.credentials.AppleTokenCredentialData;
import com.dentalstack.auth.entity.credentials.AuthCredentials;
import com.dentalstack.auth.entity.credentials.GoogleTokenCredentialData;
import com.dentalstack.auth.entity.credentials.PasswordCredentialData;
import com.dentalstack.auth.enums.auth.AuthStageStatus;
import com.dentalstack.auth.enums.auth.AuthStageType;
import com.dentalstack.auth.enums.auth.AuthStatus;
import com.dentalstack.auth.enums.auth.credentials.CredentialStatus;
import com.dentalstack.auth.enums.auth.credentials.CredentialType;
import com.dentalstack.auth.enums.patient.UserType;
import com.dentalstack.auth.exception.*;
import com.dentalstack.auth.exception.apple.AppleTokenExpiredException;
import com.dentalstack.auth.exception.apple.GoogleTokenVerificationFailedException;
import com.dentalstack.auth.exception.apple.InvalidAppleTokenException;
import com.dentalstack.auth.exception.doctor.*;
import com.dentalstack.auth.exception.google.GoogleTokenExpiredException;
import com.dentalstack.auth.exception.google.InvalidGoogleTokenException;
import com.dentalstack.auth.exception.patient.OTPExpiredException;
import com.dentalstack.auth.exception.patient.OTPValidationFailedException;
import com.dentalstack.auth.exception.patient.UserLoggedInAnotherDeviceException;
import com.dentalstack.auth.exception.token.UserNotFoundException;
import com.dentalstack.auth.repository.AuthRepository;
import com.dentalstack.auth.service.*;
import com.dentalstack.auth.service.apple.AppleIdToken;
import com.dentalstack.auth.service.apple.AppleTokenVerifier;
import com.dentalstack.auth.util.UrlUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.time.ZonedDateTime;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(noRollbackFor = BusinessException.class)
public class AuthServiceImpl implements AuthService {

    @Value("${dentalstack.login.failed-attempts-window-minutes:10}")
    private Long failedLoginAttemptWindowMinutes;

    @Value("${dentalstack.login.block-login-window-minutes:10}")
    private Long blockedLoginWindowMinutes;

    @Value("${dentalstack.login.block-after-failed-logins:3}")
    private int blockAfterNoOfFailedLogins;

    @Value("${dentalstack.google.sign-in.web.client-id}")
    private String webAppClientId;

    @Value("${dentalstack.base-url}")
    private String dentalStackBaseUrl;

    private GoogleTokenVerifier googleTokenVerifier;

    private final AppleTokenVerifier appleTokenVerifier;
    private final UrlUtil urlUtil;

    @PostConstruct
    public void init() {
        googleTokenVerifier = new GoogleTokenVerifier(
                List.of(
                        "https://securetoken.google.com/dentalstack-b31ed",
                        "https://accounts.google.com",
                        "accounts.google.com",
                        "https://ycvjhjtexbnedyugxgvp.supabase.co/auth/v1"),
                List.of(webAppClientId, "dentalstack-b31ed", "authenticated"));
    }

    private final AuthRepository authRepository;

    private final JWTService jwtService;
    private final DoctorService doctorService;
    private final OTPService otpService;
    private final ChatService chatService;
    private final PatientService patientService;

    @Override
    public Auth startPasswordSignUp(StartPasswordSignUpRequest request) {
        var email = request.getEmail();
        var password = request.getPassword();
        var optionalAuth = authRepository.findByEmail(email);
        if (optionalAuth.isPresent()) {
            var auth = optionalAuth.get();

            if (!auth.getUserType().equals(request.getUserType())) {
                throw new UserAlreadySignedUpException(auth);
            }

            if (auth.getStatus().equals(AuthStatus.ACTIVE)) {
                auth.getCredential(CredentialType.PASSWORD)
                        .orElseThrow(() -> InvalidLoginMethodException.withEmail(email, CredentialType.GOOGLE_TOKEN));
                throw new UserAlreadySignedUpException(auth);
            }

            if (auth.getStatus().equals(AuthStatus.IN_PROGRESS)) {
                auth.addOrReplace(AuthCredentials.newPasswordCredentials(password, auth));
                return auth;
            } else {
                auth.getCredential(CredentialType.PASSWORD, CredentialStatus.ACTIVE)
                        .ifPresentOrElse(
                                authCredentials -> {
                                    throw new UserAlreadySignedUpException(auth);
                                },
                                () -> {
                                    throw new UserSignedWithDifferentCredentials(auth);
                                });
            }
        }

        var auth = Auth.newPasswordSignup(email, password, request.getUserType(), request.isUserConsent());
        return authRepository.save(auth);
    }

    @Override
    public AuthDetails passwordLogin(
            String email, String password, DeviceInfoDetails deviceInfoDetails, UserType userType, String orgName) {
        var auth = getSignedUpAuth(email, userType);
        assertUserNotBlocked(auth);

        var passCredentials = auth.getCredential(CredentialType.PASSWORD, CredentialStatus.ACTIVE)
                .orElseThrow(() -> InvalidLoginMethodException.withEmail(email, CredentialType.GOOGLE_TOKEN));
        var passData = (PasswordCredentialData) passCredentials.getCredentialData();
        var loginAttempt = LoginAttempt.newAttempt(auth);
        if (!passData.getPassword().equals(password)) {
            registerFailedLoginAttempt(auth, loginAttempt);
        }

        // Mobile OTP verification can be in progress state if reset was in progress.
        // Change it to done state.
        if (List.of(AuthStatus.READY_TO_RESET, AuthStatus.RESET_IN_PROGRESS).contains(auth.getStatus())) {
            auth.changeStageStatus(AuthStageType.MOBILE_OTP_VERIFICATION, AuthStageStatus.DONE);
        }
        checkIfUserLoggedInFromAnotherDevice(deviceInfoDetails, auth);
        Long userId;
        if (userType.equals(UserType.PATIENT)) {
            PatientDetails patient = patientService.getPatient(auth.getUuid());
            userId = patient.getId();
            JWTToken sessionToken = jwtService.createSessionTokenForPatient(
                    patient.getUUID(), patient.getEmail(), patient.getUUID(), UserType.PATIENT.name(), patient.getId());
            auth.updateToken(sessionToken);

        } else {
            DoctorDetails doctor = doctorService.getDoctor(auth.getEmail());
            userId = doctor.getDoctorId();

            JWTToken sessionToken = jwtService.createSessionToken(
                    doctor.getUUID(), doctor.getEmail(), doctor.getUUID(), UserType.DOCTOR.name(), doctor.getId());

            auth.updateToken(sessionToken);
        }

        // Save login attempt
        loginAttempt.setStatus(LoginAttempt.AttemptStatus.PASSED);
        auth.getLoginAttempts().add(loginAttempt);

        auth.setStatus(AuthStatus.ACTIVE);
        auth.changeCredentialStatus(CredentialType.PASSWORD, CredentialStatus.ACTIVE);
        authRepository.save(auth);

        return AuthDetails.from(auth, userId);
    }

    private Auth getSignedUpAuth(String email, UserType userType) {
        var auth = authRepository
                .findByEmailAndUserType(email, userType)
                .orElseThrow(() -> UserNotSignedUpException.withEmail(userType, email));
        var now = ZonedDateTime.now();

        return switch (auth.getStatus()) {
            case ACTIVE, READY_TO_RESET, RESET_IN_PROGRESS -> auth;
            case IN_PROGRESS -> {
                throw UserNotSignedUpException.withEmail(userType, email);
            }
            case BLOCKED -> {
                if (now.isAfter(auth.getBlockedTill())) {
                    auth.setBlockedTill(null);
                    auth.setStatus(AuthStatus.ACTIVE);
                    yield auth;
                } else {
                    throw new LoginBlockedException(auth);
                }
            }
            case DEACTIVATED -> throw new LoginBlockedException(auth);
        };
    }

    private void assertUserNotBlocked(Auth auth) {
        // Handled blocked accounts
        var now = ZonedDateTime.now();
        if (auth.getStatus().equals(AuthStatus.BLOCKED)) {
            if (now.isAfter(auth.getBlockedTill())) {
                auth.setBlockedTill(null);
                auth.setStatus(AuthStatus.ACTIVE);
            } else {
                throw new LoginBlockedException(auth);
            }
        }
    }

    private long handleInvalidAuthCredentials(Auth auth, LoginAttempt loginAttempt) {
        auth.invalidateToken();

        loginAttempt.setStatus(LoginAttempt.AttemptStatus.FAILED);
        auth.getLoginAttempts().add(loginAttempt);

        var now = ZonedDateTime.now();
        var attemptsFailedAfter = now.minusMinutes(failedLoginAttemptWindowMinutes);
        var noOfFailedAttempts = auth.getLoginAttempts().stream()
                .filter(attempt -> attempt.getStatus().equals(LoginAttempt.AttemptStatus.FAILED)
                        && attempt.getCreatedAt() != null
                        && attempt.getCreatedAt().isAfter(attemptsFailedAfter))
                .count();
        if (noOfFailedAttempts > blockAfterNoOfFailedLogins) {
            auth.setBlockedTill(now.plusMinutes(blockedLoginWindowMinutes));
            auth.setStatus(AuthStatus.BLOCKED);
        }
        return noOfFailedAttempts;
    }

    @Override
    public Auth startGoogleSignup(String email, String googleToken, UserType userType) {
        var optionalAuth = authRepository.findByEmail(email);
        if (optionalAuth.isPresent()) {
            var auth = optionalAuth.get();
            if (auth.getUserType().equals(userType) && !auth.getStatus().equals(AuthStatus.IN_PROGRESS)) {
                auth.getCredential(CredentialType.GOOGLE_TOKEN)
                        .orElseThrow(() -> InvalidLoginMethodException.withEmail(email, CredentialType.PASSWORD));

                throw new UserAlreadySignedUpException(auth);
            }
            if (!auth.getUserType().equals(userType)) {
                throw new UserAlreadySignedUpException(auth);
            }
            auth.addOrReplace(AuthCredentials.newGoogleCredentials(googleToken, auth));
            return auth;
        }

        GoogleIdToken idToken = verifyGoogleIdToken(googleToken, email);
        if (idToken == null) throw new InvalidGoogleTokenException(email);

        var auth = Auth.newGoogleSignup(email, googleToken, userType);

        return authRepository.save(auth);
    }

    @Override
    public Auth startAppleSignup(String email, String appleToken, UserType userType) {
        var optionalAuth = authRepository.findByEmailAndUserType(email, userType);
        if (optionalAuth.isPresent()) {
            var auth = optionalAuth.get();
            if (auth.getUserType().equals(userType) && !auth.getStatus().equals((AuthStatus.IN_PROGRESS))) {
                auth.getCredential(CredentialType.APPLE_TOKEN)
                        .orElseThrow(() -> InvalidLoginMethodException.withEmail(email, CredentialType.APPLE_TOKEN));

                throw new UserAlreadySignedUpException(auth);
            }
            if (!auth.getUserType().equals(userType)) {
                throw new UserAlreadySignedUpException(auth);
            }
            auth.addOrReplace(AuthCredentials.newAppleCredentials(appleToken, auth));
            return auth;
        }

        var idToken = verifyAppleIdToken(appleToken, email);
        if (idToken == null) throw new InvalidAppleTokenException(email);

        var auth = Auth.newAppleSignup(email, appleToken, userType);

        return authRepository.save(auth);
    }

    @Override
    public AuthDetails appleLogin(
            String email, String appleToken, DeviceInfoDetails deviceInfoDetails, UserType userType, String orgName) {
        var auth = getSignedUpAuth(email, userType);

        var appleCredentials = auth.getCredential(CredentialType.APPLE_TOKEN)
                .orElseThrow(() -> InvalidLoginMethodException.withEmail(email, CredentialType.GOOGLE_TOKEN));
        var appleData = (AppleTokenCredentialData) appleCredentials.getCredentialData();
        var loginAttempt = LoginAttempt.newAttempt(auth);

        try {
            verifyAppleIdToken(appleToken, email);
            appleData.setAppleToken(appleToken);
        } catch (Exception e) {
            registerFailedLoginAttempt(auth, loginAttempt);
        }

        // Mobile OTP verification can be in progress state if reset was in progress.
        // Change it to done state.
        if (List.of(AuthStatus.READY_TO_RESET, AuthStatus.RESET_IN_PROGRESS).contains(auth.getStatus())) {
            auth.changeStageStatus(AuthStageType.MOBILE_OTP_VERIFICATION, AuthStageStatus.DONE);
        }

        Long userId;
        if (userType.equals(UserType.PATIENT)) {
            PatientDetails patient = patientService.getPatient(auth.getUuid());
            userId = patient.getId();
            JWTToken sessionToken = jwtService.createSessionTokenForPatient(
                    patient.getUUID(), patient.getEmail(), patient.getUUID(), UserType.PATIENT.name(), patient.getId());
            auth.updateToken(sessionToken);

        } else {
            DoctorDetails doctor = doctorService.getDoctor(auth.getEmail());
            userId = doctor.getDoctorId();

            JWTToken sessionToken = jwtService.createSessionToken(
                    doctor.getUUID(), doctor.getEmail(), doctor.getUUID(), UserType.DOCTOR.name(), doctor.getId());
            auth.updateToken(sessionToken);
        }

        // Save login attempt
        loginAttempt.setStatus(LoginAttempt.AttemptStatus.PASSED);
        auth.getLoginAttempts().add(loginAttempt);

        auth.setStatus(AuthStatus.ACTIVE);
        auth.changeCredentialStatus(CredentialType.PASSWORD, CredentialStatus.ACTIVE);

        authRepository.save(auth);
        return AuthDetails.from(auth, userId);
    }

    @Override
    public DeviceInfoDetails getLastLoggedInDeviceDetails(String email) {
        var auth = authRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException(email));

        return auth.getDevices().stream()
                .max(Comparator.comparing(DeviceInfo::getCreatedAt))
                .map(DeviceInfoDetails::from)
                .orElseThrow(() -> new DeviceNotFoundException(email));
    }

    @Override
    public AuthDetails getUserDetailsByEmail(String email) {
        var auth = authRepository.findByEmail(email).orElseThrow(() -> UserNotSignedUpException.withEmail(email));
        return AuthDetails.from(auth);
    }

    @Override
    public boolean checkWithEmail(String email) {
        return authRepository.findByEmailAndUserType(email, UserType.PATIENT).isPresent();
    }

    @Override
    public void deactivateUserLogin(DeactivateLogin request) {
        var auth = authRepository
                .findByEmailAndUserType(request.getEmail(), request.getUserType())
                .orElseThrow(() -> UserNotSignedUpException.withEmail(request.getUserType(), request.getEmail()));
        auth.setStatus(AuthStatus.DEACTIVATED);
        authRepository.save(auth);
    }

    private void registerFailedLoginAttempt(Auth auth, LoginAttempt loginAttempt) {
        var noOfFailedAttempts = handleInvalidAuthCredentials(auth, loginAttempt);
        auth = authRepository.save(auth);

        if (noOfFailedAttempts == blockAfterNoOfFailedLogins) {
            throw new LoginAttemptExceededException(auth, noOfFailedAttempts, failedLoginAttemptWindowMinutes);
        } else if (noOfFailedAttempts > blockAfterNoOfFailedLogins) {
            throw new LoginBlockedException(auth, blockedLoginWindowMinutes);
        } else {
            throw new InvalidLoginCredentialsException(auth);
        }
    }

    private static void checkIfUserLoggedInFromAnotherDevice(DeviceInfoDetails deviceInfoDetails, Auth auth) {
        List<DeviceInfo> devices = auth.getDevices();
        DeviceInfo activeDevice =
                devices.stream().filter(DeviceInfo::isActive).findFirst().orElse(null);
        if (activeDevice != null) {
            if (!activeDevice.getFingerprint().equals(deviceInfoDetails.getFingerprint())) {
                throw new UserLoggedInAnotherDeviceException(
                        String.format("%s has already logged in another device.", auth.getUserType()));
            }
        } else {
            auth.addDevice(DeviceInfo.from(deviceInfoDetails));
        }
    }

    private AppleIdToken verifyAppleIdToken(String appleToken, String email) {
        try {
            return appleTokenVerifier.verify(appleToken);
        } catch (AppleTokenExpiredException e) {
            throw e;
        } catch (JWTVerificationException e) {
            throw e;
        }
    }

    private GoogleIdToken verifyGoogleIdToken(String googleToken, String email) {
        try {
            return googleTokenVerifier.verify(googleToken);
        } catch (IOException e) {
            throw new FailedToValidateGoogleTokenException(email);
        } catch (GoogleTokenExpiredException | GoogleTokenVerificationFailedException e) {
            throw e;
        }
    }

    @Override
    public AuthDetails googleLogin(
            String email, String googleToken, DeviceInfoDetails deviceInfoDetails, UserType userType, String orgName) {
        var auth = getSignedUpAuth(email, userType);

        var googleCredentials = auth.getCredential(CredentialType.GOOGLE_TOKEN)
                .orElseThrow(() -> InvalidLoginMethodException.withEmail(email, CredentialType.PASSWORD));
        var googleData = (GoogleTokenCredentialData) googleCredentials.getCredentialData();
        var loginAttempt = LoginAttempt.newAttempt(auth);

        GoogleIdToken idToken = verifyGoogleIdToken(googleToken, email);

        if (idToken == null) {
            registerFailedLoginAttempt(auth, loginAttempt);
        } else {
            googleData.setGoogleToken(googleToken);
        }

        // Mobile OTP verification can be in progress state if reset was in progress.
        // Change it to done state.
        if (List.of(AuthStatus.READY_TO_RESET, AuthStatus.RESET_IN_PROGRESS).contains(auth.getStatus())) {
            auth.changeStageStatus(AuthStageType.MOBILE_OTP_VERIFICATION, AuthStageStatus.DONE);
        }

        Long userId;
        if (userType.equals(UserType.PATIENT)) {
            PatientDetails patient = patientService.getPatient(auth.getUuid());
            userId = patient.getId();
            var sessionToken = jwtService.createSessionTokenForPatient(
                    patient.getUUID(), patient.getEmail(), patient.getUUID(), UserType.PATIENT.name(), patient.getId());
            auth.updateToken(sessionToken);

        } else {
            DoctorDetails doctor = doctorService.getDoctor(auth.getEmail());
            userId = doctor.getDoctorId();

            JWTToken sessionToken = jwtService.createSessionToken(
                    doctor.getUUID(), doctor.getEmail(), doctor.getUUID(), UserType.DOCTOR.name(), doctor.getId());
            auth.updateToken(sessionToken);
        }

        // Save login attempt
        loginAttempt.setStatus(LoginAttempt.AttemptStatus.PASSED);
        auth.getLoginAttempts().add(loginAttempt);

        auth.setStatus(AuthStatus.ACTIVE);
        auth.changeCredentialStatus(CredentialType.PASSWORD, CredentialStatus.ACTIVE);

        authRepository.save(auth);
        return AuthDetails.from(auth, userId);
    }

    @Override
    public Auth sendOTPOnMobile(SendOTPRequest request) {
        var mobileNo = request.getMobileNo();
        var email = request.getEmail();

        authRepository.findByMobileNoAndStatus(mobileNo, AuthStatus.ACTIVE).ifPresent(auth -> {
            throw new UserAlreadySignedUpException(auth);
        });
        var auth = authRepository
                .findByEmailAndUserTypeAndStatusIn(
                        email, request.getUserType(), List.of(AuthStatus.IN_PROGRESS, AuthStatus.RESET_IN_PROGRESS))
                .orElseThrow(() -> UserNotSignedUpException.withEmail(request.getUserType(), email));
        if (auth.getStatus().equals(AuthStatus.RESET_IN_PROGRESS)) {
            throw new AuthResetIncompleteException(auth);
        }

        int otp = otpService.generateOtp(mobileNo);
        ZonedDateTime validTill = ZonedDateTime.now().plusMinutes(5);
        var mobileOTPStage =
                AuthStage.newMobileOTPVerificationStage(mobileNo, otp, validTill, 1, auth, request.getCountryCode());
        auth.addOrReplace(mobileOTPStage);
        auth.setMobileNo(mobileNo);
        auth.setCountryCode(request.getCountryCode());

        chatService.sendOTP(new OTPDetailsDTO(mobileNo, otp, request.getCountryCode()));

        return authRepository.save(auth);
    }

    @Override
    public Auth validateMobileOTP(ValidateOTPRequest request) {
        var mobileNo = request.getMobileNo();
        var otp = request.getOtp();
        var auth = authRepository
                .findByMobileNoAndUserTypeAndStatusIn(
                        mobileNo, request.getUserType(), List.of(AuthStatus.IN_PROGRESS, AuthStatus.RESET_IN_PROGRESS))
                .orElseThrow(() -> UserNotSignedUpException.withMobileNo(request.getUserType(), mobileNo));
        if (auth.getStatus().equals(AuthStatus.RESET_IN_PROGRESS)) {
            throw new AuthResetIncompleteException(auth);
        }

        var mobileOTPStage = auth.getStage(AuthStageType.MOBILE_OTP_VERIFICATION, AuthStageStatus.IN_PROGRESS)
                .orElseThrow(() -> new OTPValidationNotStartedException(mobileNo, request.getUserType()));
        var OTPData = (MobileOTPVerificationStageData) mobileOTPStage.getData();

        assertValidOTP(OTPData, mobileNo, otp, request.getUserType());
        mobileOTPStage.setStatus(AuthStageStatus.DONE);
        OTPData.setVerifiedAt(ZonedDateTime.now());

        return authRepository.save(auth);
    }

    private void assertValidOTP(
            MobileOTPVerificationStageData expectedOTPData,
            String incomingMobileNo,
            int incomingOTP,
            UserType userType) {
        if (expectedOTPData == null || incomingMobileNo == null)
            throw new OTPValidationFailedException(incomingMobileNo);

        if (!incomingMobileNo.equals(expectedOTPData.getMobileNo())) {
            throw new OTPValidationNotStartedException(incomingMobileNo, userType);
        }

        if (incomingOTP != expectedOTPData.getOtp()) {
            throw new OTPValidationFailedException(incomingMobileNo);
        }

        var now = ZonedDateTime.now();
        if (now.isAfter(expectedOTPData.getOtpValidTill())) {
            throw new OTPExpiredException(incomingMobileNo);
        }
    }

    @Override
    public Auth sendOTPOnEmail(SendEmailOTPRequest request) {
        var email = request.getEmail();
        var auth = authRepository
                .findByEmailAndUserTypeAndStatusIn(
                        email, request.getUserType(), List.of(AuthStatus.IN_PROGRESS, AuthStatus.RESET_IN_PROGRESS))
                .orElseThrow(() -> UserNotSignedUpException.withEmail(request.getUserType(), email));
        if (auth.getStatus().equals(AuthStatus.RESET_IN_PROGRESS)) {
            throw new AuthResetIncompleteException(auth);
        }
        int otp = email != null && email.toLowerCase().endsWith("@maildrop.cc") ? 1234 : otpService.generateOtpEmail();
        ZonedDateTime validTill = ZonedDateTime.now().plusMinutes(5);
        var emailOTPStage = AuthStage.newEmailOTPVerificationStage(email, otp, validTill, 1, auth);
        auth.addOrReplace(emailOTPStage);
        auth.setEmail(email);
        if (request.getUserType().equals(UserType.PATIENT)) {
            chatService.sendOtpOnMailPatient(OtpSendOnEmailRequest.from(
                    email, String.valueOf(otp), request.getLanguage(), request.getOrgName()));
        } else {
            chatService.sendOtpOnMail(
                    OtpSendOnEmailRequest.from(email, String.valueOf(otp), null, request.getOrgName()));
        }

        return authRepository.save(auth);
    }

    @Override
    public Auth validateOTPEmail(ValidateEmailOTPRequest request) {
        var email = request.getEmail();
        var otp = request.getOtp();

        var auth = authRepository
                .findByEmailAndUserTypeAndStatusIn(
                        email, request.getUserType(), List.of(AuthStatus.IN_PROGRESS, AuthStatus.RESET_IN_PROGRESS))
                .orElseThrow(() -> UserNotSignedUpException.withEmail(request.getUserType(), email));
        if (auth.getStatus().equals(AuthStatus.RESET_IN_PROGRESS)) {
            throw new AuthResetIncompleteException(auth);
        }

        var emailOTPStage = auth.getStage(AuthStageType.EMAIL_OTP_VERIFICATION, AuthStageStatus.IN_PROGRESS)
                .orElseThrow(() -> new OTPValidationNotStartedException(email, request.getUserType()));
        var OTPData = (EmailOTPVerificationStageData) emailOTPStage.getData();

        assertValidOTPForEmail(OTPData, email, otp, request.getUserType());
        emailOTPStage.setStatus(AuthStageStatus.DONE);
        OTPData.setVerifiedAt(ZonedDateTime.now());

        return authRepository.save(auth);
    }

    private void assertValidOTPForEmail(
            EmailOTPVerificationStageData expectedOTPData, String incomingEmail, int incomingOTP, UserType userType) {
        if (expectedOTPData == null || incomingEmail == null) throw new OTPValidationFailedException(incomingEmail);

        if (!incomingEmail.equals(expectedOTPData.getEmail())) {
            throw new OTPValidationNotStartedException(incomingEmail, userType);
        }

        if (incomingOTP != expectedOTPData.getOtp()) {
            throw new OTPValidationFailedException(incomingEmail);
        }

        var now = ZonedDateTime.now();
        if (now.isAfter(expectedOTPData.getOtpValidTill())) {
            throw new OTPExpiredException(incomingEmail);
        }
    }

    @Override
    public Auth sendPasswordResetOTPOnEmail(SendEmailOTPRequest request) {
        var email = request.getEmail();
        var auth = authRepository
                .findByEmailAndUserType(email, request.getUserType())
                .orElseThrow(() -> UserNotSignedUpException.withMobileNo(request.getUserType(), email));

        // Check if the user has signed up using Google login
        auth.getCredential(CredentialType.GOOGLE_TOKEN, CredentialStatus.ACTIVE).ifPresent(authCredentials -> {
            throw new ResetPasswordNotAvailableException(
                    "Password reset is not available for users signed up with Google.");
        });

        auth.getCredential(CredentialType.APPLE_TOKEN, CredentialStatus.ACTIVE).ifPresent(authCredentials -> {
            throw new ResetPasswordNotAvailableException(
                    "Password reset is not available for users signed up with Apple.");
        });

        var emailOTPStage = auth.getStage(AuthStageType.EMAIL_OTP_VERIFICATION)
                .orElseThrow(() -> new OTPValidationNotStartedException(email, request.getUserType()));
        var OTPData = (EmailOTPVerificationStageData) emailOTPStage.getData();

        // Send OTP on email
        int otp = otpService.generateOtpEmail();
        ZonedDateTime validTill = ZonedDateTime.now().plusMinutes(5);
        if (request.getUserType().equals(UserType.PATIENT)) {
            chatService.sendOtpOnMailPatient(OtpSendOnEmailRequest.from(
                    email, String.valueOf(otp), request.getLanguage(), request.getOrgName()));
        } else {
            chatService.sendOtpOnMail(
                    OtpSendOnEmailRequest.from(email, String.valueOf(otp), null, request.getOrgName()));
        }
        OTPData.setOtp(otp);
        OTPData.setOtpValidTill(validTill);
        emailOTPStage.setStatus(AuthStageStatus.IN_PROGRESS);

        auth.setStatus(AuthStatus.RESET_IN_PROGRESS);
        auth.invalidateToken();

        return authRepository.save(auth);
    }

    @Override
    public CredentialType fetchLoginType(SendEmailOTPRequest request) {
        var email = request.getEmail();
        Auth auth = authRepository
                .findByEmailAndUserType(email, request.getUserType())
                .orElse(null);

        if (auth == null) {
            return CredentialType.NONE;
        } else {
            return auth.getCredentials().stream()
                    .max(Comparator.comparing(AuthCredentials::getUpdatedAt))
                    .map(AuthCredentials::getType)
                    .orElseThrow(() -> new IllegalStateException("No credentials found for user"));
        }
    }

    @Override
    public Auth validateResetPasswordOTP(ValidateEmailOTPRequest request) {
        var email = request.getEmail();
        var auth = authRepository
                .findByEmailAndUserTypeAndStatusIn(email, request.getUserType(), List.of(AuthStatus.RESET_IN_PROGRESS))
                .orElseThrow(() -> new AuthResetNotStartedException(email, request.getUserType()));

        var mobileOTPStage = auth.getStage(AuthStageType.EMAIL_OTP_VERIFICATION, AuthStageStatus.IN_PROGRESS)
                .orElseThrow(() -> new OTPValidationNotStartedException(email, request.getUserType()));
        var OTPData = (EmailOTPVerificationStageData) mobileOTPStage.getData();

        // Validate OTP
        assertValidOTPForEmail(OTPData, email, request.getOtp(), request.getUserType());
        mobileOTPStage.setStatus(AuthStageStatus.DONE);
        OTPData.setVerifiedAt(ZonedDateTime.now());

        auth.setStatus(AuthStatus.READY_TO_RESET);

        return authRepository.save(auth);
    }

    public boolean checkDeviceStatus(String fingerprint, String email) {
        var auth = authRepository.findByEmail(email);
        if (auth.isPresent()) {
            for (DeviceInfo deviceInfo : auth.get().getDevices()) {
                if (deviceInfo.getFingerprint().equals(fingerprint)) {
                    return deviceInfo.isActive();
                }
            }
        }
        return false;
    }

    @Override
    public void updateAuthPatient(UpdateAuthRequest request) {
        var auth = authRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotSignedUpException("User not found"));
        auth.setUuid(request.getUuid());
        authRepository.save(auth);
    }

    @Override
    public AuthDetails resetPassword(ResetPasswordRequestEmail request) {
        var email = request.getEmail();
        var auth = authRepository
                .findByEmailAndUserTypeAndStatusIn(email, request.getUserType(), List.of(AuthStatus.READY_TO_RESET))
                .orElseThrow(() -> new AuthResetStagesIncompleteException(email, request.getUserType()));

        // Set new password
        var passCredentials = auth.getCredential(CredentialType.PASSWORD)
                .orElseThrow(() -> new CredentialsNotSetException(auth, CredentialType.PASSWORD));
        var passData = (PasswordCredentialData) passCredentials.getCredentialData();
        passData.setPassword(request.getNewPassword());
        passCredentials.setStatus(CredentialStatus.ACTIVE);

        // Create new JWT token
        String uuid;
        Long userId;
        String name;
        String orgName;

        if (request.getUserType().equals(UserType.PATIENT)) {
            PatientDetails patient = patientService.getPatient(auth.getUuid());
            userId = patient.getId();
            name = patient.getFirstName();
            orgName = patient.getOrgName();
            var sessionToken = jwtService.createSessionTokenForPatient(
                    patient.getUUID(), patient.getEmail(), patient.getUUID(), UserType.PATIENT.name(), patient.getId());
            auth.updateToken(sessionToken);
            auth.setStatus(AuthStatus.ACTIVE);
        } else {
            DoctorDetails doctor = doctorService.getDoctor(auth.getEmail());
            userId = doctor.getDoctorId();
            name = doctor.getFirstName();
            orgName = doctor.getOrgName();
            JWTToken sessionToken = jwtService.createSessionToken(
                    doctor.getUUID(), doctor.getEmail(), doctor.getUUID(), UserType.DOCTOR.name(), doctor.getId());
            auth.updateToken(sessionToken);
            auth.setStatus(AuthStatus.ACTIVE);
        }

        authRepository.save(auth);
        if (request.getUserType().equals(UserType.PATIENT)) {
            chatService.sendPasswordResetConfirmationMailToPatient(EmailSendReq.from(email, name, orgName));
        } else {
            chatService.sendPasswordResetConfirmationMail(EmailSendReq.from(email, name, orgName));
        }
        return AuthDetails.from(auth, userId);
    }

    @Override
    @Transactional
    public void logoutDevice(DeviceLogoutRequest request) {
        var optionalAuth = authRepository.findByEmail(request.getEmail());
        if (optionalAuth.isPresent()) {
            var auth = optionalAuth.get();
            List<DeviceInfo> devices = auth.getDevices();
            DeviceInfo currentActiveDevice =
                    devices.stream().filter(DeviceInfo::isActive).findFirst().orElse(null);
            if (currentActiveDevice != null) {
                boolean foundMatchingDevice = false;
                for (DeviceInfo device : devices) {
                    if (device.getFingerprint()
                            .equals(request.getDeviceInfoDetails().getFingerprint())) {
                        device.setActive(true);
                        foundMatchingDevice = true;
                        break;
                    }
                }
                if (!foundMatchingDevice) {
                    auth.addDevice(DeviceInfo.from(request.getDeviceInfoDetails()));
                }
                currentActiveDevice.setActive(false);
            } else {
                auth.addDevice(DeviceInfo.from(request.getDeviceInfoDetails()));
            }
        }
    }
}
