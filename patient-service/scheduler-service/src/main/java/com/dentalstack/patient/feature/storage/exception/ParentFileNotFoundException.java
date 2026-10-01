package com.dentalstack.patient.feature.storage.exception;

import com.dentalstack.patient.global.enums.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class ParentFileNotFoundException extends BusinessException {
    public ParentFileNotFoundException(String parentPath) {
        super(BusinessErrorCode.NOT_A_FOLDER, String.format("The parent path is not a folder %s", parentPath));
    }
}
