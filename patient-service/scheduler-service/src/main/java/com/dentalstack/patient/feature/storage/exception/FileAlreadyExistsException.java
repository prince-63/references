package com.dentalstack.patient.feature.storage.exception;

import com.dentalstack.patient.global.enums.BusinessErrorCode;
import com.dentalstack.patient.global.enums.UserType;
import com.dentalstack.patient.global.exception.BusinessException;

public class FileAlreadyExistsException extends BusinessException {
    public FileAlreadyExistsException(long userId, UserType userType, String fullPath) {
        super(
                BusinessErrorCode.FILE_ALREADY_EXISTS,
                String.format("File already at %s owned by %s with id %s", fullPath, userType, userId));
    }
}
