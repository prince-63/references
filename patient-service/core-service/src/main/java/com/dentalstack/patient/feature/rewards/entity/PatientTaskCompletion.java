package com.dentalstack.patient.feature.rewards.entity;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.rewards.enums.TaskCompletionStatus;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(
        name = "patient_task_completion",
        indexes = {
            @Index(name = "IX_completion_patient_date", columnList = "patient_id, completionDate"),
            @Index(name = "IX_completion_config", columnList = "reward_task_config_id"),
            @Index(name = "IX_completion_status", columnList = "status")
        },
        uniqueConstraints = {
            @UniqueConstraint(
                    name = "UX_patient_task_date",
                    columnNames = {"patient_id", "reward_task_config_id", "completionDate"})
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientTaskCompletion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reward_task_config_id", nullable = false)
    private RewardTaskConfig rewardTaskConfig;

    @NotNull
    private LocalDate completionDate;

    private LocalDateTime completedAt;

    @NotNull
    @Enumerated(EnumType.STRING)
    private TaskCompletionStatus status;

    @NotNull
    @Column(precision = 19, scale = 2)
    private BigDecimal coinsEarned;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(columnDefinition = "TEXT")
    private String attachmentUrl;

    private Long verifiedByUserId;

    private LocalDateTime verifiedAt;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    private Integer alignerNo;
}
