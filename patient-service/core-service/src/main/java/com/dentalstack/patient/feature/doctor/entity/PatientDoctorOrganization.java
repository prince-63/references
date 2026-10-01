package com.dentalstack.patient.feature.doctor.entity;

import com.dentalstack.patient.feature.invitation.enums.PatientBelongsTo;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(
        name = "patient_doctor_organization",
        indexes = {@Index(name = "IX_doctor_org_patient", columnList = "doctor_id, organization_id, patient_id")})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientDoctorOrganization extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_id")
    private UserProfile userProfile;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "added_by_user_profile_id")
    private UserProfile addedByUserProfile;

    @Nullable
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_user_profile_id")
    private UserProfile orgUserProfile;

    private boolean active;
    private boolean isPracticeAssigned;

    @NotNull
    @Enumerated(EnumType.STRING)
    private PatientBelongsTo patientBelongsTo;

    public static PatientDoctorOrganization from(
            Patient patient, UserProfile ownerProfile, UserProfile receiverProfile, UserProfile orgUserProfile) {
        PatientBelongsTo patientBelongsTo;

        if (UserProfile.isEnterpriseCompanyLab(ownerProfile.getRoles())) {
            patientBelongsTo = PatientBelongsTo.ORG_PATIENT;
        } else {
            patientBelongsTo = PatientBelongsTo.CUSTOMER_PATIENT;
        }
        var userProfile = UserProfile.isEnterpriseCompanyLab(ownerProfile.getRoles()) ? receiverProfile : ownerProfile;

        if (!orgUserProfile.isOwner()) {
            orgUserProfile = orgUserProfile.getInviterProfile();
        }

        return PatientDoctorOrganization.builder()
                .patient(patient)
                .doctor(ownerProfile.getDoctor())
                .organization(receiverProfile.getOrganization())
                .addedByUserProfile(receiverProfile)
                .userProfile(userProfile)
                .active(true)
                .isPracticeAssigned(false)
                .patientBelongsTo(patientBelongsTo)
                .orgUserProfile(orgUserProfile)
                .build();
    }
}
