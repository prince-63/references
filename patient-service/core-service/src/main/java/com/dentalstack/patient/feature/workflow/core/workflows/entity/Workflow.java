package com.dentalstack.patient.feature.workflow.core.workflows.entity;

import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.workflow.core.workflows.dto.CreateWorkflowRequestDto;
import com.dentalstack.patient.feature.workflow.core.workflows.metadata.WorkFlowManagementMetadata;
import com.dentalstack.patient.feature.workflow.core.workflows.metadata.WorkFlowMetadata;
import com.dentalstack.patient.global.entity.BaseEntity;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(name = "workflows")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Slf4j
public class Workflow extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id")
    private UserProfile userProfile;

    @Column(name = "org_id")
    private Long orgId;

    private String orderType;

    private String name;

    @Builder.Default
    private Boolean systemDefined = false;

    @Builder.Default
    private Boolean archived = false;

    @NotNull
    @org.hibernate.annotations.Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private WorkFlowManagementMetadata metadata;

    private String label;

    @OneToMany(mappedBy = "workflow", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("position ASC")
    private List<WorkflowStatus> statuses;

    @OneToMany(mappedBy = "workflow", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<WorkflowHistory> workflowHistories = new ArrayList<>();

    @Builder.Default
    private Integer position = 0;

    @Builder.Default
    private Boolean isDentalStackDefinedWorkflow = false;

    public static Workflow from(
            CreateWorkflowRequestDto request, UserProfile userProfile, Long orgId, WorkFlowMetadata workFlowMetadata) {
        return Workflow.builder()
                .orgId(orgId)
                .orderType(request.getOrderType())
                .name(request.getName())
                .label(request.getLabel())
                .userProfile(userProfile)
                .systemDefined(request.getSystemDefined() != null ? request.getSystemDefined() : false)
                .archived(false)
                .metadata(workFlowMetadata)
                .build();
    }
}
