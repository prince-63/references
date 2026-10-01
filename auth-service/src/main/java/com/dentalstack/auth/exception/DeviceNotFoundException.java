package com.dentalstack.auth.exception;

public class DeviceNotFoundException extends BusinessException {
    public DeviceNotFoundException(String email) {
        super(BusinessErrorCode.DEVICE_NOT_FOUND, String.format("Device not found with email %s", email));
    }
}
