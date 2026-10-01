package com.dentalstack.patient.global.exception;

import com.dentalstack.patient.global.enums.BusinessErrorCode;

public class AppNameAlreadyExistsException extends BusinessException {
    public AppNameAlreadyExistsException(String name) {
        super(BusinessErrorCode.APP_NAME_ALREADY_EXISTS, String.format("This app name already exists %s", name));
    }
}
