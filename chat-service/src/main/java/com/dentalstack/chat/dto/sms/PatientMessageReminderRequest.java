package com.dentalstack.chat.dto.sms;

import com.dentalstack.chat.dto.doctor.DoctorDetails;
import com.dentalstack.chat.dto.patient.PatientDetails;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PatientMessageReminderRequest {

    private String patientName;

    private String doctorFirstName;

    private String doctorLastName;

    private String doctorEmail;

    public static PatientMessageReminderRequest from(PatientDetails patient, DoctorDetails doctor) {
        return PatientMessageReminderRequest.builder()
                .doctorFirstName(doctor.getFirstName())
                .doctorLastName(doctor.getLastName())
                .doctorEmail(doctor.getEmail())
                .patientName(patient.getFirstName())
                .build();
    }
}
