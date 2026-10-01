package com.dentalstack.patient.feature.workflow.core.workflows;

import com.dentalstack.patient.feature.workflow.core.workflows.dto.WorkflowKanbanSummaryResponse;
import com.dentalstack.patient.feature.workflow.core.workflows.service.KanbanService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Kanban", description = "Kanban API")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/patient/kanban/v1")
public class KanbanController {

    private final KanbanService kanbanService;

    @GetMapping("/workflow-kanban-summary")
    public ResponseEntity<WorkflowKanbanSummaryResponse> getWorkflowKanbanSummary(@RequestParam Long profileId) {
        WorkflowKanbanSummaryResponse response = kanbanService.getWorkflowKanbanSummaryByProfile(profileId);
        return ResponseEntity.ok(response);
    }
}
