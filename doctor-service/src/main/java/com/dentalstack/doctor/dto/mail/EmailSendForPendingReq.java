package com.dentalstack.doctor.dto.mail;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EmailSendForPendingReq {

    private String doctorFirstName;

    private String doctorLastName;

    private String doctorEmail;

    private String patientFirstName;

    private String patientLastName;

    private LocalDateTime requestDate;

    public static EmailSendForPendingReq from(
            String doctorFirstName,
            String doctorLastName,
            String doctorEmail,
            String patientFirstName,
            String patientLastName,
            LocalDateTime requestDate) {
        return EmailSendForPendingReq.builder()
                .doctorFirstName(doctorFirstName)
                .doctorLastName(doctorLastName)
                .doctorEmail(doctorEmail)
                .patientFirstName(patientFirstName)
                .patientLastName(patientLastName)
                .requestDate(requestDate)
                .build();
    }
}
