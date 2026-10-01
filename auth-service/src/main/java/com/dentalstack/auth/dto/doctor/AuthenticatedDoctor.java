package com.dentalstack.auth.dto.doctor;

import com.dentalstack.auth.dto.JWTToken;
import com.dentalstack.auth.entity.DoctorAuth;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticatedDoctor {
    private JWTToken token;
    private boolean valid;
    private DoctorDetails doctorDetails;

    public static AuthenticatedDoctor from(DoctorAuth auth, DoctorDetails doctorDetails) {
        return AuthenticatedDoctor.builder()
                .valid(true)
                .token(new JWTToken(auth.getToken(), ZonedDateTime.of(auth.getTokenExpiryAt(), ZoneId.systemDefault())))
                .doctorDetails(doctorDetails)
                .build();
    }
}
