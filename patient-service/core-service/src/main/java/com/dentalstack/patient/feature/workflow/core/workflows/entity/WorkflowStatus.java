package com.dentalstack.patient.feature.workflow.core.workflows.entity;

import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.InternalWorkflowEnum;
import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.MapToEnum;
import com.dentalstack.patient.feature.workflow.core.workflows.metadata.WorkFlowManagementMetadata;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "workflow_status")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Slf4j
public class WorkflowStatus extends BaseEntity {

    private String name;

    private String labelName;

    private String description;

    @Enumerated(EnumType.STRING)
    private InternalWorkflowEnum internalName;

    @Enumerated(EnumType.STRING)
    private MapToEnum mapsTo;

    @Builder.Default
    private Boolean custom = false;

    private String color;

    @Builder.Default
    private Boolean nonDeletable = false;

    @Builder.Default
    private Integer position = 0;

    @Builder.Default
    private Integer initialPosition = 0;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private WorkFlowManagementMetadata metadata;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id")
    private Workflow workflow;
}
