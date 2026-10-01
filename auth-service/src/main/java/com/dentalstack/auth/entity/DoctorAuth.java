package com.dentalstack.auth.entity;

import com.dentalstack.auth.dto.JWTToken;
import com.dentalstack.auth.dto.doctor.DoctorDetails;
import com.dentalstack.auth.enums.AuthType;
import com.dentalstack.auth.service.GoogleTokenVerifier;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import jakarta.persistence.*;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.List;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(name = "doctor_auth")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
public class DoctorAuth extends BaseEntity implements Token {
    private String email;
    private Long doctorId;
    private String mobileNo;
    private Integer mobileOtp;
    private ZonedDateTime otpValidTill;

    @Column(columnDefinition = "TEXT")
    private String token;

    private String password;
    private LocalDateTime tokenExpiryAt;
    private Boolean agreedToPrivacyPolicy;

    private AuthType authType;

    public static DoctorAuth from(String emailId, String password, DoctorDetails doctorDetails, JWTToken token) {
        return DoctorAuth.builder()
                .email(emailId)
                .doctorId(doctorDetails.getDoctorId())
                .password(password)
                .mobileNo(doctorDetails.getMobile())
                .token(token.getToken())
                .tokenExpiryAt(token.getExpireAt().toLocalDateTime())
                .mobileOtp(0)
                .authType(AuthType.PASSWORD)
                .build();
    }

    public void update(String emailId, String password, DoctorDetails doctorDetails, JWTToken token) {
        this.email = emailId;
        this.password = password;
        this.doctorId = doctorDetails.getId();
        this.mobileNo = doctorDetails.getMobile();
        this.token = token.getToken();
        this.tokenExpiryAt = token.getExpireAt().toLocalDateTime();
        this.authType = AuthType.PASSWORD;
    }

    public static DoctorAuth from(String mobileNo, String email, int otp, ZonedDateTime otpValidTill) {
        return DoctorAuth.builder()
                .authType(AuthType.OTP)
                .mobileNo(mobileNo)
                .email(email)
                .mobileOtp(otp)
                .otpValidTill(otpValidTill)
                .build();
    }

    public static DoctorAuth fromGoogle(
            String email, String googleToken, LocalDateTime tokenExpireAt, DoctorDetails doctorDetails) {
        return DoctorAuth.builder()
                .authType(AuthType.GOOGLE)
                .email(email)
                .token(googleToken)
                .tokenExpiryAt(tokenExpireAt)
                .doctorId(doctorDetails.getId())
                .mobileNo(doctorDetails.getMobile())
                .build();
    }

    public void updateToken(JWTToken token) {
        this.token = token.getToken();
        this.tokenExpiryAt = token.getExpireAt().toLocalDateTime();
    }

    @Override
    public boolean isTokenValid() {
        if (token == null) {
            return false;
        }
        switch (authType) {
            case OTP, PASSWORD -> {
                var now = LocalDateTime.now();
                return token != null && !token.isEmpty() && !now.isAfter(tokenExpiryAt);
            }
            case GOOGLE -> {
                try {
                    var googleToken = getGoogleIdToken();
                    if (googleToken == null) return false;
                } catch (IOException e) {
                    return false;
                } catch (GeneralSecurityException e) {
                    return false;
                }
            }
        }
        return false;
    }

    private GoogleIdToken getGoogleIdToken() throws GeneralSecurityException, IOException {
        GoogleTokenVerifier verifier = new GoogleTokenVerifier(
                List.of(
                        "https://securetoken.google.com/dentalstack-b31ed",
                        "https://accounts.google.com",
                        "accounts.google.com"),
                Collections.singletonList(
                        "dentalstack-b31ed")); // TODO find some way to take this value from application.yml

        return verifier.verify(token);
    }

    @Override
    public boolean hasTokenExpired() {
        var now = LocalDateTime.now();

        return token != null && !token.isEmpty() && now.isAfter(tokenExpiryAt);
    }

    public JWTToken getJwtToken() {
        return new JWTToken(token, ZonedDateTime.of(tokenExpiryAt, ZoneId.systemDefault()));
    }
}
