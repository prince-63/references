package com.dentalstack.doctor.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "doctor_practice_location")
public class DoctorPracticeLocation extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "practice_location_id")
    private PracticeLocation practiceLocation;

    private Long createdByDoctorId;

    private Long updatedByDoctorId;

    private Long inactiveBy;

    private LocalDateTime inactiveAt;

    private boolean active;
}
