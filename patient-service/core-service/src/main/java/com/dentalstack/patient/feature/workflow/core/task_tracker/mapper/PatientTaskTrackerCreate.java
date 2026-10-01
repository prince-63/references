package com.dentalstack.patient.feature.workflow.core.task_tracker.mapper;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.workflow.core.task_tracker.dto.CreatePatientTaskTrackerRequestDto;
import com.dentalstack.patient.feature.workflow.core.task_tracker.enums.CaseType;
import com.dentalstack.patient.feature.workflow.core.workflows.entity.Workflow;
import com.dentalstack.patient.feature.workflow.core.workflows.entity.WorkflowStatus;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class PatientTaskTrackerCreate {

    public static CreatePatientTaskTrackerRequestDto createPatientTaskTrackerForNewPatient(
            Patient patient,
            UserProfile userProfile,
            Workflow workflow,
            WorkflowStatus workflowStatus,
            Long parentTaskId) {
        try {
            return CreatePatientTaskTrackerRequestDto.builder()
                    .patientId(patient.getId())
                    .workflowId(workflow.getId())
                    .initialWorkflowStatusId(workflowStatus.getId())
                    .orderType("ALIGNER")
                    .profileId(userProfile.getId())
                    .organizationId(userProfile.getOrganization().getId())
                    .assigneeId(null)
                    .cardDisplayConfigId(0L)
                    .priorityLevel("HIGH")
                    .practiceName(null)
                    .sequenceNumber(1)
                    .parentTaskTrackerId(parentTaskId)
                    .build();

        } catch (Exception e) {
            log.error("Failed to create patient task tracker for patient ID: {}", patient.getId(), e);
        }
        return null;
    }

    public static CreatePatientTaskTrackerRequestDto createPatientTaskTrackerForRefinementPatient(
            Patient patient,
            UserProfile userProfile,
            Workflow workflow,
            WorkflowStatus workflowStatus,
            Long parentTaskId) {
        try {
            return CreatePatientTaskTrackerRequestDto.builder()
                    .patientId(patient.getId())
                    .workflowId(workflow.getId())
                    .initialWorkflowStatusId(workflowStatus.getId())
                    .orderType("ALIGNER")
                    .profileId(userProfile.getId())
                    .organizationId(userProfile.getOrganization().getId())
                    .assigneeId(null)
                    .cardDisplayConfigId(0L)
                    .priorityLevel("HIGH")
                    .practiceName(null)
                    .sequenceNumber(1)
                    .caseType(CaseType.REFINEMENT)
                    .parentTaskTrackerId(parentTaskId)
                    .build();

        } catch (Exception e) {
            log.error("Failed to create patient task tracker for patient ID: {}", patient.getId(), e);
        }
        return null;
    }
}
