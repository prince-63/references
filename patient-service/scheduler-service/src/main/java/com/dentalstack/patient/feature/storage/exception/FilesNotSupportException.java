package com.dentalstack.patient.feature.storage.exception;

import com.dentalstack.patient.global.enums.BusinessErrorCode;
import com.dentalstack.patient.global.enums.UserType;
import com.dentalstack.patient.global.exception.BusinessException;
import jakarta.validation.constraints.NotNull;

public class FilesNotSupportException extends BusinessException {
    public FilesNotSupportException(@NotNull UserType userType) {
        super(
                BusinessErrorCode.FILES_NOT_SUPPORTED,
                String.format("Files not supported for %s", userType.toString().toLowerCase()));
    }
}
