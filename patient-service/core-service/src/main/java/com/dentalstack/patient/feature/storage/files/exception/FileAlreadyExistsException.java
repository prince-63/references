package com.dentalstack.patient.feature.storage.files.exception;

import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class FileAlreadyExistsException extends BusinessException {
    public FileAlreadyExistsException(long userId, UserType userType, String fullPath) {
        super(
                BusinessErrorCode.FILE_ALREADY_EXISTS,
                String.format("File already at %s owned by %s with id %s", fullPath, userType, userId));
    }
}
