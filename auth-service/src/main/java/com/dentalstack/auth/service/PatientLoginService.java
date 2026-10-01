package com.dentalstack.auth.service;

import com.dentalstack.auth.dto.*;
import com.dentalstack.auth.dto.patient.Patient3rdPartySignUpRequest;
import com.dentalstack.auth.dto.patient.PatientPasswordSignUpRequest;

public interface PatientLoginService {
    AuthDetails passwordSignUp(PatientPasswordSignUpRequest request);

    AuthDetails googleSignup(Patient3rdPartySignUpRequest request);

    AuthDetails appleSignup(Patient3rdPartySignUpRequest request);

    void delete(String uuid);

    void deleteByEmail(String email);
}
