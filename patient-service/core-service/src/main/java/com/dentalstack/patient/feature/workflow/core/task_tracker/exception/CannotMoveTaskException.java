package com.dentalstack.patient.feature.workflow.core.task_tracker.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class CannotMoveTaskException extends BusinessException {
    public CannotMoveTaskException(Long id) {
        super(
                BusinessErrorCode.CANNOT_MOVE_TASK,
                String.format(
                        "Cannot move task. No order found with status ACTIVE or COMPLETED for patient ID: %d", id));
    }

    public CannotMoveTaskException(Long id, Long taskId) {
        super(
                BusinessErrorCode.CANNOT_MOVE_TASK,
                String.format(
                        "Cannot move task ID: %d. No order found with status ACTIVE or COMPLETED for patient ID: %d",
                        taskId, id));
    }
}
