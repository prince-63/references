package com.dentalstack.auth.exception.doctor;

import static com.dentalstack.auth.exception.BusinessErrorCode.USER_NOT_SIGNED_UP;

import com.dentalstack.auth.enums.patient.UserType;
import com.dentalstack.auth.exception.BusinessException;

public class UserNotSignedUpException extends BusinessException {
    public UserNotSignedUpException(String msg) {
        super(USER_NOT_SIGNED_UP, msg);
    }

    public static UserNotSignedUpException withMobileNo(UserType userType, String mobileNo) {
        throw new UserNotSignedUpException(
                String.format("%s has not signed up with mobile no. `%s`", userType, mobileNo));
    }

    public static UserNotSignedUpException withEmail(UserType userType, String emailId) {
        throw new UserNotSignedUpException(String.format("%s has not signed up with email `%s`", userType, emailId));
    }

    public static UserNotSignedUpException withEmail(String emailId) {
        throw new UserNotSignedUpException(String.format("User has not signed up with email `%s`", emailId));
    }

    public static UserNotSignedUpException withId(UserType userType, Long userId) {
        throw new UserNotSignedUpException(String.format("%s has not signed up with id %s", userType, userId));
    }
}
