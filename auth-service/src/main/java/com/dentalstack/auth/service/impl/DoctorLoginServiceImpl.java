package com.dentalstack.auth.service.impl;

import com.dentalstack.auth.dto.*;
import com.dentalstack.auth.dto.chargebee.ChargebeeCreateCustomerRequest;
import com.dentalstack.auth.dto.doctor.*;
import com.dentalstack.auth.dto.doctor.invitation.DoctorInvitationAcceptRequest;
import com.dentalstack.auth.dto.webhook.SynapseWebhookPayload;
import com.dentalstack.auth.entity.*;
import com.dentalstack.auth.entity.authstage.EmailOTPVerificationStageData;
import com.dentalstack.auth.entity.organization.SyncTracker;
import com.dentalstack.auth.enums.AuthType;
import com.dentalstack.auth.enums.auth.AuthStageStatus;
import com.dentalstack.auth.enums.auth.AuthStageType;
import com.dentalstack.auth.enums.auth.AuthStatus;
import com.dentalstack.auth.enums.auth.credentials.CredentialStatus;
import com.dentalstack.auth.enums.auth.credentials.CredentialType;
import com.dentalstack.auth.enums.doctor.DoctorRole;
import com.dentalstack.auth.enums.doctor.UserRegistrationType;
import com.dentalstack.auth.enums.patient.UserType;
import com.dentalstack.auth.exception.*;
import com.dentalstack.auth.exception.doctor.*;
import com.dentalstack.auth.exception.google.GoogleTokenExpiredException;
import com.dentalstack.auth.exception.google.GoogleTokenVerificationFailedException;
import com.dentalstack.auth.exception.google.InvalidGoogleTokenException;
import com.dentalstack.auth.exception.patient.OTPExpiredException;
import com.dentalstack.auth.exception.patient.OTPValidationFailedException;
import com.dentalstack.auth.repository.AuthRepository;
import com.dentalstack.auth.repository.DoctorAuthRepository;
import com.dentalstack.auth.repository.organization.SyncTrackerRepository;
import com.dentalstack.auth.service.*;
import com.dentalstack.auth.service.webhook.WebhookService;
import com.dentalstack.auth.util.UrlUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import jakarta.annotation.Nullable;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(
        noRollbackFor = {
            BusinessException.class,
        })
public class DoctorLoginServiceImpl implements DoctorLoginService {

    private final DoctorAuthRepository doctorAuthRepository;
    private final AuthRepository authRepository;

    private final JWTService jwtService;
    private final DoctorService doctorService;

    @Value("${dentalstack.google.sign-in.web.client-id}")
    private String webAppClientId;

    private GoogleTokenVerifier googleTokenVerifier;

    private final PatientService patientService;
    private final OTPService otpService;
    private final SyncTrackerRepository syncTrackerRepository;
    private final UrlUtil urlUtil;
    private final WebhookService webhookService;

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

