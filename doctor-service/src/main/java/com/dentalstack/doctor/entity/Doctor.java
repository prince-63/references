package com.dentalstack.doctor.entity;

import com.dentalstack.doctor.dto.doctor.DoctorDetails;
import com.dentalstack.doctor.entity.organization.Organization;
import com.dentalstack.doctor.entity.patient.organization.PatientDoctorOrganization;
import com.dentalstack.doctor.entity.user.UserProfile;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
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
    @JsonIgnoreProperties({"doctor", "inviterProfile"})
    private UserProfile primaryUserProfile;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonManagedReference("doctor-profiles")
    private Set<UserProfile> userProfiles = new HashSet<>();

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<PatientDoctorOrganization> patientOrganizations = new HashSet<>();

    private String xOrganizationName;

    private Long organizationId;

    public List<DoctorDetails.OrganizationDetails> getOrganizationsData() {
        return organizations.stream()
                .map(organization -> DoctorDetails.OrganizationDetails.builder()
                        .name(organization.getName())
                        .organizationId(organization.getId())
                        .description(organization.getDescription())
                        .active(organization.isActive())
                        .build())
                .collect(Collectors.toList());
    }

    public String getDoctorFirstNameWithSalutation() {
        if (salutation != null) {
            return String.join(" ", salutation + ".", firstName != null ? firstName : "")
                    .trim();
        }

        return firstName != null ? firstName : "";
    }
}
