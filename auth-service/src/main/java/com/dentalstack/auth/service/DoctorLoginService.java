package com.dentalstack.auth.service;

import com.dentalstack.auth.dto.*;
import com.dentalstack.auth.dto.doctor.*;
import java.util.List;

public interface DoctorLoginService {

    AuthDetails passwordSignUp(DoctorPasswordSignUpRequest request, String xOrgName);

    void updateDoctorEmail(UpdateDoctorEmailRequest updateDoctorEmailRequest);

    boolean loginAuthTypeCheck(String email);

    AuthDetails appleSignup(DoctorGoogleSignupRequest request, String xOrgName);

    AuthDetails googleSignup(DoctorGoogleSignupRequest request, String xOrgName);

    AuthDetails signUpDoctorThroughUrl(DoctorUrlSignUpRequest request, String xOrgName);

    List<AuthDetails> ssoActiveUsers(String orgName, Long lastSyncUserId);
}
