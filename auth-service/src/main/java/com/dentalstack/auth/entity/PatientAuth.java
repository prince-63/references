package com.dentalstack.auth.entity;

import com.dentalstack.auth.dto.JWTToken;
import com.dentalstack.auth.dto.patient.PatientDetails;
import com.dentalstack.auth.enums.AuthType;
import com.dentalstack.auth.enums.patient.UserType;
import com.dentalstack.auth.exception.token.InvalidAuthTypeException;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "patient_auth")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientAuth extends BaseEntity implements Token {
    private String mobileNo;
    private int otp;
    private String token;
    private LocalDateTime tokenExpireAt;
    private AuthType authType;
    private ZonedDateTime otpValidTill;
    private Long patientId;

    public static PatientAuth from(String mobileNo, int otp, ZonedDateTime otpValidTill) {
        return PatientAuth.builder()
                .authType(AuthType.OTP)
                .mobileNo(mobileNo)
                .otp(otp)
                .otpValidTill(otpValidTill)
                .build();
    }

    public void updateToken(JWTToken token) {
        this.token = token.getToken();
        this.tokenExpireAt = token.getExpireAt().toLocalDateTime();
    }

    public void updateDetails(PatientDetails patientDetails) {
        this.patientId = patientDetails.getId();
    }

    public boolean isTokenValid() {
        if (token == null) {
            return false;
        }
        switch (authType) {
            case OTP -> {
                var now = LocalDateTime.now();
                return token != null && !token.isEmpty() && !now.isAfter(tokenExpireAt);
            }
            case GOOGLE, PASSWORD -> {
                throw new InvalidAuthTypeException(patientId, UserType.PATIENT, authType);
            }
        }
        return false;
    }

    public boolean hasTokenExpired() {
        var now = LocalDateTime.now();

        return token != null && !token.isEmpty() && now.isAfter(tokenExpireAt);
    }
}
