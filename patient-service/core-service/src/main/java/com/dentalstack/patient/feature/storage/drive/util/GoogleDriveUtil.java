package com.dentalstack.patient.feature.storage.drive.util;

import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class GoogleDriveUtil {
    private final UserProfileRepository userProfileRepository;

    public boolean isCustomer(Long profileId) {
        return userProfileRepository.isGoogleDriveCustomer(profileId);
    }

    public boolean isGdriveEnabled(Long profileId) {
        return userProfileRepository.isGoogleDriveEnabled(profileId);
    }
}
