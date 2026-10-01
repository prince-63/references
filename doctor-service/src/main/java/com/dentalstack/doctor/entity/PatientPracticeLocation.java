package com.dentalstack.doctor.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "patient_practice_location")
public class PatientPracticeLocation extends BaseEntity {

    private Long patientId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "practice_location_id")
    private PracticeLocation practiceLocation;

    private Long createdBy;

    private Long updatedByDoctorId;

    private boolean active;
}
