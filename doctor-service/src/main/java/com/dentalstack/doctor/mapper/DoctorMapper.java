package com.dentalstack.doctor.mapper;

import com.dentalstack.doctor.dto.account.UpdateDoctorAccountRequest;
import com.dentalstack.doctor.dto.doctor.AddDoctorRequest;
import com.dentalstack.doctor.dto.invitation.DoctorInvitationAcceptRequest;
import com.dentalstack.doctor.entity.Doctor;
import com.dentalstack.doctor.enums.UserType;
import java.text.SimpleDateFormat;
import java.util.Optional;
import java.util.function.Consumer;
import java.util.function.Supplier;

/**
 * Mapper class responsible for creating and updating {@link Doctor} entities
 * from various DTOs. Separates mapping/transformation concerns from the entity layer.
 */
public final class DoctorMapper {

    private DoctorMapper() {
        // Utility class — no instantiation
    }

    public static Doctor fromAddRequest(AddDoctorRequest req) {
        String timeStamp = new SimpleDateFormat("yyMMddss").format(new java.util.Date());
        return Doctor.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .countryCode(req.getCountryCode())
                .email(req.getEmail())
                .mobile(req.getMobile())
                .isOnBoardScreenVisited(req.getIsOnBoardScreenVisited())
                .UUID("D" + timeStamp)
                .active(true)
                .isDrToDisplay(true)
                .isWhitelabel(false)
                .orgName(req.getBrand() != null ? req.getBrand() : "Dental Stack")
                .salutation(req.getSalutation())
                .organizationId(req.getOrganizationId())
                .xOrganizationName(req.getXOrgName())
                .build();
    }

    public static Doctor fromInvitationAcceptRequest(DoctorInvitationAcceptRequest req) {
        String timeStamp = new SimpleDateFormat("yyMMddss").format(new java.util.Date());
        return Doctor.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .countryCode(req.getCountryCode())
                .email(req.getEmail())
                .mobile(req.getMobileNo())
                .isOnBoardScreenVisited(req.getIsOnBoardScreenVisited())
                .UUID("D" + timeStamp)
                .active(true)
                .isDrToDisplay(true)
                .isWhitelabel(false)
                .orgName(req.getBrand())
                .salutation(req.getSalutation())
                .organizationId(req.getOrganizationId())
                .xOrganizationName(req.getXOrgName())
                .build();
    }

    public static String generateUUID(UserType userType) {
        String timeStamp = new SimpleDateFormat("ddHHmmss").format(new java.util.Date());

        var prefix =
                switch (userType) {
                    case PATIENT -> "P";
                    case DOCTOR -> "D";
                };

        return prefix + timeStamp;
    }

    public static void updateDoctorAccount(Doctor doctor, UpdateDoctorAccountRequest request) {
        updateIfPresent(request::getEmail, doctor::setEmail);
        updateIfPresent(request::getLastName, doctor::setLastName);
        updateIfPresent(request::getFirstName, doctor::setFirstName);
        updateIfPresent(request::getMobileNo, doctor::setMobile);
        updateIfPresent(request::getSalutation, doctor::setSalutation);
    }

    private static <T> void updateIfPresent(Supplier<T> getter, Consumer<T> setter) {
        Optional.ofNullable(getter.get()).ifPresent(setter);
    }
}