    @Override
    @Transactional(rollbackFor = {BusinessException.class})
    public AuthDetails passwordSignUp(DoctorPasswordSignUpRequest request, String xOrgName) {
        var email = request.getEmail();
        var mobileNo = request.getMobileNo();
        var organizationId = request.getOrganizationId();

        var auth = authRepository
                .findByEmailAndUserTypeAndOrganizationIdAndXOrganizationNameAndStatusIN(
                        email,
                        UserType.DOCTOR,
                        organizationId,
                        xOrgName,
                        List.of(AuthStatus.IN_PROGRESS, AuthStatus.ACTIVE, AuthStatus.RESET_IN_PROGRESS))
                .orElseThrow(() -> new SignUpNotStartedException(email, mobileNo, UserType.DOCTOR));
        if (auth.getStatus().equals(AuthStatus.RESET_IN_PROGRESS)) {
            throw new AuthResetIncompleteException(auth);
        }
        if (auth.getStatus().equals(AuthStatus.ACTIVE)) {
            throw new UserAlreadySignedUpException(auth);
        }

        if (!request.getSkipEmailOrMobileVerification()) {
            var authStages = auth.getStages();
            boolean emailStageComplete = authStages.stream()
                    .filter(stage -> stage.getStageType().equals(AuthStageType.EMAIL_OTP_VERIFICATION))
                    .allMatch(stage -> stage.getStatus().equals(AuthStageStatus.DONE));

            boolean mobileStageComplete;
            if (request.getCountryCode().equals("+91")) {
                mobileStageComplete = authStages.stream()
                        .filter(stage -> stage.getStageType().equals(AuthStageType.MOBILE_OTP_VERIFICATION))
                        .allMatch(stage -> stage.getStatus().equals(AuthStageStatus.DONE));
            } else {
                mobileStageComplete = true;
            }
            if (authStages.isEmpty() || !(emailStageComplete && mobileStageComplete)) {
                throw new AuthStageNotCompleteException(auth);
            }
        }

        DoctorDetails doctorDetails = doctorService.signUpDoctor(SignUpDoctor.from(request, xOrgName));

        patientService.createCustomerAndAddBasicPlan(
                ChargebeeCreateCustomerRequest.from(doctorDetails, request, xOrgName));
        JWTToken sessionToken = jwtService.createSessionToken(
                doctorDetails.getUUID(),
                doctorDetails.getEmail(),
                doctorDetails.getUUID(),
                UserType.DOCTOR.name(),
                doctorDetails.getId());

        auth.setUuid(doctorDetails.getUUID());
        auth.updateToken(sessionToken);
        auth.setMobileNo(request.getMobileNo());
        auth.changeCredentialStatus(CredentialType.PASSWORD, CredentialStatus.ACTIVE);
        auth.addDevice(DeviceInfo.from(request.getDeviceInfoDetails()));
        auth.setStatus(AuthStatus.ACTIVE);
        auth.setBrandName(request.getBrand());
        auth.setUserRegistrationType(UserRegistrationType.NEW_USER_SIGNUP);
        auth.setDoctorRole(request.getRoles().get(0));
        auth.setFirstName(request.getFirstName());
        auth.setLastName(request.getLastName());
        auth.setCountryCode(request.getCountryCode());
        auth.setSalutation(request.getSalutation());
        auth.setMobileNo(request.getMobileNo());
        auth.setUserId(doctorDetails.getDoctorId());

        authRepository.save(auth);
        return AuthDetails.from(auth, doctorDetails.getDoctorId());
    }

    @Override
    @Transactional
    public AuthDetails googleSignup(DoctorGoogleSignupRequest request, String xOrgName) {
        return signUpWithProvider(request, CredentialType.GOOGLE_TOKEN, "google", xOrgName);
    }

