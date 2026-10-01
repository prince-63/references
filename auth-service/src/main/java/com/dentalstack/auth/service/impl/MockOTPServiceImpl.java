package com.dentalstack.auth.service.impl;

import com.dentalstack.auth.service.OTPService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@Profile("local | dev | stage")
public class MockOTPServiceImpl implements OTPService {

    @Override
    public int generateOtp(String mobileNo) {
        return 1234;
    }

    @Override
    public int generateOtpEmail() {
        return 1234;
    }
}
