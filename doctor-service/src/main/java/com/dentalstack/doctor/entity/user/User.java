package com.dentalstack.doctor.entity.user;

import com.dentalstack.doctor.entity.BaseEntity;
import com.dentalstack.doctor.enums.UserType;
import com.dentalstack.doctor.enums.user.CountryCode;
import com.dentalstack.doctor.enums.user.UserStatus;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
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

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinColumn(name = "profile_image_id")
    @ToString.Exclude
    private ProfileImage profileImage;

    private String salutation;

    private String displayName;
    private String displayProfileUrl;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JoinColumn(name = "display_profile_image_id")
    @ToString.Exclude
    private ProfileImage displayProfileImage;

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

    public String displayName() {
        return displayName != null ? displayName : fullNameWithSalutation();
    }

    public String fullName() {
        if (lastName != null) {
            return salutation + ". " + firstName + " " + lastName;
        } else {
            return salutation + ". " + firstName;
        }
    }

    public String displayPicture() {
        return displayProfileUrl != null ? displayProfileUrl : profileUrl;
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

    public String tagFullName() {
        String f = firstName != null ? firstName.replace(" ", "").trim() : "";
        String l = lastName != null ? lastName.replace(" ", "").trim() : "";

        if (!f.isEmpty() && !l.isEmpty()) {
            return f + "_" + l;
        } else if (!f.isEmpty()) {
            return f;
        } else if (!l.isEmpty()) {
            return l;
        }
        return "";
    }
}
