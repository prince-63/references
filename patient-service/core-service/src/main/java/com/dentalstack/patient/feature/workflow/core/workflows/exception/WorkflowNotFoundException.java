package com.dentalstack.patient.feature.workflow.core.workflows.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class WorkflowNotFoundException extends BusinessException {
    public WorkflowNotFoundException(Long id) {
        super(BusinessErrorCode.WORKFLOW_NOT_FOUND, String.format("Workflow not found with id %d", id));
    }

    public WorkflowNotFoundException(String workflowName) {
        super(BusinessErrorCode.WORKFLOW_NOT_FOUND, String.format("Workflow not found with name %s", workflowName));
    }
}
