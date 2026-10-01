package com.dentalstack.patient.global.utils;

import com.dentalstack.patient.feature.user.entity.UserProfile;

public class EffectiveDisplayName {

    public static String getEffectiveDisplayName(UserProfile userProfile) {
        return userProfile.getUser().getDisplayName() != null
                ? userProfile.getUser().getDisplayName()
                : String.format(
                                "%s%s%s %s",
                                userProfile.getUser().getSalutation() != null
                                        ? userProfile.getUser().getSalutation() + "."
                                        : "",
                                userProfile.getUser().getSalutation() != null ? " " : "",
                                userProfile.getUser().getFirstName(),
                                userProfile.getUser().getLastName())
                        .trim();
    }
}
