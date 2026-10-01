package com.dentalstack.auth.entity.authstage;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import lombok.*;

@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
public class EmailOTPVerificationStageData extends AuthStageData {
    private String email;
    private int otp;
    private int attempts;
    private ZonedDateTime otpValidTill;

    @JsonCreator
    public EmailOTPVerificationStageData(
            String email, int otp, int attempts, ZonedDateTime otpValidTill, ZonedDateTime verifiedAt) {
        super(
                AuthStageType.EMAIL_OTP_VERIFICATION,
                verifiedAt,
                ZonedDateTime.of(LocalDateTime.MAX, ZoneId.systemDefault()));
        this.email = email;
        this.attempts = attempts;
        this.otp = otp;
        this.otpValidTill = otpValidTill;
    }
}
