package com.dentalstack.patient.feature.user.entity;

import com.dentalstack.patient.feature.user.enums.UserStatus;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.enums.CountryCode;
import com.dentalstack.patient.global.enums.UserType;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.text.SimpleDateFormat;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@ToString
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
            return firstName != null ? firstName + " " + lastName : lastName;
        } else {
            return firstName != null ? firstName : "";
        }
    }

    public String displayName() {
        return displayName != null ? displayName : fullNameWithSalutation();
    }

    public String fullNameWithSalutation() {
        StringBuilder fullNameBuilder = new StringBuilder();

        if (salutation != null && !salutation.isEmpty()) {
            fullNameBuilder.append(salutation).append(". ");
        }

        if (firstName != null && !firstName.isEmpty()) {
            fullNameBuilder.append(firstName).append(" ");
        }

        if (lastName != null && !lastName.isEmpty()) {
            fullNameBuilder.append(lastName);
        }

        return fullNameBuilder.toString().trim();
    }
}
