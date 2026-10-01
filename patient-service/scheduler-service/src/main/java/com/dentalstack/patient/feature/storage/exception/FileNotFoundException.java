package com.dentalstack.patient.feature.storage.exception;

import com.dentalstack.patient.global.enums.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class FileNotFoundException extends BusinessException {
    public FileNotFoundException(long fileId) {
        super(BusinessErrorCode.FILE_NOT_FOUND, String.format("File with id %s not found", fileId));
    }
}
