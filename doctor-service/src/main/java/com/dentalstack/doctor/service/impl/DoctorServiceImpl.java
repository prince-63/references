package com.dentalstack.doctor.service.impl;

import com.dentalstack.doctor.dto.account.UpdateDoctorAccountRequest;
import com.dentalstack.doctor.dto.chat.DoctorForChatService;
import com.dentalstack.doctor.dto.doctor.*;
import com.dentalstack.doctor.dto.rbac.AddProfileRequest;
import com.dentalstack.doctor.dto.user.CreateUserProfile;
import com.dentalstack.doctor.entity.Doctor;
import com.dentalstack.doctor.entity.user.UserProfile;
import com.dentalstack.doctor.service.DoctorService;
import com.dentalstack.doctor.service.doctor.DoctorAccountService;
import com.dentalstack.doctor.service.doctor.DoctorSearchService;
import com.dentalstack.doctor.service.doctor.DoctorSignUpService;
import com.dentalstack.doctor.summary.UserProfileSummary;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Facade service that delegates to focused sub-services.
 * Maintains backward compatibility with existing controllers and callers.
 *
 * @see DoctorSignUpService for sign-up and profile creation
 * @see DoctorAccountService for account updates
 * @see DoctorSearchService for doctor lookup/search operations
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorSignUpService doctorSignUpService;
    private final DoctorAccountService doctorAccountService;
    private final DoctorSearchService doctorSearchService;

    // ── Sign-Up & Profile Creation (delegated to DoctorSignUpService) ──

    @Override
    public DoctorDetails signUp(AddDoctorRequest req) {
        return doctorSignUpService.signUp(req);
    }

    @Override
    public Doctor addProfile(AddProfileRequest req) {
        return doctorSignUpService.addProfile(req);
    }

    @Override
    public Doctor createProfile(CreateUserProfile req) {
        return doctorSignUpService.createProfile(req);
    }

    @Override
    public DoctorDetails getOrCreateDoctor(String email, String firstName, String lastName) {
        return doctorSignUpService.getOrCreateDoctor(email, firstName, lastName);
    }

    // ── Account Updates (delegated to DoctorAccountService) ──

    @Override
    public Doctor updateDoctor(UpdateDoctor req, MultipartFile image) {
        return doctorAccountService.updateDoctor(req, image);
    }

    @Override
    public Doctor updateDoctorForMobile(UpdateDoctorForMobile req, MultipartFile image) {
        return doctorAccountService.updateDoctorForMobile(req, image);
    }

    @Override
    public UserProfile updateDoctorAccountDetails(
            UpdateDoctorAccountRequest request, MultipartFile profileImage, MultipartFile displayProfileImage) {
        return doctorAccountService.updateDoctorAccountDetails(request, profileImage, displayProfileImage);
    }

    @Override
    public UserProfileSummary getDoctorAccountDetails(long organizationId, long doctorId, long profileId) {
        return doctorAccountService.getDoctorAccountDetails(organizationId, doctorId, profileId);
    }

    // ── Search & Retrieval (delegated to DoctorSearchService) ──

    @Override
    public DoctorDetailsAll getDoctorAllDetails(Long doctorId) {
        return doctorSearchService.getDoctorAllDetails(doctorId);
    }

    @Override
    public DoctorDetailsAll getDoctorAllDetailsForPatient(Long doctorId, Long patientId) {
        return doctorSearchService.getDoctorAllDetailsForPatient(doctorId, patientId);
    }

    @Override
    public DoctorDetails getDoctor(Long doctorId) {
        return doctorSearchService.getDoctor(doctorId);
    }

    @Override
    public DoctorDetails getDoctorFoPatient(Long doctorId, Long patientId) {
        return doctorSearchService.getDoctorFoPatient(doctorId, patientId);
    }

    @Override
    public boolean findDoctorWithMobileNumber(String doctorMobile) {
        return doctorSearchService.findDoctorWithMobileNumber(doctorMobile);
    }

    @Override
    public boolean findDoctorWithMobileNumberAndOrg(String doctorMobile, String orgName) {
        return doctorSearchService.findDoctorWithMobileNumberAndOrg(doctorMobile, orgName);
    }

    @Override
    public DoctorForChatService getDoctorDetailsForChat(Long doctorId, Long patientId) {
        return doctorSearchService.getDoctorDetailsForChat(doctorId, patientId);
    }

    @Override
    public DoctorDetails getDoctorDetailsByEmailOrMobileOrCode(String doctorCodeEmailMobile, String searchValueType) {
        return doctorSearchService.getDoctorDetailsByEmailOrMobileOrCode(doctorCodeEmailMobile, searchValueType);
    }

    @Override
    public DoctorDetails getDoctorByEmail(String emailId) {
        return doctorSearchService.getDoctorByEmail(emailId);
    }

    @Override
    public Map<String, DoctorDetails> getDoctorsByEmails(List<String> emails) {
        return doctorSearchService.getDoctorsByEmails(emails);
    }

    @Override
    public DoctorDetails getDoctorDetails(String emailId, Long organizationId, String xOrgName) {
        return doctorSearchService.getDoctorDetails(emailId, organizationId, xOrgName);
    }
}
