package com.dentalstack.patient.feature.doctor.entity.organization;

import com.dentalstack.patient.feature.doctor.entity.Doctor;
import com.dentalstack.patient.feature.doctor.enums.PatientBelongsTo;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.BaseEntity;
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
