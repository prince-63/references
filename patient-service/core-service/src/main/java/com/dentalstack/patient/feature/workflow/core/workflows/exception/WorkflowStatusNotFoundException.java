package com.dentalstack.patient.feature.workflow.core.workflows.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class WorkflowStatusNotFoundException extends BusinessException {
    public WorkflowStatusNotFoundException(String name) {
        super(BusinessErrorCode.WORKFLOW_NOT_FOUND, String.format("Workflow status not found with name %s", name));
    }
}
