package com.dentalstack.patient.feature.user.entity;

import com.dentalstack.patient.feature.patient.entity.ProfileImage;
import com.dentalstack.patient.feature.user.enums.UserStatus;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.enums.CountryCode;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.text.SimpleDateFormat;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@ToString(exclude = {"userProfile", "profileImage"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_id", unique = true)
    private UserProfile userProfile;

    private String firstName;
    private String lastName;

    @NotNull
    private String UUID;

    @NotNull
    private String email;

    private String profileUrl;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinColumn(name = "profile_image_id")
    private ProfileImage profileImage;

    private String salutation;

    private String displayName;
    private String displayProfileUrl;

    @Nullable
    private String mobileNo;

    @Enumerated(EnumType.STRING)
    private CountryCode countryCode;

    @NotNull
    @Enumerated(EnumType.STRING)
    private UserType userType;

    @NotNull
    @Enumerated(EnumType.STRING)
    private UserStatus status;

    @Builder.Default
    private boolean isOrganizationAdmin = false;

    private String xOrganizationName;

    private Long organizationId;

    public static String generateUUID(UserType userType) {
        String timeStamp = new SimpleDateFormat("ddHHmmss").format(new java.util.Date());

        var prefix =
                switch (userType) {
                    case PATIENT -> "P";
                    case DOCTOR -> "D";
                };

        return prefix + timeStamp;
    }

    public String fullName() {
        if (lastName != null) {
            return salutation + ". " + firstName + " " + lastName;
        } else {
            return salutation + ". " + firstName;
        }
    }

    public String displayName() {
        return displayName != null ? displayName : fullNameWithSalutation();
    }

    public String fullNameWithSalutation() {
        return buildFullNameWithSalutation(salutation, firstName, lastName);
    }

    public static String getFullNameWithSalutation(String salutation, String firstName, String lastName) {
        return buildFullNameWithSalutation(salutation, firstName, lastName);
    }

    @org.jetbrains.annotations.NotNull
    private static String buildFullNameWithSalutation(String salutation, String firstName, String lastName) {
        StringBuilder fullNameBuilder = new StringBuilder();

        if (salutation != null && !salutation.trim().isEmpty()) {
            fullNameBuilder.append(salutation.trim()).append(". ");
        }

        if (firstName != null && !firstName.trim().isEmpty()) {
            fullNameBuilder.append(firstName.trim()).append(" ");
        }

        if (lastName != null && !lastName.trim().isEmpty()) {
            fullNameBuilder.append(lastName.trim());
        }

        return fullNameBuilder.toString().trim();
    }
}
