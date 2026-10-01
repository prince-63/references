package com.dentalstack.chat.dto.email;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TreatmentCompletedEmailForPatientReq {
    private String patientEmail;
    private String patientName;
    private LocalDate completionDate;
    private String orgName;
}
