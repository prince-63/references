package com.dentalstack.patient.feature.doctor.entity;

import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.*;

@Entity
@Table(name = "doctor")
@Getter
@Setter
@ToString(exclude = {"organizations", "primaryUserProfile", "userProfiles"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor extends BaseEntity {

    private String firstName;
    private String lastName;
    private String countryCode;
    private String email;
    private String mobile;
    private String countryName;
    private Boolean isOnBoardScreenVisited;

    @Column(columnDefinition = "text")
    private String description;

    private String UUID;
    private String profileImage;
    private boolean active;
    private boolean isDrToDisplay;
    private Boolean isWhitelabel;
    private String orgName;

    private String salutation;

    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinTable(
            name = "doctor_organizations",
            joinColumns = @JoinColumn(name = "doctor_id"),
            inverseJoinColumns = @JoinColumn(name = "organization_id"))
    @Builder.Default
    private Set<Organization> organizations = new HashSet<>();

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "primary_user_profile_id")
    private UserProfile primaryUserProfile;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    private Set<UserProfile> userProfiles = new HashSet<>();

    private String xOrganizationName;

    private Long organizationId;

    public String getDoctorFirstName() {
        if (salutation != null) {
            return String.join(" ", salutation, firstName != null ? firstName : "")
                    .trim();
        }

        return firstName != null ? firstName : "";
    }

    public String getDoctorFullName() {
        return Stream.of(salutation, firstName, lastName)
                .filter(Objects::nonNull)
                .filter(s -> !s.isBlank())
                .collect(Collectors.joining(" "));
    }
}
