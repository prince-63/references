package com.dentalstack.auth.dto.email;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmailSendForPendingReq {

    private String name;

    private String email;

    private String patientName;

    private LocalDateTime requestDate;
}
