package com.dentalstack.patient.feature.doctor.entity;

import com.dentalstack.patient.feature.doctor.entity.organization.Organization;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;
import lombok.*;

@Entity
@Table(name = "doctor")
@Getter
@Setter
@ToString
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
    private Set<Organization> organizations = new HashSet<>();

    @OneToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinColumn(name = "primary_user_profile_id")
    private UserProfile primaryUserProfile;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private Set<UserProfile> userProfiles = new HashSet<>();
}
