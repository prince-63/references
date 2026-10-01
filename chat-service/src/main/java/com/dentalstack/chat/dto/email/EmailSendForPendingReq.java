package com.dentalstack.chat.dto.email;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmailSendForPendingReq {

    private String doctorFirstName;

    private String doctorLastName;

    private String doctorEmail;

    private String patientFirstName;

    private String patientLastName;

    private LocalDateTime requestDate;
}
