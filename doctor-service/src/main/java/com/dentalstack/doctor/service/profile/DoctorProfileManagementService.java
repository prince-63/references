package com.dentalstack.doctor.service.profile;

import com.dentalstack.doctor.dto.DoctorProfileRequest;
import com.dentalstack.doctor.dto.doctor.DoctorDetails;
import com.dentalstack.doctor.dto.profile.DoctorProfileDetails;
import com.dentalstack.doctor.dto.profile.DoctorsProfileResponse;
import com.dentalstack.doctor.dto.profile.MarkProfileAsDefaultRequest;
import java.util.List;

public interface DoctorProfileManagementService {
    List<DoctorProfileDetails> getDoctorProfile(Long doctorId, Long organizationId);

    DoctorDetails markProfileAsDefault(MarkProfileAsDefaultRequest request);

    List<DoctorsProfileResponse> getProfiles(String email, String xOrgName);

    List<DoctorsProfileResponse> getProfiles(DoctorProfileRequest request, String xOrgName);
}
