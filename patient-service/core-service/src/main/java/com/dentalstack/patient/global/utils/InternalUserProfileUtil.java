package com.dentalstack.patient.global.utils;

import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.doctor.enums.ProfileType;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.patient.exception.ForbiddenException;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import java.util.ArrayList;
import java.util.List;

public final class InternalUserProfileUtil {

    private InternalUserProfileUtil() {}

    public static List<Long> getInternalUserProfileIds(
            UserProfile requestProfile, UserProfileRepository userProfileRepository) {
        boolean isInternalUser = requestProfile.getRoles().stream()
                .anyMatch(role -> role.getName().equals(DoctorRole.INTERNAL_USER.name()));

        if (requestProfile.getProfileType().equals(ProfileType.INVITED) && isInternalUser) {
            if (requestProfile.getInviterProfile() != null) {
                var userProfileId = requestProfile.getInviterProfile().getId();
                requestProfile = userProfileRepository
                        .findByIdWithOrgAndDoctor(userProfileId)
                        .orElseThrow(() -> new DoctorNotFoundException(userProfileId));

                List<Long> internalUserProfileIds = new ArrayList<>(
                        userProfileRepository.findInvitedInternalUserProfileIdsByInviter(requestProfile.getId()));
                internalUserProfileIds.add(requestProfile.getId());
                return internalUserProfileIds;
            } else {
                throw new ForbiddenException();
            }
        }
        return new ArrayList<>();
    }
}
