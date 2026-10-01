package com.dentalstack.patient.global.utils;

import com.dentalstack.patient.feature.storage.drive.GDrivePlatformProvider;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class CommonSupportUtil {

    private final GDrivePlatformProvider gDrivePlatformProvider;

    public boolean isGDrivePlatformEnabled(Long doctorId, Long profileId) {
        return gDrivePlatformProvider.isGDrivePlatformEnabled(doctorId, profileId);
    }
}
