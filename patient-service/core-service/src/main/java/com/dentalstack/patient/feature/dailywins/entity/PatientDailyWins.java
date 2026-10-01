package com.dentalstack.patient.feature.dailywins.entity;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.*;

@Entity(name = "patient_daily_wins")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(uniqueConstraints = {@UniqueConstraint(columnNames = {"patient_id", "daily_task_id", "task_date"})})
public class PatientDailyWins extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "daily_task_id", nullable = false)
    private DailyWins dailyTask;

    @Column(name = "task_date", nullable = false)
    private LocalDate taskDate;

    private Boolean completed = false;

    private LocalDateTime completedAt;
}
