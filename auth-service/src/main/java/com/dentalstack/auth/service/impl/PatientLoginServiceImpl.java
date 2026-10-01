package com.dentalstack.auth.service.impl;

import com.dentalstack.auth.dto.*;
import com.dentalstack.auth.dto.patient.*;
import com.dentalstack.auth.entity.*;
import com.dentalstack.auth.enums.auth.AuthStageStatus;
import com.dentalstack.auth.enums.auth.AuthStageType;
import com.dentalstack.auth.enums.auth.AuthStatus;
import com.dentalstack.auth.enums.auth.credentials.CredentialStatus;
import com.dentalstack.auth.enums.auth.credentials.CredentialType;
import com.dentalstack.auth.enums.patient.UserType;
import com.dentalstack.auth.exception.*;
import com.dentalstack.auth.exception.doctor.*;
import com.dentalstack.auth.exception.google.GoogleTokenExpiredException;
import com.dentalstack.auth.exception.google.GoogleTokenVerificationFailedException;
import com.dentalstack.auth.exception.google.InvalidGoogleTokenException;
import com.dentalstack.auth.repository.*;
import com.dentalstack.auth.repository.AuthRepository;
import com.dentalstack.auth.service.*;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import jakarta.annotation.Nullable;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.time.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class PatientLoginServiceImpl implements PatientLoginService {

    private final PatientService patientService;
    private final JWTService jwtService;
    private final AuthRepository authRepository;
    private final DeviceInfoRepository deviceInfoRepository;
    private final AuthCredentialsRepository authCredentialsRepository;
    private final AuthStageRepository authStageRepository;
    private final LoginAttemptRepository loginAttemptRepository;

    @Value("${dentalstack.google.sign-in.web.client-id}")
    private String webAppClientId;

    private GoogleTokenVerifier googleTokenVerifier;

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
    public AuthDetails passwordSignUp(PatientPasswordSignUpRequest request) {
        var email = request.getEmail();
        var mobileNo = request.getMobile();

        if (mobileNo != null) {
            authRepository.findByMobileNoAndStatus(mobileNo, AuthStatus.ACTIVE).ifPresent(auth -> {
                throw new UserAlreadySignedUpException(auth, request.getMobile());
            });
        }
        var auth = authRepository
                .findByEmailAndUserTypeAndStatusIn(
                        email,
                        UserType.PATIENT,
                        List.of(AuthStatus.IN_PROGRESS, AuthStatus.ACTIVE, AuthStatus.RESET_IN_PROGRESS))
                .orElseThrow(() -> new SignUpNotStartedException(email, mobileNo, UserType.PATIENT));
        if (auth.getStatus().equals(AuthStatus.RESET_IN_PROGRESS)) {
            throw new AuthResetIncompleteException(auth);
        }
        if (auth.getStatus().equals(AuthStatus.ACTIVE)) {
            throw new UserAlreadySignedUpException(auth);
        }

        // Check if all stages are complete
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

        PatientDetails patient = patientService.registerPatientFromAuth(RegisterPatientRequest.from(request));
        var sessionToken = jwtService.createSessionTokenForPatient(
                patient.getUUID(), patient.getEmail(), patient.getUUID(), UserType.PATIENT.name(), patient.getId());
        auth.setUuid(patient.getUUID());
        auth.updateToken(sessionToken);
        auth.setMobileNo(request.getMobile());
        auth.changeCredentialStatus(CredentialType.PASSWORD, CredentialStatus.ACTIVE);
        auth.addDevice(DeviceInfo.from(request.getDeviceInfoDetails()));
        auth.setStatus(AuthStatus.ACTIVE);

        authRepository.save(auth);
        return AuthDetails.from(auth, patient.getId());
    }

    @Override
    public AuthDetails googleSignup(Patient3rdPartySignUpRequest request) {
        var email = request.getEmail();
        var mobileNo = request.getMobile();
        var googleToken = request.getToken();

        GoogleIdToken idToken = verifyGoogleIdToken(googleToken, email);
        if (idToken == null) throw new InvalidGoogleTokenException(email);

        if (mobileNo != null) {
            authRepository.findByMobileNoAndStatus(mobileNo, AuthStatus.ACTIVE).ifPresent(auth -> {
                throw new UserAlreadySignedUpException(auth, request.getMobile());
            });
        }

        var signUpDetails = signup(request, email, mobileNo, idToken, CredentialType.GOOGLE_TOKEN);

        authRepository.save(signUpDetails.auth());

        return AuthDetails.from(
                signUpDetails.auth(), signUpDetails.patientDetails().getId());
    }

    @Override
    public AuthDetails appleSignup(Patient3rdPartySignUpRequest request) {
        var email = request.getEmail();
        var mobileNo = request.getMobile();
        var googleToken = request.getToken();

        GoogleIdToken idToken = verifyGoogleIdToken(googleToken, email);
        if (idToken == null) throw new InvalidGoogleTokenException(email);

        if (mobileNo != null) {
            authRepository.findByMobileNoAndStatus(mobileNo, AuthStatus.ACTIVE).ifPresent(auth -> {
                throw new UserAlreadySignedUpException(auth, request.getMobile());
            });
        }

        var signUpDetails = signup(request, email, mobileNo, idToken, CredentialType.APPLE_TOKEN);
        authRepository.save(signUpDetails.auth());

        return AuthDetails.from(
                signUpDetails.auth(), signUpDetails.patientDetails().getId());
    }

    private PatientSignUpDetails signup(
            Patient3rdPartySignUpRequest request,
            String email,
            String mobileNo,
            GoogleIdToken idToken,
            CredentialType credentialType) {
        var auth = authRepository
                .findByEmailAndUserTypeAndStatusIn(
                        email,
                        UserType.PATIENT,
                        List.of(AuthStatus.IN_PROGRESS, AuthStatus.ACTIVE, AuthStatus.RESET_IN_PROGRESS))
                .orElseThrow(() -> new SignUpNotStartedException(email, mobileNo, UserType.PATIENT));
        if (auth.getStatus().equals(AuthStatus.RESET_IN_PROGRESS)) {
            throw new AuthResetIncompleteException(auth);
        }
        if (auth.getStatus().equals(AuthStatus.ACTIVE)) {
            throw new UserAlreadySignedUpException(auth);
        }

        var patient = patientService.registerPatientFromAuth(RegisterPatientRequest.from(request));
        var sessionToken = jwtService.createSessionTokenForPatient(
                patient.getUUID(), patient.getEmail(), patient.getUUID(), UserType.PATIENT.name(), patient.getId());

        auth.setUuid(patient.getUUID());
        auth.updateToken(sessionToken);
        auth.setMobileNo(request.getMobile());
        auth.changeCredentialStatus(credentialType, CredentialStatus.ACTIVE);
        auth.setStatus(AuthStatus.ACTIVE);
        auth.addDevice(DeviceInfo.from(request.getDeviceInfoDetails()));
        return new PatientSignUpDetails(auth, patient);
    }

    @Transactional
    public void delete(String uuid) {
        deleteAuth(authRepository.findByUuid(uuid));
    }

    @Transactional
    public void deleteByEmail(String email) {
        deleteAuth(authRepository.findByEmail(email));
    }

    private void deleteAuth(Optional<Auth> authOptional) {
        if (authOptional.isPresent()) {
            var auth = authOptional.get();
            deviceInfoRepository.deleteByAuthId(auth.getId());
            authCredentialsRepository.deleteByAuthId(auth.getId());
            loginAttemptRepository.deleteByAuthId(auth.getId());
            authStageRepository.deleteByAuthId(auth.getId());
            authRepository.deleteById(auth.getId());
        }
    }

    private record PatientSignUpDetails(Auth auth, PatientDetails patientDetails) {}

    @Nullable
    private GoogleIdToken verifyGoogleIdToken(String googleToken, String email) {
        GoogleIdToken idToken;
        try {
            idToken = googleTokenVerifier.verify(googleToken);
        } catch (IOException e) {
            throw new FailedToValidateGoogleTokenException(email);
        } catch (GoogleTokenExpiredException e) {
            throw e;
        } catch (GoogleTokenVerificationFailedException e) {
            throw e;
        }
        return idToken;
    }
}
