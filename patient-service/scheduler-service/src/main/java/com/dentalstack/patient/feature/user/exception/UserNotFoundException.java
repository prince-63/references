package com.dentalstack.patient.feature.user.exception;

public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(long userId) {
        super(String.format("user not found with this id %s", userId));
    }
}
