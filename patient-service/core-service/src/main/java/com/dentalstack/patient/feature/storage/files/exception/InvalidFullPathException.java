package com.dentalstack.patient.feature.storage.files.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class InvalidFullPathException extends BusinessException {
    public InvalidFullPathException() {
        super(BusinessErrorCode.INVALID_PATH_FOUND, "Invalid path found");
    }

    public InvalidFullPathException(String path) {
        super(BusinessErrorCode.INVALID_PATH_FOUND, String.format("Invalid path found %s", path));
    }
}
