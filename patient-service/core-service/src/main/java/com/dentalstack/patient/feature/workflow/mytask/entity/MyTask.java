package com.dentalstack.patient.feature.workflow.mytask.entity;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.workflow.mytask.dto.MyTaskRequestDTO;
import com.dentalstack.patient.feature.workflow.mytask.enums.MyTaskPriority;
import com.dentalstack.patient.feature.workflow.mytask.enums.MyTaskStatus;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Builder
@Entity
@Table(name = "my_task")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Slf4j
public class MyTask extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "added_by_profile_id")
    private UserProfile addedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_profile_id")
    private UserProfile assignee;

    private String title;

    private String description;

    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    private MyTaskStatus status;

    @Enumerated(EnumType.STRING)
    private MyTaskPriority priority;

    public static MyTask fromMyTask(MyTaskRequestDTO dto) {
        return MyTask.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .dueDate(dto.getDueDate())
                .status(dto.getStatus())
                .priority(dto.getPriority())
                .build();
    }
}
