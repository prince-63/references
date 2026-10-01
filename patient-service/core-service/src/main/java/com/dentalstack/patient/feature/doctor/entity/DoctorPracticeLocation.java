package com.dentalstack.patient.feature.doctor.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "doctor_practice_location")
public class DoctorPracticeLocation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "practice_location_id")
    private PracticeLocation practiceLocation;

    private Long createdByDoctorId;

    private Long updatedByDoctorId;

    private Long inactiveBy;

    private LocalDateTime inactiveAt;

    private boolean active;
}
