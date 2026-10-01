package com.dentalstack.doctor.service;

import com.dentalstack.doctor.dto.account.UpdateDoctorAccountRequest;
import com.dentalstack.doctor.dto.chat.DoctorForChatService;
import com.dentalstack.doctor.dto.doctor.*;
import com.dentalstack.doctor.dto.rbac.AddProfileRequest;
import com.dentalstack.doctor.dto.user.CreateUserProfile;
import com.dentalstack.doctor.entity.Doctor;
import com.dentalstack.doctor.entity.user.UserProfile;
import com.dentalstack.doctor.summary.UserProfileSummary;
import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;

public interface DoctorService {

    DoctorDetails getDoctorDetailsByEmailOrMobileOrCode(String doctorCodeEmailMobile, String searchValueType);

    DoctorDetailsAll getDoctorAllDetails(Long doctorId);

    DoctorDetails signUp(AddDoctorRequest req);

    Doctor updateDoctor(UpdateDoctor req, MultipartFile image);

    Doctor updateDoctorForMobile(UpdateDoctorForMobile req, MultipartFile image);

    DoctorDetails getOrCreateDoctor(String email, String firstName, String lastName);

    DoctorForChatService getDoctorDetailsForChat(Long doctorId, Long patientId);

    DoctorDetails getDoctorByEmail(String emailId);

    DoctorDetailsAll getDoctorAllDetailsForPatient(Long doctorId, Long patientId);

    DoctorDetails getDoctor(Long doctorId);

    DoctorDetails getDoctorFoPatient(Long doctorId, Long patientId);

    boolean findDoctorWithMobileNumber(String doctorMobile);

    boolean findDoctorWithMobileNumberAndOrg(String doctorMobile, String orgName);

    Doctor addProfile(AddProfileRequest req);

    UserProfile updateDoctorAccountDetails(
            UpdateDoctorAccountRequest request, MultipartFile profileImage, MultipartFile displayProfileImage);

    UserProfileSummary getDoctorAccountDetails(long organizationId, long doctorId, long profileId);

    Doctor createProfile(CreateUserProfile req);

    Map<String, DoctorDetails> getDoctorsByEmails(List<String> emails);

    DoctorDetails getDoctorDetails(String emailId, Long organizationId, String xOrgName);
}
