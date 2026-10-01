package com.dentalstack.patient.feature.rewards.entity;

import com.dentalstack.patient.feature.rewards.enums.TaskCategory;
import com.dentalstack.patient.feature.rewards.enums.TaskFrequency;
import com.dentalstack.patient.feature.rewards.enums.TaskType;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.*;

@Entity
@Table(
        name = "reward_task_config",
        indexes = {
            @Index(name = "IX_task_config_profile", columnList = "user_profile_id, isActive"),
            @Index(name = "IX_task_config_type_category", columnList = "taskType, category, isActive")
        },
        uniqueConstraints = {
            @UniqueConstraint(
                    name = "UX_profile_task_category",
                    columnNames = {"user_profile_id", "taskIdentifier"})
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RewardTaskConfig extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_id", nullable = false)
    private UserProfile userProfile;

    @NotNull
    private String taskIdentifier;

    @NotNull
    private String taskName;

    @Column(columnDefinition = "TEXT")
    private String taskDescription;

    @NotNull
    @Enumerated(EnumType.STRING)
    private TaskType taskType;

    @NotNull
    @Enumerated(EnumType.STRING)
    private TaskCategory category;

    @NotNull
    @Enumerated(EnumType.STRING)
    private TaskFrequency frequency;

    @NotNull
    @Column(precision = 19, scale = 2)
    private BigDecimal coinReward;

    private Integer streakRequirement;

    @NotNull
    private Boolean isEnabled;

    @NotNull
    private Boolean isActive;

    private Boolean requiresVerification;

    private Integer displayOrder;

    @Column(columnDefinition = "TEXT")
    private String iconUrl;

    private Boolean isDefaultTask;
}
