package com.dentalstack.patient.feature.notification.dto;

import com.dentalstack.patient.feature.doctor.dto.DoctorDetails;
import com.dentalstack.patient.feature.patient.entity.Patient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SmsToDoctor {
    private String mobile;
    private String doctorName;
    private String patientName;
    private String countryCode;

    public static SmsToDoctor from(DoctorDetails doctor, Patient patient) {
        return SmsToDoctor.builder()
                .mobile(doctor.getMobile())
                .doctorName(doctor.getFirstName())
                .patientName(patient.getFirstName())
                .countryCode(doctor.getCountryCode())
                .build();
    }

    public static SmsToDoctor forPatient(Patient patient, String doctorName) {
        return SmsToDoctor.builder()
                .mobile(patient.getMobileNo())
                .doctorName(doctorName)
                .patientName(patient.getFirstName())
                .countryCode(String.valueOf(patient.getCountryCode()))
                .build();
    }
}
