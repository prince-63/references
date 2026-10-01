package com.dentalstack.patient.feature.workflow.core.workflows.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class WorkStatusFlowNotFoundException extends BusinessException {
    public WorkStatusFlowNotFoundException(Long id) {
        super(BusinessErrorCode.WORKFLOW_STATUS_NOT_FOUND, String.format("Workflow status not found with id %d", id));
    }

    public WorkStatusFlowNotFoundException(String workflowStatusName) {
        super(
                BusinessErrorCode.WORKFLOW_STATUS_NOT_FOUND,
                String.format("Workflow status not found with name %s", workflowStatusName));
    }
}