    @Override
    @Transactional
    public AuthDetails signUpDoctorThroughUrl(DoctorUrlSignUpRequest request, String xOrgName) {
        var email = request.getEmail();

        if (request.getRegistrationType().equals(UserRegistrationType.EXISTING_USER)) {
            var auth = request.getCredentialType() == null
                    ? authRepository
                            .findByEmailAndUserTypeAndOrganizationIdAndXOrganizationNameAndStatusIN(
                                    email,
                                    UserType.DOCTOR,
                                    request.getOrganizationId(),
                                    xOrgName,
                                    List.of(AuthStatus.IN_PROGRESS, AuthStatus.RESET_IN_PROGRESS))
                            .orElseThrow(() -> UserNotSignedUpException.withEmail(UserType.DOCTOR, email))
                    : authRepository
                            .findByEmailAndUserTypeAndOrganizationIdAndXOrganizationNameAndStatusIN(
                                    email,
                                    UserType.DOCTOR,
                                    request.getOrganizationId(),
                                    xOrgName,
                                    List.of(AuthStatus.IN_PROGRESS, AuthStatus.RESET_IN_PROGRESS, AuthStatus.ACTIVE))
                            .orElseThrow(() -> UserNotSignedUpException.withEmail(UserType.DOCTOR, email));

            if (request.getCredentialType() != null && request.getCredentialType() == CredentialType.PASSWORD
                    || request.getCredentialType() == CredentialType.NONE) {
                if (request.getSkip() == null || !request.getSkip()) {
                    validateExistingUserEmailOtp(request, auth);
                }
            }
            var doctorDetails = doctorService.acceptInvitation(DoctorInvitationAcceptRequest.from(request, xOrgName));
            JWTToken sessionToken = jwtService.createSessionToken(
                    doctorDetails.getUUID(),
                    doctorDetails.getEmail(),
                    doctorDetails.getUUID(),
                    UserType.DOCTOR.name(),
                    doctorDetails.getId());
            auth.updateToken(sessionToken);

            JWTToken ssoToken = jwtService.createSsoToken(
                    doctorDetails.getUUID(), doctorDetails.getEmail(), doctorDetails.getUUID());
            auth.updateSsoToken(ssoToken);

            auth.setBrandName(request.getBrand());
            auth.setUserRegistrationType(request.getRegistrationType());
            auth.setUserId(doctorDetails.getDoctorId());

            authRepository.save(auth);
            patientService.createCustomerAndAddBasicPlan(ChargebeeCreateCustomerRequest.from(
                    doctorDetails,
                    Collections.singletonList(DoctorRole.ALIGNER_COMPANY_OR_LAB),
                    doctorDetails.getOwnerId(),
                    doctorDetails.getOwnerProfileId(),
                    request,
                    xOrgName));

            var authDetails = AuthDetails.from(auth, doctorDetails.getDoctorId());

            // Trigger webhook for SYNAPSE brand
            if ("SYNAPSE".equalsIgnoreCase(request.getBrand())) {
                var authSSSoToken = auth.getSsoToken();

                var redirectUrl = urlUtil.generateHomeRedirectUrl(authSSSoToken, auth.getEmail());

                var synapseAuthDetailsResponse = AuthDetails.from(auth, redirectUrl, doctorDetails);

                triggerSynapseWebhook(synapseAuthDetailsResponse);
            }

            return authDetails;
        } else {
            if (request.getSkip() == null || !request.getSkip()) {
                validateNewUserEmailOtp(request, xOrgName);
            }
            var mobileNo = request.getMobileNo();
            var auth = authRepository
                    .findByEmailAndUserTypeAndOrganizationIdAndXOrganizationNameAndStatusIN(
                            email,
                            UserType.DOCTOR,
                            request.getOrganizationId(),
                            xOrgName,
                            List.of(AuthStatus.IN_PROGRESS, AuthStatus.ACTIVE, AuthStatus.RESET_IN_PROGRESS))
                    .orElseThrow(() -> new SignUpNotStartedException(email, mobileNo, UserType.DOCTOR));
            if (auth.getStatus().equals(AuthStatus.RESET_IN_PROGRESS)) {
                throw new AuthResetIncompleteException(auth);
            }
            if (auth.getStatus().equals(AuthStatus.ACTIVE)) {
                throw new UserAlreadySignedUpException(auth);
            }

            var authStages = auth.getStages();
            boolean emailStageComplete = authStages.stream()
                    .filter(stage -> stage.getStageType().equals(AuthStageType.EMAIL_OTP_VERIFICATION))
                    .allMatch(stage -> stage.getStatus().equals(AuthStageStatus.DONE));

            boolean mobileStageComplete;
            if (request.getCountryCode().equals("+91")) {
                mobileStageComplete = authStages.stream()
                        .filter(stage -> stage.getStageType().equals(AuthStageType.MOBILE_OTP_VERIFICATION))
                        .allMatch(stage -> stage.getStatus().equals(AuthStageStatus.DONE));
            } else {
                mobileStageComplete = true;
            }

            if (authStages.isEmpty() || !(emailStageComplete && mobileStageComplete)) {
                throw new AuthStageNotCompleteException(auth);
            }

            var doctorDetails = doctorService.acceptInvitation(DoctorInvitationAcceptRequest.from(request, xOrgName));

            patientService.createCustomerAndAddBasicPlan(ChargebeeCreateCustomerRequest.from(
                    doctorDetails,
                    Collections.singletonList(DoctorRole.ALIGNER_COMPANY_OR_LAB),
                    doctorDetails.getOwnerId(),
                    doctorDetails.getOwnerProfileId(),
                    request,
                    xOrgName));
            JWTToken sessionToken = jwtService.createSessionToken(
                    doctorDetails.getUUID(),
                    doctorDetails.getEmail(),
                    doctorDetails.getUUID(),
                    UserType.DOCTOR.name(),
                    doctorDetails.getId());

            auth.setUuid(doctorDetails.getUUID());
            auth.updateToken(sessionToken);
            auth.setMobileNo(request.getMobileNo());
            auth.changeCredentialStatus(CredentialType.PASSWORD, CredentialStatus.ACTIVE);
            auth.addDevice(DeviceInfo.from(request.getDeviceInfoDetails()));
            auth.setStatus(AuthStatus.ACTIVE);
            auth.setBrandName(request.getBrand());
            auth.setUserRegistrationType(request.getRegistrationType());
            auth.setDoctorRole(request.getDoctorRole());
            auth.setFirstName(request.getFirstName());
            auth.setLastName(request.getLastName());
            auth.setCountryCode(request.getCountryCode());
            auth.setSalutation(request.getSalutation());
            auth.setMobileNo(request.getMobileNo());
            auth.setUserId(doctorDetails.getDoctorId());

            JWTToken ssoToken = jwtService.createSsoToken(
                    doctorDetails.getUUID(), doctorDetails.getEmail(), doctorDetails.getUUID());
            auth.updateSsoToken(ssoToken);

            authRepository.save(auth);

            var authDetails = AuthDetails.from(auth, doctorDetails.getDoctorId());

            if ("SYNAPSE".equalsIgnoreCase(request.getBrand())) {
                var authSSOToken = auth.getSsoToken();

                var redirectUrl = urlUtil.generateHomeRedirectUrl(authSSOToken, auth.getEmail());

                var synapseAuthDetailsResponse = AuthDetails.from(auth, redirectUrl, doctorDetails);

                triggerSynapseWebhook(synapseAuthDetailsResponse);
            }

            return authDetails;
        }
    }

