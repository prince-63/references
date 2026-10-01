package com.dentalstack.auth.exception.patient;

import static com.dentalstack.auth.exception.BusinessErrorCode.LOGGED_IN_ANOTHER_DEVICE;

import com.dentalstack.auth.exception.BusinessException;

public class UserLoggedInAnotherDeviceException extends BusinessException {
    public UserLoggedInAnotherDeviceException(String message) {
        super(LOGGED_IN_ANOTHER_DEVICE, message);
    }
}
