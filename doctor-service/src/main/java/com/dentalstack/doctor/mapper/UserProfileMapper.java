package com.dentalstack.doctor.mapper;

import com.dentalstack.doctor.dto.account.UpdateDoctorAccountRequest;
import com.dentalstack.doctor.dto.invitation.DoctorInvitationRequest;
import com.dentalstack.doctor.entity.user.User;
import com.dentalstack.doctor.entity.user.UserProfile;
import java.util.Optional;
import java.util.function.Consumer;
import java.util.function.Supplier;

/**
 * Mapper class responsible for updating {@link UserProfile} entities from DTOs.
 */
public final class UserProfileMapper {

    private UserProfileMapper() {
        // Utility class — no instantiation
    }

    public static void updateFromAccountRequest(UserProfile userProfile, UpdateDoctorAccountRequest request) {
        User user = userProfile.getUser();

        updateIfPresent(request::getEmail, user::setEmail);
        updateIfPresent(request::getLastName, user::setLastName);
        updateIfPresent(request::getFirstName, user::setFirstName);
        updateIfPresent(request::getDisplayName, user::setDisplayName);
        updateIfPresent(request::getMobileNo, user::setMobileNo);
        updateIfPresent(request::getCountryCode, user::setCountryCode);
        updateIfPresent(request::getSalutation, user::setSalutation);
    }

    public static void updateFromInvitationRequest(UserProfile userProfile, DoctorInvitationRequest request) {
        User user = userProfile.getUser();
        updateIfPresent(request::getEmail, user::setEmail);
        updateIfPresent(request::getLastName, user::setLastName);
        updateIfPresent(request::getFirstName, user::setFirstName);
        updateIfPresent(request::getMobileNo, user::setMobileNo);
        updateIfPresent(request::getCountryCode, user::setCountryCode);
        updateIfPresent(request::getSalutation, user::setSalutation);
    }

    private static <T> void updateIfPresent(Supplier<T> getter, Consumer<T> setter) {
        Optional.ofNullable(getter.get()).ifPresent(setter);
    }
}
