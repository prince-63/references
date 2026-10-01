package com.dentalstack.auth.entity;

import com.dentalstack.auth.entity.authstage.AuthStageData;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.time.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
public class MobileOTPVerificationStageData extends AuthStageData {
    private String mobileNo;
    private String countryCode;

    private int otp;
    private int attempts;
    private ZonedDateTime otpValidTill;

    @JsonCreator
    public MobileOTPVerificationStageData(
            String mobileNo,
            String countryCode,
            int otp,
            int attempts,
            ZonedDateTime otpValidTill,
            ZonedDateTime verifiedAt) {
        super(
                AuthStageType.MOBILE_OTP_VERIFICATION,
                verifiedAt,
                ZonedDateTime.of(LocalDateTime.MAX, ZoneId.systemDefault()));
        this.mobileNo = mobileNo;
        this.countryCode = countryCode;
        this.attempts = attempts;
        this.otp = otp;
        this.otpValidTill = otpValidTill;
    }
}
