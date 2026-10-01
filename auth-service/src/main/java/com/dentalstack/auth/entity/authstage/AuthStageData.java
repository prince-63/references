package com.dentalstack.auth.entity.authstage;

import com.dentalstack.auth.entity.MobileOTPVerificationStageData;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.io.Serializable;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = MobileOTPVerificationStageData.class, name = "MOBILE_OTP_VERIFICATION"),
    @JsonSubTypes.Type(value = EmailOTPVerificationStageData.class, name = "EMAIL_OTP_VERIFICATION"),
})
@AllArgsConstructor
@Data
public abstract class AuthStageData implements Serializable {
    private final AuthStageType type;
    private ZonedDateTime verifiedAt;
    private ZonedDateTime validTill;

    public enum AuthStageType {
        MOBILE_OTP_VERIFICATION,
        EMAIL_OTP_VERIFICATION;
    }
}
