package com.dentalstack.doctor.dto.mail.welcome;

import com.dentalstack.doctor.entity.Doctor;
import com.dentalstack.doctor.enums.doctor.DoctorRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WelcomeEmailRequest {
    private String doctorFirstName;
    private String doctorEmail;
    private String orgName;
    private DoctorRole doctorRole;
    private String companyName;

    public static WelcomeEmailRequest from(Doctor doctor, DoctorRole doctorRole) {
        return WelcomeEmailRequest.builder()
                .doctorFirstName(doctor.getDoctorFirstNameWithSalutation())
                .doctorEmail(doctor.getEmail())
                .orgName(doctor.getOrgName())
                .doctorRole(doctorRole)
                .companyName(doctor.getDoctorFirstNameWithSalutation())
                .build();
    }
}
