package com.dentalstack.patient.feature.mcp;

import com.dentalstack.patient.feature.workflow.core.task_tracker.entity.PatientTaskTracker;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientTaskTrackerResponseForMcp {

    private Long patientId;
    private String patientName;
    private String workflowName;
    private String currentStatusName;
    private String userSetWorkflowName;
    private String userSetCurrentStatusName;

    public static PatientTaskTrackerResponseForMcp buildPatientTaskResponse(PatientTaskTracker patientTaskTracker) {
        return PatientTaskTrackerResponseForMcp.builder()
                .patientName(patientTaskTracker.getPatient().fullName())
                .workflowName(patientTaskTracker.getWorkflow().getName())
                .currentStatusName(patientTaskTracker.getCurrentWorkflowStatus().getName())
                .userSetWorkflowName(patientTaskTracker.getWorkflow().getLabel())
                .userSetCurrentStatusName(
                        patientTaskTracker.getCurrentWorkflowStatus().getLabelName())
                .patientId(patientTaskTracker.getPatient().getId())
                .build();
    }
}
