package com.dentalstack.patient.feature.workflow.core.workflows.service;

import com.dentalstack.patient.feature.workflow.core.task_tracker.dto.LabelCountResponse;
import com.dentalstack.patient.feature.workflow.core.task_tracker.repository.PatientTaskTrackerRepository;
import com.dentalstack.patient.feature.workflow.core.workflows.dto.WorkflowKanbanDetailsResponse;
import com.dentalstack.patient.feature.workflow.core.workflows.dto.WorkflowKanbanSummaryResponse;
import com.dentalstack.patient.feature.workflow.core.workflows.projection.WorkflowKanbanProjection;
import com.dentalstack.patient.global.utils.UserProfileUtil;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class KanbanServiceImpl implements KanbanService {

    private final PatientTaskTrackerRepository patientTaskTrackerRepository;
    private final UserProfileUtil userProfileUtil;

    @Override
    public WorkflowKanbanSummaryResponse getWorkflowKanbanSummaryByProfile(Long profileId) {
        Long orgProfileId = userProfileUtil.getOrgProfileId(profileId);

        List<WorkflowKanbanProjection> projections =
                patientTaskTrackerRepository.findWorkflowKanbanDetailsByProfileId(profileId, orgProfileId);

        Map<String, List<WorkflowKanbanProjection>> groupedByWorkflow =
                projections.stream().collect(Collectors.groupingBy(WorkflowKanbanProjection::getWorkflowLabelName));

        List<WorkflowKanbanDetailsResponse> workflowDetails = groupedByWorkflow.entrySet().stream()
                .map(entry -> {
                    String workflowLabelName = entry.getKey();
                    List<WorkflowKanbanProjection> workflowProjections = entry.getValue();

                    String workflowName = workflowProjections.stream()
                            .findFirst()
                            .map(WorkflowKanbanProjection::getWorkflowName)
                            .orElse(workflowLabelName);

                    List<LabelCountResponse> labelCounts = workflowProjections.stream()
                            .map(proj -> LabelCountResponse.builder()
                                    .labelName(proj.getLabelName())
                                    .name(proj.getWorkflowStatusName())
                                    .count(proj.getCount())
                                    .build())
                            .collect(Collectors.toList());

                    Long totalCount = workflowProjections.stream()
                            .mapToLong(WorkflowKanbanProjection::getCount)
                            .sum();

                    return WorkflowKanbanDetailsResponse.builder()
                            .kanbanName(workflowName)
                            .workflowLabelName(workflowLabelName)
                            .statusLabels(labelCounts)
                            .totalCount(totalCount)
                            .build();
                })
                .collect(Collectors.toList());

        return WorkflowKanbanSummaryResponse.builder().details(workflowDetails).build();
    }
}
