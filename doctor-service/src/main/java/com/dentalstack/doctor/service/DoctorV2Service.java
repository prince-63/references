package com.dentalstack.doctor.service;

import com.dentalstack.doctor.dto.account.UpdateDoctorAccountRequest;
import com.dentalstack.doctor.entity.user.UserProfile;
import org.springframework.web.multipart.MultipartFile;

public interface DoctorV2Service {
    UserProfile updateDoctorAccountDetails(
            UpdateDoctorAccountRequest request, MultipartFile profileImage, MultipartFile displayProfileImage);
}
