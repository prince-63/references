package com.dentalstack.auth.service;

public interface OTPService {

    int generateOtp(String mobileNo);

    int generateOtpEmail();
}
