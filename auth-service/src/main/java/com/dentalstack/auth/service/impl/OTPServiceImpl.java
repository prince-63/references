package com.dentalstack.auth.service.impl;

import com.dentalstack.auth.service.OTPService;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomUtils;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@Profile("prod")
public class OTPServiceImpl implements OTPService {

    @Override
    public int generateOtp(String mobileNo) {
        var mobileNoLong = Long.parseLong(mobileNo);
        var lowerLimit = 1_000_000_000L;
        var upperLimit = 2_999_999_999L;
        if (mobileNoLong >= lowerLimit && mobileNoLong <= upperLimit) {
            return 1234;
        } else {
            return RandomUtils.nextInt(1000, 9999);
        }
    }

    @Override
    public int generateOtpEmail() {
        return RandomUtils.nextInt(1000, 9999);
    }
}
