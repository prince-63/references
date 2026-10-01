package com.dentalstack.doctor.entity.patient.organization;

import com.dentalstack.doctor.entity.BaseEntity;
import com.dentalstack.doctor.entity.Doctor;
import com.dentalstack.doctor.entity.organization.Organization;
import com.dentalstack.doctor.entity.patient.Patient;
import com.dentalstack.doctor.entity.user.UserProfile;
import com.dentalstack.doctor.enums.invitation.PatientBelongsTo;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "patient_doctor_organization")
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

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_id")
    private UserProfile userProfile;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "added_by_user_profile_id")
    private UserProfile addedByUserProfile;

    private boolean active;
    private boolean isPracticeAssigned;

    @NotNull
    @Enumerated(EnumType.STRING)
    private PatientBelongsTo patientBelongsTo;
}
