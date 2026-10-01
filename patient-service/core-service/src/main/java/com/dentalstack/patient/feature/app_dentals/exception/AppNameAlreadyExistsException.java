package com.dentalstack.patient.feature.app_dentals.exception;

import com.dentalstack.patient.global.exception.BusinessErrorCode;
import com.dentalstack.patient.global.exception.BusinessException;

public class AppNameAlreadyExistsException extends BusinessException {
    public AppNameAlreadyExistsException(String name) {
        super(BusinessErrorCode.APP_NAME_ALREADY_EXISTS, String.format("This app name already exists %s", name));
    }
}
