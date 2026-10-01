package com.dentalstack.patient.feature.storage.files.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class FailedToMoveFileException extends BusinessException {
    public FailedToMoveFileException(long fileId, String oldFullPath, String newFullPath) {
        super(
                BusinessErrorCode.FAILED_TO_MOVE,
                String.format("Failed to move the file with id %s from %s to %s", fileId, oldFullPath, newFullPath));
    }
}
