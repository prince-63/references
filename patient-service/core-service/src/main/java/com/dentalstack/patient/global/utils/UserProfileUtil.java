package com.dentalstack.patient.global.utils;

import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import org.springframework.stereotype.Component;

@Component
public class UserProfileUtil {

    private final UserProfileRepository userProfileRepository;

    public UserProfileUtil(UserProfileRepository userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    public Long getOrgProfileId(Long profileId) {
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(profileId)
                .orElseThrow(() -> new DoctorNotFoundException(profileId));

        Long orgProfileId = null;
        if (userProfile.isInternalUser()) {
            if (userProfile.getInviterProfile() != null) {
                orgProfileId = userProfile.getInviterProfile().getId();
            }
        }
        return orgProfileId;
    }

    public static String fullName(String firstName, String lastName) {
        if (lastName != null) {
            return firstName != null ? firstName + " " + lastName : lastName;
        } else {
            return firstName != null ? firstName : "";
        }
    }
}