    private void triggerSynapseWebhook(AuthDetails authDetails) {
        try {

            SynapseWebhookPayload payload = SynapseWebhookPayload.builder()
                    .timestamp(Instant.now())
                    .authDetails(authDetails)
                    .build();

            webhookService.sendSynapseWebhook(payload);

        } catch (Exception ignore) {
        }
    }

    @Override
    @Transactional
    public List<AuthDetails> ssoActiveUsers(String orgName, Long lastSyncUserId) {

        SyncTracker syncTracker = syncTrackerRepository.findByOrgName(orgName).orElseGet(() -> SyncTracker.builder()
                .orgName(orgName)
                .lastSyncedUserId(0L)
                .lastSyncTime(ZonedDateTime.now())
                .build());

        List<Auth> authUsers = authRepository.findByBrandNameAndUserIdGreaterThanOrderByUserIdAsc(
                orgName, lastSyncUserId != null ? lastSyncUserId : syncTracker.getLastSyncedUserId());

        if (!authUsers.isEmpty()) {
            syncTracker.setLastSyncedUserId(authUsers.get(authUsers.size() - 1).getId());
            syncTracker.setLastSyncTime(ZonedDateTime.now());
            syncTrackerRepository.save(syncTracker);
        }

        Map<String, DoctorDetails> doctorDetailsMap = doctorService.getDoctorsByEmails(
                authUsers.stream().map(Auth::getEmail).collect(Collectors.toList()));

        return authUsers.stream()
                .map(auth -> {
                    DoctorDetails doctorDetails = doctorDetailsMap.get(auth.getEmail());
                    if (doctorDetails == null) {
                        return null;
                    }

                    String token = auth.getSsoToken() != null
                            ? auth.getSsoToken()
                            : jwtService
                                    .createSsoToken(
                                            doctorDetails.getUUID(), doctorDetails.getEmail(), doctorDetails.getUUID())
                                    .getToken();

                    String redirectUrl = urlUtil.generateHomeRedirectUrl(token, auth.getEmail());
                    return AuthDetails.from(auth, redirectUrl, doctorDetails);
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private void validateNewUserEmailOtp(DoctorUrlSignUpRequest request, String xOrgName) {
        var email = request.getEmail();
        var otp = request.getOtp();

        var auth = authRepository
                .findByEmailAndUserTypeAndOrganizationIdAndXOrganizationNameAndStatusIN(
                        email,
                        UserType.DOCTOR,
                        request.getOrganizationId(),
                        xOrgName,
                        List.of(AuthStatus.IN_PROGRESS, AuthStatus.RESET_IN_PROGRESS))
                .orElseThrow(() -> UserNotSignedUpException.withEmail(UserType.DOCTOR, email));
        if (auth.getStatus().equals(AuthStatus.RESET_IN_PROGRESS)) {
            throw new AuthResetIncompleteException(auth);
        }

        var emailOTPStage = auth.getStage(AuthStageType.EMAIL_OTP_VERIFICATION, AuthStageStatus.IN_PROGRESS)
                .orElseThrow(() -> new OTPValidationNotStartedException(email, UserType.DOCTOR));
        var OTPData = (EmailOTPVerificationStageData) emailOTPStage.getData();

        assertValidOTPForEmail(OTPData, email, otp, UserType.DOCTOR);
        emailOTPStage.setStatus(AuthStageStatus.DONE);
        OTPData.setVerifiedAt(ZonedDateTime.now());
    }

    private void validateExistingUserEmailOtp(DoctorUrlSignUpRequest request, Auth auth) {
        var email = request.getEmail();

        var mobileOTPStage = auth.getStage(AuthStageType.EMAIL_OTP_VERIFICATION, AuthStageStatus.IN_PROGRESS)
                .orElseThrow(() -> new OTPValidationNotStartedException(email, UserType.DOCTOR));
        var OTPData = (EmailOTPVerificationStageData) mobileOTPStage.getData();

        assertValidOTPForEmail(OTPData, email, request.getOtp(), UserType.DOCTOR);
        mobileOTPStage.setStatus(AuthStageStatus.DONE);
        OTPData.setVerifiedAt(ZonedDateTime.now());

        auth.setStatus(AuthStatus.ACTIVE);
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
    @Transactional
    public AuthDetails appleSignup(DoctorGoogleSignupRequest request, String xOrgName) {
        return signUpWithProvider(request, CredentialType.APPLE_TOKEN, "apple", xOrgName);
    }

    private AuthDetails signUpWithProvider(
            DoctorGoogleSignupRequest request, CredentialType credentialType, String provider, String xOrgName) {
        var email = request.getEmail();
        var mobileNo = request.getMobileNo();
        var googleToken = request.getToken();

        GoogleIdToken idToken = verifyGoogleIdToken(googleToken, email);
        if (idToken == null) {
            throw new InvalidGoogleTokenException(email);
        }

        var auth = authRepository
                .findByEmailAndUserTypeAndOrganizationIdAndXOrganizationNameAndStatusIN(
                        email,
                        UserType.DOCTOR,
                        request.getOrganizationId(),
                        xOrgName,
                        List.of(AuthStatus.IN_PROGRESS, AuthStatus.ACTIVE, AuthStatus.RESET_IN_PROGRESS))
                .orElseThrow(() -> new SignUpNotStartedException(email, mobileNo, UserType.DOCTOR));
        if (auth.getStatus().equals(AuthStatus.RESET_IN_PROGRESS)) {
            throw new AuthResetIncompleteException(auth);
        }
        if (auth.getStatus().equals(AuthStatus.ACTIVE)) {
            throw new UserAlreadySignedUpException(auth);
        }

        var expireAt = Date.from(Instant.ofEpochSecond(idToken.getPayload().getExpirationTimeSeconds()));
        var doctorDetails = doctorService.signUpDoctor(SignUpDoctor.from(request, xOrgName));
        patientService.createCustomerAndAddBasicPlan(
                ChargebeeCreateCustomerRequest.from(doctorDetails, request, xOrgName));
        JWTToken sessionToken = jwtService.createSessionToken(
                doctorDetails.getUUID(),
                doctorDetails.getEmail(),
                doctorDetails.getUUID(),
                UserType.DOCTOR.name(),
                doctorDetails.getId());
        auth.setUuid(doctorDetails.getUUID());
        auth.updateToken(sessionToken);
        auth.setMobileNo(request.getMobileNo());
        auth.changeCredentialStatus(credentialType, CredentialStatus.ACTIVE);
        auth.addDevice(DeviceInfo.from(request.getDeviceInfoDetails()));
        auth.setStatus(AuthStatus.ACTIVE);
        auth.setBrandName(request.getBrand());
        auth.setUserRegistrationType(UserRegistrationType.NEW_USER_SIGNUP);
        auth.setUserId(doctorDetails.getDoctorId());

        auth.setDoctorRole(request.getRoles().get(0));

        authRepository.save(auth);
        return AuthDetails.from(auth, doctorDetails.getDoctorId());
    }

    @Override
    @Transactional
    public void updateDoctorEmail(UpdateDoctorEmailRequest request) {
        var doctorId = request.getDoctorId();
        DoctorAuth auth = doctorAuthRepository
                .findByDoctorId(doctorId)
                .orElseThrow(() -> UserNotSignedUpException.withId(UserType.DOCTOR, doctorId));
        auth.setEmail(request.getEmail());
        doctorAuthRepository.save(auth);
    }

    @Override
    @Transactional
    public boolean loginAuthTypeCheck(String email) {
        DoctorAuth auth = doctorAuthRepository
                .findByEmail(email)
                .orElseThrow(() -> UserNotSignedUpException.withEmail(UserType.DOCTOR, email));
        return !auth.getAuthType().equals(AuthType.PASSWORD);
    }

    @Nullable
    private GoogleIdToken verifyGoogleIdToken(String googleToken, String email) {
        GoogleIdToken idToken;
        try {
            idToken = googleTokenVerifier.verify(googleToken);
        } catch (IOException e) {
            throw new FailedToValidateGoogleTokenException(email);
        } catch (GoogleTokenExpiredException | GoogleTokenVerificationFailedException e) {
            throw e;
        }
        return idToken;
    }
}
